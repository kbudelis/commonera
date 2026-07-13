#!/usr/bin/env node

/** Validate the complete, research-only source segment library. */

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SHA256 = /^[a-f0-9]{64}$/;
const SECTION_IDS = new Set([
  "kadesh", "urchatz", "karpas", "yachatz", "maggid", "rachtzah",
  "motzi-matzah", "maror", "korech", "shulchan-orech", "tzafun",
  "barech", "hallel", "nirtzah",
]);
const SEAMS = new Set([
  "section-opening", "ritual-setup", "ritual-explanation", "story-core",
  "story-reflection", "discussion-prompt", "before-blessing", "after-blessing",
  "meal-transition", "song-introduction", "closing-reflection",
  "historical-sidebar", "plate-option", "optional-insert",
]);

export const normalizeSegmentText = (value) => String(value).normalize("NFC").replace(/\s+/gu, " ").trim();
export const segmentHash = (value) => createHash("sha256").update(normalizeSegmentText(value), "utf8").digest("hex");

function isString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function safePath(root, relative) {
  if (!isString(relative) || path.isAbsolute(relative)) return null;
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, relative);
  return resolved.startsWith(`${resolvedRoot}${path.sep}`) ? resolved : null;
}

function extractNormalizedContent(value) {
  const lineNormalized = value.replace(/\r\n?/g, "\n");
  const headerEnd = lineNormalized.indexOf("\n\n");
  const body = headerEnd >= 0 ? lineNormalized.slice(headerEnd + 2) : lineNormalized;
  const marker = /^===== ([^\n=]+) =====$/gm;
  const matches = [...body.matchAll(marker)];
  if (!matches.length) return normalizeSegmentText(body);
  const units = [];
  const preface = normalizeSegmentText(body.slice(0, matches[0].index));
  if (preface) units.push(preface);
  matches.forEach((match, index) => {
    const text = normalizeSegmentText(body.slice(match.index + match[0].length, matches[index + 1]?.index ?? body.length));
    if (text) units.push(text);
  });
  return units.join(" ");
}

function parseJsonLines(value, label, errors) {
  const records = [];
  for (const [index, line] of value.split("\n").entries()) {
    if (!line.trim()) continue;
    try {
      records.push(JSON.parse(line));
    } catch (error) {
      errors.push(`${label}:${index + 1}: invalid JSON: ${error.message}`);
    }
  }
  return records;
}

function validateArray(value, label, errors, allowed = null) {
  if (!Array.isArray(value) || !value.length) {
    errors.push(`${label} must be a non-empty array.`);
    return;
  }
  for (const entry of value) {
    if (!isString(entry)) errors.push(`${label} contains a non-string or empty value.`);
    if (allowed && !allowed.has(entry)) errors.push(`${label} contains unknown value ${JSON.stringify(entry)}.`);
  }
}

export async function validateSourceSegmentLibrary({ repositoryRoot, local = false } = {}) {
  const root = repositoryRoot ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const errors = [];
  const [manifest, index] = await Promise.all([
    readFile(path.join(root, "research", "generated", "source-segment-manifest.json"), "utf8").then(JSON.parse),
    readFile(path.join(root, "research", "source-runtime-index.json"), "utf8").then(JSON.parse),
  ]);
  const sourceById = new Map(index.sources.map((source) => [source.sourceId, source]));
  const ids = new Set();
  let totalSegments = 0;
  let totalApproved = 0;
  let totalQuarantined = 0;
  let totalCharacters = 0;

  if (manifest.sourceCount !== 20 || manifest.sources?.length !== 20) {
    errors.push(`Manifest must contain 20 sources; received ${manifest.sources?.length ?? "none"}.`);
  }
  if (manifest.segmentCount < 1_000) errors.push(`Manifest must contain at least 1,000 complete-corpus segments; received ${manifest.segmentCount}.`);

  for (const [sourceOrder, sourceManifest] of (manifest.sources ?? []).entries()) {
    const label = sourceManifest.sourceId ?? `source-${sourceOrder}`;
    const source = sourceById.get(sourceManifest.sourceId);
    if (!source) {
      errors.push(`${label}: source is absent from the runtime source index.`);
      continue;
    }
    if (sourceManifest.sourceOrder !== sourceOrder) errors.push(`${label}: sourceOrder must be ${sourceOrder}.`);
    const filename = safePath(root, sourceManifest.file);
    if (!filename) {
      errors.push(`${label}: unsafe segment file path ${JSON.stringify(sourceManifest.file)}.`);
      continue;
    }
    const records = parseJsonLines(await readFile(filename, "utf8"), sourceManifest.file, errors);
    let previousEnd = -1;
    for (const [order, record] of records.entries()) {
      const recordLabel = `${label}/${record.id ?? order}`;
      if (!isString(record.id) || ids.has(record.id)) errors.push(`${recordLabel}: id must be non-empty and globally unique.`);
      ids.add(record.id);
      if (record.sourceId !== source.sourceId) errors.push(`${recordLabel}: sourceId does not match its file.`);
      if (record.sourceOrder !== sourceOrder) errors.push(`${recordLabel}: sourceOrder must be ${sourceOrder}.`);
      if (record.order !== order) errors.push(`${recordLabel}: order must be ${order}.`);
      if (!Number.isInteger(record.unitOrder) || !Number.isInteger(record.unitSegmentOrder)) {
        errors.push(`${recordLabel}: unit order fields must be integers.`);
      }
      if (!isString(record.exactText) || record.exactText !== normalizeSegmentText(record.exactText)) {
        errors.push(`${recordLabel}: exactText must be non-empty and already normalized.`);
      }
      if (record.provenanceHash !== segmentHash(record.exactText)) errors.push(`${recordLabel}: provenance hash mismatch.`);
      if (!SHA256.test(record.provenanceHash ?? "")) errors.push(`${recordLabel}: invalid provenance hash shape.`);
      const wordCount = record.exactText?.split(" ").filter(Boolean).length ?? 0;
      if (record.wordCount !== wordCount) errors.push(`${recordLabel}: wordCount must be ${wordCount}.`);
      if (record.characterCount !== record.exactText?.length) errors.push(`${recordLabel}: characterCount mismatch.`);
      if (wordCount > 250) errors.push(`${recordLabel}: exceeds the 250-word segment maximum.`);
      if (wordCount < 40 && !record.qualityFlags?.includes("short-complete-unit")) {
        errors.push(`${recordLabel}: sub-40-word complete unit must carry short-complete-unit.`);
      }
      validateArray(record.sectionIds, `${recordLabel}.sectionIds`, errors, SECTION_IDS);
      validateArray(record.themes, `${recordLabel}.themes`, errors);
      validateArray(record.audience, `${recordLabel}.audience`, errors);
      validateArray(record.tones, `${recordLabel}.tones`, errors);
      if (!SEAMS.has(record.seam)) errors.push(`${recordLabel}: unknown seam ${JSON.stringify(record.seam)}.`);
      if (!Array.isArray(record.sourcePresentedAttribution)) errors.push(`${recordLabel}: sourcePresentedAttribution must be an array.`);
      if (!isString(record.attribution?.creator) || !isString(record.attribution?.containingSource) || !isString(record.attribution?.readerCredit)) {
        errors.push(`${recordLabel}: complete source credit is required.`);
      }
      if (record.classificationStatus !== "machine-classified") errors.push(`${recordLabel}: classificationStatus must be machine-classified.`);
      if (record.editorialReviewStatus !== "pending-context-review") errors.push(`${recordLabel}: editorial review status must remain explicit.`);
      if (record.runtimeEligible !== false) errors.push(`${recordLabel}: research segments must not be runtime eligible.`);
      if (!Array.isArray(record.qualityFlags) || !Array.isArray(record.quarantineReasons)) {
        errors.push(`${recordLabel}: qualityFlags and quarantineReasons must be arrays.`);
      }
      if (record.approvalStatus === "approved") {
        totalApproved += 1;
        if (record.quarantineReasons?.length) errors.push(`${recordLabel}: approved segment cannot have quarantine reasons.`);
      } else if (record.approvalStatus === "quarantined") {
        totalQuarantined += 1;
        if (!record.quarantineReasons?.length) errors.push(`${recordLabel}: quarantined segment requires a reason.`);
      } else {
        errors.push(`${recordLabel}: approvalStatus must be approved or quarantined.`);
      }
      const locator = record.locator;
      if (!locator || !isString(locator.label) || locator.localExtract !== source.acquisition.extractFile) {
        errors.push(`${recordLabel}: invalid source locator.`);
      }
      if (locator?.sourceSha256 !== source.acquisition.sha256 || locator?.extractSha256 !== source.acquisition.extractSha256) {
        errors.push(`${recordLabel}: locator hashes do not match the source index.`);
      }
      if (!Number.isInteger(locator?.normalizedStartOffset) || !Number.isInteger(locator?.normalizedEndOffset)) {
        errors.push(`${recordLabel}: normalized offsets must be integers.`);
      } else {
        if (locator.normalizedStartOffset !== previousEnd + 1) {
          errors.push(`${recordLabel}: expected contiguous start offset ${previousEnd + 1}, received ${locator.normalizedStartOffset}.`);
        }
        if (locator.normalizedEndOffset - locator.normalizedStartOffset !== record.exactText.length) {
          errors.push(`${recordLabel}: normalized offsets do not span exactText.`);
        }
        previousEnd = locator.normalizedEndOffset;
      }
    }

    const reconstruction = records.map((record) => record.exactText).join(" ");
    const reconstructionHash = segmentHash(reconstruction);
    if (previousEnd !== reconstruction.length) errors.push(`${label}: final normalized offset does not equal reconstruction length.`);
    if (reconstructionHash !== sourceManifest.normalizedContentSha256 || reconstructionHash !== sourceManifest.reconstructedContentSha256) {
      errors.push(`${label}: reconstruction hash does not match the manifest.`);
    }
    if (records.length !== sourceManifest.segmentCount) errors.push(`${label}: segment count does not match the manifest.`);
    if (records.filter((record) => record.approvalStatus === "approved").length !== sourceManifest.approvedPrecomputeCount) {
      errors.push(`${label}: approved precompute count does not match the manifest.`);
    }
    if (records.filter((record) => record.approvalStatus === "quarantined").length !== sourceManifest.quarantinedCount) {
      errors.push(`${label}: quarantine count does not match the manifest.`);
    }
    if (reconstruction.length !== sourceManifest.normalizedContentCharacters) errors.push(`${label}: normalized content character count mismatch.`);
    if (sourceManifest.coverageVerified !== true) errors.push(`${label}: coverageVerified must be true.`);

    if (local) {
      const extractFilename = safePath(root, source.acquisition.extractFile);
      if (!extractFilename) {
        errors.push(`${label}: unsafe local extract path.`);
      } else {
        const bytes = await readFile(extractFilename);
        const extractHash = createHash("sha256").update(bytes).digest("hex");
        if (extractHash !== source.acquisition.extractSha256) errors.push(`${label}: local extract hash mismatch.`);
        const rawNormalized = normalizeSegmentText(bytes.toString("utf8"));
        for (const record of records) {
          if (!rawNormalized.includes(record.exactText)) errors.push(`${label}/${record.id}: exact segment is absent from the local extract.`);
        }
        const extractedContent = extractNormalizedContent(bytes.toString("utf8"));
        if (extractedContent !== reconstruction) errors.push(`${label}: reconstructed segments do not equal normalized local source content.`);
      }
    }

    totalSegments += records.length;
    totalCharacters += reconstruction.length;
  }

  if (totalSegments !== manifest.segmentCount) errors.push(`Total segment count ${totalSegments} does not match manifest ${manifest.segmentCount}.`);
  if (totalApproved !== manifest.approvedPrecomputeCount) errors.push(`Total approved count ${totalApproved} does not match manifest ${manifest.approvedPrecomputeCount}.`);
  if (totalQuarantined !== manifest.quarantinedCount) errors.push(`Total quarantine count ${totalQuarantined} does not match manifest ${manifest.quarantinedCount}.`);
  if (totalCharacters !== manifest.normalizedContentCharacters) errors.push(`Total normalized characters ${totalCharacters} do not match manifest ${manifest.normalizedContentCharacters}.`);
  if (manifest.allSourcesCoverageVerified !== true) errors.push("Manifest allSourcesCoverageVerified must be true.");

  return { errors, manifest };
}

const scriptPath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  const unknown = process.argv.slice(2).filter((argument) => argument !== "--local");
  if (unknown.length) {
    console.error(`Unknown argument(s): ${unknown.join(", ")}`);
    process.exitCode = 2;
  } else {
    try {
      const local = process.argv.includes("--local");
      const { errors, manifest } = await validateSourceSegmentLibrary({ local });
      if (errors.length) {
        console.error(`Source segment library validation failed with ${errors.length} error(s):`);
        for (const error of errors) console.error(`- ${error}`);
        process.exitCode = 1;
      } else {
        console.log(
          `Source segment library valid: ${manifest.sourceCount} sources, ${manifest.segmentCount} coherent segments, ` +
          `${manifest.normalizedContentCharacters} normalized source characters${local ? "; local extracts and reconstruction verified" : ""}.`,
        );
      }
    } catch (error) {
      console.error(`Could not validate source segment library: ${error.stack ?? error.message}`);
      process.exitCode = 1;
    }
  }
}
