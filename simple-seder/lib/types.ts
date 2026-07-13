export type SederLength = 20 | 45 | 90;
export type Audience = "adults" | "kids" | "mixed";
export type Interaction = "reflective" | "balanced" | "participatory";
export type Tone = "playful" | "balanced" | "reverent";
export type Typography = "classic" | "modern" | "readable";
export type LanguageMode = "english" | "transliteration";
export type PlateAddition = "orange" | "pomegranate";

export type ThemeId =
  | "feminist"
  | "lgbtq"
  | "social-justice"
  | "environment"
  | "interfaith"
  | "secular"
  | "mindfulness"
  | "traditional"
  | "family-storytelling";

export interface GenerationProfile {
  length: SederLength;
  audience: Audience;
  interaction: Interaction;
  tone: Tone;
  typography: Typography;
  language: LanguageMode;
  themes: ThemeId[];
  sederPlateAdditions: PlateAddition[];
  customTheme: string;
  hostName: string;
  sederDate: string;
  coverQuote: string;
}

export interface QuoteEntry {
  id: string;
  text: string;
  author: string;
  work: string;
  year: string;
  themes: ThemeId[];
  /** Seder section IDs where the quotation has been editorially reviewed in context. */
  sectionIds: string[];
  rights: "public-domain" | "original-translation" | "owner-approved-demo";
  sourceUrl: string;
  approved: true;
  /** Marks a non-Jewish contemplative text that receives stricter runtime limits. */
  externalContemplative?: true;
  traditionLabel?: string;
  placementNote?: string;
}

export interface SederPlateGuideEntry {
  element: string;
  meaning: string;
  ingredients: string;
  preparation: string;
}

export interface DocumentSourceMetrics {
  /** Complete beginner-facing ritual structure; not the profile's featured editorial source. */
  proceduralBackboneSourceId: "shir-geulah" | "velveteen-rabbi";
  featuredSourceId: string;
  featuredSourceWords: number;
  supportingSourceIds: string[];
  /** Reviewed non-house wording, including inherited traditional liturgy. */
  borrowedWords: number;
  houseWords: number;
  traditionalWords: number;
  borrowedWordShare: number;
}

export interface HaggadahSection {
  id: string;
  order: number;
  transliteration: string;
  title: string;
  ritual: string;
  body: string[];
  prompt?: string;
  bridge?: string;
  quoteContext?: string;
  quote?: QuoteEntry;
  minutes: number;
  sourceIds: string[];
  passageIds: string[];
}

export interface CoverOption {
  id: string;
  name: string;
  image: string;
  filter: string;
  position: string;
  ink: "dark" | "light";
  themes: ThemeId[];
}

export interface HaggadahDocument {
  id: string;
  title: string;
  profile: GenerationProfile;
  sections: HaggadahSection[];
  coverId: string;
  invitation: string;
  hostGuide: string[];
  shoppingList: string[];
  sederPlateGuide: SederPlateGuideEntry[];
  sourceSpineId: "shir-geulah-primary" | "velveteen-rabbi-primary";
  featuredSourceId: string;
  sourceMetrics: DocumentSourceMetrics;
  /** Approved supplemental source IDs offered to the optional model reranker. */
  runtimePassageCandidateIds: string[];
  /** Whether supplemental exact text came from the embedded fallback or lazy reviewed packs. */
  runtimeContentMode: "embedded-smoke-index" | "per-source-dynamic";
  createdAt: string;
  editorialWarnings: string[];
}

export const defaultProfile: GenerationProfile = {
  length: 45,
  audience: "mixed",
  interaction: "balanced",
  tone: "balanced",
  typography: "classic",
  language: "transliteration",
  themes: [],
  sederPlateAdditions: [],
  customTheme: "",
  hostName: "",
  sederDate: "",
  coverQuote: "",
};
