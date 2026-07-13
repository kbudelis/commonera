import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  EXPECTED_SOURCE_COUNT,
  MINIMUM_APPROVED_PASSAGES_PER_SOURCE,
  sourceTextHash,
  validateLocalSourceExtracts,
  validateSourceRuntimeIndex,
} from "../scripts/validate-source-runtime-index.mjs";

const trackedIndex = JSON.parse(await readFile(new URL("../research/source-runtime-index.json", import.meta.url), "utf8"));

test("tracked source runtime index has a valid 20-source smoke-fixture floor", () => {
  const errors = validateSourceRuntimeIndex(trackedIndex);
  assert.deepEqual(errors, [], errors.join("\n"));
  assert.equal(trackedIndex.sources.length, EXPECTED_SOURCE_COUNT);
  assert.equal(new Set(trackedIndex.sources.map((source) => source.sourceId)).size, EXPECTED_SOURCE_COUNT);
  for (const source of trackedIndex.sources) {
    const approved = source.passages.filter(
      (passage) => passage.approvalStatus === "approved" && passage.rights.runtimeEligible,
    );
    assert.ok(approved.length >= MINIMUM_APPROVED_PASSAGES_PER_SOURCE, source.sourceId);
  }
});

test("tracked validation detects exact-text provenance drift", () => {
  const changed = structuredClone(trackedIndex);
  const passage = changed.sources[0].passages[0];
  passage.exactText += " changed";
  const errors = validateSourceRuntimeIndex(changed).join("\n");
  assert.match(errors, /wordCount must be/);
  assert.match(errors, /provenanceHash must equal/);
});

test("local extract audit is independently testable without ignored corpus files", async () => {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "pesach-source-audit-"));
  try {
    const relativeExtract = "research/source-extracts/example.txt";
    const filename = path.join(temporaryRoot, relativeExtract);
    await mkdir(path.dirname(filename), { recursive: true });
    const bytes = Buffer.from("Page heading\nA precisely borrowed passage.\nPage footer\n", "utf8");
    await writeFile(filename, bytes);
    const exactText = "A precisely borrowed passage.";
    const fixture = {
      sources: [{
        sourceId: "example",
        passages: [{
          id: "example-passage",
          exactText,
          provenanceHash: sourceTextHash(exactText),
          locator: {
            localExtract: relativeExtract,
            extractSha256: createHash("sha256").update(bytes).digest("hex"),
          },
        }],
      }],
    };
    assert.deepEqual(await validateLocalSourceExtracts(fixture, { repositoryRoot: temporaryRoot }), []);
    fixture.sources[0].passages[0].exactText = "A sentence absent from the extract.";
    assert.match(
      (await validateLocalSourceExtracts(fixture, { repositoryRoot: temporaryRoot })).join("\n"),
      /normalized exactText was not found verbatim/,
    );
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
