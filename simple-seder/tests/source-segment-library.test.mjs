import assert from "node:assert/strict";
import test from "node:test";

import { validateSourceSegmentLibrary } from "../scripts/validate-source-segment-library.mjs";

test("complete source segment library has verified 20-source reconstruction coverage", async () => {
  const { errors, manifest } = await validateSourceSegmentLibrary();
  assert.deepEqual(errors, [], errors.join("\n"));
  assert.equal(manifest.sourceCount, 20);
  assert.ok(manifest.segmentCount >= 1_000);
  assert.equal(manifest.allSourcesCoverageVerified, true);
  assert.equal(manifest.approvedPrecomputeCount + manifest.quarantinedCount, manifest.segmentCount);
});
