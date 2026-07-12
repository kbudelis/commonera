#!/usr/bin/env node
// Builds the letter-name audio track (level 1) + an EXACT timing map — the
// script does the concatenation, so boundaries are known, not detected.
//
// Voice: PLACEHOLDER espeak-ng by default. To use a human recording, drop
// files named <slug>.wav or <slug>.mp3 (alef.wav, shin.mp3, …) into
// assets-src/audio/letters/ and re-run — those take precedence per letter.
//
//   node tools/build-letters-track.mjs
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const humanDir = path.join(root, 'assets-src/audio/letters');
const tmp = path.join(root, '.letters-tmp');
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

// slug (timing-map word id, matches synth.ts letterSlug) → espeak-friendly text
const LETTERS = [
  ['alef', 'ahlef'],
  ['bet', 'bet'],
  ['gimel', 'geemel'],
  ['dalet', 'dahlet'],
  ['hei', 'hey'],
  ['vav', 'vahv'],
  ['zayin', 'zahyin'],
  ['chet', 'khet'],
  ['tet', 'tet'],
  ['yod', 'yohd'],
  ['kaf', 'kahf'],
  ['lamed', 'lahmed'],
  ['mem', 'mem'],
  ['nun', 'noon'],
  ['samech', 'sahmekh'],
  ['ayin', 'ahyin'],
  ['pe', 'pay'],
  ['tsadi', 'tsahdee'],
  ['kuf', 'koof'],
  ['resh', 'resh'],
  ['shin', 'sheen'],
  ['tav', 'tahv'],
];

const GAP = 0.35; // seconds of silence between names
const RATE = 22050;

const duration = (file) =>
  Number(
    execFileSync('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file,
    ]).toString(),
  );

let placeholders = 0;
const clips = LETTERS.map(([slug, espeakText]) => {
  const wav = path.join(tmp, `${slug}.wav`);
  const human = ['wav', 'mp3'].map((e) => path.join(humanDir, `${slug}.${e}`)).find(existsSync);
  if (human) {
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', human, '-ar', `${RATE}`, '-ac', '1', wav]);
  } else {
    placeholders++;
    execFileSync('espeak-ng', ['-v', 'en-us', '-s', '130', '-a', '120', '-w', wav, espeakText]);
  }
  return { slug, wav, dur: duration(wav) };
});

const silence = path.join(tmp, 'gap.wav');
execFileSync('ffmpeg', [
  '-y', '-v', 'error', '-f', 'lavfi',
  '-i', `anullsrc=r=${RATE}:cl=mono`, '-t', `${GAP}`, silence,
]);

// Exact boundaries fall out of the concat order.
let t = 0;
const words = [];
const list = [];
for (const { slug, wav, dur } of clips) {
  words.push({ id: slug, start: Number(t.toFixed(3)), end: Number((t + dur).toFixed(3)) });
  list.push(`file '${wav}'`, `file '${silence}'`);
  t += dur + GAP;
}
const listFile = path.join(tmp, 'list.txt');
writeFileSync(listFile, list.join('\n'));

const mp3 = path.join(root, 'public/audio/letters.mp3');
execFileSync('ffmpeg', [
  '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', listFile,
  '-codec:a', 'libmp3lame', '-q:a', '6', mp3,
]);
writeFileSync(
  path.join(root, 'public/timing/letters.json'),
  JSON.stringify({ audio: 'audio/letters.mp3', version: 1, words }, null, 1),
);
rmSync(tmp, { recursive: true, force: true });
console.log(
  `letters.mp3 (${t.toFixed(1)}s, ${words.length} names, ` +
    `${placeholders ? `${placeholders} espeak PLACEHOLDERS` : 'all human recordings'}) + timing map written`,
);
