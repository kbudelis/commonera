/** All UI copy in one place. Voice: smart older sibling — warm, short, never preachy. */

export const copy = {
  landing: {
    kicker: 'Your B’Mitzvah is coming.',
    headline: 'Let’s open the scroll.',
    promise:
      'Start with the Shema — the most famous words in the Torah. Hear them. Touch them. Actually understand them.',
    note: 'No Hebrew needed. About ten minutes.',
    cta: 'Start with the Shema',
    trust: 'No sign-up. No grades. Just you and a very old scroll.',
    dateLabel: 'When’s the big day? (optional)',
    parentLink: 'Grown-up in the room?',
  },
  parent: {
    title: 'For the grown-ups',
    body:
      'This is a gentle first step toward the B’Mitzvah — the Shema, heard and understood, with zero Hebrew assumed. It was built just as much for you: plenty of parents never learned this, or aren’t Jewish, and want to follow along anyway. Best on a laptop, side by side. One of you drives the pointer; swap when it feels right.',
    close: 'Got it',
  },
  tutorial: {
  },
  baruchShem: {
    caption:
      'This line isn’t written in the scroll — people whisper it after the Shema. A secret that’s two thousand years old.',
  },
  session: {
    handOff: 'Playing with someone? Hand over the yad for the next part.',
    verseDone: 'That’s the whole line. Keep going —',
  },
  quiz: {
    intro: 'Three questions. Bet you get them.',
    items: [
      {
        id: 'q1',
        kind: 'tap-word' as const,
        playWord: 'p1v4w6',
        stem: 'Tap the word you just heard.',
        /** Word ids that glow as choices; answer is playWord. */
        choices: ['p1v4w2', 'p1v4w6', 'p1v4w4'],
        right: 'e-CHAD — "one." You knew it by sound.',
        wrong: 'So close — hear it again?',
      },
      {
        id: 'q2',
        kind: 'choice' as const,
        playWord: 'p1v4w1',
        stem: '“Sh’ma” is the very first word. What’s it asking you to do?',
        choices: ['Listen', 'Sing', 'Bow'],
        answer: 0,
        right: 'Listen. Not obey, not memorize — listen.',
        wrong: 'Hear it again — sh’MA. It’s an invitation, not an order.',
      },
      {
        id: 'q3',
        kind: 'choice' as const,
        playWord: 'p1v5w1',
        stem: 'This word kicks off the line about how to feel. What does it mean?',
        choices: ['And you shall love…', 'And you shall write…', 'And you shall walk…'],
        answer: 0,
        right: 'V’a-hav-TA — "and you shall love." Everything else follows from that.',
        wrong: 'Listen once more — this one’s the heart of the whole thing.',
      },
    ],
  },
  lamp: ['Just arrived', 'Getting the sound', 'Following along', 'Almost there', 'You know it!'],
  timeline: {
    kicker: 'A journey back through time',
    title: 'Every era read these same words',
    hint: 'Start today. End up two thousand years ago.',
    replay: 'Read again',
    locked: 'Locked',
    challengeKicker: 'This era’s challenge',
  },
  help: {
    title: 'Controls & dev tools',
    link: '? Help',
    intro: 'Press ? anywhere to open this panel. Settings ride the URL as parameters.',
    sections: [
      {
        heading: 'Audio timing tool',
        rows: [
          ['?timing=p1 / p2 / p3', 'open the word-timing editor for that recording'],
          ['Space', 'mark the next word boundary while the audio plays'],
          [', and .', 'nudge the selected boundary offset earlier / later'],
          ['Enter', 'replay the audio around the selected word'],
          ['E', 'export the refined timing map as JSON'],
        ],
      },
      {
        heading: 'Levels & debugging',
        rows: [
          ['?level=1–5', 'jump straight into a mini level'],
          ['?level=6', 'jump to the full scroll experience'],
          ['?unlockAll=1', 'open every era on the timeline'],
          ['?debugRects=1', 'draw the baked ink and hit boxes'],
          ['?forceWebGL=1', 'force the WebGL2 renderer (skip WebGPU)'],
          ['?reset=1', 'reset the game — clears progress, re-locks every level'],
          ['?level=6&quiz=1', 'jump straight to the quiz on the scroll'],
          ['__shema.gotoQuiz()', 'console: jump to the quiz mid-scroll'],
        ],
      },
    ],
    close: 'Close',
  },
  credits: {
    title: 'Credits & sources',
    items: [
      'Hebrew text: <a href="https://www.sefaria.org" target="_blank" rel="noopener">Sefaria</a> — “Miqra according to the Masorah” (CC BY-SA). Deuteronomy 6:4–9, Deuteronomy 11:13–21, Numbers 15:37–41.',
      'Chanted audio: “Shema 1/2/3” by SuperJew via <a href="https://commons.wikimedia.org/wiki/File:Shema_1_SuperJew.ogg" target="_blank" rel="noopener">Wikimedia Commons</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener">CC BY-SA 3.0</a> (transcoded to MP3, sliced for word-level playback).',
      'Scroll lettering: Stam Ashkenaz CLM by Yoram Gnat, the Culmus Project (GPL with font-embedding exception).',
      'Pointed Hebrew: Taamey Frank CLM, Culmus Project (GPL+FE). UI type: Rubik (SIL OFL).',
      'Parchment textures: <a href="https://ambientcg.com/view?id=Paper005" target="_blank" rel="noopener">ambientCG Paper005</a> (CC0). Era-device textures: <a href="https://ambientcg.com" target="_blank" rel="noopener">ambientCG</a> Wood027, Plastic004, Leather037, Metal009 (CC0).',
      'Letter-name voice (level 1): neural TTS (Microsoft edge-tts, he-IL) — demo placeholder pending a recorded human voice.',
      'Plain-English translations and all app copy are original to this project.',
      'Built with three.js (WebGPU renderer). This app supplements a real teacher — it doesn’t replace one.',
    ],
  },
  celebration: {
    title: 'You know the Shema ✓',
    body:
      'Not just the sounds — what it means. You followed the yad across the most famous paragraph in the Torah and heard every single word. That’s exactly how it starts. When you stand up there on the big day, the first line out of your mouth will already be an old friend.',
    countdown: (days: number) =>
      `${days} days until your B’Mitzvah — and you already know the Shema.`,
    explore: 'Explore the scroll freely',
    show: 'Show someone what you learned',
    comeBack: 'The scroll stays open for you. Come back anytime.',
  },
} as const;

export interface LevelCopy {
  name: string;
  year: string;
  introKicker: string;
  introTitle: string;
  introBody: string;
  /** The highlighted "what makes this level harder" callout. */
  introChallenge: string;
  introCta: string;
  doneKicker: string;
  doneTitle: string;
  doneBody: string;
  doneCta: string;
}

/** Per-level era copy. Translation register travels modern → literal down
    the ladder; level 7's cards live in the original arc, untouched. */
export const levelCopy: Record<string, LevelCopy> = {
  'l1-tablet': {
    name: 'The Tablet',
    year: '2026 CE',
    introKicker: '2026 · Today',
    introTitle: 'It starts with twelve letters.',
    introBody:
      'The most famous sentence in the Torah — “we’re all here, we’re in this ' +
      'together” — is built from the letters on this screen. Tap each one to ' +
      'collect it and see its name. Letters make words. Words make the Shema.',
    introChallenge:
      'Press each letter to collect it. Labels tell you every letter’s name — ' +
      'this is the only level that gives you all of them.',
    introCta: 'Let’s explore',
    doneKicker: 'Twelve for twelve',
    doneTitle: 'You can read the raw ingredients.',
    doneBody:
      'Those letters have looked exactly like this for a very, very long time. ' +
      'Time to put them together — one machine older.',
    doneCta: 'Back to the timeline',
  },
  'l2-laptop': {
    name: 'The Laptop',
    year: '1995',
    introKicker: '1995 · The family laptop',
    introTitle: 'Now: whole words.',
    introBody:
      'Eight words — the spine of the Shema and the V’ahavta. Listen. One. Love. ' +
      'Heart. Soul. Touch each one and a real cantor sings it. ' +
      '(In 1995, downloading one of these sounds took all afternoon.)',
    introChallenge:
      'Whole words now — and the letter names are gone. Each label shows how ' +
      'its word sounds, not what the letters are called.',
    introCta: 'Boot it up',
    doneKicker: 'Eight words down',
    doneTitle: 'You just read actual Torah words.',
    doneBody:
      'Every one of them appears in the real scroll — and you’ll meet them all ' +
      'again on the way back. Next stop: whole sentences, one hammered letter ' +
      'at a time.',
    doneCta: 'Back to the timeline',
  },
  'l3-typewriter': {
    name: 'The Typewriter',
    year: '1958',
    introKicker: '1958 · The typewriter',
    introTitle: 'Two whole sentences.',
    introBody:
      'Someone rolled a sheet in and hammered out the Shema one letter at a ' +
      'time — the whole wake-up call: we’re all here, we’re present, we’re in ' +
      'this together. Trace the line, then the whispered reply underneath. A ' +
      'Torah scroll never shows that whisper. Paper doesn’t mind.',
    introChallenge:
      'No more labels under the words, and two full sentences to read. Press ' +
      'and hold a word to hear it and see its sounds.',
    introCta: 'Roll the sheet in',
    doneKicker: 'Typed and read',
    doneTitle: 'You read the line AND the whisper.',
    doneBody:
      'That’s the last machine on the way back. Next stop is the printing ' +
      'press — and the letters start looking like the real thing.',
    doneCta: 'Back to the timeline',
  },
  'l5-siddur': {
    name: 'The Printed Siddur',
    year: '1565',
    introKicker: '1565 · The printing press',
    introTitle: 'The real letters appear.',
    introBody:
      'This is the Shema the way the first printed prayer books set it: sofer-style ' +
      'letters, no vowels on the page. “Hear, O Israel: the Eternal is our God, the ' +
      'Eternal is One.” Press a word when you want its sounds back.',
    introChallenge:
      'The vowels vanish from the page — sofer letters only, like a real ' +
      'scroll. Press a word and the strip shows its pointed form.',
    introCta: 'Open the book',
    doneKicker: 'Read like 1565',
    doneTitle: 'No vowels. You read it anyway.',
    doneBody:
      'That’s the exact skill Torah readers train. Everything from here back is ' +
      'made by hand — next, a scribe’s manuscript.',
    doneCta: 'Back to the timeline',
  },
  'l6-manuscript': {
    name: 'The Manuscript',
    year: '~1200',
    introKicker: 'Around 1200 · A scribe’s hand',
    introTitle: 'The whole first paragraph.',
    introBody:
      'Someone wrote this page with a feather and iron-gall ink, ruling every line ' +
      'by hand. All six verses: love with all your heart, teach your kids, tie the ' +
      'sign, write the doorposts. Trace it end to end.',
    introChallenge:
      'The whole paragraph — six verses in a scribe’s hand, still no vowels. ' +
      'The longest read yet.',
    introCta: 'Take the quill',
    doneKicker: 'The V’ahavta, complete',
    doneTitle: 'You just read a whole Torah paragraph.',
    doneBody:
      'Eight hundred years ago this took a scribe a day to write. One era left — ' +
      'the scroll itself, and it’s the full three paragraphs.',
    doneCta: 'Back to the timeline',
  },
  'l7-scroll': {
    name: 'The Scroll',
    year: '~100 BCE',
    introKicker: 'Around 100 BCE · The scroll itself',
    introTitle: 'The true scroll.',
    introBody:
      'No vowels, no labels, no shortcuts — three full paragraphs under a real ' +
      'cantor’s voice, the way the words have always lived. Take the yad.',
    introChallenge:
      'Everything at once: three full paragraphs, no labels, no vowels — ' +
      'just the yad, the cantor, and you.',
    introCta: 'Unroll it',
    doneKicker: '',
    doneTitle: '',
    doneBody: '',
    doneCta: '', // level 7 celebrates through its own arc
  },
};
