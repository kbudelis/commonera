import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../content/quotes-expanded.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { expandedQuoteCatalog } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("expanded quotations keep stable exact IDs and reviewed wording", () => {
  const byId = Object.fromEntries(expandedQuoteCatalog.map((quote) => [quote.id, quote]));
  assert.equal(expandedQuoteCatalog.length, 34);
  assert.equal(byId["q-exodus-midwives"].text, "The midwives honored God and did not do as the king of Egypt had ordered; they kept the children alive.");
  assert.equal(byId["q-amos-waters"].text, "Let justice roll down like waters, and righteousness like an ever-flowing stream.");
  assert.equal(byId["q-ruth-go"].sourceUrl, "https://www.sefaria.org/Ruth.1.16");
});

test("expanded quotations have unique text and narrow, valid placement contexts", () => {
  const ids = expandedQuoteCatalog.map((quote) => quote.id);
  const texts = expandedQuoteCatalog.map((quote) => quote.text);
  const runtimeQuoteSections = new Set(["kadesh", "maggid", "tzafun", "nirtzah"]);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(texts).size, texts.length);
  assert.ok(expandedQuoteCatalog.every((quote) => quote.sectionIds.length <= 2));
  assert.ok(expandedQuoteCatalog.every((quote) => quote.sectionIds.every((id) => runtimeQuoteSections.has(id))));
  assert.ok(expandedQuoteCatalog.every((quote) => quote.sourceUrl.startsWith("https://")));
});
