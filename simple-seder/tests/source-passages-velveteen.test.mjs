import assert from "node:assert/strict";
import crypto from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const projectRoot = new URL("../", import.meta.url);
const compiledRoot = await mkdtemp(path.join(tmpdir(), "pesach-velveteen-v9-"));
const source = await readFile(new URL("content/source-passages-velveteen.ts", projectRoot), "utf8");
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 }, fileName: "source-passages-velveteen.ts" }).outputText;
await mkdir(path.join(compiledRoot, "content"), { recursive: true });
await writeFile(path.join(compiledRoot, "content/source-passages-velveteen.js"), output);
const pack = await import(new URL(`file://${path.join(compiledRoot, "content/source-passages-velveteen.js")}`).href);
process.on("exit", () => void rm(compiledRoot, { recursive: true, force: true }));

const sha = (text) => crypto.createHash("sha256").update(text.replace(/\s+/gu, " ").trim(), "utf8").digest("hex");

test("Velveteen v9 pack has exact reading coverage for all 14 sections and tiers", () => {
  assert.deepEqual(pack.validateVelveteenPassagePack(), []);
  assert.deepEqual(pack.velveteenSectionPacks.map((section) => section.sectionId), pack.VELVETEEN_SECTION_ORDER);
  assert.equal(pack.velveteenSectionPacks.length, 14);
  for (const section of pack.velveteenSectionPacks) {
    for (const tier of [20, 45, 90]) assert.ok(section.readingPassageIdsByTier[tier].length >= 1, `${section.sectionId} missing ${tier}-minute reading`);
  }
});

test("stored hashes cover normalized exact excerpt text", () => {
  for (const passage of pack.velveteenPassages) assert.equal(passage.provenanceHash, sha(passage.text), passage.id);
});

test("third-party excerpts preserve printed attribution and containing Haggadah/page", () => {
  for (const passage of pack.velveteenPassages) {
    assert.equal(passage.containingHaggadah, "velveteen-rabbi-v9");
    assert.ok(passage.pdfPages.every((page) => Number.isInteger(page) && page >= 1 && page <= 84));
    if (passage.attributionStatus === "third-party-attributed") assert.ok(passage.printedAttribution?.trim(), passage.id);
  }
});

test("beginner actions and orientation never appear in reading tier arrays", () => {
  const readingIds = new Set(pack.velveteenSectionPacks.flatMap((section) => Object.values(section.readingPassageIdsByTier).flat()));
  for (const passage of pack.velveteenPassages) {
    if (passage.role !== "reading") assert.ok(!readingIds.has(passage.id), passage.id);
  }
  for (const section of pack.velveteenSectionPacks) {
    for (const id of section.actionPassageIds) assert.notEqual(pack.velveteenPassages.find((passage) => passage.id === id)?.role, "reading");
  }
});

test("longer tiers are additive and do not randomly replace the source voice", () => {
  for (const section of pack.velveteenSectionPacks) {
    const short = section.readingPassageIdsByTier[20];
    const medium = section.readingPassageIdsByTier[45];
    const long = section.readingPassageIdsByTier[90];
    assert.ok(short.every((id) => medium.includes(id)), `${section.sectionId}: 45-minute tier must retain 20-minute reading`);
    assert.ok(medium.every((id) => long.includes(id)), `${section.sectionId}: 90-minute tier must retain 45-minute readings`);
  }
});
