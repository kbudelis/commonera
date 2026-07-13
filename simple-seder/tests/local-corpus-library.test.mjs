import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const readJson = async (relativePath) => JSON.parse(await readFile(new URL(relativePath, root), "utf8"));

const [canonical, localManifest, catalog, sequenceIndex] = await Promise.all([
  readJson("research/generated/source-segment-manifest.json"),
  readJson("content/generated/local-corpus/local-corpus-manifest.json"),
  readJson("content/generated/local-corpus/source-module-catalog.json"),
  readJson("content/generated/local-corpus/source-sequences.json"),
]);

test("the local corpus manifest proves complete organization without an external source-text API", () => {
  assert.equal(localManifest.externalModelApiUsed, false);
  assert.equal(localManifest.humanReviewClaimed, false);
  assert.equal(localManifest.completeLocalCorpus.sourceCount, 20);
  assert.equal(localManifest.completeLocalCorpus.segmentCount, canonical.segmentCount);
  assert.ok(localManifest.completeLocalCorpus.exactCharacterCount >= 1_800_000);
  assert.equal(localManifest.completeLocalCorpus.canonicalReconstructionVerified, true);
  assert.equal(localManifest.localEditorialReview.reviewedSourceCount, 20);
  assert.deepEqual(localManifest.localEditorialReview.missingSourceIds, []);
  assert.equal(localManifest.localEditorialReview.status, "complete-local-agent-review");
  assert.equal(localManifest.runtimePack.sourceCount, 20);
  assert.ok(localManifest.runtimePack.moduleCount >= 40);
  assert.ok(localManifest.runtimePack.exactCharacterCount >= 50_000);
  assert.equal(localManifest.runtimePack.comprehensiveLocalOrganization, true);
});

test("all 20 source dossiers and lazy runtime packs are present", async () => {
  const [dossiers, packs] = await Promise.all([
    readdir(new URL("research/source-dossier-reviews/", root)),
    readdir(new URL("content/generated/local-corpus/source-packs/", root)),
  ]);
  assert.equal(dossiers.filter((name) => name.endsWith(".json")).length, 20);
  assert.equal(packs.filter((name) => name.endsWith(".json")).length, 20);
  assert.equal(catalog.sources.length, 20);
  assert.ok(catalog.sources.every((source) => source.modules.length > 0));
  assert.equal(
    catalog.sources.flatMap((source) => source.modules).length,
    localManifest.runtimePack.moduleCount,
  );
});

test("reviewed sequence modules preserve exact canonical source order and hashes", async () => {
  const canonicalBySource = new Map();
  for (const source of canonical.sources) {
    const records = (await readFile(new URL(source.file, root), "utf8"))
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    canonicalBySource.set(source.sourceId, new Map(records.map((record) => [record.id, record])));
  }
  const indexedSequences = new Map(sequenceIndex.sequences.map((sequence) => [sequence.id, sequence]));
  for (const source of catalog.sources) {
    const pack = await readJson(`content/generated/local-corpus/source-packs/${source.sourceId}.json`);
    assert.equal(pack.sourceId, source.sourceId);
    const records = canonicalBySource.get(source.sourceId);
    const compactById = new Map(source.modules.map((module) => [module.id, module]));
    for (const sequenceModule of pack.modules) {
      assert.equal(sequenceModule.sourceId, source.sourceId);
      assert.ok(sequenceModule.segmentIds.length >= 2 && sequenceModule.segmentIds.length <= 8);
      const components = sequenceModule.segmentIds.map((id) => records.get(id));
      assert.ok(components.every(Boolean));
      assert.ok(components.every((record, index) => index === 0 || record.order > components[index - 1].order));
      assert.deepEqual(
        components.map((record) => record.order),
        components.map((record) => record.order).toSorted((left, right) => left - right),
      );
      assert.equal(sequenceModule.exactText, components.map((record) => record.exactText).join("\n\n"));
      assert.equal(
        sequenceModule.provenanceHash,
        createHash("sha256").update(sequenceModule.exactText, "utf8").digest("hex"),
      );
      assert.ok(indexedSequences.has(sequenceModule.id));
      if (sequenceModule.runtimeEligible) {
        assert.equal(sequenceModule.sectionIds.length, 1, `${sequenceModule.id} must have one safe insertion section`);
        assert.equal(sequenceModule.insertionSectionId, sequenceModule.sectionIds[0]);
        assert.ok(sequenceModule.sourceSectionIds.includes(sequenceModule.insertionSectionId));
        assert.equal(sequenceModule.editorialReviewStatus, "local-agent-reviewed-demo");
        assert.equal(sequenceModule.approvalBasis, "local-source-dossier-review");
        assert.equal(sequenceModule.beginnerContext, sequenceModule.beginnerContext.trim());
        assert.ok(sequenceModule.beginnerContext.length >= 20);
        assert.equal(
          sequenceModule.wordCount,
          sequenceModule.exactText.split(/\s+/u).filter(Boolean).length,
        );
        const compact = compactById.get(sequenceModule.id);
        assert.equal(compact?.provenanceHash, sequenceModule.provenanceHash);
        for (const field of [
          "sectionIds", "sourceSectionIds", "insertionSectionId", "beginnerContext", "themes",
          "audience", "tones", "lengthTiers", "seam", "editorialGates", "requiresExplicitOptIn",
        ]) assert.deepEqual(compact?.[field], sequenceModule[field], `${sequenceModule.id}:${field}`);
      } else {
        assert.equal(compactById.has(sequenceModule.id), false);
      }
    }
  }
});

test("the browser catalog contains matching metadata but never exact source text", () => {
  for (const source of catalog.sources) {
    for (const sequenceModule of source.modules) {
      assert.equal("exactText" in sequenceModule, false);
      assert.match(sequenceModule.provenanceHash, /^[a-f0-9]{64}$/u);
      assert.equal(sequenceModule.approvalStatus, "approved");
      assert.equal(sequenceModule.runtimeEligible, true);
    }
  }
});
