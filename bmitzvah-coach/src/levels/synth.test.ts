import { describe, expect, it } from 'vitest';
import { paragraphWords, shema } from '../content/shema';
import { synthesize } from './synth';

const CORPUS_ID = /^p\d+v\d+w\d+$/;
const corpusIds = new Set(
  shema.paragraphs.flatMap((p) => p.verses.flatMap((v) => v.words.map((w) => w.id))),
);

describe('synthesize letters', () => {
  const spec = {
    kind: 'letters' as const,
    sourceWordIds: ['p1v4w1', 'p1v4w2', 'p1v4w3', 'p1v4w4', 'p1v4w5', 'p1v4w6'],
  };

  it('dedupes to unique letters in first-appearance order', () => {
    const tokens = synthesize(spec);
    const letters = tokens.map((t) => t.heScroll);
    expect(new Set(letters).size).toBe(letters.length);
    expect(tokens.length).toBe(12); // שמע ישראל אלהינו אחד → 12 unique letters
  });

  it('skips divine-name words as letter sources', () => {
    const tokens = synthesize(spec);
    for (const t of tokens) {
      const parent = t.audioRef!.wordId;
      expect(['p1v4w3', 'p1v4w5']).not.toContain(parent);
    }
  });

  it('uses synthetic ids that can never collide with corpus word ids', () => {
    for (const t of synthesize(spec)) {
      expect(t.id).not.toMatch(CORPUS_ID);
    }
  });

  it('points every letter at a real parent word slice and names it', () => {
    for (const t of synthesize(spec)) {
      expect(corpusIds.has(t.audioRef!.wordId)).toBe(true);
      expect(t.translit.length).toBeGreaterThan(0); // letter name from the codepoint table
      expect(t.gloss).toMatch(/^as in /);
      expect(t.counts).toBe(true);
    }
  });
});

describe('synthesize words / phrases', () => {
  it('resolves real words with their glosses and slices', () => {
    const tokens = synthesize({ kind: 'words', wordIds: ['p1v4w1', 'p1v9w3'] });
    expect(tokens[0].gloss).toBe('Listen!');
    expect(tokens[0].audioRef).toEqual({ track: 'p1', wordId: 'p1v4w1' });
    expect(tokens[1].id).toBe('p1v9w3');
  });

  it('throws on an unknown word id', () => {
    expect(() => synthesize({ kind: 'words', wordIds: ['p9v9w9'] })).toThrow(/unknown word/);
  });

  it('groups phrase chunks and breaks lines between them', () => {
    const tokens = synthesize({
      kind: 'phrases',
      chunks: [
        ['p1v4w1', 'p1v4w2'],
        ['p1v4w3', 'p1v4w4'],
      ],
    });
    expect(tokens.map((t) => t.group)).toEqual(['c0', 'c0', 'c1', 'c1']);
    expect(tokens[0].breakBefore).toBe(false);
    expect(tokens[2].breakBefore).toBe(true);
    expect(tokens[3].breakBefore).toBe(false);
  });
});

describe('synthesize verses + asides', () => {
  const tokens = synthesize({ kind: 'verses', verseIds: ['p1v4'], asideIds: ['baruch-shem'] });
  const bshem = tokens.filter((t) => t.group === 'baruch-shem');

  it('keeps real verse words counting toward completion', () => {
    const verseTokens = tokens.filter((t) => !t.group);
    expect(verseTokens.length).toBe(6);
    expect(verseTokens.every((t) => t.counts)).toBe(true);
  });

  it('renders the aside as silent, non-counting rows with a line-level strip', () => {
    expect(bshem.length).toBeGreaterThan(3);
    expect(bshem[0].breakBefore).toBe(true);
    for (const t of bshem) {
      expect(t.audioRef).toBeNull();
      expect(t.counts).toBe(false);
      expect(t.line?.translit).toContain('ba-RUCH');
      expect(t.id).not.toMatch(CORPUS_ID);
    }
  });

  it('splits the aside from the corpus string, never hand-typed', () => {
    const aside = shema.asides[0];
    expect(bshem.map((t) => t.hePointed).join(' ')).toBe(aside.hePointed);
  });
});

describe('synthesize paragraph', () => {
  it('is the full p1 word list, verbatim', () => {
    const tokens = synthesize({ kind: 'paragraph', pid: 'p1' });
    expect(tokens.map((t) => t.id)).toEqual(paragraphWords('p1').map((w) => w.id));
  });
});
