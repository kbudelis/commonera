import type { EraId } from '../scene/eras/types';
import { POINTED_FONT, SCROLL_FONT } from '../text/fonts';

/**
 * The difficulty ladder: seven levels, each an era of the same words.
 * Content grows letters → words → phrases → sentences → paragraphs while
 * the presentation travels 2026 CE back to the scroll itself. Level 7 is
 * the original full three-column experience, untouched.
 */

export type ContentSpec =
  | { kind: 'letters'; sourceWordIds: string[] }
  | { kind: 'words'; wordIds: string[] }
  | { kind: 'phrases'; chunks: string[][] }
  | { kind: 'verses'; verseIds: string[]; asideIds?: string[] }
  | { kind: 'paragraph'; pid: 'p1' };

export interface TypographySpec {
  /** Which string bakes onto the medium. */
  script: 'pointed' | 'consonantal';
  font: string;
  /** Multiplier on the default bake font size (letters go big). */
  fontScale?: number;
  /** Persistent DOM labels under every token (letter names / translit). */
  labels: boolean;
  /** What the hover strip shows. Vowels-on-hover = he:true on a consonantal level. */
  strip: { he: boolean; translit: boolean; gloss: boolean };
}

export interface InteractionSpec {
  /** Hit-rect padding as a fraction of line height — the difficulty knob. */
  hitPadFactor: number;
  /** Play the whole chunk's audio when its last word is first touched. */
  chunkPlayback?: boolean;
}

export interface LevelDef {
  id: string;
  /** 1..7 — map order and unlock order. */
  index: number;
  kind: 'mini' | 'scroll';
  eraId: EraId;
  content: ContentSpec;
  typography: TypographySpec;
  interaction: InteractionSpec;
  /** All mini-level audio slices key against the p1 timing map. */
  audioTrack: 'p1';
}

const STRIP_ALL = { he: true, translit: true, gloss: true };

export const LEVELS: readonly LevelDef[] = [
  {
    id: 'l1-tablet',
    index: 1,
    kind: 'mini',
    eraId: 'tablet2026',
    content: {
      kind: 'letters',
      sourceWordIds: ['p1v4w1', 'p1v4w2', 'p1v4w3', 'p1v4w4', 'p1v4w5', 'p1v4w6'],
    },
    typography: {
      script: 'consonantal',
      font: SCROLL_FONT,
      fontScale: 2.2,
      labels: true,
      strip: { he: false, translit: false, gloss: true },
    },
    interaction: { hitPadFactor: 0.4 },
    audioTrack: 'p1',
  },
  {
    id: 'l2-laptop',
    index: 2,
    kind: 'mini',
    eraId: 'laptop1995',
    content: {
      kind: 'words',
      wordIds: [
        'p1v4w1', // sh'MA
        'p1v4w2', // yis-ra-EIL
        'p1v4w4', // e-lo-HEI-nu
        'p1v4w6', // e-CHAD
        'p1v5w1', // v'a-hav-TA
        'p1v5w6', // l'vav-CHA
        'p1v5w8', // naf-sh'CHA
        'p1v9w3', // m'zu-ZOT
      ],
    },
    typography: {
      script: 'pointed',
      font: POINTED_FONT,
      fontScale: 1.5,
      labels: true,
      strip: STRIP_ALL,
    },
    interaction: { hitPadFactor: 0.35 },
    audioTrack: 'p1',
  },
  {
    id: 'l3-crt',
    index: 3,
    kind: 'mini',
    eraId: 'crt1984',
    content: {
      kind: 'phrases',
      chunks: [
        ['p1v4w1', 'p1v4w2'],
        ['p1v4w3', 'p1v4w4'],
        ['p1v4w5', 'p1v4w6'],
      ],
    },
    typography: {
      script: 'pointed',
      font: POINTED_FONT,
      fontScale: 1.2,
      labels: false,
      strip: STRIP_ALL,
    },
    interaction: { hitPadFactor: 0.25, chunkPlayback: true },
    audioTrack: 'p1',
  },
  {
    id: 'l4-dotmatrix',
    index: 4,
    kind: 'mini',
    eraId: 'dotmatrix1978',
    content: { kind: 'verses', verseIds: ['p1v4', 'p1v5'], asideIds: ['baruch-shem'] },
    typography: {
      script: 'pointed',
      font: POINTED_FONT,
      labels: false,
      strip: { he: true, translit: false, gloss: true },
    },
    interaction: { hitPadFactor: 0.2 },
    audioTrack: 'p1',
  },
  {
    id: 'l5-siddur',
    index: 5,
    kind: 'mini',
    eraId: 'siddur1565',
    content: { kind: 'verses', verseIds: ['p1v4'], asideIds: ['baruch-shem'] },
    typography: {
      script: 'consonantal',
      font: SCROLL_FONT,
      fontScale: 1.3,
      labels: false,
      strip: STRIP_ALL, // he: pointed Hebrew — vowels appear on hover
    },
    interaction: { hitPadFactor: 0.18 },
    audioTrack: 'p1',
  },
  {
    id: 'l6-manuscript',
    index: 6,
    kind: 'mini',
    eraId: 'manuscript1200',
    content: { kind: 'paragraph', pid: 'p1' },
    typography: {
      script: 'consonantal',
      font: SCROLL_FONT,
      labels: false,
      strip: STRIP_ALL,
    },
    interaction: { hitPadFactor: 0.15 },
    audioTrack: 'p1',
  },
  {
    id: 'l7-scroll',
    index: 7,
    kind: 'scroll',
    eraId: 'scroll100bce',
    content: { kind: 'paragraph', pid: 'p1' }, // unused — the full arc owns its content
    typography: { script: 'consonantal', font: SCROLL_FONT, labels: false, strip: STRIP_ALL },
    interaction: { hitPadFactor: 0.15 },
    audioTrack: 'p1',
  },
];

export const levelByIndex = (index: number) => LEVELS.find((l) => l.index === index);
