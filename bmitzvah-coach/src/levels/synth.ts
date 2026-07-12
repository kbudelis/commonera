import { paragraphWords, shema } from '../content/shema';
import { toScrollText, type ShemaWord } from '../content/types';
import type { ContentSpec } from './levels';

/**
 * Runtime synthesis of mini-level content from the existing corpus.
 * HARD RULE: Hebrew is never hand-typed — every Hebrew string here is a
 * programmatic slice of a corpus string (letters by codepoint, aside lines
 * split on spaces). Real word ids are reused so audio slices, glosses, and
 * the strip keep working unchanged.
 */

export interface LevelToken extends ShemaWord {
  /** Slice to play on touch; null = silent (Baruch Shem rows). Letters point at their parent word. */
  audioRef: { track: 'p1' | 'letters'; wordId: string } | null;
  /** Counts toward touch-all completion. */
  counts: boolean;
  /** Start a new baked line before this token. */
  breakBefore?: boolean;
  /** Chunk/aside grouping (phrase playback, line-level strip). */
  group?: string;
  /** Line-level strip content (asides show the whole line, not per-word). */
  line?: { he: string; translit: string; english: string };
}

/** English letter names keyed by hex codepoint — no Hebrew is typed here. */
const LETTER_NAMES: Record<number, string> = {
  0x05d0: 'Alef',
  0x05d1: 'Bet',
  0x05d2: 'Gimel',
  0x05d3: 'Dalet',
  0x05d4: 'Hei',
  0x05d5: 'Vav',
  0x05d6: 'Zayin',
  0x05d7: 'Chet',
  0x05d8: 'Tet',
  0x05d9: 'Yod',
  0x05da: 'Final Kaf',
  0x05db: 'Kaf',
  0x05dc: 'Lamed',
  0x05dd: 'Final Mem',
  0x05de: 'Mem',
  0x05df: 'Final Nun',
  0x05e0: 'Nun',
  0x05e1: 'Samech',
  0x05e2: 'Ayin',
  0x05e3: 'Final Pe',
  0x05e4: 'Pe',
  0x05e5: 'Final Tsadi',
  0x05e6: 'Tsadi',
  0x05e7: 'Kuf',
  0x05e8: 'Resh',
  0x05e9: 'Shin',
  0x05ea: 'Tav',
};

/** Timing-map word id on the letters track — "Final Kaf" plays "Kaf". */
function letterSlug(name: string): string {
  return (name.startsWith('Final ') ? name.slice(6) : name).toLowerCase();
}

let wordByIdCache: Map<string, ShemaWord> | null = null;
function wordById(id: string): ShemaWord {
  if (!wordByIdCache) {
    wordByIdCache = new Map(
      shema.paragraphs.flatMap((p) => p.verses.flatMap((v) => v.words)).map((w) => [w.id, w]),
    );
  }
  const w = wordByIdCache.get(id);
  if (!w) throw new Error(`[synth] unknown word id: ${id}`);
  return w;
}

const asWordToken = (w: ShemaWord, extra?: Partial<LevelToken>): LevelToken => ({
  ...w,
  audioRef: { track: 'p1', wordId: w.id },
  counts: true,
  ...extra,
});

function synthesizeLetters(sourceWordIds: string[]): LevelToken[] {
  const tokens: LevelToken[] = [];
  const seen = new Set<number>();
  for (const wid of sourceWordIds) {
    const parent = wordById(wid);
    if (parent.flags?.divineName) continue; // the Name is not letter-tile material
    for (const ch of toScrollText(parent)) {
      const cp = ch.codePointAt(0)!;
      if (seen.has(cp)) continue;
      seen.add(cp);
      const name = LETTER_NAMES[cp];
      if (!name) throw new Error(`[synth] no letter name for U+${cp.toString(16)}`);
      tokens.push({
        id: `l1t${tokens.length + 1}`,
        hePointed: ch,
        heScroll: ch,
        translit: name,
        gloss: `as in ${parent.translit}${parent.gloss ? ` — ${parent.gloss}` : ''}`,
        // Letters play their own slice on the letters track (ids = name
        // slugs; final forms share the base clip). Currently pitched chimes —
        // name recordings drop in via tools/build-letters-track.mjs.
        audioRef: { track: 'letters', wordId: letterSlug(name) },
        counts: true,
      });
    }
  }
  return tokens;
}

function synthesizeAside(asideId: string): LevelToken[] {
  const aside = shema.asides.find((a) => a.id === asideId);
  if (!aside) throw new Error(`[synth] unknown aside id: ${asideId}`);
  const line = { he: aside.hePointed, translit: aside.translit, english: aside.english };
  return aside.hePointed.split(' ').map((piece, i) => ({
    id: `${aside.id}-w${i + 1}`,
    hePointed: piece,
    translit: '',
    audioRef: null, // the recording has no Baruch Shem — verified in the sprint
    counts: false,
    group: aside.id,
    breakBefore: i === 0,
    line,
  }));
}

export function synthesize(spec: ContentSpec): LevelToken[] {
  switch (spec.kind) {
    case 'letters':
      return synthesizeLetters(spec.sourceWordIds);
    case 'words':
      return spec.wordIds.map((id) => asWordToken(wordById(id)));
    case 'phrases':
      return spec.chunks.flatMap((chunk, ci) =>
        chunk.map((id, i) =>
          asWordToken(wordById(id), { group: `c${ci}`, breakBefore: i === 0 && ci > 0 }),
        ),
      );
    case 'verses': {
      const verses = spec.verseIds.flatMap((vid) => {
        const verse = shema.paragraphs
          .flatMap((p) => p.verses)
          .find((v) => v.id === vid);
        if (!verse) throw new Error(`[synth] unknown verse id: ${vid}`);
        return verse.words.map((w) => asWordToken(w));
      });
      const asides = (spec.asideIds ?? []).flatMap(synthesizeAside);
      return [...verses, ...asides];
    }
    case 'paragraph':
      return paragraphWords(spec.pid).map((w) => asWordToken(w));
  }
}
