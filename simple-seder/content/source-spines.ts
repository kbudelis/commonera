import {
  shirSourcePassages,
  type ShirSourcePassage,
} from "./source-passages-shir";
import {
  VELVETEEN_SECTION_ORDER,
  VELVETEEN_V9_WORK,
  velveteenPassages,
  velveteenSectionPacks,
  type PassageTier,
  type VelveteenPassage,
} from "./source-passages-velveteen";

export const SEDER_SECTION_ORDER = [
  "kadesh", "urchatz", "karpas", "yachatz", "maggid", "rachtzah",
  "motzi-matzah", "maror", "korech", "shulchan-orech", "tzafun",
  "barech", "hallel", "nirtzah",
] as const;

export type SederSectionId = (typeof SEDER_SECTION_ORDER)[number];
export type SourceTier = 20 | 45 | 90;
export type PrimarySourceId = "shir-geulah" | "velveteen-rabbi";
export type SeamType =
  | "ritual-anchor"
  | "narrative-reading"
  | "quotation"
  | "song-or-poem"
  | "closing-reflection";
export type HouseCopyRole =
  | "beginner-orientation"
  | "ritual-direction"
  | "bridge"
  | "table-prompt"
  | "accessibility-clarification";

export interface SourceIdentity {
  sourceId: PrimarySourceId;
  workTitle: string;
  creator: string;
  compatibilityTags: string[];
  readerCredit: string;
}

export interface ReviewedSourcePassage {
  id: string;
  sectionId: SederSectionId;
  sourceId: PrimarySourceId;
  text: string;
  locator: string;
  originalAttribution: string;
  containingHaggadah: string;
  containingHaggadahCreator: string;
  modificationNote: string;
  provenanceHash: string;
}

export interface SpineExcerptRef {
  passageId: string;
  sectionId: SederSectionId;
  seam: SeamType;
  tiers: SourceTier[];
}

export interface SourceSpine {
  id: string;
  label: string;
  primarySourceId: PrimarySourceId;
  status: "generation-ready-with-house-copy" | "partial-evidence-only";
  coverage: SpineExcerptRef[];
  houseCopyBoundaries: HouseCopyRole[];
  secondaryCompatibility: Array<{
    sourceId: PrimarySourceId;
    allowedSeams: SeamType[];
    allowedSections: SederSectionId[];
    maxInserts: number;
    rationale: string;
  }>;
  maxSecondarySources: number;
  maxSecondaryInserts: number;
  attributionDisplay: "final-credits-once-per-source";
}

export const sourceIdentities: SourceIdentity[] = [
  {
    sourceId: "shir-geulah",
    workTitle: "Haggadah Shir Ge’ulah / Song of Liberation",
    creator: "Emily Aviva Kapor-Mater",
    compatibilityTags: ["traditional-order", "clear-ritual-directions", "inclusive", "cc-by"],
    readerCredit: "Haggadah Shir Ge’ulah / Song of Liberation — Emily Aviva Kapor-Mater (CC BY 4.0).",
  },
  {
    sourceId: "velveteen-rabbi",
    workTitle: VELVETEEN_V9_WORK.title,
    creator: VELVETEEN_V9_WORK.compiler,
    compatibilityTags: ["traditional-order", "contemporary-reflection", "poetry", "inclusive", "author-permission"],
    readerCredit: VELVETEEN_V9_WORK.readerCredit,
  },
];

const shirTierMap: Record<ShirSourcePassage["tiers"][number], SourceTier> = {
  short: 20,
  medium: 45,
  full: 90,
};

function velveteenTiersFor(passageId: string): SourceTier[] {
  const tiers: SourceTier[] = [];
  for (const tier of [20, 45, 90] as const) {
    if (velveteenSectionPacks.some((pack) => pack.readingPassageIdsByTier[tier].includes(passageId))) {
      tiers.push(tier);
    }
  }
  return tiers;
}

function seamFor(sectionId: SederSectionId, role: string): SeamType {
  if (role === "ritual-source") return "ritual-anchor";
  if (sectionId === "hallel") return "song-or-poem";
  if (sectionId === "nirtzah") return "closing-reflection";
  return "narrative-reading";
}

const reviewedShirPassages: ReviewedSourcePassage[] = shirSourcePassages.map((passage) => ({
  id: passage.id,
  sectionId: passage.sectionId as SederSectionId,
  sourceId: "shir-geulah",
  text: passage.text,
  locator: passage.locator,
  originalAttribution: passage.sourcePresentedAttribution ?? `${passage.containingHaggadahCreator}, ${passage.containingHaggadah}`,
  containingHaggadah: passage.containingHaggadah,
  containingHaggadahCreator: passage.containingHaggadahCreator,
  modificationNote: "Verbatim source wording with PDF line breaks and discretionary hyphenation normalized.",
  provenanceHash: passage.provenanceHash,
}));

const reviewedVelveteenPassages: ReviewedSourcePassage[] = velveteenPassages.map((passage) => ({
  id: passage.id,
  sectionId: passage.sectionId,
  sourceId: "velveteen-rabbi",
  text: passage.text,
  locator: `PDF ${passage.pdfPages.length === 1 ? "p." : "pp."} ${passage.pdfPages.join("–")}, ${passage.printedHeading}`,
  originalAttribution: passage.printedAttribution ?? VELVETEEN_V9_WORK.readerCredit,
  containingHaggadah: VELVETEEN_V9_WORK.title,
  containingHaggadahCreator: VELVETEEN_V9_WORK.compiler,
  modificationNote: "Exact source wording with whitespace normalized.",
  provenanceHash: passage.provenanceHash,
}));

export const reviewedSourcePassages: ReviewedSourcePassage[] = [
  ...reviewedShirPassages,
  ...reviewedVelveteenPassages,
];

const shirCoverage: SpineExcerptRef[] = shirSourcePassages.map((passage) => ({
  passageId: passage.id,
  sectionId: passage.sectionId as SederSectionId,
  seam: seamFor(passage.sectionId as SederSectionId, passage.role),
  tiers: passage.tiers.map((tier) => shirTierMap[tier]),
}));

const velveteenCoverage: SpineExcerptRef[] = velveteenPassages
  .filter((passage) => passage.role === "reading")
  .map((passage) => ({
    passageId: passage.id,
    sectionId: passage.sectionId,
    seam: seamFor(passage.sectionId, passage.role),
    tiers: velveteenTiersFor(passage.id),
  }));

const allowedHouseCopy: HouseCopyRole[] = [
  "beginner-orientation",
  "ritual-direction",
  "bridge",
  "table-prompt",
  "accessibility-clarification",
];

/**
 * Both source packs provide a complete primary voice. Runtime assembly selects
 * one of them and does not mix source prose. Secondary source seams remain
 * closed until a specific cross-source edit is reviewed for cohesion.
 */
export const sourceSpines: SourceSpine[] = [
  {
    id: "shir-geulah-primary",
    label: "Shir Ge’ulah — clear, justice-centered ritual voice",
    primarySourceId: "shir-geulah",
    status: "generation-ready-with-house-copy",
    coverage: shirCoverage,
    houseCopyBoundaries: allowedHouseCopy,
    secondaryCompatibility: [],
    maxSecondarySources: 0,
    maxSecondaryInserts: 0,
    attributionDisplay: "final-credits-once-per-source",
  },
  {
    id: "velveteen-rabbi-primary",
    label: "Velveteen Rabbi — reflective and poetic ritual voice",
    primarySourceId: "velveteen-rabbi",
    status: "generation-ready-with-house-copy",
    coverage: velveteenCoverage,
    houseCopyBoundaries: allowedHouseCopy,
    secondaryCompatibility: [],
    maxSecondarySources: 0,
    maxSecondaryInserts: 0,
    attributionDisplay: "final-credits-once-per-source",
  },
];

export type AssemblyBlock =
  | { kind: "primary-source" | "secondary-source"; passageId: string; seam: SeamType; text: string }
  | { kind: "house-copy"; role: HouseCopyRole; text: string }
  | { kind: "traditional-liturgy"; text: string };

export interface SectionAssembly {
  sectionId: SederSectionId;
  /** Each block is a paragraph unit; sourced words may never be stitched into house copy. */
  blocks: AssemblyBlock[];
}

export interface HaggadahAssembly {
  spineId: string;
  tier: SourceTier;
  sections: SectionAssembly[];
}

export interface SourceShareMetrics {
  totalWords: number;
  borrowedWords: number;
  borrowedWordShare: number;
  houseWords: number;
  traditionalWords: number;
  bySource: Record<string, { words: number; share: number }>;
}

const wordCount = (text: string) => text.trim().split(/\s+/u).filter(Boolean).length;

export function reviewedPassage(passageId: string): ReviewedSourcePassage | undefined {
  return reviewedSourcePassages.find((passage) => passage.id === passageId);
}

export function sourceShareMetrics(assembly: HaggadahAssembly): SourceShareMetrics {
  const bySourceWords: Record<string, number> = {};
  let totalWords = 0;
  let borrowedWords = 0;
  let houseWords = 0;
  let traditionalWords = 0;
  for (const block of assembly.sections.flatMap((section) => section.blocks)) {
    const words = wordCount(block.text);
    totalWords += words;
    if (block.kind === "house-copy") houseWords += words;
    else if (block.kind === "traditional-liturgy") traditionalWords += words;
    else {
      borrowedWords += words;
      const passage = reviewedPassage(block.passageId);
      if (passage) bySourceWords[passage.sourceId] = (bySourceWords[passage.sourceId] ?? 0) + words;
    }
  }
  return {
    totalWords,
    borrowedWords,
    borrowedWordShare: totalWords ? borrowedWords / totalWords : 0,
    houseWords,
    traditionalWords,
    bySource: Object.fromEntries(
      Object.entries(bySourceWords).map(([sourceId, words]) => [
        sourceId,
        { words, share: totalWords ? words / totalWords : 0 },
      ]),
    ),
  };
}

/** Internal provenance stays exact; reader credits dedupe by Haggadah and omit locators. */
export function readerCredits(assembly: HaggadahAssembly): string[] {
  const sourceIds = new Set<PrimarySourceId>();
  for (const block of assembly.sections.flatMap((section) => section.blocks)) {
    if (block.kind === "primary-source" || block.kind === "secondary-source") {
      const passage = reviewedPassage(block.passageId);
      if (passage) sourceIds.add(passage.sourceId);
    }
  }
  return sourceIdentities
    .filter((source) => sourceIds.has(source.sourceId))
    .map((source) => source.readerCredit);
}

/** Audit-only provenance; never render this as an inline reader citation. */
export function internalProvenance(passageId: string): ReviewedSourcePassage | undefined {
  return reviewedPassage(passageId);
}

export function validateSourceSpines(): string[] {
  const errors: string[] = [];
  for (const spine of sourceSpines) {
    if (spine.status === "generation-ready-with-house-copy") {
      for (const tier of [20, 45, 90] as const) {
        for (const sectionId of SEDER_SECTION_ORDER) {
          if (!spine.coverage.some((ref) => ref.sectionId === sectionId && ref.tiers.includes(tier))) {
            errors.push(`${spine.id} lacks primary-source coverage for ${sectionId} at ${tier} minutes.`);
          }
        }
      }
    }
    for (const ref of spine.coverage) {
      const passage = reviewedPassage(ref.passageId);
      if (!passage) errors.push(`${spine.id} references unknown passage ${ref.passageId}.`);
      else if (passage.sourceId !== spine.primarySourceId || passage.sectionId !== ref.sectionId) {
        errors.push(`${spine.id} misclassifies ${ref.passageId}.`);
      }
      if (ref.tiers.length === 0) errors.push(`${spine.id} has no length tier for ${ref.passageId}.`);
    }
  }
  return [...new Set(errors)];
}

export function validateAssembly(assembly: HaggadahAssembly): string[] {
  const errors: string[] = [];
  const spine = sourceSpines.find((item) => item.id === assembly.spineId);
  if (!spine) return [`Unknown source spine: ${assembly.spineId}.`];
  if (spine.status !== "generation-ready-with-house-copy") {
    errors.push(`${spine.id} is partial evidence and cannot generate a full Haggadah.`);
  }
  if (assembly.sections.length !== SEDER_SECTION_ORDER.length) {
    errors.push(`A complete assembly requires ${SEDER_SECTION_ORDER.length} ordered sections; received ${assembly.sections.length}.`);
  }
  SEDER_SECTION_ORDER.forEach((sectionId, index) => {
    if (assembly.sections[index]?.sectionId !== sectionId) {
      errors.push(`Assembly section ${index + 1} must be ${sectionId}.`);
    }
  });

  const secondarySources = new Set<PrimarySourceId>();
  let secondaryInsertCount = 0;
  for (const section of assembly.sections) {
    let primaryBlocks = 0;
    for (const block of section.blocks) {
      if (!block.text.trim()) {
        errors.push(`${section.sectionId} contains an empty block.`);
        continue;
      }
      if (block.kind === "house-copy") {
        if (!spine.houseCopyBoundaries.includes(block.role)) {
          errors.push(`${section.sectionId} uses disallowed house-copy role ${block.role}.`);
        }
        continue;
      }
      if (block.kind === "traditional-liturgy") continue;

      const passage = reviewedPassage(block.passageId);
      if (!passage) {
        errors.push(`${section.sectionId} references unknown passage ${block.passageId}.`);
        continue;
      }
      if (passage.sectionId !== section.sectionId) {
        errors.push(`${block.passageId} cannot move from ${passage.sectionId} to ${section.sectionId}.`);
      }
      if (block.text !== passage.text) {
        errors.push(`${block.passageId} must remain an exact reviewed passage block; do not stitch or rewrite it.`);
      }
      if (block.kind === "primary-source") {
        primaryBlocks += 1;
        if (passage.sourceId !== spine.primarySourceId) {
          errors.push(`${block.passageId} is not from primary source ${spine.primarySourceId}.`);
        }
        if (!spine.coverage.some(
          (ref) => ref.passageId === block.passageId && ref.seam === block.seam && ref.tiers.includes(assembly.tier),
        )) {
          errors.push(`${block.passageId} is outside the primary spine coverage, tier, or designated seam.`);
        }
      } else {
        secondarySources.add(passage.sourceId);
        secondaryInsertCount += 1;
        const compatibility = spine.secondaryCompatibility.find((item) => item.sourceId === passage.sourceId);
        if (!compatibility || !compatibility.allowedSeams.includes(block.seam) || !compatibility.allowedSections.includes(section.sectionId)) {
          errors.push(`${block.passageId} is not allowed at the ${block.seam} seam in ${section.sectionId}.`);
        }
      }
    }
    if (primaryBlocks === 0) {
      errors.push(`${section.sectionId} must contain primary-source prose from ${spine.primarySourceId}.`);
    }
  }

  if (secondarySources.has(spine.primarySourceId)) {
    errors.push("Primary-source passages cannot be labeled as secondary inserts.");
  }
  if (secondarySources.size > spine.maxSecondarySources) {
    errors.push(`At most ${spine.maxSecondarySources} secondary sources are allowed.`);
  }
  if (secondaryInsertCount > spine.maxSecondaryInserts) {
    errors.push(`At most ${spine.maxSecondaryInserts} secondary inserts are allowed.`);
  }
  return [...new Set(errors)];
}

export function passagesForSpine(
  spineId: string,
  sectionId: SederSectionId,
  tier: SourceTier,
): ReviewedSourcePassage[] {
  const spine = sourceSpines.find((candidate) => candidate.id === spineId);
  if (!spine || spine.status !== "generation-ready-with-house-copy") return [];
  return spine.coverage
    .filter((ref) => ref.sectionId === sectionId && ref.tiers.includes(tier))
    .map((ref) => reviewedPassage(ref.passageId))
    .filter((passage): passage is ReviewedSourcePassage => Boolean(passage));
}

export const sourcePackDiagnostics = {
  shirPassageCount: shirSourcePassages.length,
  velveteenPassageCount: velveteenPassages.length,
  velveteenSectionOrder: VELVETEEN_SECTION_ORDER,
  velveteenTierValues: [20, 45, 90] as PassageTier[],
  velveteenPassageType: null as VelveteenPassage | null,
};
