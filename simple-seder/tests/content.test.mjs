import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { runValidation, validateContent } from "../scripts/validate-content.mjs";

test("content pack satisfies structural and source validation", async () => {
  const result = await runValidation();

  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.counts, {
    themes: 9,
    sections: 14,
    inserts: 108,
    tones: 3,
    quotes: 53,
    sources: 20,
    covers: 8,
    coverMasters: 8,
  });
  assert.ok(result.warnings.some((warning) => warning.includes("velveteen-rabbi")));
  assert.ok(result.warnings.some((warning) => warning.includes("source-presented attribution")));
});

test("explicit borrowing permission is reviewable, not categorically rejected", () => {
  const minimal = {
    themeLabels: {},
    themeDescriptions: {},
    themeInserts: {},
    sectionBlueprints: [],
    toneOpeners: {},
    quoteCatalog: [],
    coverOptions: [],
    sourceCatalog: [{
      id: "custom-permission",
      title: "Custom source",
      creator: "Creator",
      url: "https://example.com/source",
      rights: "Explicit permission to reuse and borrow with attribution; noncommercial only",
    }],
  };

  const result = validateContent(minimal);
  assert.ok(result.warnings.some((warning) => warning.includes("custom-permission")));
  assert.ok(!result.errors.some((error) => error.includes("custom-permission needs a documented")));
});

test("policies include both eligible named sources and item-level limits", async () => {
  const [quotationPolicy, editorialPolicy, copyAudit, coverProvenance] = await Promise.all([
    readFile(new URL("../research/quotation-policy.md", import.meta.url), "utf8"),
    readFile(new URL("../research/editorial-policy.md", import.meta.url), "utf8"),
    readFile(new URL("../research/content-provenance-audit.md", import.meta.url), "utf8"),
    readFile(new URL("../public/covers/README.md", import.meta.url), "utf8"),
  ]);

  assert.match(quotationPolicy, /Shir Ge’ulah/);
  assert.match(quotationPolicy, /Velveteen Rabbi/);
  assert.match(quotationPolicy, /explicit permission/i);
  assert.match(quotationPolicy, /material printed inside an approved Haggadah is eligible/i);
  assert.match(quotationPolicy, /preserve its attribution exactly/i);
  assert.match(editorialPolicy, /standardized open licenses \*\*or explicit reuse\/borrowing permission\*\*/i);
  assert.match(copyAudit, /two complete, generation-ready primary spines/i);
  assert.match(copyAudit, /at least \*\*50% reviewed-source words\*\*/i);
  assert.match(copyAudit, /Reviewed source passages are immutable paragraph-level blocks/i);
  assert.match(copyAudit, /Material embedded in an approved Haggadah is eligible/i);
  assert.match(coverProvenance, /July 11, 2026/);
  assert.match(coverProvenance, /No reference images/);
  assert.match(coverProvenance, /flags, maps, and national symbols/);
  assert.match(coverProvenance, /genuinely different composition/);
});

test("reader-facing PDF credits stay compact and source-level", async () => {
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(pageSource, /Passages used:/);
  assert.doesNotMatch(pageSource, /passage\.locator|passage\.treatment/);
  assert.match(pageSource, /Sources used in this generated Haggadah/);
});
