import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const expectedSections = [
  "kadesh", "urchatz", "karpas", "yachatz", "maggid", "rachtzah",
  "motzi-matzah", "maror", "korech", "shulchan-orech", "tzafun",
  "barech", "hallel", "nirtzah",
];

async function loadCorpus() {
  const source = await readFile(new URL("../content/source-passages-shir.ts", import.meta.url), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
    fileName: "source-passages-shir.ts",
  }).outputText;
  const directory = await mkdtemp(path.join(tmpdir(), "shir-corpus-"));
  const modulePath = path.join(directory, "source-passages-shir.mjs");
  await writeFile(modulePath, output);
  try {
    return await import(`${new URL(`file://${modulePath}`).href}?v=${Date.now()}`);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

function hash(text) {
  return createHash("sha256")
    .update(text.normalize("NFC").replace(/\s+/g, " ").trim())
    .digest("hex");
}

test("Shir source corpus has honest all-section tier coverage", async () => {
  const { shirSourcePassages, shirCoverage } = await loadCorpus();
  assert.equal(shirSourcePassages.length, 28);
  assert.deepEqual([...shirCoverage.sectionIds].sort(), [...expectedSections].sort());
  for (const tier of ["short", "medium", "full"]) {
    assert.deepEqual([...shirCoverage.byTier[tier]].sort(), [...expectedSections].sort(), `${tier} tier has a source gap`);
  }
  for (const passage of shirSourcePassages) {
    assert.ok(expectedSections.includes(passage.sectionId));
    assert.ok(passage.tiers.length > 0);
    if (passage.tiers.includes("short")) assert.deepEqual(passage.tiers, ["short", "medium", "full"]);
    if (passage.tiers.includes("medium")) assert.ok(passage.tiers.includes("full"));
  }
});

test("every Shir passage has exact containing-source metadata and a fresh hash", async () => {
  const { shirSourcePassages } = await loadCorpus();
  const ids = new Set();
  for (const passage of shirSourcePassages) {
    assert.ok(!ids.has(passage.id), `duplicate passage ID ${passage.id}`);
    ids.add(passage.id);
    assert.equal(passage.containingHaggadah, "Haggadah Shir Ge’ulah / Song of Liberation, v2.1");
    assert.equal(passage.containingHaggadahCreator, "Emily Aviva Kapor-Mater");
    assert.equal(passage.containingHaggadahLicense, "CC BY 4.0");
    assert.equal(passage.treatment, "verbatim-normalized");
    assert.match(passage.locator, /^PDF p\. \d+/);
    assert.equal(passage.provenanceHash, hash(passage.text), `${passage.id} hash does not match its reviewed text`);
  }
});

test("source readings remain distinct from ritual source text and preserve embedded credit", async () => {
  const { shirSourcePassages } = await loadCorpus();
  assert.ok(shirSourcePassages.some((passage) => passage.role === "source-reading"));
  assert.ok(shirSourcePassages.some((passage) => passage.role === "ritual-source"));
  const bendigamos = shirSourcePassages.find((passage) => passage.id === "shir-nirtzah-bendigamos");
  assert.match(bendigamos.sourcePresentedAttribution, /David de Sola Pool/);
  assert.match(bendigamos.sourcePresentedAttribution, /Haggadah Shir Ge’ulah p\. 66/);
});

test("each tier contains enough reviewed source wording for a source-primary spine", async () => {
  const { shirSourcePassages, shirCoverage } = await loadCorpus();
  const totals = Object.fromEntries(["short", "medium", "full"].map((tier) => [
    tier,
    shirSourcePassages
      .filter((passage) => passage.tiers.includes(tier))
      .reduce((sum, passage) => sum + passage.text.trim().split(/\s+/).length, 0),
  ]));
  assert.ok(totals.short >= 1_100, `short source spine has only ${totals.short} words`);
  assert.ok(totals.medium >= 1_700, `medium source spine has only ${totals.medium} words`);
  assert.ok(totals.full >= 1_850, `full source spine has only ${totals.full} words`);
  assert.ok(totals.short < totals.medium && totals.medium < totals.full);
  assert.deepEqual(totals, { short: 1278, medium: 1898, full: 1983 });
  assert.deepEqual(shirCoverage.sourceWordTotals, totals);
  assert.deepEqual(
    [...shirCoverage.expansionSections.medium].sort(),
    ["barech", "hallel", "kadesh", "korech", "maggid", "tzafun"].sort(),
  );
  assert.deepEqual(shirCoverage.expansionSections.full, ["nirtzah"]);
});
