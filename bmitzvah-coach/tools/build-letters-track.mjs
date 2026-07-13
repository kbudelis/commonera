#!/usr/bin/env node
// Builds the letter-name audio track (level 1) + an EXACT timing map — the
// script does the concatenation, so boundaries are known, not detected.
//
// Default sound: a soft synthesized pluck per letter, pitched up a pentatonic
// scale in alphabet order (no usable human letter-name recordings exist under
// an open license — see CLAUDE.md open items). To use human recordings, drop
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

// slugs = timing-map word ids, matches synth.ts letterSlug; alphabet order
const LETTERS = [
  'alef', 'bet', 'gimel', 'dalet', 'hei', 'vav', 'zayin', 'chet', 'tet',
  'yod', 'kaf', 'lamed', 'mem', 'nun', 'samech', 'ayin', 'pe', 'tsadi',
  'kuf', 'resh', 'shin', 'tav',
];

const GAP = 0.25; // seconds of silence between clips
const RATE = 22050;

// Warm two-partial pluck with an exponential decay — reads as a marimba
// blip. Pitch climbs a major-pentatonic scale so the alef-bet is a melody.
const PENTATONIC = [0, 2, 4, 7, 9];
function chimeFilter(i) {
  const semis = PENTATONIC[i % 5] + 12 * Math.floor(i / 5);
  const f = 330 * 2 ** (semis / 12); // E4 upward, ~2.5 octaves over 22 letters
  return (
    `aevalsrc=0.55*sin(2*PI*${f.toFixed(2)}*t)*exp(-7*t)` +
    `+0.22*sin(4*PI*${f.toFixed(2)}*t)*exp(-10*t)` +
    `+0.08*sin(6*PI*${f.toFixed(2)}*t)*exp(-14*t):d=0.55:s=${RATE}`
  );
}

const duration = (file) =>
  Number(
    execFileSync('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file,
    ]).toString(),
  );

let chimes = 0;
const clips = LETTERS.map((slug, i) => {
  const wav = path.join(tmp, `${slug}.wav`);
  const human = ['wav', 'mp3'].map((e) => path.join(humanDir, `${slug}.${e}`)).find(existsSync);
  if (human) {
    // Normalize + trim leading/trailing silence so slices stay tight.
    execFileSync('ffmpeg', [
      '-y', '-v', 'error', '-i', human, '-ar', `${RATE}`, '-ac', '1',
      '-af',
      'silenceremove=start_periods=1:start_threshold=-45dB,areverse,' +
        'silenceremove=start_periods=1:start_threshold=-45dB,areverse',
      wav,
    ]);
  } else {
    chimes++;
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', chimeFilter(i), '-ac', '1', wav]);
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
  `letters.mp3 (${t.toFixed(1)}s, ${words.length} letters, ` +
    `${chimes ? `${chimes} chimes` : 'all human recordings'}) + timing map written`,
);
