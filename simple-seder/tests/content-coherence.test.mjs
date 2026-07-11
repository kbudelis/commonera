import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const projectRoot = new URL("../", import.meta.url);
const compiledRoot = await mkdtemp(path.join(tmpdir(), "pesach-coherence-"));

async function compile(relativePath) {
  const source = await readFile(new URL(relativePath, projectRoot), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
    fileName: relativePath,
  }).outputText.replace(
    /(from\s+["'])(\.\.?\/[^"']+)(["'])/g,
    (_match, prefix, specifier, suffix) => `${prefix}${specifier.endsWith(".js") ? specifier : `${specifier}.js`}${suffix}`,
  );
  const outputPath = path.join(compiledRoot, relativePath.replace(/\.ts$/, ".js"));
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, output);
}

await Promise.all([compile("content/pack.ts"), compile("content/quotes-expanded.ts")]);
const pack = await import(new URL(`file://${path.join(compiledRoot, "content/pack.js")}`).href);
process.on("exit", () => void rm(compiledRoot, { recursive: true, force: true }));

const actionLanguage = {
  kadesh: /fill|lift|bless/i,
  urchatz: /wash|pour water/i,
  karpas: /dip|eat/i,
  yachatz: /break|hide/i,
  maggid: /ask|uncover|spill|sing|read/i,
  rachtzah: /wash|pour water/i,
  "motzi-matzah": /hold|eat|give everyone/i,
  maror: /take|dip|eat/i,
  korech: /place|eat|sandwich/i,
  "shulchan-orech": /serve|eat/i,
  tzafun: /search|find|eat/i,
  barech: /grace|fill|lift|drink/i,
  hallel: /sing|read|fill|drink/i,
  nirtzah: /close|name|say/i,
};

test("every 20-minute section tells a first-time host what to do and why", () => {
  for (const section of pack.sectionBlueprints) {
    assert.ok(
      section.short.length >= 1 && section.short.length <= 3,
      `${section.id} should contain one to three concise paragraphs`,
    );
    const copy = section.short.join(" ");
    assert.match(copy, actionLanguage[section.id], `${section.id} needs a physical or spoken action`);
    assert.ok(copy.length >= 140, `${section.id} needs enough context to orient a beginner`);
  }
});

test("the short Maggid preserves the complete Exodus narrative spine", () => {
  const maggid = pack.sectionBlueprints.find((section) => section.id === "maggid").short.join(" ");
  for (const required of [
    /Pharaoh enslaved the Israelites in Egypt/i,
    /midwives Shifra and Puah resisted/i,
    /Moses.+fled Egypt.+returned/s,
    /ten plagues/i,
    /left in haste/i,
    /crossed through the parted water/i,
    /journey from slavery toward freedom/i,
  ]) {
    assert.match(maggid, required);
  }
});

test("section copy and tone openers avoid canned contrast formulas", () => {
  const sectionCopy = pack.sectionBlueprints.flatMap((section) => [
    ...section.short,
    ...section.medium,
    ...section.full,
  ]);
  const allCopy = [...sectionCopy, ...Object.values(pack.toneOpeners).flat()].join("\n");

  assert.doesNotMatch(allCopy, /\b(?:it is|it's|this is|that is|that's) not\b[^.!?]{0,80}\b(?:but|instead)\b/i);
  assert.doesNotMatch(allCopy, /\bless about\b[^.!?]{0,80}\bthan\b/i);
  assert.doesNotMatch(allCopy, /seder police|typos and all/i);
});

test("beginner instructions name the actor, object, and next step", () => {
  const urchatz = pack.sectionBlueprints.find((section) => section.id === "urchatz").short.join(" ");
  assert.match(urchatz, /Each person washes their own hands/i);
  assert.match(urchatz, /pitcher, bowl, and towel/i);
  assert.match(urchatz, /every guest holds out their hands in turn/i);

  const yachatz = pack.sectionBlueprints.find((section) => section.id === "yachatz").short.join(" ");
  assert.match(yachatz, /children to find after dinner/i);
  assert.match(yachatz, /small prize/i);

  const allCopy = JSON.stringify(pack.themeInserts);
  assert.doesNotMatch(allCopy, /sea is not a prop|recipe that carries memory/i);
});
