import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const SECTION_IDS = [
  "kadesh", "urchatz", "karpas", "yachatz", "maggid", "rachtzah",
  "motzi-matzah", "maror", "korech", "shulchan-orech", "tzafun",
  "barech", "hallel", "nirtzah",
];

const HARD_POLITICAL_PATTERNS = [
  ["collective-blame", /(?<!not )(?<!aren['’]t )\b(?:all|every)\s+(?:jews?|muslims?|christians?|israelis?|palestinians?|arabs?)\s+(?:are|were|must|should|deserve)\b/iu],
  ["collective-blame", /\b(?:jews?|muslims?|christians?|israelis?|palestinians?|arabs?)\s+(?:are\s+)?(?:collectively\s+)?(?:guilty|responsible|to blame|evil)\b/iu],
  ["dehumanizing", /\b(?:human animals?|no innocent civilians?)\b|\b(?:jews?|muslims?|christians?|israelis?|palestinians?|arabs?|those people|they)\s+(?:are|were|are like|should be treated like)\s+(?:subhumans?|vermin|savages?|cockroaches?)\b/iu],
  ["exclusive-territorial-claim", /\b(?:the\s+)?land\s+(?:belongs|must belong|should belong)\s+(?:only|exclusively)\s+to\b/iu],
  ["expulsion-advocacy", /\b(?:jews?|muslims?|christians?|israelis?|palestinians?|arabs?)\b.{0,80}\b(?:must|should|need to)\s+be\s+(?:expelled|removed|driven out|transferred)\b/iu],
  ["expulsion-advocacy", /\b(?:expel|remove|drive out|transfer)\s+(?:all\s+)?(?:jews?|muslims?|christians?|israelis?|palestinians?|arabs?)\b/iu],
];

const EXPLICIT_POLITICAL_PATTERNS = [
  ["explicit-zionism", /\b(?:anti[- ]?)?zionis(?:m|t|ts|tic)\b/iu],
  ["explicit-modern-israel-state", /\b(?:state of israel|jewish state|first flowering of (?:our )?redemption|israeli government|israel(?:’s|'s) right to exist)\b/iu],
  ["explicit-anti-palestinian", /\b(?:palestinians?|palestinian people|arabs?)\s+(?:are|were)\s+(?:terrorists?|animals?|invaders?|nonexistent|a fiction)\b/iu],
  ["explicit-anti-palestinian", /\b(?:palestinians?|palestinian people|arabs?)\s+(?:do not|don['’]t|cannot|can['’]t)\s+(?:exist|belong|have (?:a |the )?right)\b/iu],
  ["explicit-anti-palestinian", /\bthere (?:is|was) no (?:such thing as )?(?:a )?palestinian(?: people| nation| identity)?\b/iu],
  ["contemporary-israel-palestine", /\b(?:gaza|hamas|netanyahu|west bank|occupied palestinian territories|settler colonial(?:ism)?|intifada|october 7(?:th)?)\b/iu],
];

const METADATA_PATTERNS = [
  ["license-boilerplate", /\bGNU (?:General Public|Free Documentation) License\b/iu],
  ["license-boilerplate", /\bCreative Commons Attribution(?:-ShareAlike)?\b/iu],
  ["license-boilerplate", /\bTERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION\b/iu],
  ["navigation-only", /\btable of contents\b/iu],
  ["contact-boilerplate", /\b\d{3}[-.) ]\d{3}[-. ]\d{4}\b.{0,100}\b(?:office|info|contact)@/iu],
];

const QUALITY_PATTERNS = [
  ["corrupt-control-glyphs", /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/u],
  ["extraction-failure", /\[(?:no searchable text|text extraction error)[^\]]*\]/iu],
  ["provenance-label-in-reading", /\[(?:PDF p\.|visually audited transcriptions)[^\]]*(?:visually checked|OCR)[^\]]*\]/iu],
  ["page-furniture", /\bPage\s*\|\s*\d+\b.{0,100}\bHappy Passover from\b/iu],
  ["page-furniture", /(?:\b[A-Z][A-Za-z ]{3,40}\s+\d{1,3}){3}/u],
  ["non-seder-promotion", /\b(?:download|use)\s+[^.!?]{0,80}\bapp\s+(?:for|on)\s+(?:Android|iOS)\b/iu],
];

const CREDIT_PATTERN = /(?:copyright|©|adapted\s+(?:from|by)|translated\s+(?:from|by)|translation\s+by|written\s+by|compiled\s+by|poem\s+by|song\s+by|reading\s+by)/iu;

const ENGLISH_JERUSALEM = /\bnext year in jerusalem\b/iu;
const TRANSLITERATED_JERUSALEM = /\bl[’']?shana?h?\s+ha[- ]?ba[’']?ah?\s+b[’']?y(?:e|i)rushalayim\b/iu;

export function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function wordCount(value) {
  return String(value).trim().split(/\s+/u).filter(Boolean).length;
}

export function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export async function readJson(filename) {
  return JSON.parse(await readFile(filename, "utf8"));
}

export async function readJsonLines(filename) {
  const body = await readFile(filename, "utf8");
  return body.split(/\n/u).filter((line) => line.trim()).map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`${filename}:${index + 1}: invalid JSON: ${error.message}`);
    }
  });
}

export async function writeJson(filename, value) {
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function labels(value, patterns) {
  return [...new Set(patterns.filter(([, pattern]) => pattern.test(value)).map(([label]) => label))].sort();
}

function hebrewLettersOnly(value) {
  return value.normalize("NFD").replace(/[\u0591-\u05c7\s\p{P}\p{N}]/gu, "");
}

export function containsJerusalemRefrain(value) {
  return ENGLISH_JERUSALEM.test(value) ||
    TRANSLITERATED_JERUSALEM.test(value) ||
    hebrewLettersOnly(value).includes("לשנההבאהבירושלים");
}

export function localPolicyReview(segment) {
  const text = segment.exactText;
  const hardRisks = labels(text, HARD_POLITICAL_PATTERNS);
  const explicitPolitics = labels(text, EXPLICIT_POLITICAL_PATTERNS);
  const metadataFlags = labels(text, METADATA_PATTERNS);
  const qualityFlags = labels(text, QUALITY_PATTERNS);
  const tokens = text.trim().split(/\s+/u).filter(Boolean);
  const singleNoiseTokens = tokens.filter((token) => /^[A-Za-z0-9?*#^|\\/()[\]{}.,:;_'’"“”!-]$/u.test(token)).length;
  if (tokens.length >= 20 && singleNoiseTokens / tokens.length >= 0.3) qualityFlags.push("likely-ocr-gibberish");
  for (const flag of segment.qualityFlags ?? []) {
    if (["corrupt-glyphs", "run-together-ocr", "no-searchable-text"].includes(flag)) qualityFlags.push(flag);
  }

  const editorialGates = [];
  const exclusionReasons = [...(segment.quarantineReasons ?? [])];
  if (containsJerusalemRefrain(text)) editorialGates.push("traditional-without-social-justice-only");
  if (explicitPolitics.length > 0) editorialGates.push("explicit-political-opt-in");
  if (segment.sourceId === "battlestar-seder") editorialGates.push("explicit-battlestar-opt-in");
  if (segment.sourceId === "mayer-ashkenaz" && /\b(?:state of israel|first flowering of (?:our )?redemption)\b/iu.test(text)) {
    exclusionReasons.push("modern-nationalist-affirmation");
  }
  if (segment.sourceId === "inner-seder" && /\b(?:hamas|netanyahu|gaza|west bank)\b/iu.test(text)) {
    exclusionReasons.push("contemporary-partisan-assertion");
  }
  if (segment.sourceId === "velveteen-rabbi" && /\b(?:zionis[mt]|palestinian solidarity)\b/iu.test(text)) {
    exclusionReasons.push("explicit-zionism-default-exclusion");
  }
  if (segment.sourceId === "seder-in-the-streets" && /\b(?:zionis[mt]|state of israel)\b/iu.test(text)) {
    exclusionReasons.push("explicit-israel-politics-default-exclusion");
  }
  exclusionReasons.push(...hardRisks.map((risk) => `unsafe-${risk}`));
  exclusionReasons.push(...metadataFlags);
  exclusionReasons.push(...qualityFlags);
  if (segment.approvalStatus === "quarantined") exclusionReasons.push("canonical-quarantine");

  return {
    hardRisks,
    explicitPolitics,
    metadataFlags,
    qualityFlags: [...new Set(qualityFlags)].sort(),
    likelyEmbeddedCredit: CREDIT_PATTERN.test(text),
    hasSourcePresentedAttribution: (segment.sourcePresentedAttribution ?? []).length > 0,
    editorialGates: [...new Set(editorialGates)].sort(),
    exclusionReasons: [...new Set(exclusionReasons)].sort(),
    candidateStatus: exclusionReasons.length > 0 ? "quarantined-local" : "unreviewed-candidate",
    requiresExplicitOptIn: editorialGates.some((gate) => gate.includes("explicit")),
  };
}

export function assertCanonicalCorpus(manifest, segments) {
  if (manifest.sourceCount !== 20 || manifest.sources?.length !== 20 || manifest.allSourcesCoverageVerified !== true) {
    throw new Error("Canonical source manifest must prove complete coverage of exactly 20 sources.");
  }
  if (segments.length !== manifest.segmentCount) throw new Error(`Expected ${manifest.segmentCount} canonical segments; found ${segments.length}.`);
  const seen = new Set();
  let previousSource = -1;
  let previousOrder = -1;
  for (const segment of segments) {
    if (seen.has(segment.id)) throw new Error(`Duplicate canonical segment ID: ${segment.id}.`);
    seen.add(segment.id);
    if (sha256(segment.exactText) !== segment.provenanceHash) throw new Error(`${segment.id}: stale exact-text hash.`);
    if (wordCount(segment.exactText) !== segment.wordCount || segment.exactText.length !== segment.characterCount) {
      throw new Error(`${segment.id}: stale exact-text counts.`);
    }
    if (segment.sourceOrder < previousSource || (segment.sourceOrder === previousSource && segment.order <= previousOrder)) {
      throw new Error(`${segment.id}: non-monotonic source order.`);
    }
    if (segment.sourceOrder !== previousSource) previousOrder = -1;
    previousSource = segment.sourceOrder;
    previousOrder = segment.order;
  }
  return true;
}

export async function loadCanonicalCorpus({ manifestPath, root }) {
  const manifest = await readJson(manifestPath);
  const segments = [];
  for (const source of [...manifest.sources].sort((left, right) => left.sourceOrder - right.sourceOrder)) {
    const records = await readJsonLines(path.resolve(root, source.file));
    if (records.length !== source.segmentCount) throw new Error(`${source.sourceId}: source manifest count mismatch.`);
    segments.push(...records);
  }
  assertCanonicalCorpus(manifest, segments);
  return { manifest, segments };
}

function intersection(left, right) {
  const rightSet = new Set(right);
  return left.filter((value) => rightSet.has(value));
}

export function deterministicSequenceSkeletons(sourceId, records, maximum = 5) {
  const safe = records.filter((record) => localPolicyReview(record).exclusionReasons.length === 0);
  const windows = [];
  for (let start = 0; start < safe.length - 1; start += 1) {
    const group = [safe[start]];
    for (let cursor = start + 1; cursor < safe.length && group.length < 4; cursor += 1) {
      const previous = group[group.length - 1];
      const next = safe[cursor];
      if (next.order - previous.order > 2) break;
      const commonSections = intersection(group.flatMap((record) => record.sectionIds), next.sectionIds);
      if (commonSections.length === 0 && next.locator?.pageNumber !== previous.locator?.pageNumber) break;
      group.push(next);
      const words = group.reduce((sum, record) => sum + record.wordCount, 0);
      if (group.length >= 2 && words >= 80 && words <= 650) windows.push([...group]);
    }
  }
  const selected = [];
  const coveredSections = new Set();
  for (const group of windows.sort((left, right) => {
    const leftNew = new Set(left.flatMap((record) => record.sectionIds).filter((id) => !coveredSections.has(id))).size;
    const rightNew = new Set(right.flatMap((record) => record.sectionIds).filter((id) => !coveredSections.has(id))).size;
    return rightNew - leftNew || left[0].order - right[0].order;
  })) {
    if (selected.length >= maximum) break;
    if (selected.some((existing) => existing.some((record) => group.includes(record)))) continue;
    selected.push(group);
    group.flatMap((record) => record.sectionIds).forEach((id) => coveredSections.add(id));
  }
  return selected.map((group, index) => ({
    id: `${sourceId}-skeleton-${String(index + 1).padStart(2, "0")}`,
    title: `Candidate sequence ${index + 1}`,
    sectionIds: [...new Set(group.flatMap((record) => record.sectionIds))].filter((id) => SECTION_IDS.includes(id)),
    segmentIds: group.map((record) => record.id),
    beginnerContext: "Introduce the ritual moment in plain language before reading these source passages in order.",
    rationale: "Adjacent source passages share a ritual section or page context and preserve the source's original order.",
    themes: [...new Set(group.flatMap((record) => record.themes))],
    tones: [...new Set(group.flatMap((record) => record.tones))],
    requiresExplicitOptIn: group.some((record) => localPolicyReview(record).requiresExplicitOptIn),
    editorialGates: [...new Set(group.flatMap((record) => localPolicyReview(record).editorialGates))],
    creditNotes: "Use the source-level reader credit and preserve any segment-level source-presented attribution.",
    status: "deterministic-skeleton-pending-local-review",
  }));
}

function requiredString(value, label, minimum = 1) {
  if (typeof value !== "string" || value.trim().length < minimum) throw new Error(`${label} must be a string of at least ${minimum} characters.`);
}

export function validateReviewOverride(review, sourceId, records) {
  if (review.schemaVersion !== "1.0.0" || review.sourceId !== sourceId || review.status !== "local-agent-reviewed-candidate") {
    throw new Error(`${sourceId}: review identity/status does not match the dossier schema.`);
  }
  if (review.review?.mode !== "local-codex-agent" || review.review.externalModelApiUsed !== false ||
      review.review.batchModelReviewed !== false || review.review.humanReviewed !== false) {
    throw new Error(`${sourceId}: review must retain the local-only, non-human, non-batch label.`);
  }
  requiredString(review.review.reviewer, `${sourceId}.review.reviewer`, 2);
  requiredString(review.review.reviewedAt, `${sourceId}.review.reviewedAt`, 10);
  requiredString(review.summary, `${sourceId}.summary`, 30);
  const byId = new Map(records.map((record) => [record.id, record]));
  if (!Array.isArray(review.recommendedSequences) || review.recommendedSequences.length === 0) {
    throw new Error(`${sourceId}: at least one locally reviewed sequence is required.`);
  }
  const sequenceIds = new Set();
  const recommendedSegmentIds = new Set();
  for (const sequence of review.recommendedSequences) {
    if (sequenceIds.has(sequence.id)) throw new Error(`${sourceId}: duplicate sequence ID ${sequence.id}.`);
    sequenceIds.add(sequence.id);
    if (!Array.isArray(sequence.sectionIds) || sequence.sectionIds.length === 0 ||
        sequence.sectionIds.some((sectionId) => !SECTION_IDS.includes(sectionId))) {
      throw new Error(`${sequence.id}: sectionIds must contain only canonical Seder sections.`);
    }
    if (!Array.isArray(sequence.segmentIds) || sequence.segmentIds.length < 2 || sequence.segmentIds.length > 8 || new Set(sequence.segmentIds).size !== sequence.segmentIds.length) {
      throw new Error(`${sequence.id}: sequences require 2-8 unique canonical IDs.`);
    }
    if (sequence.insertionSectionId !== undefined &&
        (!SECTION_IDS.includes(sequence.insertionSectionId) || !sequence.sectionIds.includes(sequence.insertionSectionId))) {
      throw new Error(`${sequence.id}: insertionSectionId must be a canonical section already represented in sectionIds.`);
    }
    const selected = sequence.segmentIds.map((id) => byId.get(id));
    if (selected.some((record) => !record)) throw new Error(`${sequence.id}: sequence references a foreign or missing canonical ID.`);
    sequence.segmentIds.forEach((id) => recommendedSegmentIds.add(id));
    if (selected.some((record, index) => index > 0 && record.order <= selected[index - 1].order)) {
      throw new Error(`${sequence.id}: canonical order must be strictly increasing.`);
    }
    const requiredGates = [...new Set(selected.flatMap((record) => localPolicyReview(record).editorialGates))];
    if (requiredGates.some((gate) => !sequence.editorialGates.includes(gate))) throw new Error(`${sequence.id}: required editorial gate is missing.`);
    if (selected.some((record) => localPolicyReview(record).exclusionReasons.length > 0)) {
      throw new Error(`${sequence.id}: a locally quarantined segment may not enter a recommended sequence.`);
    }
    if (requiredGates.some((gate) => gate.includes("explicit")) && sequence.requiresExplicitOptIn !== true) {
      throw new Error(`${sequence.id}: explicit material must require opt-in.`);
    }
    for (const [field, minimum] of [["title", 4], ["beginnerContext", 20], ["rationale", 20], ["creditNotes", 10]]) {
      requiredString(sequence[field], `${sequence.id}.${field}`, minimum);
    }
  }
  for (const exclusion of review.exclusions ?? []) {
    if (!byId.has(exclusion.segmentId) || !Array.isArray(exclusion.reasons) || exclusion.reasons.length === 0) {
      throw new Error(`${sourceId}: invalid explicit exclusion record.`);
    }
    if (recommendedSegmentIds.has(exclusion.segmentId)) {
      throw new Error(`${sourceId}: explicitly excluded segment ${exclusion.segmentId} may not enter a recommended sequence.`);
    }
  }
  return true;
}

function resolvedSequence(sequence, recordsById) {
  const records = sequence.segmentIds.map((id) => recordsById.get(id));
  return {
    ...sequence,
    status: sequence.status ?? "local-agent-reviewed-candidate",
    sourceSpan: {
      start: records[0].sourceLocation,
      end: records[records.length - 1].sourceLocation,
      locators: records.map((record) => ({ id: record.id, sourceLocation: record.sourceLocation, locator: record.locator })),
    },
    totalWords: records.reduce((sum, record) => sum + record.wordCount, 0),
    exactTextSequenceSha256: sha256(records.map((record) => record.exactText).join("\n\n")),
    sourcePresentedAttribution: [...new Set(records.flatMap((record) => record.sourcePresentedAttribution ?? []))],
    runtimeEligible: false,
  };
}

export function buildDossier({ sourceManifest, sourceIndex, records, reviewOverride = null }) {
  if (reviewOverride) validateReviewOverride(reviewOverride, sourceManifest.sourceId, records);
  const recordsById = new Map(records.map((record) => [record.id, record]));
  const reviewedSequences = reviewOverride?.recommendedSequences ?? deterministicSequenceSkeletons(sourceManifest.sourceId, records);
  const policies = records.map((record) => ({ record, policy: localPolicyReview(record) }));
  const sectionCoverage = Object.fromEntries(SECTION_IDS.map((sectionId) => {
    const matches = records.filter((record) => record.sectionIds.includes(sectionId));
    return [sectionId, { segmentCount: matches.length, segmentIds: matches.map((record) => record.id) }];
  }));
  const explicitExclusions = new Map((reviewOverride?.exclusions ?? []).map((item) => [item.segmentId, item.reasons]));
  const exclusions = policies.flatMap(({ record, policy }) => {
    const reasons = [...new Set([...policy.exclusionReasons, ...(explicitExclusions.get(record.id) ?? [])])];
    return reasons.length ? [{ id: record.id, sourceLocation: record.sourceLocation, reasons }] : [];
  });
  return {
    schemaVersion: "1.0.0",
    sourceId: sourceManifest.sourceId,
    title: sourceIndex.title,
    creator: sourceIndex.creator,
    family: sourceIndex.family,
    status: reviewOverride ? "local-agent-reviewed-candidate" : "deterministic-skeleton-pending-local-review",
    review: reviewOverride?.review ?? {
      mode: "local-deterministic-skeleton",
      externalModelApiUsed: false,
      batchModelReviewed: false,
      humanReviewed: false,
      reviewer: null,
      reviewedAt: null,
    },
    summary: reviewOverride?.summary ?? "Deterministic dossier skeleton awaiting local Codex editorial review of coherent same-source sequences.",
    sourceAssessment: reviewOverride?.sourceAssessment ?? {
      voice: sourceIndex.voiceTags.join(", "),
      bestUses: sourceIndex.themeTags,
      beginnerRisks: sourceIndex.audienceTags.includes("specialist") ? ["Specialist context requires a plain-language introduction."] : [],
      politicalContext: sourceIndex.politicalFramingTags.join(", "),
      creditContext: `Use: ${sourceManifest.credit} License: ${sourceIndex.rights.license}.`,
    },
    corpus: {
      acquisitionKind: sourceManifest.acquisitionKind,
      pageCount: sourceManifest.pageCount,
      segmentCount: records.length,
      exactCharacterCount: records.reduce((sum, record) => sum + record.characterCount, 0),
      exactWordCount: records.reduce((sum, record) => sum + record.wordCount, 0),
      reconstructionSha256: sourceManifest.reconstructedContentSha256,
      reconstructionVerified: sourceManifest.coverageVerified,
    },
    credit: {
      readerCredit: sourceManifest.credit,
      license: sourceIndex.rights.license,
      conditions: sourceIndex.rights.conditions,
      primaryUrl: sourceIndex.primaryUrl,
    },
    sectionCoverage,
    policySummary: {
      localQuarantineCount: exclusions.length,
      hardRiskCount: policies.filter(({ policy }) => policy.hardRisks.length > 0).length,
      explicitPoliticalCount: policies.filter(({ policy }) => policy.explicitPolitics.length > 0).length,
      jerusalemGateCount: policies.filter(({ policy }) => policy.editorialGates.includes("traditional-without-social-justice-only")).length,
      sourcePresentedAttributionCount: records.filter((record) => (record.sourcePresentedAttribution ?? []).length > 0).length,
    },
    recommendedSequences: reviewedSequences.map((sequence) => resolvedSequence(sequence, recordsById)),
    exclusions,
    notes: reviewOverride?.notes ?? ["Exact source text remains in the canonical JSONL and local lazy pack; this dossier resolves it by stable ID and locator."],
  };
}

export function buildLocalModule(record, reviewOverride) {
  const policy = localPolicyReview(record);
  const reviewedSequenceIds = (reviewOverride?.recommendedSequences ?? []).flatMap((sequence) =>
    sequence.segmentIds.includes(record.id) ? [sequence.id] : []);
  return {
    id: record.id,
    sourceId: record.sourceId,
    family: record.family,
    exactText: record.exactText,
    locator: record.locator,
    sourceLocation: record.sourceLocation,
    provenanceHash: record.provenanceHash,
    wordCount: record.wordCount,
    characterCount: record.characterCount,
    sectionIds: record.sectionIds,
    themes: record.themes,
    audience: record.audience,
    tones: record.tones,
    seam: record.seam,
    sourcePresentedAttribution: record.sourcePresentedAttribution,
    attribution: record.attribution,
    rights: {
      license: record.sourceRightsLicense,
      conditions: record.sourceRightsConditions,
      embeddedMaterialRequiresItemReview: record.embeddedMaterialRequiresItemReview,
      runtimeEligible: false,
    },
    localPolicy: policy,
    localReviewStatus: reviewedSequenceIds.length > 0 ? "local-agent-reviewed-candidate" : policy.candidateStatus,
    reviewedSequenceIds,
    approvalStatus: policy.exclusionReasons.length > 0 ? "quarantined" : "candidate-review",
    runtimeEligible: false,
  };
}
