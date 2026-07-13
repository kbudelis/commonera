#!/usr/bin/env node

/** Measure the actual rendered words in deterministic Haggadahs. */

import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const compiledRoot = await mkdtemp(path.join(tmpdir(), "let-my-people-host-timing-"));

async function compile(relativePath) {
  const source = await readFile(new URL(relativePath, root), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
    fileName: relativePath,
  }).outputText.replace(
    /(from\s+["'])(\.\.?\/[^"']+)(["'])/g,
    (_match, prefix, specifier, suffix) =>
      `${prefix}${specifier.endsWith(".js") || specifier.endsWith(".json") ? specifier : `${specifier}.js`}${suffix}`,
  );
  const outputPath = path.join(compiledRoot, relativePath.replace(/\.ts$/u, ".js"));
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, output);
}

const files = [
  "content/pack.ts",
  "content/quotes-expanded.ts",
  "content/source-passages-shir.ts",
  "content/source-passages-velveteen.ts",
  "content/source-spines.ts",
  "content/source-runtime.ts",
  "content/generated/local-corpus/source-pack-loaders.ts",
  "content/runtime-pack-adapter.ts",
  "lib/types.ts",
  "lib/editorial.ts",
  "lib/generator.ts",
];

try {
  await Promise.all(files.map(compile));
  await mkdir(path.join(compiledRoot, "research"), { recursive: true });
  await cp(new URL("research/source-runtime-index.json", root), path.join(compiledRoot, "research/source-runtime-index.json"));
  await cp(
    new URL("content/generated/local-corpus/", root),
    path.join(compiledRoot, "content/generated/local-corpus"),
    { recursive: true },
  );
  const generator = await import(new URL(`file://${path.join(compiledRoot, "lib/generator.js")}`).href);
  const base = {
    length: 20,
    audience: "mixed",
    interaction: "balanced",
    tone: "balanced",
    typography: "classic",
    language: "english",
    themes: ["family-storytelling"],
    sederPlateAdditions: [],
    customTheme: "",
    hostName: "Sample Family",
    sederDate: "2027-04-21",
    coverQuote: "",
  };
  const countWords = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
  const actionMinutesBySection = {
    kadesh: 0.75,
    urchatz: 2.75,
    karpas: 1,
    yachatz: 1.25,
    maggid: 2.5,
    rachtzah: 2.75,
    "motzi-matzah": 1,
    maror: 1,
    korech: 1,
    "shulchan-orech": 1,
    tzafun: 2,
    barech: 1,
    hallel: 1.5,
    nirtzah: 0.75,
  };
  const spokenWordsPerMinute = { adults: 140, mixed: 130, kids: 120 };
  const audienceActionMinutes = { adults: 0, mixed: 0.75, kids: 1.5 };
  const output = [];
  for (const length of [20, 45, 90]) {
    for (const audience of ["adults", "mixed", "kids"]) {
      const document = await generator.generateHaggadahWithRuntimePacks({ ...base, length, audience });
      const sections = document.sections.map((section) => {
        const bodyWords = section.body.reduce((sum, paragraph) => sum + countWords(paragraph), 0);
        const bridgeWords = countWords(section.bridge);
        const promptWords = countWords(section.prompt);
        const quoteWords = section.quote ? countWords(section.quoteContext) + countWords(section.quote.text) : 0;
        return {
          id: section.id,
          bodyWords,
          bridgeWords,
          promptWords,
          quoteWords,
          requiredSpokenWords: bodyWords + bridgeWords + quoteWords,
          totalWords: bodyWords + bridgeWords + promptWords + quoteWords,
          displayedMinutes: section.minutes,
        };
      });
      const totalWords = sections.reduce((sum, section) => sum + section.totalWords, 0);
      const bodyWords = sections.reduce((sum, section) => sum + section.bodyWords, 0);
      const bridgeWords = sections.reduce((sum, section) => sum + section.bridgeWords, 0);
      const promptWords = sections.reduce((sum, section) => sum + section.promptWords, 0);
      const quoteWords = sections.reduce((sum, section) => sum + section.quoteWords, 0);
      const requiredSpokenWords = sections.reduce((sum, section) => sum + section.requiredSpokenWords, 0);
      const readingMinutes = requiredSpokenWords / spokenWordsPerMinute[audience];
      const actionMinutes = Object.values(actionMinutesBySection).reduce((sum, minutes) => sum + minutes, 0) +
        audienceActionMinutes[audience];
      output.push({
        length,
        audience,
        runtimeMode: document.runtimeContentMode,
        featuredSourceId: document.featuredSourceId,
        bodyWords,
        bridgeWords,
        optionalPromptWords: promptWords,
        quoteWords,
        requiredSpokenWords,
        totalRenderedWords: totalWords,
        spokenWordsPerMinute: spokenWordsPerMinute[audience],
        requiredReadingMinutes: Number(readingMinutes.toFixed(1)),
        realisticActionMinutes: Number(actionMinutes.toFixed(1)),
        estimatedCoreLiveMinutes: Number((readingMinutes + actionMinutes).toFixed(1)),
        displayedLiveMinutes: sections.reduce((sum, section) => sum + section.displayedMinutes, 0),
        borrowedWordShare: Number(document.sourceMetrics.borrowedWordShare.toFixed(3)),
        sections,
      });
    }
  }
  console.log(JSON.stringify(output, null, 2));
} finally {
  await rm(compiledRoot, { recursive: true, force: true });
}
