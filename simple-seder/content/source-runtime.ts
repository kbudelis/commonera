import runtimeIndexData from "../research/source-runtime-index.json" with { type: "json" };

import type { GenerationProfile, ThemeId, Tone } from "../lib/types";
import { sourceCatalog } from "./pack";
import {
  reviewedSourcePassages,
  SEDER_SECTION_ORDER,
  type SederSectionId,
} from "./source-spines";

export type RuntimePassageSeam =
  | "section-opening"
  | "ritual-setup"
  | "ritual-explanation"
  | "story-core"
  | "story-reflection"
  | "discussion-prompt"
  | "before-blessing"
  | "after-blessing"
  | "meal-transition"
  | "song-introduction"
  | "closing-reflection"
  | "historical-sidebar"
  | "plate-option"
  | "optional-insert";

export interface RuntimePassageLocator {
  edition: string;
  sourceLocation: string;
  localExtract: string;
  sourceSha256: string;
  extractSha256: string;
}

export interface RuntimePassageRights {
  runtimeEligible: boolean;
  license: string;
  materialKind:
    | "creator-authored"
    | "traditional-liturgy"
    | "public-domain"
    | "embedded-third-party";
  sourcePresentedAttributionRequired: boolean;
  conditions: string[];
}

export interface RuntimePassageAttribution {
  creator: string;
  containingSource: string;
  sourcePresented: string | null;
  readerCredit: string;
}

export interface RuntimeSourcePassage {
  id: string;
  sourceId: string;
  family: string;
  exactText: string;
  /** Separate house-written orientation for a reviewed multi-segment insert. */
  beginnerContext?: string;
  locator: RuntimePassageLocator;
  sectionIds: SederSectionId[];
  themes: ThemeId[];
  audience: string[];
  tones: Tone[];
  lengthTiers: Array<"20" | "45" | "90">;
  seam: RuntimePassageSeam;
  wordCount: number;
  approvalStatus: "approved" | "candidate-review" | "quarantined";
  rights: RuntimePassageRights;
  provenanceHash: string;
  attribution: RuntimePassageAttribution;
}

export interface RuntimeSourceRecord {
  sourceId: string;
  title: string;
  creator: string;
  primaryUrl: string;
  authoritativeFileUrl: string;
  family: string;
  voiceTags: string[];
  audienceTags: string[];
  themeTags: ThemeId[];
  politicalFramingTags: string[];
  compatibleFamilies: string[];
  incompatibleFamilies: string[];
  requiresExplicitOptIn?: string[];
  primarySpineEligible: boolean;
  runtimeSpineAvailable: boolean;
  secondaryPassageCap: number;
  rights: {
    basis: string;
    license: string;
    conditions: string[];
    runtimeEligible: boolean;
    embeddedMaterialRequiresItemReview: boolean;
  };
  acquisition: {
    status: string;
    kind: string;
    localFile: string;
    sha256: string;
    pageCount: number | null;
    extractFile: string;
    extractMode: string;
    extractSha256: string;
    extractCharacters: number;
    officialSnapshotSha256: string | null;
    verifiedAt: string;
  };
  passages: RuntimeSourcePassage[];
}

export interface RuntimeSourceIndex {
  schemaVersion: string;
  corpusVersion: string;
  compiledAt: string;
  localMaterialPolicy: string;
  cohesionPolicy: {
    dominantSourceCount: number;
    maximumSecondaryFamilies: number;
    maximumSecondarySources: number;
    compatibilityDirection: "dominant-to-secondary";
    rules: string[];
  };
  passageSchema: {
    required: string[];
    sectionIds: string[];
    lengthTiers: string[];
    seams: string[];
    approvalStatuses: string[];
    provenanceHashBasis: string;
  };
  sources: RuntimeSourceRecord[];
}

export interface RuntimePassageCandidate {
  passage: RuntimeSourcePassage;
  source: RuntimeSourceRecord;
  sectionId: SederSectionId;
  score: number;
}

/**
 * A bounded view of source passages available to one generation. The default
 * context contains the tracked 40-module smoke index. A comprehensive build
 * may supply a context assembled from one or two lazily loaded per-source
 * packs without changing the deterministic matching rules below.
 */
export interface RuntimePassageContext {
  mode: "embedded-smoke-index" | "per-source-dynamic";
  sources: RuntimeSourceRecord[];
  passages: RuntimeSourcePassage[];
  approvedPassages: RuntimeSourcePassage[];
  errors: string[];
}

const THEME_IDS: ThemeId[] = [
  "feminist",
  "lgbtq",
  "social-justice",
  "environment",
  "interfaith",
  "secular",
  "mindfulness",
  "traditional",
  "family-storytelling",
];
const TONES: Tone[] = ["playful", "balanced", "reverent"];
const LENGTHS = ["20", "45", "90"] as const;
const SEAMS: RuntimePassageSeam[] = [
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
const MATERIAL_KINDS = [
  "creator-authored",
  "traditional-liturgy",
  "public-domain",
  "embedded-third-party",
] as const;
const HASH_PATTERN = /^[a-f0-9]{64}$/;

const nonempty = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;
const unique = <T>(values: readonly T[]) => new Set(values).size === values.length;
const normalizedWords = (value: string) =>
  value.normalize("NFC").replace(/\s+/gu, " ").trim().split(" ").filter(Boolean).length;

export const runtimeSourceIndex = runtimeIndexData as unknown as RuntimeSourceIndex;
export const runtimeSources = runtimeSourceIndex.sources;
export const runtimePassages = runtimeSources.flatMap((source) => source.passages);

function validatePassage(
  passage: RuntimeSourcePassage,
  source: RuntimeSourceRecord,
  passageIds: Set<string>,
): string[] {
  const errors: string[] = [];
  const label = passage?.id || `(passage in ${source.sourceId})`;
  if (!nonempty(passage?.id)) errors.push(`${label} needs a stable ID.`);
  else if (passageIds.has(passage.id)) errors.push(`Duplicate runtime passage ID: ${passage.id}.`);
  else passageIds.add(passage.id);
  if (passage?.sourceId !== source.sourceId) errors.push(`${label} has the wrong sourceId.`);
  if (passage?.family !== source.family) errors.push(`${label} has the wrong source family.`);
  if (!nonempty(passage?.exactText)) errors.push(`${label} has no exactText.`);
  if (!passage?.locator || ![
    passage.locator.edition,
    passage.locator.sourceLocation,
    passage.locator.localExtract,
  ].every(nonempty)) errors.push(`${label} has an incomplete locator.`);
  if (!HASH_PATTERN.test(passage?.locator?.sourceSha256 ?? "")) errors.push(`${label} has an invalid source hash.`);
  if (!HASH_PATTERN.test(passage?.locator?.extractSha256 ?? "")) errors.push(`${label} has an invalid extract hash.`);
  if (passage?.locator?.sourceSha256 !== source.acquisition.sha256) errors.push(`${label} does not resolve to its acquired source file.`);
  if (passage?.locator?.extractSha256 !== source.acquisition.extractSha256) errors.push(`${label} does not resolve to its searchable extract.`);
  if (!Array.isArray(passage?.sectionIds) || passage.sectionIds.length === 0 ||
      !unique(passage.sectionIds) || passage.sectionIds.some((id) => !SEDER_SECTION_ORDER.includes(id))) {
    errors.push(`${label} has invalid sectionIds.`);
  }
  if (!Array.isArray(passage?.themes) || passage.themes.length === 0 ||
      !unique(passage.themes) || passage.themes.some((theme) => !THEME_IDS.includes(theme))) {
    errors.push(`${label} has invalid themes.`);
  }
  if (!Array.isArray(passage?.audience) || passage.audience.length === 0 || !passage.audience.every(nonempty)) {
    errors.push(`${label} has invalid audience tags.`);
  }
  if (!Array.isArray(passage?.tones) || passage.tones.length === 0 ||
      !unique(passage.tones) || passage.tones.some((tone) => !TONES.includes(tone))) {
    errors.push(`${label} has invalid tones.`);
  }
  if (!Array.isArray(passage?.lengthTiers) || passage.lengthTiers.length === 0 ||
      !unique(passage.lengthTiers) || passage.lengthTiers.some((tier) => !LENGTHS.includes(tier))) {
    errors.push(`${label} has invalid length tiers.`);
  }
  if (!SEAMS.includes(passage?.seam)) errors.push(`${label} has an invalid seam.`);
  if (!Number.isInteger(passage?.wordCount) || passage.wordCount !== normalizedWords(passage?.exactText ?? "")) {
    errors.push(`${label} has a stale wordCount.`);
  }
  if (!["approved", "candidate-review", "quarantined"].includes(passage?.approvalStatus)) {
    errors.push(`${label} has an invalid approval status.`);
  }
  if (!passage?.rights || typeof passage.rights.runtimeEligible !== "boolean" ||
      !nonempty(passage.rights.license) || !MATERIAL_KINDS.includes(passage.rights.materialKind) ||
      typeof passage.rights.sourcePresentedAttributionRequired !== "boolean" ||
      !Array.isArray(passage.rights.conditions) || !passage.rights.conditions.every(nonempty)) {
    errors.push(`${label} has incomplete passage rights.`);
  }
  if (!HASH_PATTERN.test(passage?.provenanceHash ?? "")) errors.push(`${label} has an invalid provenance hash.`);
  if (!passage?.attribution || ![
    passage.attribution.creator,
    passage.attribution.containingSource,
    passage.attribution.readerCredit,
  ].every(nonempty)) errors.push(`${label} has incomplete attribution.`);
  if (passage?.rights?.sourcePresentedAttributionRequired && !nonempty(passage?.attribution?.sourcePresented)) {
    errors.push(`${label} requires its source-presented attribution.`);
  }
  return errors;
}

export function validateRuntimeSourceIndex(
  index: RuntimeSourceIndex = runtimeSourceIndex,
): string[] {
  const errors: string[] = [];
  if (index.schemaVersion !== "1.0.0") errors.push(`Unsupported runtime source schema: ${index.schemaVersion}.`);
  if (index.cohesionPolicy?.dominantSourceCount !== 1) errors.push("Runtime source policy must require exactly one dominant source.");
  if (index.cohesionPolicy?.compatibilityDirection !== "dominant-to-secondary") errors.push("Runtime source compatibility must be dominant-to-secondary.");
  if (index.cohesionPolicy?.maximumSecondaryFamilies > 2 || index.cohesionPolicy?.maximumSecondarySources > 2) {
    errors.push("Runtime source policy may allow no more than two secondary families and sources.");
  }
  if (!Array.isArray(index.sources) || index.sources.length !== 20) {
    return [...errors, `Expected 20 runtime source records; found ${index.sources?.length ?? 0}.`];
  }

  const sourceIds = index.sources.map((source) => source.sourceId);
  const catalogIds = sourceCatalog.map((source) => source.id);
  if (!unique(sourceIds)) errors.push("Runtime source IDs must be unique.");
  if (
    JSON.stringify([...sourceIds].sort()) !== JSON.stringify([...catalogIds].sort())
  ) errors.push("Runtime source index IDs must exactly match the reader-credit catalog.");
  const families = new Set(index.sources.map((source) => source.family));
  const passageIds = new Set<string>();

  for (const source of index.sources) {
    const label = source?.sourceId || "(unknown source)";
    if (![source.sourceId, source.title, source.creator, source.primaryUrl, source.authoritativeFileUrl, source.family].every(nonempty)) {
      errors.push(`${label} has incomplete source identity metadata.`);
    }
    for (const field of [source.voiceTags, source.audienceTags, source.themeTags, source.politicalFramingTags]) {
      if (!Array.isArray(field) || field.length === 0 || !field.every(nonempty)) errors.push(`${label} has an empty matching-tag collection.`);
    }
    if (source.themeTags.some((theme) => !THEME_IDS.includes(theme))) errors.push(`${label} has an unknown source theme.`);
    if (source.compatibleFamilies.some((family) => !families.has(family)) || source.incompatibleFamilies.some((family) => !families.has(family))) {
      errors.push(`${label} references an unknown source family.`);
    }
    if (source.compatibleFamilies.some((family) => source.incompatibleFamilies.includes(family))) {
      errors.push(`${label} marks a family both compatible and incompatible.`);
    }
    if (source.requiresExplicitOptIn && (source.requiresExplicitOptIn.length === 0 || !source.requiresExplicitOptIn.every(nonempty))) {
      errors.push(`${label} has invalid explicit opt-in phrases.`);
    }
    if (typeof source.runtimeSpineAvailable !== "boolean" || typeof source.primarySpineEligible !== "boolean") {
      errors.push(`${label} has invalid spine eligibility metadata.`);
    }
    if (!Number.isInteger(source.secondaryPassageCap) || source.secondaryPassageCap < 0) {
      errors.push(`${label} has an invalid secondary passage cap.`);
    }
    if (!source.rights || !source.rights.runtimeEligible || !nonempty(source.rights.license) ||
        !Array.isArray(source.rights.conditions) || !source.rights.conditions.every(nonempty)) {
      errors.push(`${label} is missing runtime-eligible source rights.`);
    }
    if (!source.acquisition || source.acquisition.status !== "acquired-verified" ||
        !HASH_PATTERN.test(source.acquisition.sha256 ?? "") ||
        !HASH_PATTERN.test(source.acquisition.extractSha256 ?? "") ||
        ![source.acquisition.localFile, source.acquisition.extractFile, source.acquisition.extractMode, source.acquisition.verifiedAt].every(nonempty)) {
      errors.push(`${label} has incomplete verified-acquisition metadata.`);
    }
    if (!Array.isArray(source.passages)) errors.push(`${label} passages must be an array.`);
    else for (const passage of source.passages) errors.push(...validatePassage(passage, source, passageIds));
  }
  const runtimeSpines = index.sources.filter((source) => source.runtimeSpineAvailable).map((source) => source.sourceId).sort();
  if (JSON.stringify(runtimeSpines) !== JSON.stringify(["shir-geulah", "velveteen-rabbi"])) {
    errors.push("Only the two implemented complete source spines may be marked runtimeSpineAvailable.");
  }
  return [...new Set(errors)];
}

export const runtimeSourceErrors = validateRuntimeSourceIndex();

function sourceIsValid(source: RuntimeSourceRecord): boolean {
  return source.rights.runtimeEligible && source.acquisition.status === "acquired-verified";
}

export const approvedRuntimePassages = runtimePassages.filter((passage) => {
  const source = runtimeSources.find((candidate) => candidate.sourceId === passage.sourceId);
  return Boolean(
    source &&
    sourceIsValid(source) &&
    passage.approvalStatus === "approved" &&
    passage.rights.runtimeEligible &&
    validatePassage(passage, source, new Set()).length === 0,
  );
});

export const smokeRuntimeContext: RuntimePassageContext = {
  mode: "embedded-smoke-index",
  sources: runtimeSources,
  passages: runtimePassages,
  approvedPassages: approvedRuntimePassages,
  errors: runtimeSourceErrors,
};

export function runtimeSourceById(
  sourceId: string,
  context: RuntimePassageContext = smokeRuntimeContext,
): RuntimeSourceRecord | undefined {
  return context.sources.find((source) => source.sourceId === sourceId);
}

export function runtimePassageById(
  passageId: string,
  context: RuntimePassageContext = smokeRuntimeContext,
): RuntimeSourcePassage | undefined {
  return context.approvedPassages.find((passage) => passage.id === passageId);
}

function normalizedOptIn(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "");
}

function explicitOptInSatisfied(source: RuntimeSourceRecord, profile: GenerationProfile): boolean {
  if (!source.requiresExplicitOptIn?.length) return true;
  const requested = normalizedOptIn(profile.customTheme);
  return source.requiresExplicitOptIn.some((phrase) => requested.includes(normalizedOptIn(phrase)));
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const audienceCompatibility: Record<GenerationProfile["audience"], Set<string>> = {
  kids: new Set(["kids", "child", "children", "family", "mixed", "mixed-ages", "beginner"]),
  mixed: new Set(["mixed", "mixed-ages", "family", "beginner", "interfaith", "community"]),
  adults: new Set(["adults", "adult", "adult-fans", "older-teen", "community", "beginner", "reflective", "facilitator", "historical", "history-oriented", "specialist"]),
};

function bestSectionId(passage: RuntimeSourcePassage, profile: GenerationProfile): SederSectionId {
  return [...passage.sectionIds].sort((left, right) =>
    stableHash(`${profile.length}:${profile.audience}:${profile.tone}:${left}:${passage.id}`) -
    stableHash(`${profile.length}:${profile.audience}:${profile.tone}:${right}:${passage.id}`),
  )[0];
}

function scorePassage(
  passage: RuntimeSourcePassage,
  source: RuntimeSourceRecord,
  profile: GenerationProfile,
): number {
  const themes = profile.themes.length ? profile.themes : (["traditional"] as ThemeId[]);
  const themeMatches = passage.themes.filter((theme) => themes.includes(theme)).length;
  const audienceMatches = passage.audience.filter((tag) => audienceCompatibility[profile.audience].has(tag)).length;
  let score = themeMatches * 40 + audienceMatches * 12;
  if (passage.tones.includes(profile.tone)) score += 18;
  if (source.themeTags.some((theme) => themes.includes(theme))) score += 8;
  if (profile.interaction === "reflective" && source.voiceTags.some((tag) => /contemplative|reflective|poetic/.test(tag))) score += 6;
  if (profile.interaction === "participatory" && source.voiceTags.some((tag) => /participatory|discussion|action/.test(tag))) score += 6;
  if (profile.tone === "playful" && source.voiceTags.includes("playful")) score += 8;
  const targetWords = profile.length === 20 ? 55 : profile.length === 45 ? 95 : 145;
  score -= Math.max(0, passage.wordCount - targetWords) / 5;
  score += (stableHash(`${profile.length}:${profile.audience}:${profile.interaction}:${profile.tone}:${profile.themes.join(",")}:${profile.customTheme}:${passage.id}`) % 1000) / 10000;
  return score;
}

function candidatePool(
  profile: GenerationProfile,
  backboneSourceId: string,
  context: RuntimePassageContext = smokeRuntimeContext,
): RuntimePassageCandidate[] {
  if (context.errors.length > 0 || context.approvedPassages.length === 0) return [];
  const backbone = runtimeSourceById(backboneSourceId, context);
  if (!backbone?.runtimeSpineAvailable) return [];
  const themes = profile.themes.length ? profile.themes : (["traditional"] as ThemeId[]);
  const tier = String(profile.length) as "20" | "45" | "90";
  const backboneTexts = new Set(
    reviewedSourcePassages
      .filter((passage) => passage.sourceId === backboneSourceId)
      .map((passage) => passage.text),
  );
  return context.approvedPassages.flatMap((passage) => {
    const source = runtimeSourceById(passage.sourceId, context);
    if (!source) return [];
    if (
      source.sourceId !== backboneSourceId &&
      (!backbone.compatibleFamilies.includes(source.family) || backbone.incompatibleFamilies.includes(source.family))
    ) return [];
    if (!explicitOptInSatisfied(source, profile)) return [];
    if (!passage.lengthTiers.includes(tier) || !passage.tones.includes(profile.tone)) return [];
    if (!passage.audience.some((tag) => audienceCompatibility[profile.audience].has(tag))) return [];
    if (!passage.themes.some((theme) => themes.includes(theme)) && !source.requiresExplicitOptIn?.length) return [];
    const contextualWordCount = passage.beginnerContext
      ? normalizedWords(passage.beginnerContext)
      : 0;
    // A concise seder can carry one featured voice, but not a second essay.
    // Bound the complete inserted reading—including its newcomer context—so
    // the 20-minute tier remains usable at a real table.
    if (profile.length === 20 && passage.wordCount + contextualWordCount > 110) return [];
    if (
      /\bnext year in jerusalem\b/i.test(passage.exactText) &&
      (!profile.themes.includes("traditional") || profile.themes.includes("social-justice"))
    ) return [];
    if (source.sourceId !== backboneSourceId && backboneTexts.has(passage.exactText)) return [];
    return [{
      passage,
      source,
      sectionId: bestSectionId(passage, profile),
      score: scorePassage(passage, source, profile),
    }];
  }).sort((left, right) => right.score - left.score || left.passage.id.localeCompare(right.passage.id));
}

export function runtimeFeaturedSource(
  profile: GenerationProfile,
  backboneSourceId: string,
  context: RuntimePassageContext = smokeRuntimeContext,
): RuntimeSourceRecord | undefined {
  const candidates = candidatePool(profile, backboneSourceId, context);
  const bySource = new Map<string, RuntimePassageCandidate[]>();
  for (const candidate of candidates) {
    bySource.set(candidate.source.sourceId, [
      ...(bySource.get(candidate.source.sourceId) ?? []),
      candidate,
    ]);
  }
  const ranked = [...bySource.values()].map((items) => {
    const source = items[0].source;
    const sectionCount = new Set(items.flatMap((item) => item.passage.sectionIds)).size;
    const score = items[0].score + Math.min(items.length, 3) * 6 + Math.min(sectionCount, 3) * 4 +
      // Every candidate has already passed exact theme, audience, tone, tier,
      // rights, and backbone-compatibility gates. A broad deterministic
      // rendezvous component prevents one prolific source from permanently
      // crowding equally valid works out of the featured slot.
      (stableHash(`${profile.length}:${profile.audience}:${profile.interaction}:${profile.tone}:${profile.themes.join(",")}:${profile.customTheme}:featured:${source.sourceId}`) % 10000) / 100;
    return { source, score };
  }).sort((left, right) => right.score - left.score || left.source.sourceId.localeCompare(right.source.sourceId));
  return ranked[0]?.source ?? runtimeSourceById(backboneSourceId, context);
}

function canSupportFeatured(
  featured: RuntimeSourceRecord,
  supporting: RuntimeSourceRecord,
  backboneSourceId: string,
): boolean {
  if (supporting.sourceId === featured.sourceId || supporting.sourceId === backboneSourceId) return false;
  if (supporting.family === featured.family) return true;
  return featured.compatibleFamilies.includes(supporting.family) &&
    !featured.incompatibleFamilies.includes(supporting.family);
}

export function runtimePassageCandidates(
  profile: GenerationProfile,
  backboneSourceId: string,
  featuredSourceId: string | undefined = undefined,
  limit = 12,
  context: RuntimePassageContext = smokeRuntimeContext,
): RuntimePassageCandidate[] {
  featuredSourceId ??= runtimeFeaturedSource(profile, backboneSourceId, context)?.sourceId;
  if (!featuredSourceId || limit <= 0) return [];
  const allCandidates = candidatePool(profile, backboneSourceId, context);
  const featured = runtimeSourceById(featuredSourceId, context);
  if (!featured) return [];
  const featuredCandidates = featuredSourceId === backboneSourceId
    ? []
    : allCandidates.filter((candidate) => candidate.source.sourceId === featuredSourceId);
  const supportingCandidates = allCandidates.filter((candidate) =>
    profile.length !== 20 && canSupportFeatured(featured, candidate.source, backboneSourceId),
  );

  // The featured work comes first and may contribute several coherent passages;
  // supporting options stay source-diverse and strictly secondary.
  const shortlist = featuredCandidates.slice(0, Math.min(6, limit));
  const usedSources = new Set<string>();
  for (const candidate of supportingCandidates) {
    if (usedSources.has(candidate.source.sourceId)) continue;
    shortlist.push(candidate);
    usedSources.add(candidate.source.sourceId);
    if (shortlist.length === limit) return shortlist;
  }
  for (const candidate of supportingCandidates) {
    if (shortlist.some((item) => item.passage.id === candidate.passage.id)) continue;
    shortlist.push(candidate);
    if (shortlist.length === limit) break;
  }
  return shortlist;
}

export function selectRuntimePassages(
  profile: GenerationProfile,
  backboneSourceId: string,
  featuredSourceId: string,
  requestedIds?: string[],
  context: RuntimePassageContext = smokeRuntimeContext,
): RuntimePassageCandidate[] {
  const candidates = runtimePassageCandidates(
    profile,
    backboneSourceId,
    featuredSourceId,
    12,
    context,
  );
  const byId = new Map(candidates.map((candidate) => [candidate.passage.id, candidate]));
  if (requestedIds) {
    if (!unique(requestedIds)) throw new Error("Model-selected runtime passage IDs must be unique.");
    for (const id of requestedIds) {
      if (!byId.has(id)) throw new Error(`Model suggested unknown, unapproved, or incompatible runtime passage: ${id}.`);
    }
  }
  const featured = runtimeSourceById(featuredSourceId, context);
  if (!featured) return [];
  const featureLimit = featuredSourceId === backboneSourceId
    ? 0
    : Math.min(featured.secondaryPassageCap, profile.length === 20 ? 1 : 3);
  const passageLimit = profile.length === 20 ? featureLimit : featureLimit + 1;
  if (requestedIds && requestedIds.length > passageLimit) {
    throw new Error(`At most ${passageLimit} supplemental source passages are allowed at ${profile.length} minutes.`);
  }
  const selected: RuntimePassageCandidate[] = [];
  const sectionIds = new Set<SederSectionId>();
  const supportingSourceIds = new Set<string>();

  function addCandidate(candidate: RuntimePassageCandidate, strict: boolean): boolean {
    const availableSection = [...candidate.passage.sectionIds]
      .sort((left, right) =>
        stableHash(`${candidate.passage.id}:${left}`) - stableHash(`${candidate.passage.id}:${right}`),
      )
      .find((sectionId) => !sectionIds.has(sectionId));
    if (!availableSection) {
      if (strict) throw new Error("Model-selected runtime passages must use distinct approved sections.");
      return false;
    }
    if (candidate.source.sourceId !== featuredSourceId) {
      supportingSourceIds.add(candidate.source.sourceId);
      if (supportingSourceIds.size > 1 || !canSupportFeatured(featured!, candidate.source, backboneSourceId)) {
        if (strict) throw new Error("Model-selected runtime passages exceed the one-source support limit.");
        supportingSourceIds.delete(candidate.source.sourceId);
        return false;
      }
    }
    selected.push({ ...candidate, sectionId: availableSection });
    sectionIds.add(availableSection);
    return true;
  }

  if (requestedIds) {
    for (const id of requestedIds) addCandidate(byId.get(id)!, true);
    const featureCandidatesAvailable = candidates.filter(
      (candidate) => candidate.source.sourceId === featuredSourceId,
    );
    const featureSectionCapacity = new Set(
      featureCandidatesAvailable.flatMap((candidate) => candidate.passage.sectionIds),
    ).size;
    const requiredFeatured = Math.min(
      profile.length === 20 ? 1 : 2,
      featureLimit,
      featureCandidatesAvailable.length,
      featureSectionCapacity,
    );
    const selectedFeatured = selected.filter(
      (candidate) => candidate.source.sourceId === featuredSourceId,
    ).length;
    if (selectedFeatured > featureLimit) {
      throw new Error(`Model reranking exceeds the featured-source passage cap of ${featureLimit}.`);
    }
    if (selectedFeatured < requiredFeatured) {
      throw new Error(`Model reranking must retain at least ${requiredFeatured} passage(s) from featured source ${featuredSourceId}.`);
    }
    if (selected.filter((candidate) => candidate.source.sourceId !== featuredSourceId).length > 1) {
      throw new Error("Model reranking may select at most one supporting passage.");
    }
    return selected;
  }

  for (const candidate of candidates.filter((item) => item.source.sourceId === featuredSourceId)) {
    addCandidate(candidate, false);
    if (selected.filter((item) => item.source.sourceId === featuredSourceId).length === featureLimit) break;
  }
  if (profile.length !== 20) {
    for (const candidate of candidates.filter((item) => item.source.sourceId !== featuredSourceId)) {
      if (addCandidate(candidate, false)) break;
    }
  }
  return selected;
}

export function runtimePassageBriefs(
  passageIds: string[],
  context: RuntimePassageContext = smokeRuntimeContext,
) {
  return passageIds.flatMap((id) => {
    const passage = runtimePassageById(id, context);
    if (!passage) return [];
    return [{
      id: passage.id,
      sourceId: passage.sourceId,
      sectionIds: passage.sectionIds,
      themes: passage.themes,
      tones: passage.tones,
      seam: passage.seam,
      exactText: passage.exactText,
    }];
  });
}
