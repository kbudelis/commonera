import { coverOptions, quoteCatalog } from "../content/pack";
import type { HaggadahDocument, QuoteEntry } from "./types";

export const EDITORIAL_SECTION_ORDER = [
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
] as const;

/** Quotes approved not just by topic, but for the exact narrative seam. */
export const CONTEXTUAL_QUOTE_IDS: Record<string, ReadonlySet<string>> = {
  maggid: new Set([
    "q-amos-waters",
    "q-avot-freedom",
    "q-avot-free",
    "q-avot-precious",
    "q-deuteronomy-justice",
    "q-deuteronomy-open-hand",
    "q-deuteronomy-remember",
    "q-douglass-power",
    "q-douglass-struggle",
    "q-exodus-cry",
    "q-exodus-let-go",
    "q-exodus-midwives",
    "q-exodus-moses-turned",
    "q-exodus-stranger",
    "q-genesis-image",
    "q-genesis-keeper",
    "q-isaiah-learn-good",
    "q-leviticus-stranger",
    "q-proverbs-voiceless",
    "q-psalm-justice",
    "q-wells",
    "q-wilde-disobedience",
    "q-wollstonecraft",
  ]),
  nirtzah: new Set([
    "q-amos-waters",
    "q-avot-action",
    "q-avot-community",
    "q-avot-free",
    "q-hillel-self",
    "q-deuteronomy-justice",
    "q-deuteronomy-life",
    "q-dhammapada-hatred",
    "q-ecclesiastes-season",
    "q-ecclesiastes-two",
    "q-eliot",
    "q-exodus-strength",
    "q-gita-right-action",
    "q-isaiah-peace",
    "q-isaiah-repairer",
    "q-isha-self",
    "q-jeremiah-welfare",
    "q-leviticus-neighbor",
    "q-malachi-parent",
    "q-micah",
    "q-proverbs-tree",
    "q-psalm-goodness",
    "q-psalm-peace",
    "q-psalm-tears",
    "q-psalm-together",
    "q-ruth-go",
    "q-song-love",
    "q-truth",
    "q-wollstonecraft",
  ]),
};

export const MIN_BRIDGE_WORDS = 6;
export const MAX_BRIDGE_WORDS = 45;

function expectedQuoteCount(length: HaggadahDocument["profile"]["length"]): number {
  void length;
  return 2;
}

const prohibitedLanguage: Array<{ label: string; pattern: RegExp }> = [
  {
    label: "collective blame",
    pattern:
      /\b(?:all|every)\s+(?:jews?|muslims?|christians?|israelis?|palestinians?|arabs?)\s+(?:are|must|should|deserve|want|support)\b/i,
  },
  {
    label: "collective guilt",
    pattern:
      /\b(?:jews?|muslims?|christians?|israelis?|palestinians?|arabs?)\s+(?:are\s+)?(?:collectively\s+)?(?:guilty|responsible|to blame)\b/i,
  },
  {
    label: "dehumanizing language",
    pattern: /\b(?:subhuman|vermin|human animals?|no innocent civilians?)\b/i,
  },
  {
    label: "exclusivist freedom claim",
    pattern:
      /\bonly\s+(?:jews?|muslims?|christians?|israelis?|palestinians?|arabs?)\s+(?:deserve|have a right to)\s+(?:freedom|safety|dignity|the land)\b/i,
  },
  {
    label: "exclusive territorial claim",
    pattern:
      /\b(?:the\s+)?land\s+(?:belongs|should belong)\s+(?:only|exclusively)\s+to\b/i,
  },
  {
    label: "expulsion advocacy",
    pattern:
      /\b(?:jews?|muslims?|christians?|israelis?|palestinians?|arabs?)\s+(?:must|should)\s+be\s+(?:expelled|removed|driven out)\b/i,
  },
];

function words(value: string): number {
  return value.trim().split(/\s+/u).filter(Boolean).length;
}

function quoteIsExact(quote: QuoteEntry): boolean {
  const approved = quoteCatalog.find((entry) => entry.id === quote.id);
  return approved !== undefined && JSON.stringify(quote) === JSON.stringify(approved);
}

function editorialText(document: HaggadahDocument): string[] {
  return [
    document.title,
    document.invitation,
    ...document.hostGuide,
    ...document.sections.flatMap((section) => [
      section.title,
      section.ritual,
      ...section.body,
      section.prompt ?? "",
      section.bridge ?? "",
    ]),
  ].filter(Boolean);
}

/** Returns actionable editorial errors. An empty array means the document is valid. */
export function validateEditorial(document: HaggadahDocument): string[] {
  const errors: string[] = [];
  const ids = document.sections.map((section) => section.id);

  if (ids.length !== EDITORIAL_SECTION_ORDER.length) {
    errors.push(
      `Expected ${EDITORIAL_SECTION_ORDER.length} seder sections; received ${ids.length}.`,
    );
  }

  EDITORIAL_SECTION_ORDER.forEach((expectedId, index) => {
    const section = document.sections[index];
    if (!section || section.id !== expectedId || section.order !== index + 1) {
      errors.push(
        `Section ${index + 1} must be ${expectedId} with order ${index + 1}.`,
      );
    }
  });

  if (new Set(ids).size !== ids.length) {
    errors.push("Seder section IDs must be unique.");
  }

  if (!coverOptions.some((cover) => cover.id === document.coverId)) {
    errors.push(`Unknown or unapproved cover: ${document.coverId}.`);
  }

  document.sections.forEach((section) => {
    if (section.body.length === 0 || section.body.some((paragraph) => !paragraph.trim())) {
      errors.push(`Section ${section.id} must contain non-empty body text.`);
    }

    if (section.bridge) {
      const bridgeWords = words(section.bridge);
      if (bridgeWords < MIN_BRIDGE_WORDS || bridgeWords > MAX_BRIDGE_WORDS) {
        errors.push(
          `Bridge for ${section.id} must be ${MIN_BRIDGE_WORDS}-${MAX_BRIDGE_WORDS} words; received ${bridgeWords}.`,
        );
      }
    }

    if (section.quote) {
      if (!quoteIsExact(section.quote)) {
        errors.push(`Quote in ${section.id} must exactly match an approved catalog entry.`);
      } else if (!section.quote.sectionIds.includes(section.id)) {
        errors.push(
          `Quote ${section.quote.id} is not approved for placement in ${section.id}.`,
        );
      } else if (!CONTEXTUAL_QUOTE_IDS[section.id]?.has(section.quote.id)) {
        errors.push(
          `Quote ${section.quote.id} has not passed seam-specific review for ${section.id}.`,
        );
      } else if (
        !section.quote.themes.some((theme) =>
          document.profile.themes.includes(theme),
        ) && document.profile.themes.length > 0
      ) {
        errors.push(
          `Quote ${section.quote.id} does not match a selected theme.`,
        );
      }
      if (
        section.quote.externalContemplative &&
        !document.profile.themes.includes("mindfulness")
      ) {
        errors.push(
          `External contemplative quote ${section.quote.id} requires the Mindfulness & spiritual depth theme.`,
        );
      }
    }
  });

  const placedQuotes = document.sections.flatMap((section) =>
    section.quote ? [section.quote] : [],
  );
  const expectedQuotes = expectedQuoteCount(document.profile.length);
  if (placedQuotes.length !== expectedQuotes) {
    errors.push(
      `A ${document.profile.length}-minute Haggadah must contain exactly ${expectedQuotes} contextual quotations; received ${placedQuotes.length}.`,
    );
  }
  if (new Set(placedQuotes.map((quote) => quote.id)).size !== placedQuotes.length) {
    errors.push("Quotation IDs must be unique within a Haggadah.");
  }
  if (placedQuotes.filter((quote) => quote.externalContemplative).length > 1) {
    errors.push("A Haggadah may contain at most one external contemplative quotation.");
  }

  editorialText(document).forEach((value) => {
    prohibitedLanguage.forEach(({ label, pattern }) => {
      if (pattern.test(value)) {
        errors.push(`Prohibited ${label}: “${value}”`);
      }
    });
  });

  const allText = editorialText(document).join(" ");
  const hasJerusalemRefrain = /\bnext year in jerusalem\b/i.test(allText);
  const hasInclusiveFrame =
    /(?:not as a claim of exclusivity|shared freedom|every people|all who call the land home|safety, dignity, equality, and peace)/i.test(
      allText,
    );

  const allowsJerusalemRefrain =
    document.profile.themes.includes("traditional") &&
    !document.profile.themes.includes("social-justice");

  if (!allowsJerusalemRefrain && hasJerusalemRefrain) {
    errors.push(
      "The “Next year in Jerusalem” refrain is allowed only when Traditional is selected without Social Justice.",
    );
  } else if (
    !allowsJerusalemRefrain &&
    !/\bnext year in peace\b/i.test(allText)
  ) {
    errors.push(
      "The closing must include the approved “Next year in peace” refrain unless Traditional is selected without Social Justice.",
    );
  } else if (hasJerusalemRefrain && !hasInclusiveFrame) {
    errors.push(
      "The “Next year in Jerusalem” refrain requires explicit inclusive, peace-focused framing.",
    );
  }

  return [...new Set(errors)];
}

export function assertEditorial(document: HaggadahDocument): void {
  const errors = validateEditorial(document);
  if (errors.length > 0) {
    throw new Error(`Editorial validation failed:\n- ${errors.join("\n- ")}`);
  }
}
