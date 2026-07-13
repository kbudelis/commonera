#!/usr/bin/env node

/** Validate the tracked source corpus index, with an optional local extract audit. */

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const EXPECTED_SOURCE_COUNT = 20;
export const MINIMUM_APPROVED_PASSAGES_PER_SOURCE = 2;

export const SECTION_IDS = [
  "kadesh",
  "urchatz",
  "karpas",
  "yachatz",
  "maggid",
  "rachtzah",
  "motzi-matzah",
  "maror",
  "korech",
  "shulchan-orech",
  "tzafun",
  "barech",
  "hallel",
  "nirtzah",
];
export const LENGTH_TIERS = ["20", "45", "90"];
export const SEAMS = [
  "section-opening",
  "ritual-setup",
  "ritual-explanation",
  "story-core",
  "story-reflection",
  "discussion-prompt",
  "before-blessing",
  "after-blessing",
  "meal-transition",
  "song-introduction",
  "closing-reflection",
  "historical-sidebar",
  "plate-option",
  "optional-insert",
];
export const APPROVAL_STATUSES = ["approved", "candidate-review", "quarantined"];
export const TREATMENTS = ["verbatim", "verbatim-normalized", "excerpted", "lightly-adapted", "adapted"];
export const MATERIAL_KINDS = ["creator-authored", "traditional-liturgy", "public-domain", "embedded-third-party"];

const REQUIRED_PASSAGE_FIELDS = [
  "id",
  "sourceId",
  "family",
  "exactText",
  "locator",
  "sectionIds",
  "themes",
  "audience",
  "tones",
  "lengthTiers",
  "seam",
  "treatment",
  "wordCount",
  "approvalStatus",
  "rights",
  "provenanceHash",
  "attribution",
];
const SHA256_PATTERN = /^[a-f0-9]{64}$/;

export function normalizeSourceText(value) {
  return String(value).normalize("NFC").replace(/\s+/g, " ").trim();
}

export function sourceTextHash(value) {
  return createHash("sha256").update(normalizeSourceText(value), "utf8").digest("hex");
}

function isNonemptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateStringArray(value, label, errors, { allowed, requireValue = true } = {}) {
  if (!Array.isArray(value)) {
    errors.push(`${label} must be an array.`);
    return;
  }
  if (requireValue && value.length === 0) errors.push(`${label} must not be empty.`);
  const seen = new Set();
  for (const entry of value) {
    if (!isNonemptyString(entry)) {
      errors.push(`${label} must contain only non-empty strings.`);
      continue;
    }
    if (seen.has(entry)) errors.push(`${label} contains duplicate value ${JSON.stringify(entry)}.`);
    seen.add(entry);
    if (allowed && !allowed.includes(entry)) errors.push(`${label} contains unknown value ${JSON.stringify(entry)}.`);
  }
}

function validateDeclaredEnum(actual, expected, label, errors) {
  validateStringArray(actual, label, errors, { requireValue: true });
  if (!Array.isArray(actual)) return;
  const actualSet = new Set(actual);
  for (const value of expected) {
    if (!actualSet.has(value)) errors.push(`${label} is missing ${JSON.stringify(value)}.`);
  }
  for (const value of actualSet) {
    if (!expected.includes(value)) errors.push(`${label} declares unknown value ${JSON.stringify(value)}.`);
  }
}

function validateLocator(locator, source, label, errors) {
  if (!locator || typeof locator !== "object" || Array.isArray(locator)) {
    errors.push(`${label}.locator must be an object.`);
    return;
  }
  for (const field of ["edition", "sourceLocation", "localExtract"]) {
    if (!isNonemptyString(locator[field])) errors.push(`${label}.locator.${field} must be a non-empty string.`);
  }
  for (const field of ["sourceSha256", "extractSha256"]) {
    if (!SHA256_PATTERN.test(locator[field] ?? "")) errors.push(`${label}.locator.${field} must be a lowercase SHA-256 hex digest.`);
  }
  if (locator.localExtract !== source.acquisition?.extractFile) {
    errors.push(`${label}.locator.localExtract must match ${source.sourceId}'s acquisition.extractFile.`);
  }
  if (locator.sourceSha256 !== source.acquisition?.sha256) {
    errors.push(`${label}.locator.sourceSha256 must match ${source.sourceId}'s acquisition.sha256.`);
  }
  if (locator.extractSha256 !== source.acquisition?.extractSha256) {
    errors.push(`${label}.locator.extractSha256 must match ${source.sourceId}'s acquisition.extractSha256.`);
  }
}

function validateRights(rights, passage, label, errors) {
  if (!rights || typeof rights !== "object" || Array.isArray(rights)) {
    errors.push(`${label}.rights must be an object.`);
    return;
  }
  if (typeof rights.runtimeEligible !== "boolean") errors.push(`${label}.rights.runtimeEligible must be boolean.`);
  if (!isNonemptyString(rights.license)) errors.push(`${label}.rights.license must be a non-empty string.`);
  if (!MATERIAL_KINDS.includes(rights.materialKind)) {
    errors.push(`${label}.rights.materialKind must be one of ${MATERIAL_KINDS.join(", ")}.`);
  }
  if (typeof rights.sourcePresentedAttributionRequired !== "boolean") {
    errors.push(`${label}.rights.sourcePresentedAttributionRequired must be boolean.`);
  }
  validateStringArray(rights.conditions, `${label}.rights.conditions`, errors, { requireValue: true });
  const hasSourcePresentedAttribution = isNonemptyString(passage.attribution?.sourcePresented);
  if (typeof rights.sourcePresentedAttributionRequired === "boolean" && rights.sourcePresentedAttributionRequired !== hasSourcePresentedAttribution) {
    errors.push(`${label}.rights.sourcePresentedAttributionRequired must agree with attribution.sourcePresented.`);
  }
}

function validateAttribution(attribution, label, errors) {
  if (!attribution || typeof attribution !== "object" || Array.isArray(attribution)) {
    errors.push(`${label}.attribution must be an object.`);
    return;
  }
  for (const field of ["creator", "containingSource", "readerCredit"]) {
    if (!isNonemptyString(attribution[field])) errors.push(`${label}.attribution.${field} must be a non-empty string.`);
  }
  if (attribution.sourcePresented !== null && !isNonemptyString(attribution.sourcePresented)) {
    errors.push(`${label}.attribution.sourcePresented must be null or a non-empty string.`);
  }
}

function validatePassage(passage, source, label, errors) {
  if (!passage || typeof passage !== "object" || Array.isArray(passage)) {
    errors.push(`${label} must be an object.`);
    return;
  }
  for (const field of REQUIRED_PASSAGE_FIELDS) {
    if (!(field in passage)) errors.push(`${label} is missing required field ${field}.`);
  }
  for (const field of ["id", "sourceId", "family", "exactText"]) {
    if (!isNonemptyString(passage[field])) errors.push(`${label}.${field} must be a non-empty string.`);
  }
  if (passage.sourceId !== source.sourceId) errors.push(`${label}.sourceId must match its containing source.`);
  if (passage.family !== source.family) errors.push(`${label}.family must match ${source.sourceId}'s family.`);

  const normalizedText = normalizeSourceText(passage.exactText ?? "");
  if (passage.exactText !== normalizedText) errors.push(`${label}.exactText must already be NFC-normalized with whitespace collapsed.`);
  const expectedWordCount = normalizedText ? normalizedText.split(" ").length : 0;
  if (!Number.isInteger(passage.wordCount) || passage.wordCount !== expectedWordCount) {
    errors.push(`${label}.wordCount must be ${expectedWordCount}; received ${JSON.stringify(passage.wordCount)}.`);
  }
  const expectedHash = sourceTextHash(passage.exactText ?? "");
  if (!SHA256_PATTERN.test(passage.provenanceHash ?? "") || passage.provenanceHash !== expectedHash) {
    errors.push(`${label}.provenanceHash must equal ${expectedHash}.`);
  }

  validateStringArray(passage.sectionIds, `${label}.sectionIds`, errors, { allowed: SECTION_IDS });
  validateStringArray(passage.themes, `${label}.themes`, errors);
  validateStringArray(passage.audience, `${label}.audience`, errors);
  validateStringArray(passage.tones, `${label}.tones`, errors);
  validateStringArray(passage.lengthTiers, `${label}.lengthTiers`, errors, { allowed: LENGTH_TIERS });
  if (!SEAMS.includes(passage.seam)) errors.push(`${label}.seam must be a recognized seam.`);
  if (!TREATMENTS.includes(passage.treatment)) errors.push(`${label}.treatment must be a recognized treatment.`);
  if (!APPROVAL_STATUSES.includes(passage.approvalStatus)) errors.push(`${label}.approvalStatus must be recognized.`);
  validateLocator(passage.locator, source, label, errors);
  validateAttribution(passage.attribution, label, errors);
  validateRights(passage.rights, passage, label, errors);
}

/** Validate only information committed to Git; ignored source files are not read. */
export function validateSourceRuntimeIndex(index) {
  const errors = [];
  if (!index || typeof index !== "object" || Array.isArray(index)) return ["Index must be an object."];
  if (index.schemaVersion !== "1.0.0") errors.push(`schemaVersion must be "1.0.0".`);
  if (!Array.isArray(index.sources)) return [...errors, "sources must be an array."];
  if (index.sources.length !== EXPECTED_SOURCE_COUNT) {
    errors.push(`sources must contain exactly ${EXPECTED_SOURCE_COUNT} records; received ${index.sources.length}.`);
  }

  const schema = index.passageSchema;
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    errors.push("passageSchema must be an object.");
  } else {
    validateDeclaredEnum(schema.sectionIds, SECTION_IDS, "passageSchema.sectionIds", errors);
    validateDeclaredEnum(schema.lengthTiers, LENGTH_TIERS, "passageSchema.lengthTiers", errors);
    validateDeclaredEnum(schema.seams, SEAMS, "passageSchema.seams", errors);
    validateDeclaredEnum(schema.approvalStatuses, APPROVAL_STATUSES, "passageSchema.approvalStatuses", errors);
    validateDeclaredEnum(schema.treatments, TREATMENTS, "passageSchema.treatments", errors);
    validateStringArray(schema.required, "passageSchema.required", errors, { requireValue: true });
    if (Array.isArray(schema.required)) {
      for (const field of REQUIRED_PASSAGE_FIELDS) {
        if (!schema.required.includes(field)) errors.push(`passageSchema.required is missing ${field}.`);
      }
    }
  }

  const sourceIds = new Set();
  const passageIds = new Set();
  const sourceFamilies = new Set(index.sources.map((source) => source?.family).filter(isNonemptyString));
  let approvedRuntimeTotal = 0;

  for (const [sourceIndex, source] of index.sources.entries()) {
    const label = `sources[${sourceIndex}]`;
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      errors.push(`${label} must be an object.`);
      continue;
    }
    for (const field of ["sourceId", "title", "creator", "family"]) {
      if (!isNonemptyString(source[field])) errors.push(`${label}.${field} must be a non-empty string.`);
    }
    if (sourceIds.has(source.sourceId)) errors.push(`Duplicate sourceId ${JSON.stringify(source.sourceId)}.`);
    sourceIds.add(source.sourceId);
    if (typeof source.primarySpineEligible !== "boolean") errors.push(`${label}.primarySpineEligible must be boolean.`);
    if (typeof source.runtimeSpineAvailable !== "boolean") errors.push(`${label}.runtimeSpineAvailable must be boolean.`);
    if (!Number.isInteger(source.secondaryPassageCap) || source.secondaryPassageCap < 0) {
      errors.push(`${label}.secondaryPassageCap must be a non-negative integer.`);
    }
    validateStringArray(source.compatibleFamilies, `${label}.compatibleFamilies`, errors, { requireValue: false });
    validateStringArray(source.incompatibleFamilies, `${label}.incompatibleFamilies`, errors, { requireValue: false });
    for (const family of [...(source.compatibleFamilies ?? []), ...(source.incompatibleFamilies ?? [])]) {
      if (isNonemptyString(family) && !sourceFamilies.has(family)) errors.push(`${label} references unknown source family ${JSON.stringify(family)}.`);
    }

    const acquisition = source.acquisition;
    if (!acquisition || typeof acquisition !== "object" || Array.isArray(acquisition)) {
      errors.push(`${label}.acquisition must be an object.`);
    } else {
      if (acquisition.status !== "acquired-verified") errors.push(`${label}.acquisition.status must be acquired-verified.`);
      for (const field of ["kind", "localFile", "extractFile", "extractMode", "verifiedAt"]) {
        if (!isNonemptyString(acquisition[field])) errors.push(`${label}.acquisition.${field} must be a non-empty string.`);
      }
      for (const field of ["sha256", "extractSha256"]) {
        if (!SHA256_PATTERN.test(acquisition[field] ?? "")) errors.push(`${label}.acquisition.${field} must be a lowercase SHA-256 hex digest.`);
      }
    }

    const sourceRights = source.rights;
    if (!sourceRights || typeof sourceRights !== "object" || Array.isArray(sourceRights)) {
      errors.push(`${label}.rights must be an object.`);
    } else {
      if (!isNonemptyString(sourceRights.basis)) errors.push(`${label}.rights.basis must be a non-empty string.`);
      if (!isNonemptyString(sourceRights.license)) errors.push(`${label}.rights.license must be a non-empty string.`);
      if (typeof sourceRights.runtimeEligible !== "boolean") errors.push(`${label}.rights.runtimeEligible must be boolean.`);
      if (typeof sourceRights.embeddedMaterialRequiresItemReview !== "boolean") {
        errors.push(`${label}.rights.embeddedMaterialRequiresItemReview must be boolean.`);
      }
      validateStringArray(sourceRights.conditions, `${label}.rights.conditions`, errors, { requireValue: true });
    }

    if (!Array.isArray(source.passages)) {
      errors.push(`${label}.passages must be an array.`);
      continue;
    }
    let approvedRuntimeForSource = 0;
    for (const [passageIndex, passage] of source.passages.entries()) {
      const passageLabel = `${label}.passages[${passageIndex}]`;
      validatePassage(passage, source, passageLabel, errors);
      if (passageIds.has(passage?.id)) errors.push(`Duplicate passage id ${JSON.stringify(passage?.id)}.`);
      passageIds.add(passage?.id);
      if (passage?.approvalStatus === "approved" && passage?.rights?.runtimeEligible === true) {
        approvedRuntimeForSource += 1;
        approvedRuntimeTotal += 1;
      }
    }
    if (approvedRuntimeForSource < MINIMUM_APPROVED_PASSAGES_PER_SOURCE) {
      errors.push(`${source.sourceId} must have at least ${MINIMUM_APPROVED_PASSAGES_PER_SOURCE} approved, runtime-eligible passages; received ${approvedRuntimeForSource}.`);
    }
  }

  const minimumTotal = EXPECTED_SOURCE_COUNT * MINIMUM_APPROVED_PASSAGES_PER_SOURCE;
  if (approvedRuntimeTotal < minimumTotal) {
    errors.push(`Index must have at least ${minimumTotal} approved, runtime-eligible passages; received ${approvedRuntimeTotal}.`);
  }
  return errors;
}

function resolveRepositoryFile(repositoryRoot, relativePath) {
  if (!isNonemptyString(relativePath) || path.isAbsolute(relativePath)) return null;
  const root = path.resolve(repositoryRoot);
  const resolved = path.resolve(root, relativePath);
  return resolved === root || resolved.startsWith(`${root}${path.sep}`) ? resolved : null;
}

/** Audit ignored local extracts. This is deliberately separate from tracked/CI validation. */
export async function validateLocalSourceExtracts(index, { repositoryRoot } = {}) {
  const errors = [];
  const root = repositoryRoot ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const cache = new Map();

  async function loadExtract(source, locator) {
    const relativePath = locator?.localExtract;
    if (cache.has(relativePath)) return cache.get(relativePath);
    const promise = (async () => {
      const filename = resolveRepositoryFile(root, relativePath);
      if (!filename) throw new Error(`unsafe or invalid repository-relative path ${JSON.stringify(relativePath)}`);
      const bytes = await readFile(filename);
      return {
        text: normalizeSourceText(bytes.toString("utf8")),
        hash: createHash("sha256").update(bytes).digest("hex"),
      };
    })();
    cache.set(relativePath, promise);
    return promise;
  }

  for (const source of index?.sources ?? []) {
    for (const passage of source?.passages ?? []) {
      const label = `${source.sourceId}/${passage.id}`;
      try {
        const extract = await loadExtract(source, passage.locator);
        if (extract.hash !== passage.locator?.extractSha256) {
          errors.push(`${label}: local extract SHA-256 does not match locator.extractSha256.`);
        }
        const exactText = normalizeSourceText(passage.exactText ?? "");
        if (!exactText || !extract.text.includes(exactText)) {
          errors.push(`${label}: normalized exactText was not found verbatim in ${passage.locator?.localExtract}.`);
        }
      } catch (error) {
        errors.push(`${label}: could not read local extract: ${error.message}`);
      }
    }
  }
  return errors;
}

export async function readSourceRuntimeIndex(indexPath) {
  return JSON.parse(await readFile(indexPath, "utf8"));
}

const scriptPath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  const unknownArgs = process.argv.slice(2).filter((argument) => argument !== "--local");
  if (unknownArgs.length) {
    console.error(`Unknown argument(s): ${unknownArgs.join(", ")}`);
    process.exitCode = 2;
  } else {
    const repositoryRoot = path.resolve(path.dirname(scriptPath), "..");
    const indexPath = path.join(repositoryRoot, "research", "source-runtime-index.json");
    try {
      const index = await readSourceRuntimeIndex(indexPath);
      const errors = validateSourceRuntimeIndex(index);
      if (process.argv.includes("--local")) errors.push(...await validateLocalSourceExtracts(index, { repositoryRoot }));
      if (errors.length) {
        console.error(`Source runtime index validation failed with ${errors.length} error(s):`);
        for (const error of errors) console.error(`- ${error}`);
        process.exitCode = 1;
      } else {
        const approved = index.sources.flatMap((source) => source.passages).filter(
          (passage) => passage.approvalStatus === "approved" && passage.rights.runtimeEligible,
        ).length;
        const suffix = process.argv.includes("--local") ? "; local exact-text extracts verified" : "";
        console.log(`Source runtime index valid: ${index.sources.length} sources, ${approved} approved runtime passages${suffix}.`);
      }
    } catch (error) {
      console.error(`Could not validate source runtime index: ${error.stack ?? error.message}`);
      process.exitCode = 1;
    }
  }
}
