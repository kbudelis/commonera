#!/usr/bin/env node
// Generates a PREVIEW of neural-TTS letter names (Microsoft edge-tts,
// he-IL-HilaNeural) into assets-src/audio/letters-tts-preview/ — deliberately
// NOT the live override dir. Listen, and if it passes:
//   cp assets-src/audio/letters-tts-preview/*.mp3 assets-src/audio/letters/
//   node tools/build-letters-track.mjs
// Note: edge-tts calls Microsoft's online service — fine for a demo, review
// before any commercial ship.
//   node tools/preview-letters-tts.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, 'assets-src/audio/letters-tts-preview');
mkdirSync(out, { recursive: true });
const edgeTts = path.join(homedir(), '.local/opt/fonttools-venv/bin/edge-tts');

// Letter names assembled from codepoints (never hand-typed Hebrew), fully
// vocalized so the voice says the LETTER name — דָּלֶת "dalet", not the word
// דלת "delet".
const P = { qamats: 0x5b8, patach: 0x5b7, segol: 0x5b6, tsere: 0x5b5, hiriq: 0x5b4,
  holam: 0x5b9, sheva: 0x5b0, dagesh: 0x5bc, shinDot: 0x5c1, shurukDot: 0x5bc };
const L = { alef: 0x5d0, bet: 0x5d1, gimel: 0x5d2, dalet: 0x5d3, hei: 0x5d4, vav: 0x5d5,
  zayin: 0x5d6, chet: 0x5d7, tet: 0x5d8, yod: 0x5d9, kafF: 0x5da, kaf: 0x5db,
  lamed: 0x5dc, mem: 0x5de, nun: 0x5e0, nunF: 0x5df, samech: 0x5e1, ayin: 0x5e2,
  peF: 0x5e3, pe: 0x5e4, tsadi: 0x5e6, kuf: 0x5e7, resh: 0x5e8, shin: 0x5e9, tav: 0x5ea };
const cp = (...points) => String.fromCodePoint(...points);

const NAMES = {
  alef: cp(L.alef, P.qamats, L.lamed, P.segol, L.peF),
  bet: cp(L.bet, P.dagesh, P.tsere, L.yod, L.tav),
  gimel: cp(L.gimel, P.dagesh, P.hiriq, L.yod, L.mem, P.segol, L.lamed),
  dalet: cp(L.dalet, P.dagesh, P.qamats, L.lamed, P.segol, L.tav),
  hei: cp(L.hei, P.tsere, L.alef),
  vav: cp(L.vav, P.qamats, L.vav),
  zayin: cp(L.zayin, P.patach, L.yod, P.hiriq, L.nunF),
  chet: cp(L.chet, P.tsere, L.yod, L.tav),
  tet: cp(L.tet, P.tsere, L.yod, L.tav),
  yod: cp(L.yod, L.vav, P.holam, L.dalet),
  kaf: cp(L.kaf, P.dagesh, P.patach, L.peF),
  lamed: cp(L.lamed, P.qamats, L.mem, P.segol, L.dalet),
  mem: cp(L.mem, P.tsere, 0x5dd), // ends in final mem
  nun: cp(L.nun, L.vav, P.shurukDot, L.nunF),
  samech: cp(L.samech, P.qamats, L.mem, P.segol, L.kafF, P.sheva),
  ayin: cp(L.ayin, P.patach, L.yod, P.hiriq, L.nunF),
  pe: cp(L.pe, P.dagesh, P.tsere, L.alef),
  tsadi: cp(L.tsadi, P.qamats, L.dalet, P.hiriq, L.yod),
  kuf: cp(L.kuf, L.vav, P.shurukDot, L.peF),
  resh: cp(L.resh, P.tsere, L.yod, L.shin, P.shinDot),
  shin: cp(L.shin, P.shinDot, P.hiriq, L.yod, L.nunF),
  tav: cp(L.tav, P.dagesh, P.qamats, L.vav),
};

for (const [slug, he] of Object.entries(NAMES)) {
  execFileSync(edgeTts, [
    '--voice', 'he-IL-HilaNeural',
    '--rate=-15%',
    '--text', he,
    '--write-media', path.join(out, `${slug}.mp3`),
  ]);
  process.stdout.write(`${slug} `);
}
console.log(`\n22 previews in ${path.relative(root, out)}`);
