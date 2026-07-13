import type { GenerationProfile, ThemeId, Tone } from "../lib/types";
import catalogData from "./generated/local-corpus/source-module-catalog.json" with { type: "json" };
import manifestData from "./generated/local-corpus/local-corpus-manifest.json" with { type: "json" };
import { localSourcePackLoaders } from "./generated/local-corpus/source-pack-loaders";
import {
  runtimeFeaturedSource,
  runtimePassageBriefs,
  runtimePassageCandidates,
  runtimeSources,
  smokeRuntimeContext,
  type RuntimePassageContext,
  type RuntimePassageSeam,
  type RuntimeSourcePassage,
  type RuntimeSourceRecord,
} from "./source-runtime";
import { SEDER_SECTION_ORDER, type SederSectionId } from "./source-spines";

type LengthTier = "20" | "45" | "90";

interface CorpusPackManifest {
  externalModelApiUsed?: boolean;
  completeLocalCorpus?: {
    sourceCount?: number;
    segmentCount?: number;
    exactCharacterCount?: number;
    canonicalReconstructionVerified?: boolean;
  };
  localEditorialReview?: {
    reviewedSourceCount?: number;
    missingSourceIds?: string[];
    reviewedSequenceCount?: number;
    status?: string;
  };
  runtimePack?: {
    sourceCount?: number;
    moduleCount?: number;
    exactCharacterCount?: number;
    maturity?: string;
    activeRuntimeLoadingMode?: string;
    comprehensiveLocalOrganization?: boolean;
  };
}

export interface CompactRuntimeModule {
  id: string;
  sourceId: string;
  family: string;
  sectionIds: string[];
  sourceSectionIds?: string[];
  insertionSectionId?: string | null;
  beginnerContext?: string;
  themes: string[];
  audience: string[];
  tones: string[];
  lengthTiers?: string[];
  seam: string;
  wordCount: number;
  approvalStatus: string;
  runtimeEligible: boolean;
  provenanceHash: string;
  beginnerSuitable?: boolean;
  requiresExplicitOptIn?: boolean;
  politicalRisk?: string;
  editorialGates?: string[];
  editorialReviewStatus?: string;
  containsThirdPartyAttribution?: boolean;
  evaluatorAttributionClear?: boolean;
  approvalBasis?: string;
  segmentIds?: string[];
}

export interface CompactRuntimeSource {
  sourceId: string;
  family: string;
  sourceTags: {
    voice: string[];
    audience: string[];
    themes: string[];
    politicalFraming: string[];
  };
  compatibleFamilies: string[];
  incompatibleFamilies: string[];
  requiresExplicitOptIn: string[];
  primarySpineEligible: boolean;
  runtimeSpineAvailable: boolean;
  secondaryPassageCap: number;
  modules: CompactRuntimeModule[];
}

interface CompactRuntimeCatalog {
  schemaVersion?: string;
  sources?: CompactRuntimeSource[];
}

interface PregeneratedPackModule extends Record<string, unknown> {
  id?: string;
  sourceId?: string;
  family?: string;
  exactText?: string;
  beginnerContext?: string;
  sourceLocation?: string;
  locator?: Record<string, unknown>;
  provenanceHash?: string;
  wordCount?: number;
  sectionIds?: string[];
  sourceSectionIds?: string[];
  insertionSectionId?: string | null;
  themes?: string[];
  audience?: string[];
  tones?: string[];
  lengthTiers?: string[];
  seam?: string;
  beginnerSuitable?: boolean;
  requiresExplicitOptIn?: boolean;
  politicalRisk?: string;
  editorialGates?: string[];
  sourcePresentedAttribution?: string[];
  attribution?: Record<string, unknown>;
  rights?: Record<string, unknown>;
  approvalStatus?: string;
  editorialReviewStatus?: string;
}

interface PregeneratedSourcePack {
  sourceId?: string;
  modules?: PregeneratedPackModule[];
}

type SourcePackLoader = () => Promise<unknown>;

export interface RuntimePackLoadOptions {
  featuredSourceId?: string;
  requestedPassageIds?: string[];
  manifest?: CorpusPackManifest;
  catalog?: CompactRuntimeCatalog;
  loaders?: Record<string, SourcePackLoader>;
  digest?: (text: string) => Promise<string>;
}

export interface RuntimePackLoadResult {
  context: RuntimePassageContext;
  featuredSourceId: string;
  loadedSourceIds: string[];
  usedComprehensivePack: boolean;
  fallbackReasons: string[];
}

const THEMES = new Set<ThemeId>([
  "feminist",
  "lgbtq",
  "social-justice",
  "environment",
  "interfaith",
  "secular",
  "mindfulness",
  "traditional",
  "family-storytelling",
]);
const SECTIONS = new Set<string>(SEDER_SECTION_ORDER);
const HASH_PATTERN = /^[a-f0-9]{64}$/u;
const LENGTHS = new Set<LengthTier>(["20", "45", "90"]);

const defaultManifest = manifestData as CorpusPackManifest;
const defaultCatalog = catalogData as CompactRuntimeCatalog;
const defaultLoaders = localSourcePackLoaders as unknown as Record<string, SourcePackLoader>;

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function normalizedOptIn(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "");
}

function explicitOptInSatisfied(source: CompactRuntimeSource, profile: GenerationProfile): boolean {
  if (!source.requiresExplicitOptIn?.length) return true;
  const requested = normalizedOptIn(profile.customTheme ?? "");
  return source.requiresExplicitOptIn.some((phrase) => requested.includes(normalizedOptIn(phrase)));
}

type EditorialGateEvidence = "profile" | "beginner-context" | "exact-text" | "retained-credit" | "host-backbone";

interface EditorialGatePolicy {
  disposition: "machine-enforced" | "build-time-satisfied" | "unresolved";
  evidence?: EditorialGateEvidence;
}

const PROFILE_GATES = new Set([
  "traditional-without-social-justice-only",
  "disable-when-social-justice-selected",
  "traditional-theme-only",
  "environment-theme-only",
  "social-justice-theme-only",
  "interfaith-or-social-justice-theme-only",
  "feminist-environment-or-interfaith-theme-only",
  "social-justice-family-or-interfaith-theme-only",
  "mindfulness-or-spiritual-depth-selected",
  "miriams-cup-selected",
  "optional-plate-item-selected",
  "optional-plate-addition-only",
  "lgbtq-feminist-or-orange-plate-selection-only",
  "immigrant-justice-theme-or-explicit-opt-in",
  "traditional-or-specialist-opt-in",
  "long-form-only",
  "adult-only",
  "adult-or-facilitated-mixed-age-only",
  "adult-or-facilitated-mixed-age-use",
  "historical-sidebar-only",
  "specialist-textual-note-only",
  "optional-ritual-only",
]);

const HARD_BLOCKED_GATES = new Set([
  "explicit-zionism-default-exclusion",
  "explicit-israel-politics-default-exclusion",
]);

const UNRESOLVED_GATE_PATTERNS = [
  /^(?:facsimile-visual-check-required|rendered-page-ocr-check|ocr-and-page-layout-check)$/u,
  /^(?:cantillation-rendering-check|hebrew-and-transliteration-render-check|multilingual-render-check)$/u,
  /^(?:translate-hebrew-excerpt-before-display|checked-english-meaning-required)$/u,
  /(?:rights-review|rights-and-credit-review)$/u,
  /^(?:origin-story-fact-check|age-appropriate-language-review)$/u,
  /^traditional-land-(?:lines|language)-review$/u,
  /^(?:review|verify)-/u,
  /^must-precede-all-other-source-sequences$/u,
  /^embedded-artwork-reference-may-be-omitted-only-with-clean-boundary$/u,
];

const RETAINED_CREDIT_GATE_PATTERNS = [
  /^embedded-credit-check$/u,
  /^embedded-.*(?:attribution|quotation|speech|testimony)-review$/u,
  /^preserve-.*(?:credit|attribution)/u,
  /^preserve-translator-credit-and-warning-in-full$/u,
];

const EXACT_TEXT_GATE_PATTERNS = [
  /^preserve-/u,
  /^do-not-/u,
  /^never-/u,
  /^foundational-exodus-story-must-remain$/u,
  /^translator-warning-must-appear-first$/u,
];

const HOST_BACKBONE_GATE_PATTERN = /(?:host|action|object|food|allergy|wine|grape-juice|cup|washing|handwashing|door|pouring|water|afikoman|reclining|ingredient|caffeine|beverage|citrus|fish|clothing|staining|maror|charoset|haroset|plate|ritual|reader|speaker|listener|participation|refrain|responsive|song|turn-taking|pass-option|right-to-pass)/u;

const BEGINNER_CONTEXT_GATE_PATTERN = /^(?:plain-language|age-appropriate|age-specific|nontriumphalist|peace|label|define|explain|identify|clarify|supply|disclose|offer|replace|adapt|present-|retain|distinguish|inclusive|historical|mixed-belief|nonlabeling|harsh-language|fiction|coerced-labor|trafficking|content-note|correct-|omit-|source-date|single-closing|one-contextual|concrete-discussion|child-inclusive|children-may|no-|explicit-consent|protect-|optional-shortened|participation-optional|action-pledge)/u;

function sourceOptInGate(gate: string): boolean {
  if (gate === "explicit-consent-and-no-hitting-rule") return false;
  return gate.endsWith("-opt-in") || gate.startsWith("explicit-") ||
    ["historical-sidebar-only", "specialist-textual-note-only", "optional-ritual-only"].includes(gate);
}

/** Explicit policy classification: anything not classified here remains blocked. */
export function runtimeEditorialGatePolicy(gate: string): EditorialGatePolicy {
  if (HARD_BLOCKED_GATES.has(gate)) return { disposition: "unresolved" };
  if (PROFILE_GATES.has(gate) || sourceOptInGate(gate)) {
    return { disposition: "machine-enforced", evidence: "profile" };
  }
  if (UNRESOLVED_GATE_PATTERNS.some((pattern) => pattern.test(gate))) {
    return { disposition: "unresolved" };
  }
  if (RETAINED_CREDIT_GATE_PATTERNS.some((pattern) => pattern.test(gate))) {
    return { disposition: "build-time-satisfied", evidence: "retained-credit" };
  }
  if (EXACT_TEXT_GATE_PATTERNS.some((pattern) => pattern.test(gate))) {
    return { disposition: "build-time-satisfied", evidence: "exact-text" };
  }
  if (HOST_BACKBONE_GATE_PATTERN.test(gate)) {
    return { disposition: "build-time-satisfied", evidence: "host-backbone" };
  }
  if (BEGINNER_CONTEXT_GATE_PATTERN.test(gate) || gate.endsWith("-required") || gate.endsWith("-context")) {
    return { disposition: "build-time-satisfied", evidence: "beginner-context" };
  }
  return { disposition: "unresolved" };
}

export function runtimeEditorialGateReport(catalog: CompactRuntimeCatalog = defaultCatalog) {
  const gates = [...new Set((catalog.sources ?? []).flatMap((source) =>
    (source.modules ?? []).flatMap((module) => module.editorialGates ?? [])))].sort();
  const byDisposition = {
    machineEnforced: gates.filter((gate) => runtimeEditorialGatePolicy(gate).disposition === "machine-enforced"),
    buildTimeSatisfied: gates.filter((gate) => runtimeEditorialGatePolicy(gate).disposition === "build-time-satisfied"),
    unresolved: gates.filter((gate) => runtimeEditorialGatePolicy(gate).disposition === "unresolved"),
  };
  return {
    gateCount: gates.length,
    ...byDisposition,
    blockedModuleIds: (catalog.sources ?? []).flatMap((source) => (source.modules ?? [])
      .filter((module) => (module.editorialGates ?? []).some((gate) =>
        runtimeEditorialGatePolicy(gate).disposition === "unresolved"))
      .map((module) => module.id)),
  };
}

function compactCatalogErrors(catalog: CompactRuntimeCatalog, loaderIds: string[]): string[] {
  const errors: string[] = [];
  const sources = catalog.sources ?? [];
  if (sources.length !== 20) errors.push(`compact runtime catalog has ${sources.length}/20 sources`);
  const sourceIds = sources.map((source) => source.sourceId);
  if (new Set(sourceIds).size !== sourceIds.length) errors.push("compact runtime catalog has duplicate source IDs");
  if (loaderIds.length !== 20) errors.push(`dynamic source-pack loader map has ${loaderIds.length}/20 sources`);
  if (sourceIds.some((sourceId) => !loaderIds.includes(sourceId))) {
    errors.push("dynamic source-pack loader map does not cover every compact-catalog source");
  }
  const moduleIds = sources.flatMap((source) => source.modules ?? []).map((module) => module.id);
  if (new Set(moduleIds).size !== moduleIds.length) errors.push("compact runtime catalog has duplicate module IDs");
  if (sources.some((source) => !source.modules?.length)) {
    errors.push("every source needs at least one locally reviewed sequence module");
  }
  return errors;
}

/**
 * The local corpus is fail-closed. Complete source reconstruction and one
 * schema-valid local dossier per source must agree before any reviewed sequence
 * is loaded. This is an honest demo review gate, not a claim of human review.
 */
export function comprehensiveRuntimeGateErrors(
  manifest: CorpusPackManifest = defaultManifest,
  catalog: CompactRuntimeCatalog = defaultCatalog,
  loaderIds: string[] = Object.keys(defaultLoaders),
): string[] {
  const errors: string[] = [];
  const runtime = manifest.runtimePack;
  const research = manifest.completeLocalCorpus;
  const review = manifest.localEditorialReview;
  if (manifest.externalModelApiUsed !== false) errors.push("local corpus manifest must state that no external model API was used");
  if (research?.sourceCount !== 20 || research.segmentCount !== 1999) errors.push("canonical local corpus must cover all 20 sources and 1,999 segments");
  if (research?.canonicalReconstructionVerified !== true || (research.exactCharacterCount ?? 0) < 1_800_000) {
    errors.push("complete local corpus reconstruction is not verified");
  }
  if (review?.reviewedSourceCount !== 20 || review.status !== "complete-local-agent-review" || review.missingSourceIds?.length) {
    errors.push("local dossier review is incomplete");
  }
  if (runtime?.comprehensiveLocalOrganization !== true || runtime.maturity !== "local-reviewed-demo-pack") {
    errors.push("compiled local runtime pack is not complete");
  }
  if (runtime?.activeRuntimeLoadingMode !== "per-source-dynamic") errors.push("local runtime loading must be per-source dynamic");
  if (runtime?.sourceCount !== 20) errors.push("reviewed runtime sequences must cover all 20 sources");
  if ((runtime?.moduleCount ?? 0) < 40) errors.push("reviewed local sequence count is below the demo floor");
  if ((runtime?.exactCharacterCount ?? 0) < 50_000) errors.push("reviewed local sequence text is below the demo floor");
  errors.push(...compactCatalogErrors(catalog, loaderIds));
  const eligibleModules = (catalog.sources ?? []).flatMap((source) => source.modules ?? [])
    .filter((module) => module.approvalStatus === "approved" && module.runtimeEligible);
  if (eligibleModules.length !== runtime?.moduleCount) {
    errors.push("compact catalog module count does not match the local runtime manifest");
  }
  if (eligibleModules.some((module) =>
    typeof module.beginnerSuitable !== "boolean" ||
    typeof module.beginnerContext !== "string" || module.beginnerContext !== module.beginnerContext.trim() || module.beginnerContext.length < 20 ||
    module.sectionIds?.length !== 1 || module.insertionSectionId !== module.sectionIds[0] ||
    !Array.isArray(module.sourceSectionIds) || !module.sourceSectionIds.includes(module.insertionSectionId) ||
    typeof module.requiresExplicitOptIn !== "boolean" ||
    typeof module.politicalRisk !== "string" ||
    !Array.isArray(module.editorialGates) ||
    typeof module.editorialReviewStatus !== "string" ||
    typeof module.containsThirdPartyAttribution !== "boolean" ||
    typeof module.evaluatorAttributionClear !== "boolean" ||
    typeof module.approvalBasis !== "string")) {
    errors.push("compact catalog is missing matcher-critical editorial metadata");
  }
  return [...new Set(errors)];
}

export const comprehensiveRuntimeStatus = Object.freeze({
  enabled: comprehensiveRuntimeGateErrors(defaultManifest, defaultCatalog, Object.keys(defaultLoaders)).length === 0,
  errors: comprehensiveRuntimeGateErrors(defaultManifest, defaultCatalog, Object.keys(defaultLoaders)),
});

const audienceCompatibility: Record<GenerationProfile["audience"], Set<string>> = {
  kids: new Set(["kids", "child", "children", "family", "families", "mixed", "mixed-ages", "beginner", "beginners"]),
  mixed: new Set(["mixed", "mixed-ages", "family", "families", "beginner", "beginners", "interfaith", "community"]),
  adults: new Set(["adults", "adult", "adult-fans", "older-teen", "community", "beginner", "beginners", "reflective", "facilitator", "historical", "history-oriented", "specialists", "specialist"]),
};

function toneMatches(tones: string[], tone: Tone): boolean {
  if (tones.includes(tone)) return true;
  if (tone === "reverent") return tones.some((value) => value === "contemplative");
  if (tone === "balanced") return tones.some((value) => value === "activist");
  return false;
}

function compactModuleMatches(
  module: CompactRuntimeModule,
  source: CompactRuntimeSource,
  profile: GenerationProfile,
): boolean {
  if (module.approvalStatus !== "approved" || module.runtimeEligible !== true) return false;
  if (module.beginnerSuitable === false) return false;
  if (module.editorialReviewStatus !== "local-agent-reviewed-demo") return false;
  if (module.evaluatorAttributionClear !== true || module.approvalBasis !== "local-source-dossier-review") return false;
  if (!["none", "context-sensitive"].includes(module.politicalRisk ?? "")) return false;
  if (!moduleExplicitOptInSatisfied(module, source, profile)) return false;
  if (!editorialGatesSatisfied(module.editorialGates ?? [], module, source, profile)) return false;
  if (!module.id || module.sourceId !== source.sourceId || !HASH_PATTERN.test(module.provenanceHash ?? "")) return false;
  if (module.sectionIds?.length !== 1 || !SECTIONS.has(module.sectionIds[0])) return false;
  if (module.insertionSectionId !== module.sectionIds[0] || !module.sourceSectionIds?.includes(module.insertionSectionId)) return false;
  const tier = String(profile.length) as LengthTier;
  if (module.lengthTiers?.length && !module.lengthTiers.includes(tier)) return false;
  if (!toneMatches(module.tones ?? [], profile.tone)) return false;
  if (!(module.audience ?? []).some((tag) => audienceCompatibility[profile.audience].has(tag))) return false;
  const themes = profile.themes.length ? profile.themes : (["traditional"] as ThemeId[]);
  if (!(module.themes ?? []).some((theme) => themes.includes(theme as ThemeId)) && !source.requiresExplicitOptIn?.length) return false;
  return explicitOptInSatisfied(source, profile);
}

function compactModuleScore(
  module: CompactRuntimeModule,
  source: CompactRuntimeSource,
  profile: GenerationProfile,
): number {
  const themes = profile.themes.length ? profile.themes : (["traditional"] as ThemeId[]);
  const themeMatches = (module.themes ?? []).filter((theme) => themes.includes(theme as ThemeId)).length;
  const audienceMatches = (module.audience ?? []).filter((tag) => audienceCompatibility[profile.audience].has(tag)).length;
  let score = themeMatches * 40 + audienceMatches * 12 + (toneMatches(module.tones ?? [], profile.tone) ? 18 : 0);
  if ((source.sourceTags?.themes ?? []).some((theme) => themes.includes(theme as ThemeId))) score += 8;
  const targetWords = profile.length === 20 ? 55 : profile.length === 45 ? 95 : 145;
  score -= Math.max(0, (module.wordCount ?? targetWords) - targetWords) / 5;
  score += (stableHash(`${profile.length}:${profile.audience}:${profile.interaction}:${profile.tone}:${profile.themes.join(",")}:${profile.customTheme}:${module.id}`) % 1000) / 10000;
  return score;
}

function sourceIsBackboneCompatible(
  source: CompactRuntimeSource,
  backbone: CompactRuntimeSource,
): boolean {
  return source.sourceId === backbone.sourceId || (
    backbone.compatibleFamilies.includes(source.family) &&
    !backbone.incompatibleFamilies.includes(source.family)
  );
}

function sourceCanSupport(
  supporting: CompactRuntimeSource,
  featured: CompactRuntimeSource,
  backbone: CompactRuntimeSource,
): boolean {
  if (supporting.sourceId === featured.sourceId || supporting.sourceId === backbone.sourceId) return false;
  if (!sourceIsBackboneCompatible(supporting, backbone)) return false;
  return supporting.family === featured.family || (
    featured.compatibleFamilies.includes(supporting.family) &&
    !featured.incompatibleFamilies.includes(supporting.family)
  );
}

function rankedCatalogSources(
  profile: GenerationProfile,
  backboneSourceId: string,
  catalog: CompactRuntimeCatalog,
): CompactRuntimeSource[] {
  const sources = catalog.sources ?? [];
  const backbone = sources.find((source) => source.sourceId === backboneSourceId);
  if (!backbone) return [];
  return sources.flatMap((source) => {
    if (!sourceIsBackboneCompatible(source, backbone) || !explicitOptInSatisfied(source, profile)) return [];
    const modules = (source.modules ?? []).filter((module) => compactModuleMatches(module, source, profile));
    if (!modules.length) return [];
    const requiredFeaturedPassages = profile.length === 20 ? 1 : 2;
    const sectionCapacity = new Set(modules.flatMap((module) => module.sectionIds)).size;
    if (
      source.sourceId !== backboneSourceId &&
      Math.min(modules.length, sectionCapacity, source.secondaryPassageCap) < requiredFeaturedPassages
    ) return [];
    const rankedModules = modules.sort((left, right) =>
      compactModuleScore(right, source, profile) - compactModuleScore(left, source, profile) || left.id.localeCompare(right.id));
    const sectionCount = sectionCapacity;
    const score = compactModuleScore(rankedModules[0], source, profile) +
      Math.min(modules.length, 3) * 6 + Math.min(sectionCount, 3) * 4 +
      (stableHash(`${profile.length}:${profile.audience}:${profile.interaction}:${profile.tone}:${profile.themes.join(",")}:${profile.customTheme}:comprehensive:${source.sourceId}`) % 10000) / 100;
    return [{ source, score }];
  }).sort((left, right) => right.score - left.score || left.source.sourceId.localeCompare(right.source.sourceId))
    .map(({ source }) => source);
}

function selectedCatalogSources(
  profile: GenerationProfile,
  backboneSourceId: string,
  catalog: CompactRuntimeCatalog,
  featuredSourceId?: string,
  requestedPassageIds: string[] = [],
): { featured?: CompactRuntimeSource; supporting?: CompactRuntimeSource; errors: string[] } {
  const ranked = rankedCatalogSources(profile, backboneSourceId, catalog);
  const backbone = (catalog.sources ?? []).find((source) => source.sourceId === backboneSourceId);
  const featured = featuredSourceId
    ? ranked.find((source) => source.sourceId === featuredSourceId)
    : ranked.find((source) => source.sourceId !== backboneSourceId) ?? ranked[0];
  if (!backbone || !featured) return { errors: ["no approved comprehensive featured source matches this profile"] };
  if (profile.length === 20) return { featured, errors: [] };

  const requestedSources = [...new Set(requestedPassageIds.flatMap((passageId) =>
    (catalog.sources ?? []).flatMap((source) =>
      source.modules?.some((module) => module.id === passageId) ? [source.sourceId] : [])))]
    .filter((sourceId) => sourceId !== featured.sourceId);
  if (requestedSources.length > 1) {
    return { featured, errors: ["requested passages span more than one supporting source"] };
  }
  const supporting = requestedSources.length
    ? (catalog.sources ?? []).find((source) => source.sourceId === requestedSources[0] && sourceCanSupport(source, featured, backbone))
    : ranked.find((source) => sourceCanSupport(source, featured, backbone));
  if (requestedSources.length && !supporting) {
    return { featured, errors: ["requested supporting source is not compatible with the featured source"] };
  }
  return { featured, supporting, errors: [] };
}

async function sha256(value: string): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error("Web Crypto SHA-256 is unavailable");
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function normalizedTones(values: string[]): Tone[] {
  const tones = new Set<Tone>();
  for (const value of values) {
    if (value === "playful" || value === "balanced" || value === "reverent") tones.add(value);
    if (value === "contemplative") tones.add("reverent");
    if (value === "activist") tones.add("balanced");
  }
  return [...tones];
}

function normalizedSeam(value: string): RuntimePassageSeam {
  const direct = new Set<RuntimePassageSeam>([
    "section-opening", "ritual-setup", "ritual-explanation", "story-core", "story-reflection",
    "discussion-prompt", "before-blessing", "after-blessing", "meal-transition", "song-introduction",
    "closing-reflection", "historical-sidebar", "plate-option", "optional-insert",
  ]);
  if (direct.has(value as RuntimePassageSeam)) return value as RuntimePassageSeam;
  const mapping: Record<string, RuntimePassageSeam> = {
    "ritual-instruction": "ritual-setup",
    reading: "optional-insert",
    "song-or-blessing": "before-blessing",
    "section-closing": "closing-reflection",
    "credits-or-metadata": "historical-sidebar",
  };
  return mapping[value] ?? "ritual-explanation";
}

function customThemeIncludes(profile: GenerationProfile, value: string): boolean {
  const requested = normalizedOptIn(profile.customTheme ?? "");
  const candidate = normalizedOptIn(value);
  return candidate.length >= 4 && requested.includes(candidate);
}

function gateOptInSatisfied(
  gate: string,
  source: CompactRuntimeSource,
  profile: GenerationProfile,
): boolean {
  if (source.requiresExplicitOptIn?.length && explicitOptInSatisfied(source, profile)) return true;
  if (customThemeIncludes(profile, source.sourceId)) return true;
  const phrase = gate
    .replace(/^explicit-/u, "")
    .replace(/-(?:opt-in|framing|context|only)$/u, "");
  if (customThemeIncludes(profile, phrase)) return true;
  if (gate === "portuguese-language-opt-in") return customThemeIncludes(profile, "portuguese");
  if (gate === "historical-latin-specialist-opt-in") return customThemeIncludes(profile, "latin");
  if (gate === "hebrew-chant-opt-in") {
    return customThemeIncludes(profile, "hebrew chant") || customThemeIncludes(profile, "cantillation");
  }
  return false;
}

function profileGateSatisfied(
  gate: string,
  source: CompactRuntimeSource,
  profile: GenerationProfile,
): boolean {
  switch (gate) {
    case "traditional-without-social-justice-only":
      return profile.themes.includes("traditional") && !profile.themes.includes("social-justice");
    case "disable-when-social-justice-selected":
      return !profile.themes.includes("social-justice");
    case "traditional-theme-only":
      return profile.themes.includes("traditional") && !profile.themes.includes("social-justice");
    case "environment-theme-only":
      return profile.themes.includes("environment");
    case "social-justice-theme-only":
      return profile.themes.includes("social-justice");
    case "interfaith-or-social-justice-theme-only":
      return profile.themes.some((theme) => theme === "interfaith" || theme === "social-justice");
    case "feminist-environment-or-interfaith-theme-only":
      return profile.themes.some((theme) => ["feminist", "environment", "interfaith"].includes(theme));
    case "social-justice-family-or-interfaith-theme-only":
      return profile.themes.some((theme) => ["social-justice", "family-storytelling", "interfaith"].includes(theme));
    case "mindfulness-or-spiritual-depth-selected":
      return profile.themes.includes("mindfulness") || customThemeIncludes(profile, "spiritual depth");
    case "miriams-cup-selected":
      return customThemeIncludes(profile, "miriams cup") || customThemeIncludes(profile, "miriam cup");
    case "optional-plate-item-selected":
    case "optional-plate-addition-only":
      return profile.sederPlateAdditions.length > 0;
    case "lgbtq-feminist-or-orange-plate-selection-only":
      return profile.themes.some((theme) => theme === "lgbtq" || theme === "feminist") ||
        profile.sederPlateAdditions.includes("orange");
    case "immigrant-justice-theme-or-explicit-opt-in":
      return profile.themes.includes("social-justice") || customThemeIncludes(profile, "immigrant justice");
    case "traditional-or-specialist-opt-in":
      return (profile.themes.includes("traditional") && !profile.themes.includes("social-justice")) ||
        customThemeIncludes(profile, "specialist") || customThemeIncludes(profile, source.sourceId);
    case "long-form-only":
      return profile.length === 90;
    case "adult-only":
      return profile.audience === "adults";
    case "adult-or-facilitated-mixed-age-only":
    case "adult-or-facilitated-mixed-age-use":
      return profile.audience === "adults" || profile.audience === "mixed";
    case "historical-sidebar-only":
      return customThemeIncludes(profile, "historical sidebar") || customThemeIncludes(profile, source.sourceId);
    case "specialist-textual-note-only":
      return customThemeIncludes(profile, "specialist textual note") || customThemeIncludes(profile, source.sourceId);
    case "optional-ritual-only":
      return customThemeIncludes(profile, "optional ritual") || customThemeIncludes(profile, source.sourceId);
    default:
      return sourceOptInGate(gate) && gateOptInSatisfied(gate, source, profile);
  }
}

const MODULE_SELECTION_GATES = new Set([
  "traditional-theme-only",
  "environment-theme-only",
  "social-justice-theme-only",
  "interfaith-or-social-justice-theme-only",
  "feminist-environment-or-interfaith-theme-only",
  "social-justice-family-or-interfaith-theme-only",
  "mindfulness-or-spiritual-depth-selected",
  "miriams-cup-selected",
  "optional-plate-item-selected",
  "optional-plate-addition-only",
  "lgbtq-feminist-or-orange-plate-selection-only",
  "immigrant-justice-theme-or-explicit-opt-in",
  "traditional-or-specialist-opt-in",
]);

function moduleExplicitOptInSatisfied(
  module: CompactRuntimeModule,
  source: CompactRuntimeSource,
  profile: GenerationProfile,
): boolean {
  if (!module.requiresExplicitOptIn) return true;
  if (source.requiresExplicitOptIn?.length && explicitOptInSatisfied(source, profile)) return true;
  if (customThemeIncludes(profile, source.sourceId)) return true;
  return (module.editorialGates ?? []).some((gate) =>
    (sourceOptInGate(gate) || MODULE_SELECTION_GATES.has(gate)) && profileGateSatisfied(gate, source, profile));
}

function editorialGatesSatisfied(
  gates: string[],
  module: CompactRuntimeModule,
  source: CompactRuntimeSource,
  profile: GenerationProfile,
): boolean {
  for (const gate of gates) {
    const policy = runtimeEditorialGatePolicy(gate);
    if (policy.disposition === "unresolved") return false;
    if (policy.disposition === "machine-enforced") {
      if (!profileGateSatisfied(gate, source, profile)) return false;
      continue;
    }
    if (policy.evidence === "beginner-context" &&
        (typeof module.beginnerContext !== "string" || module.beginnerContext.trim().length < 20)) return false;
    if (policy.evidence === "retained-credit" && module.evaluatorAttributionClear !== true) return false;
    if (policy.evidence === "exact-text" && !HASH_PATTERN.test(module.provenanceHash ?? "")) return false;
    if (policy.evidence === "host-backbone" &&
        (module.sectionIds?.length !== 1 || typeof module.beginnerContext !== "string")) return false;
  }
  return true;
}

async function normalizePackModule(
  record: PregeneratedPackModule,
  compact: CompactRuntimeModule,
  compactSource: CompactRuntimeSource,
  source: RuntimeSourceRecord,
  profile: GenerationProfile,
  digest: (text: string) => Promise<string>,
): Promise<RuntimeSourcePassage | null> {
  if (
    record.id !== compact.id || record.sourceId !== source.sourceId || compact.sourceId !== source.sourceId ||
    record.family !== source.family || compact.family !== source.family ||
    record.approvalStatus !== "approved" || compact.approvalStatus !== "approved" ||
    record.rights?.runtimeEligible !== true || record.runtimeEligible !== true || compact.runtimeEligible !== true ||
    record.editorialReviewStatus !== "local-agent-reviewed-demo" ||
    record.approvalBasis !== "local-source-dossier-review" ||
    record.beginnerSuitable === false
  ) return null;
  const exactText = typeof record.exactText === "string" ? record.exactText : "";
  if (!exactText.trim() || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/u.test(exactText)) return null;
  const beginnerContext = typeof record.beginnerContext === "string" ? record.beginnerContext : "";
  if (
    beginnerContext !== compact.beginnerContext || beginnerContext !== beginnerContext.trim() || beginnerContext.length < 20 ||
    record.beginnerSuitable !== compact.beginnerSuitable ||
    record.requiresExplicitOptIn !== compact.requiresExplicitOptIn ||
    record.politicalRisk !== compact.politicalRisk ||
    record.editorialReviewStatus !== compact.editorialReviewStatus ||
    record.containsThirdPartyAttribution !== compact.containsThirdPartyAttribution ||
    record.evaluatorAttributionClear !== compact.evaluatorAttributionClear ||
    record.approvalBasis !== compact.approvalBasis ||
    JSON.stringify(record.editorialGates ?? []) !== JSON.stringify(compact.editorialGates ?? []) ||
    JSON.stringify(record.sectionIds ?? []) !== JSON.stringify(compact.sectionIds ?? []) ||
    JSON.stringify(record.sourceSectionIds ?? []) !== JSON.stringify(compact.sourceSectionIds ?? []) ||
    record.insertionSectionId !== compact.insertionSectionId ||
    JSON.stringify(record.themes ?? []) !== JSON.stringify(compact.themes ?? []) ||
    JSON.stringify(record.audience ?? []) !== JSON.stringify(compact.audience ?? []) ||
    JSON.stringify(record.tones ?? []) !== JSON.stringify(compact.tones ?? []) ||
    JSON.stringify(record.lengthTiers ?? []) !== JSON.stringify(compact.lengthTiers ?? []) ||
    record.seam !== compact.seam
  ) return null;
  const exactHash = await digest(exactText);
  if (exactHash !== record.provenanceHash || exactHash !== compact.provenanceHash) return null;
  const words = exactText.split(/\s+/u).filter(Boolean).length;
  if (record.wordCount !== words || compact.wordCount !== words) return null;
  const sectionIds = (record.sectionIds ?? []).filter((value): value is SederSectionId => SECTIONS.has(value));
  const themes = (record.themes ?? []).filter((value): value is ThemeId => THEMES.has(value as ThemeId));
  const audience = (record.audience ?? []).filter((value) => typeof value === "string" && value.length > 0);
  const tones = normalizedTones(record.tones ?? []);
  const lengthTiers = (record.lengthTiers ?? [])
    .filter((value): value is LengthTier => LENGTHS.has(value as LengthTier));
  if (sectionIds.length !== 1 || record.insertionSectionId !== sectionIds[0] ||
      !record.sourceSectionIds?.includes(sectionIds[0]) || !themes.length || !audience.length || !tones.length || !lengthTiers.length) return null;
  if (!moduleExplicitOptInSatisfied(compact, compactSource, profile)) return null;
  if (!["none", "context-sensitive"].includes(String(record.politicalRisk ?? "context-sensitive"))) return null;
  const gates = Array.isArray(record.editorialGates) ? record.editorialGates.filter((value): value is string => typeof value === "string") : [];
  if (!editorialGatesSatisfied(gates, compact, compactSource, profile)) return null;
  if (/\bnext year in jerusalem\b/iu.test(exactText) &&
      (!profile.themes.includes("traditional") || profile.themes.includes("social-justice"))) return null;

  const locator = record.locator ?? {};
  const attribution = record.attribution ?? {};
  const sourcePresentedParts = (record.sourcePresentedAttribution ?? []).filter((value) => typeof value === "string" && value.trim());
  const sourcePresented = typeof attribution.sourcePresented === "string"
    ? attribution.sourcePresented
    : sourcePresentedParts.length ? sourcePresentedParts.join("; ") : null;
  const license = typeof record.rights?.license === "string" ? record.rights.license : source.rights.license;
  const conditions = Array.isArray(record.rights?.conditions)
    ? record.rights.conditions.filter((value): value is string => typeof value === "string" && value.length > 0)
    : source.rights.conditions;
  const allowedMaterialKinds = new Set<RuntimeSourcePassage["rights"]["materialKind"]>([
    "creator-authored", "traditional-liturgy", "public-domain", "embedded-third-party",
  ]);
  const recordedMaterialKind = String(record.rights?.materialKind ?? "");
  const materialKind = allowedMaterialKinds.has(recordedMaterialKind as RuntimeSourcePassage["rights"]["materialKind"])
    ? recordedMaterialKind as RuntimeSourcePassage["rights"]["materialKind"]
    : sourcePresented ? "embedded-third-party"
      : /public domain/iu.test(license) ? "public-domain"
        : source.family === "traditional-liturgical" ? "traditional-liturgy" : "creator-authored";
  const sourcePresentedAttributionRequired = record.rights?.sourcePresentedAttributionRequired === true;
  if (sourcePresentedAttributionRequired && !sourcePresented) return null;
  const sourceLocation = typeof record.sourceLocation === "string"
    ? record.sourceLocation
    : typeof locator.label === "string" ? locator.label : "reviewed source segment";

  return {
    id: compact.id,
    sourceId: source.sourceId,
    family: source.family,
    exactText,
    beginnerContext,
    locator: {
      edition: source.title,
      sourceLocation,
      localExtract: typeof locator.localExtract === "string" ? locator.localExtract : source.acquisition.extractFile,
      sourceSha256: typeof locator.sourceSha256 === "string" ? locator.sourceSha256 : source.acquisition.sha256,
      extractSha256: typeof locator.extractSha256 === "string" ? locator.extractSha256 : source.acquisition.extractSha256,
    },
    sectionIds: [...new Set(sectionIds)],
    themes: [...new Set(themes)],
    audience: [...new Set(audience)],
    tones,
    lengthTiers: [...new Set(lengthTiers)],
    seam: normalizedSeam(String(record.seam ?? compact.seam ?? "ritual-explanation")),
    wordCount: words,
    approvalStatus: "approved",
    rights: {
      runtimeEligible: true,
      license,
      materialKind,
      sourcePresentedAttributionRequired,
      conditions,
    },
    provenanceHash: exactHash,
    attribution: {
      creator: typeof attribution.creator === "string" ? attribution.creator : source.creator,
      containingSource: typeof attribution.containingSource === "string" ? attribution.containingSource : source.title,
      sourcePresented,
      readerCredit: typeof attribution.readerCredit === "string"
        ? attribution.readerCredit
        : `From ${source.title} by ${source.creator}.`,
    },
  };
}

function unpackDynamicJson(value: unknown): PregeneratedSourcePack {
  if (value && typeof value === "object" && "default" in value) {
    return (value as { default: PregeneratedSourcePack }).default;
  }
  return value as PregeneratedSourcePack;
}

function smokeResult(profile: GenerationProfile, backboneSourceId: string, reasons: string[]): RuntimePackLoadResult {
  return {
    context: smokeRuntimeContext,
    featuredSourceId: runtimeFeaturedSource(profile, backboneSourceId, smokeRuntimeContext)?.sourceId ?? backboneSourceId,
    loadedSourceIds: [],
    usedComprehensivePack: false,
    fallbackReasons: reasons,
  };
}

/** Load exact text from at most the featured and one supporting source pack. */
export async function loadRuntimeContextForProfile(
  profile: GenerationProfile,
  backboneSourceId: "shir-geulah" | "velveteen-rabbi",
  options: RuntimePackLoadOptions = {},
): Promise<RuntimePackLoadResult> {
  const manifest = options.manifest ?? defaultManifest;
  const catalog = options.catalog ?? defaultCatalog;
  const loaders = options.loaders ?? defaultLoaders;
  const gateErrors = comprehensiveRuntimeGateErrors(manifest, catalog, Object.keys(loaders));
  if (gateErrors.length) return smokeResult(profile, backboneSourceId, gateErrors);

  const selection = selectedCatalogSources(
    profile,
    backboneSourceId,
    catalog,
    options.featuredSourceId,
    options.requestedPassageIds,
  );
  if (!selection.featured || selection.errors.length) {
    return smokeResult(profile, backboneSourceId, selection.errors);
  }
  const selectedSources = [selection.featured, selection.supporting].filter(
    (source): source is CompactRuntimeSource => Boolean(source),
  );
  if (selectedSources.length > 2) return smokeResult(profile, backboneSourceId, ["runtime attempted to load more than two source packs"]);

  try {
    const loadedPassages: RuntimeSourcePassage[] = [];
    for (const compactSource of selectedSources) {
      const source = runtimeSources.find((item) => item.sourceId === compactSource.sourceId);
      const loader = loaders[compactSource.sourceId];
      if (!source || !loader) throw new Error(`No approved dynamic pack loader exists for ${compactSource.sourceId}`);
      const pack = unpackDynamicJson(await loader());
      if (pack.sourceId !== compactSource.sourceId || !Array.isArray(pack.modules)) {
        throw new Error(`Dynamic pack identity is invalid for ${compactSource.sourceId}`);
      }
      const compactById = new Map(compactSource.modules.map((module) => [module.id, module]));
      for (const record of pack.modules) {
        const compact = typeof record.id === "string" ? compactById.get(record.id) : undefined;
        if (!compact || !compactModuleMatches(compact, compactSource, profile)) continue;
        const normalized = await normalizePackModule(
          record,
          compact,
          compactSource,
          source,
          profile,
          options.digest ?? sha256,
        );
        if (normalized) loadedPassages.push(normalized);
      }
    }
    if (!loadedPassages.some((passage) => passage.sourceId === selection.featured?.sourceId)) {
      throw new Error("The selected featured pack contains no exact approved module compatible with this profile");
    }
    const bySource = new Map<string, RuntimeSourcePassage[]>();
    for (const passage of loadedPassages) {
      bySource.set(passage.sourceId, [...(bySource.get(passage.sourceId) ?? []), passage]);
    }
    const sources = runtimeSources.map((source) => ({
      ...source,
      passages: bySource.get(source.sourceId) ?? [],
    }));
    return {
      context: {
        mode: "per-source-dynamic",
        sources,
        passages: loadedPassages,
        approvedPassages: loadedPassages,
        errors: [],
      },
      featuredSourceId: selection.featured.sourceId,
      loadedSourceIds: selectedSources.map((source) => source.sourceId),
      usedComprehensivePack: true,
      fallbackReasons: [],
    };
  } catch (error) {
    return smokeResult(profile, backboneSourceId, [error instanceof Error ? error.message : "dynamic source-pack loading failed"]);
  }
}

/**
 * Resolve the exact allowlisted briefs server-side (or in a static client)
 * without trusting caller-supplied source text.
 */
export async function runtimePassageBriefsForProfile(
  profile: GenerationProfile,
  backboneSourceId: "shir-geulah" | "velveteen-rabbi",
  featuredSourceId: string,
  requestedPassageIds: string[],
) {
  const loaded = await loadRuntimeContextForProfile(profile, backboneSourceId, {
    featuredSourceId,
    requestedPassageIds,
  });
  const candidates = runtimePassageCandidates(
    profile,
    backboneSourceId,
    loaded.featuredSourceId,
    12,
    loaded.context,
  );
  const allowed = new Set(candidates.map((candidate) => candidate.passage.id));
  return runtimePassageBriefs(
    requestedPassageIds.filter((passageId) => allowed.has(passageId)),
    loaded.context,
  );
}
