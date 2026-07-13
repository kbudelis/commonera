#!/usr/bin/env node

/**
 * Build the local-only source library and coherent reviewed sequence modules.
 *
 * This command never reads an API key and never uses the network. It resolves
 * local editorial dossiers against the canonical 20-source segment library,
 * preserves the complete exact corpus in lazy per-source packs, and exposes
 * only locally reviewed same-source sequences to the runtime matcher.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  SECTION_IDS,
  buildDossier,
  loadCanonicalCorpus,
  localPolicyReview,
  readJson,
  sha256,
  validateReviewOverride,
  writeJson,
} from "./lib/local-corpus-dossiers.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(projectRoot, "research", "generated", "source-segment-manifest.json");
const sourceIndexPath = path.join(projectRoot, "research", "source-runtime-index.json");
const reviewRoot = path.join(projectRoot, "research", "source-dossier-reviews");
const dossierOutputRoot = path.join(projectRoot, "research", "generated", "source-dossiers");
const outputRoot = path.join(projectRoot, "content", "generated", "local-corpus");
const packOutputRoot = path.join(outputRoot, "source-packs");

const THEMES = new Set([
  "feminist", "lgbtq", "social-justice", "environment", "interfaith",
  "secular", "mindfulness", "traditional", "family-storytelling",
]);
const TONES = new Set(["playful", "balanced", "reverent"]);
const LENGTHS = ["20", "45", "90"];

function parseArgs(argv) {
  return {
    requireComplete: argv.includes("--require-complete"),
    check: argv.includes("--check"),
  };
}

async function optionalJson(filename) {
  try {
    return await readJson(filename);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function unique(values) {
  return [...new Set(values)];
}

function validTags(values, allowed, fallback) {
  const selected = unique(values).filter((value) => allowed.has(value));
  return selected.length ? selected : unique(fallback).filter((value) => allowed.has(value));
}

function lengthTiers(wordCount) {
  if (wordCount <= 160) return LENGTHS;
  if (wordCount <= 420) return ["45", "90"];
  return ["90"];
}

function materialKind(source, records) {
  if (records.some((record) => (record.sourcePresentedAttribution ?? []).length > 0)) return "embedded-third-party";
  if (/public domain|CC0/iu.test(source.rights.license)) return "public-domain";
  if (source.family === "traditional-liturgical") return "traditional-liturgy";
  return "creator-authored";
}

function sequenceModule(source, sequence, recordsById) {
  const records = sequence.segmentIds.map((id) => recordsById.get(id));
  if (records.some((record) => !record)) throw new Error(`${sequence.id}: unresolved canonical segment.`);
  const exactText = records.map((record) => record.exactText).join("\n\n");
  const policies = records.map((record) => localPolicyReview(record));
  const editorialGates = unique([
    ...(sequence.editorialGates ?? []),
    ...policies.flatMap((policy) => policy.editorialGates),
  ]).sort();
  const exclusionReasons = unique(policies.flatMap((policy) => policy.exclusionReasons));
  if (exclusionReasons.length) {
    throw new Error(`${sequence.id}: reviewed sequence contains locally quarantined material (${exclusionReasons.join(", ")}).`);
  }
  const sourcePresentedAttribution = unique(records.flatMap((record) => record.sourcePresentedAttribution ?? []));
  const wordCount = records.reduce((sum, record) => sum + record.wordCount, 0);
  const sourceSectionIds = unique(sequence.sectionIds.filter(Boolean));
  if (!sourceSectionIds.length || sourceSectionIds.some((sectionId) => !SECTION_IDS.includes(sectionId))) {
    throw new Error(`${sequence.id}: reviewed sequence has an invalid source section.`);
  }
  const insertionSectionId = sequence.insertionSectionId ?? (
    sourceSectionIds.length === 1 ? sourceSectionIds[0] : null
  );
  if (insertionSectionId && !sourceSectionIds.includes(insertionSectionId)) {
    throw new Error(`${sequence.id}: insertionSectionId must be one of the reviewed source sections.`);
  }
  const sectionIds = insertionSectionId ? [insertionSectionId] : sourceSectionIds;
  const fallbackThemes = records.flatMap((record) => record.themes ?? []);
  const fallbackTones = records.flatMap((record) => record.tones ?? []);
  const audience = unique(records.flatMap((record) => record.audience ?? []));
  const requiresExplicitOptIn = sequence.requiresExplicitOptIn === true ||
    policies.some((policy) => policy.requiresExplicitOptIn);
  const insertionSafe = insertionSectionId !== null;
  const sourceLocation = records.length === 1
    ? records[0].sourceLocation
    : `${records[0].sourceLocation} through ${records.at(-1).sourceLocation}`;

  return {
    id: `local-sequence-${sequence.id}`,
    sourceId: source.sourceId,
    family: source.family,
    title: sequence.title,
    exactText,
    segmentIds: sequence.segmentIds,
    sourceLocation,
    locator: {
      edition: source.title,
      sourceLocation,
      localExtract: source.acquisition.extractFile,
      sourceSha256: source.acquisition.sha256,
      extractSha256: source.acquisition.extractSha256,
      componentLocators: records.map((record) => ({ id: record.id, ...record.locator })),
    },
    provenanceHash: sha256(exactText),
    componentProvenanceHashes: records.map((record) => record.provenanceHash),
    wordCount,
    characterCount: exactText.length,
    sectionIds,
    sourceSectionIds,
    insertionSectionId,
    themes: validTags(sequence.themes ?? [], THEMES, fallbackThemes),
    audience: audience.length ? audience : ["adults"],
    tones: validTags(sequence.tones ?? [], TONES, fallbackTones),
    lengthTiers: editorialGates.includes("long-form-only") ? ["90"] : lengthTiers(wordCount),
    seam: records[0].seam,
    beginnerContext: sequence.beginnerContext,
    rationale: sequence.rationale,
    creditNotes: sequence.creditNotes,
    sourcePresentedAttribution,
    attribution: {
      creator: source.creator,
      containingSource: source.title,
      sourcePresented: sourcePresentedAttribution.length ? sourcePresentedAttribution.join("; ") : null,
      readerCredit: `From ${source.title} by ${source.creator}.`,
    },
    rights: {
      runtimeEligible: insertionSafe,
      license: source.rights.license,
      materialKind: materialKind(source, records),
      sourcePresentedAttributionRequired: sourcePresentedAttribution.length > 0,
      conditions: source.rights.conditions,
    },
    approvalStatus: insertionSafe ? "approved" : "candidate-review",
    editorialReviewStatus: "local-agent-reviewed-demo",
    approvalBasis: "local-source-dossier-review",
    beginnerSuitable: true,
    requiresExplicitOptIn,
    politicalRisk: editorialGates.length ? "context-sensitive" : "none",
    editorialGates,
    containsThirdPartyAttribution: sourcePresentedAttribution.length > 0,
    evaluatorAttributionClear: true,
    runtimeEligible: insertionSafe,
  };
}

function compactModule(record) {
  const compact = { ...record };
  for (const key of [
    "exactText", "locator", "componentProvenanceHashes",
    "sourcePresentedAttribution", "attribution", "rights",
    "rationale", "creditNotes",
  ]) delete compact[key];
  return compact;
}

function loadersSource(sourceIds) {
  const entries = sourceIds.map((sourceId) =>
    `  ${JSON.stringify(sourceId)}: () => import("./source-packs/${sourceId}.json", { with: { type: "json" } }),`,
  ).join("\n");
  return `/* Generated by scripts/build-local-corpus-library.mjs. */\n` +
    `export const localSourcePackLoaders = {\n${entries}\n} as const;\n\n` +
    `export type LocalSourcePackId = keyof typeof localSourcePackLoaders;\n`;
}

async function build() {
  const args = parseArgs(process.argv.slice(2));
  const [{ manifest, segments }, sourceIndex] = await Promise.all([
    loadCanonicalCorpus({ manifestPath, root: projectRoot }),
    readJson(sourceIndexPath),
  ]);
  const segmentGroups = new Map();
  for (const segment of segments) {
    segmentGroups.set(segment.sourceId, [...(segmentGroups.get(segment.sourceId) ?? []), segment]);
  }
  const indexById = new Map(sourceIndex.sources.map((source) => [source.sourceId, source]));
  const manifestById = new Map(manifest.sources.map((source) => [source.sourceId, source]));
  const missingReviews = [];
  const dossiers = [];
  const packs = [];
  const catalog = [];
  const sequences = [];

  for (const sourceManifest of [...manifest.sources].sort((left, right) => left.sourceOrder - right.sourceOrder)) {
    const source = indexById.get(sourceManifest.sourceId);
    const records = segmentGroups.get(sourceManifest.sourceId) ?? [];
    if (!source) throw new Error(`${sourceManifest.sourceId}: missing source runtime metadata.`);
    const review = await optionalJson(path.join(reviewRoot, `${source.sourceId}.json`));
    if (!review) missingReviews.push(source.sourceId);
    else validateReviewOverride(review, source.sourceId, records);
    const dossier = buildDossier({
      sourceManifest: manifestById.get(source.sourceId),
      sourceIndex: source,
      records,
      reviewOverride: review,
    });
    dossiers.push(dossier);
    const recordsById = new Map(records.map((record) => [record.id, record]));
    const reviewedSequenceModules = review
      ? review.recommendedSequences.map((sequence) => sequenceModule(source, sequence, recordsById))
      : [];
    sequences.push(...reviewedSequenceModules.map((module) => ({
      id: module.id,
      sourceId: module.sourceId,
      title: module.title,
      segmentIds: module.segmentIds,
      sectionIds: module.sectionIds,
      sourceSectionIds: module.sourceSectionIds,
      insertionSectionId: module.insertionSectionId,
      themes: module.themes,
      tones: module.tones,
      lengthTiers: module.lengthTiers,
      beginnerContext: module.beginnerContext,
      rationale: module.rationale,
      creditNotes: module.creditNotes,
      requiresExplicitOptIn: module.requiresExplicitOptIn,
      editorialGates: module.editorialGates,
      runtimeEligible: module.runtimeEligible,
    })));
    const pack = {
      schemaVersion: "1.0.0",
      sourceId: source.sourceId,
      sourceTitle: source.title,
      reviewStatus: dossier.status,
      sourceCredit: dossier.credit,
      modules: reviewedSequenceModules,
    };
    packs.push(pack);
    catalog.push({
      sourceId: source.sourceId,
      family: source.family,
      sourceTags: {
        voice: source.voiceTags,
        audience: source.audienceTags,
        themes: source.themeTags,
        politicalFraming: source.politicalFramingTags,
      },
      compatibleFamilies: source.compatibleFamilies,
      incompatibleFamilies: source.incompatibleFamilies,
      requiresExplicitOptIn: source.requiresExplicitOptIn ?? [],
      primarySpineEligible: source.primarySpineEligible,
      runtimeSpineAvailable: source.runtimeSpineAvailable,
      secondaryPassageCap: Math.max(source.secondaryPassageCap, 3),
      modules: reviewedSequenceModules.filter((module) => module.runtimeEligible).map(compactModule),
    });
  }

  if (args.requireComplete && missingReviews.length) {
    throw new Error(`Local dossier review is incomplete (${missingReviews.length}/20 missing): ${missingReviews.join(", ")}`);
  }

  const reviewedCharacters = packs.flatMap((pack) => pack.modules)
    .reduce((sum, module) => sum + module.characterCount, 0);
  const runtimeModules = packs.flatMap((pack) => pack.modules).filter((module) => module.runtimeEligible);
  const runtimeCharacters = runtimeModules.reduce((sum, module) => sum + module.characterCount, 0);
  const fullCharacters = segments.reduce((sum, module) => sum + module.characterCount, 0);
  const corpusManifest = {
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString().slice(0, 10),
    processingMode: "local-source-dossier-review",
    externalModelApiUsed: false,
    humanReviewClaimed: false,
    completeLocalCorpus: {
      sourceCount: packs.length,
      segmentCount: segments.length,
      exactCharacterCount: fullCharacters,
      canonicalReconstructionVerified: manifest.allSourcesCoverageVerified === true,
      storage: "research/generated/source-segments/*.jsonl",
      runtimeShippingPolicy: "The complete corpus is research-only; browser packs contain reviewed sequences only.",
    },
    localEditorialReview: {
      reviewedSourceCount: packs.length - missingReviews.length,
      missingSourceIds: missingReviews,
      reviewedSequenceCount: sequences.length,
      reviewedSequenceExactCharacterCount: reviewedCharacters,
      status: missingReviews.length ? "in-progress" : "complete-local-agent-review",
    },
    runtimePack: {
      sourceCount: catalog.filter((source) => source.modules.length > 0).length,
      moduleCount: runtimeModules.length,
      exactCharacterCount: runtimeCharacters,
      maturity: missingReviews.length ? "local-review-in-progress" : "local-reviewed-demo-pack",
      activeRuntimeLoadingMode: "per-source-dynamic",
      comprehensiveLocalOrganization: missingReviews.length === 0,
    },
  };

  if (args.check) {
    console.log(JSON.stringify(corpusManifest, null, 2));
    return;
  }

  await Promise.all([
    mkdir(dossierOutputRoot, { recursive: true }),
    mkdir(packOutputRoot, { recursive: true }),
    ...dossiers.map((dossier) => writeJson(path.join(dossierOutputRoot, `${dossier.sourceId}.json`), dossier)),
    ...packs.map((pack) => writeJson(path.join(packOutputRoot, `${pack.sourceId}.json`), pack)),
    writeJson(path.join(outputRoot, "source-module-catalog.json"), { schemaVersion: "1.0.0", sources: catalog }),
    writeJson(path.join(outputRoot, "source-sequences.json"), { schemaVersion: "1.0.0", sequences }),
    writeJson(path.join(outputRoot, "local-corpus-manifest.json"), corpusManifest),
  ]);
  await writeFile(
    path.join(outputRoot, "source-pack-loaders.ts"),
    loadersSource(packs.map((pack) => pack.sourceId)),
    "utf8",
  );
  console.log(JSON.stringify(corpusManifest, null, 2));
}

await build();
