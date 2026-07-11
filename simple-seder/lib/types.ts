export type SederLength = 20 | 45 | 90;
export type Audience = "adults" | "kids" | "mixed";
export type Interaction = "reflective" | "balanced" | "participatory";
export type Tone = "playful" | "balanced" | "reverent";
export type Typography = "classic" | "modern" | "readable";
export type LanguageMode = "english" | "transliteration";

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
  customTheme: string;
  antiZionist: boolean;
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
}

export interface SederPlateGuideEntry {
  element: string;
  meaning: string;
  ingredients: string;
  preparation: string;
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
  customTheme: "",
  antiZionist: true,
  hostName: "",
  sederDate: "",
  coverQuote: "",
};
