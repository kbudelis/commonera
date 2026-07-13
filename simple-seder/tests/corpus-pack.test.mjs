import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("content/generated/corpus-pack-manifest.json", root), "utf8"));
const approval = JSON.parse(await readFile(new URL("research/full-corpus-approval.json", root), "utf8"));
const catalog = JSON.parse(await readFile(new URL("content/generated/source-module-catalog.json", root), "utf8"));
const sequences = JSON.parse(await readFile(new URL("content/generated/source-sequences.json", root), "utf8"));

test("research corpus and approved runtime pack remain explicitly distinct", () => {
  assert.equal(manifest.researchCorpus.sourceCount, 20);
  assert.ok(manifest.researchCorpus.segmentCount >= 200);
  assert.ok(manifest.researchCorpus.characterCount > 1_000_000);
  assert.equal(manifest.approvedRuntimePack.sourceCount, 20);
  assert.ok(manifest.approvedRuntimePack.moduleCount >= 40);
  assert.equal(manifest.approvedRuntimePack.comprehensiveApproval, approval.comprehensiveApproval);
  assert.equal(approval.comprehensiveApproval, false);
  assert.equal(manifest.approvedRuntimePack.maturity, "smoke-test-fixtures");
  assert.equal(manifest.approvedRuntimePack.activeRuntimeLoadingMode, "embedded-smoke-index");
  assert.equal(manifest.approvedRuntimePack.availableComprehensiveLoadingMode, "per-source-dynamic");
  assert.match(manifest.approvedRuntimePack.note, /not yet a comprehensive representation/i);
});

test("full-text research segmentation uses coherent ordered chunks with verified coverage", async () => {
  const segmentManifest = JSON.parse(
    await readFile(new URL("research/generated/source-segment-manifest.json", root), "utf8"),
  );
  assert.equal(segmentManifest.sourceCount, 20);
  assert.ok(segmentManifest.pdfPageCount >= 800);
  assert.equal(segmentManifest.segmentCount, manifest.researchCorpus.segmentCount);
  assert.equal(segmentManifest.allSourcesCoverageVerified, true);
  assert.ok(segmentManifest.sources.every((source) => source.coverageVerified));
  assert.ok(segmentManifest.sources.every((source) => source.normalizedContentSha256 === source.reconstructedContentSha256));

  for (const source of segmentManifest.sources) {
    const records = (await readFile(new URL(source.file, root), "utf8"))
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    assert.equal(records.length, source.segmentCount, source.sourceId);
    assert.deepEqual(records.map((record) => record.order), records.map((_record, index) => index), source.sourceId);
    assert.ok(records.every((record) => record.wordCount <= 250), source.sourceId);
    assert.ok(records.every((record) => record.runtimeEligible === false), source.sourceId);
    assert.ok(records.every((record) => record.editorialReviewStatus === "pending-context-review"), source.sourceId);
    assert.ok(records.every((record) => record.exactText.trim().split(/\s+/u).length === record.wordCount), source.sourceId);
  }

  const byId = Object.fromEntries(segmentManifest.sources.map((source) => [source.sourceId, source]));
  assert.ok(byId["socialist-hagode"].segmentCount < 200);
  assert.ok(byId["velveteen-rabbi"].segmentCount < 300);
});

test("complete-corpus organization is local-only and runtime uses reviewed source-order sequences", async () => {
  const [readme, pipeline, builder] = await Promise.all([
    readFile(new URL("README.md", root), "utf8"),
    readFile(new URL("research/corpus-pregeneration-pipeline.md", root), "utf8"),
    readFile(new URL("scripts/build-local-corpus-library.mjs", root), "utf8"),
  ]);
  assert.match(readme, /no source collection is uploaded to an external model API/i);
  assert.match(readme, /coherent same-source passage sequences/i);
  assert.match(pipeline, /matcher chooses\s+a whole reviewed sequence/i);
  assert.match(pipeline, /local-agent-reviewed-demo/i);
  assert.doesNotMatch(builder, /OPENAI_API_KEY|api\.openai\.com|fetch\s*\(/i);
  assert.ok(manifest.researchCorpus.characterCount >= 1_800_000);
});

test("approved content compiles into replaceable per-source packs and precomputed sequences", async () => {
  const files = (await readdir(new URL("content/generated/source-packs/", root)))
    .filter((name) => name.endsWith(".json"));
  assert.equal(files.length, 20);
  assert.equal(catalog.sources.length, 20);
  assert.ok(sequences.sequences.length >= 20);

  const catalogModules = catalog.sources.flatMap((source) => source.modules);
  assert.equal(catalogModules.length, manifest.approvedRuntimePack.moduleCount);
  for (const source of catalog.sources) {
    const pack = JSON.parse(
      await readFile(new URL(`content/generated/source-packs/${source.sourceId}.json`, root), "utf8"),
    );
    assert.equal(pack.sourceId, source.sourceId);
    assert.ok(pack.modules.length >= 2);
    assert.ok(pack.modules.every((module) => module.approvalStatus === "approved" && module.rights.runtimeEligible));
    assert.deepEqual(
      pack.modules.map((module) => module.id).sort(),
      source.modules.map((module) => module.id).sort(),
    );
  }
});

test("the initial client bundle never imports exhaustive research JSONL", async () => {
  const clientFiles = [
    "app/page.tsx",
    "app/api/match/route.ts",
    "lib/generator.ts",
    "content/source-runtime.ts",
    "content/runtime-pack-adapter.ts",
    "content/generated/source-pack-loaders.ts",
  ];
  const source = (await Promise.all(
    clientFiles.map((filename) => readFile(new URL(filename, root), "utf8")),
  )).join("\n");
  assert.doesNotMatch(source, /research\/generated|source-segments\/|\.jsonl/);

  const loaders = await readFile(new URL("content/generated/source-pack-loaders.ts", root), "utf8");
  assert.equal((loaders.match(/:\s*\(\)\s*=>\s*import\(/g) ?? []).length, 20);
  assert.doesNotMatch(loaders, /^import\s+.+source-packs/gm);

  const adapter = await readFile(new URL("content/runtime-pack-adapter.ts", root), "utf8");
  assert.doesNotMatch(adapter, /^import\s+.+source-packs/gm);
  assert.match(adapter, /selectedSources\.length > 2/);
});

test("the app upgrades the immediate draft through the gated lazy-pack adapter", async () => {
  const [page, generator, route, adapter] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("lib/generator.ts", root), "utf8"),
    readFile(new URL("app/api/match/route.ts", root), "utf8"),
    readFile(new URL("content/runtime-pack-adapter.ts", root), "utf8"),
  ]);
  assert.match(page, /generateHaggadahWithRuntimePacks/);
  assert.match(page, /proceduralBackboneSourceId/);
  assert.match(generator, /mergeModelEnhancementWithRuntimePacks/);
  assert.match(route, /runtimePassageBriefsForProfile/);
  assert.match(adapter, /comprehensiveRuntimeGateErrors/);
  assert.match(adapter, /per-source-dynamic/);
});
