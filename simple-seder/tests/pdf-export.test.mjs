import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { jsPDF } from "jspdf";
import ts from "typescript";

const projectRoot = new URL("../", import.meta.url);
const paginationSource = await readFile(new URL("lib/pdf-pagination.ts", projectRoot), "utf8");
const paginationJavaScript = ts.transpileModule(paginationSource, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  fileName: "lib/pdf-pagination.ts",
}).outputText;
const { paginatePdfLines } = await import(
  `data:text/javascript;base64,${Buffer.from(paginationJavaScript).toString("base64")}`
);

test("PDF line pagination keeps every line inside the Letter content boundary", () => {
  const lines = Array.from({ length: 137 }, (_, index) => `Line ${index + 1}`);
  const layout = paginatePdfLines(lines, {
    startY: 710,
    pageTopY: 64,
    pageBottomY: 734,
    lineHeight: 15,
    spaceAfter: 12,
  });

  assert.ok(layout.chunks.length >= 4);
  assert.equal(layout.chunks[0].newPageBefore, true, "avoid leaving a one-line orphan at the page bottom");
  assert.deepEqual(layout.chunks.flatMap((chunk) => chunk.lines), lines);
  for (const chunk of layout.chunks) {
    const lastBaseline = chunk.y + (chunk.lines.length - 1) * 15;
    assert.ok(chunk.y >= 64);
    assert.ok(lastBaseline <= 734, `${lastBaseline} exceeds the printable bottom`);
  }
});

test("90-minute reviewed source block is split across real jsPDF pages without loss", async () => {
  const pack = JSON.parse(await readFile(
    new URL("content/generated/local-corpus/source-packs/velveteen-rabbi.json", projectRoot),
    "utf8",
  ));
  const passage = pack.modules.find((module) => module.id === "local-sequence-velveteen-rabbi-exodus-narrative");
  assert.ok(passage);
  assert.ok(passage.lengthTiers.includes("90"));
  assert.ok(passage.exactText.length > 7_000);
  assert.match(passage.exactText, /[\u0590-\u05ff]/u);

  const fontBytes = await readFile(new URL("public/fonts/Cardo-Regular.ttf", projectRoot));
  const pdf = new jsPDF({ unit: "pt", format: "letter" });
  pdf.addFileToVFS("Cardo-Regular.ttf", fontBytes.toString("base64"));
  pdf.addFont("Cardo-Regular.ttf", "Cardo", "normal");
  pdf.setFont("Cardo", "normal");
  pdf.setFontSize(11);
  const wrappedLines = pdf.splitTextToSize(passage.exactText.normalize("NFD"), 496);
  const layout = paginatePdfLines(wrappedLines, {
    startY: 300,
    pageTopY: 64,
    pageBottomY: 734,
    lineHeight: 15,
    spaceAfter: 12,
  });

  let expectedPages = 1;
  for (const chunk of layout.chunks) {
    if (chunk.newPageBefore) { pdf.addPage(); expectedPages += 1; }
    pdf.setFont("Cardo", "normal");
    pdf.setFontSize(11);
    pdf.text(chunk.lines, 58, chunk.y);
  }

  assert.ok(layout.chunks.length >= 3, "the long reviewed source must exercise multiple continuation pages");
  assert.deepEqual(layout.chunks.flatMap((chunk) => chunk.lines), wrappedLines);
  assert.equal(pdf.getNumberOfPages(), expectedPages);
  const output = Buffer.from(pdf.output("arraybuffer"));
  assert.ok(output.includes(Buffer.from("/ToUnicode")), "embedded font must include a Unicode map");
});

test("Hebrew-first mixed continuation forces an LTR paragraph without reversing English", async () => {
  const pack = JSON.parse(await readFile(
    new URL("content/generated/local-corpus/source-packs/velveteen-rabbi.json", projectRoot),
    "utf8",
  ));
  const passage = pack.modules.find((module) => module.id === "local-sequence-velveteen-rabbi-exodus-narrative");
  const fixture = passage?.exactText.match(/מִי כָמֹכָה[\s\S]*?Doing wonders!/u)?.[0];
  assert.ok(fixture, "reviewed source must retain the Hebrew-first mixed-language fixture");
  const normalizedFixture = fixture.normalize("NFD");

  const contextualEngine = new jsPDF.__bidiEngine__({ isInputVisual: true });
  const contextualOutput = contextualEngine.doBidiReorder(normalizedFixture);
  assert.match(contextualOutput, /srewop eht gnoma/u, "fixture must reproduce jsPDF's contextual RTL regression");

  const ltrEngine = new jsPDF.__bidiEngine__({
    isInputVisual: false,
    isInputRtl: false,
    isOutputVisual: true,
    isOutputRtl: false,
  });
  const ltrOutput = ltrEngine.doBidiReorder(normalizedFixture);
  assert.match(ltrOutput, /Who’s like You among the powers/u);
  assert.doesNotMatch(ltrOutput, /srewop eht gnoma/u);
  assert.match(ltrOutput, /[\u0590-\u05ff]/u, "Hebrew runs must remain present");
  assert.deepEqual([...ltrOutput].sort(), [...normalizedFixture].sort(), "direction handling must only reorder glyphs");
});

test("Cardo covers every approved runtime passage after render-time normalization", async () => {
  const [runtimeIndex, ...fontAssets] = await Promise.all([
    readFile(new URL("research/source-runtime-index.json", projectRoot), "utf8").then(JSON.parse),
    ...["Cardo-Regular.ttf", "Cardo-Bold.ttf", "Cardo-Italic.ttf"].map(async (file) => ({
      file,
      bytes: await readFile(new URL(`public/fonts/${file}`, projectRoot)),
    })),
  ]);
  const approvedTexts = runtimeIndex.sources.flatMap((source) => source.passages
    .filter((passage) => source.rights.runtimeEligible && passage.approvalStatus === "approved" && passage.rights.runtimeEligible)
    .map((passage) => passage.exactText.normalize("NFD")));

  assert.ok(approvedTexts.length >= 40);
  for (const { file, bytes } of fontAssets) {
    const pdf = new jsPDF();
    pdf.addFileToVFS(file, bytes.toString("base64"));
    pdf.addFont(file, "Cardo", "normal");
    pdf.setFont("Cardo", "normal");
    const codeMap = pdf.getFont().metadata.cmap.unicode.codeMap;
    const unsupported = [...new Set([...approvedTexts.join("")]
      .map((character) => character.codePointAt(0))
      .filter((codePoint) => codeMap[codePoint] === undefined && ![9, 10, 13].includes(codePoint)))];
    assert.equal(unsupported.length, 0, `${file} missing glyphs: ${unsupported.map((value) => `U+${value.toString(16).toUpperCase()}`).join(", ")}`);
    for (const codePoint of [0x0591, 0x0596, 0x05a3, 0x05ae, 0x05c4]) {
      assert.notEqual(codeMap[codePoint], undefined, `${file} must include U+${codePoint.toString(16).toUpperCase()}`);
    }
  }
  assert.equal("ḇ ḵ".normalize("NFD"), "b\u0331 k\u0331");
});

test("bundled PDF fonts and OFL license are stable local assets", async () => {
  const [regular, bold, italic, license, readme, page] = await Promise.all([
    readFile(new URL("public/fonts/Cardo-Regular.ttf", projectRoot)),
    readFile(new URL("public/fonts/Cardo-Bold.ttf", projectRoot)),
    readFile(new URL("public/fonts/Cardo-Italic.ttf", projectRoot)),
    readFile(new URL("public/fonts/Cardo-OFL.txt", projectRoot), "utf8"),
    readFile(new URL("public/fonts/README.md", projectRoot), "utf8"),
    readFile(new URL("app/page.tsx", projectRoot), "utf8"),
  ]);
  assert.equal(createHash("sha256").update(regular).digest("hex"), "bcb81f376f1c3892c7026dabf2beafbd1a7ee8ae95d132ee7d4ff7d7c3988261");
  assert.equal(createHash("sha256").update(bold).digest("hex"), "6c9383b1471936ee83b08b67bf79f0ed92bee3d5e8363ec3ba21309d5a272e36");
  assert.equal(createHash("sha256").update(italic).digest("hex"), "52c51cfde3a827dd9428511c4a968699952b8a917c5f0e97be782cbfa1880f9c");
  assert.match(license, /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.match(readme, /bcb81f376f1c3892c7026dabf2beafbd1a7ee8ae95d132ee7d4ff7d7c3988261/);
  assert.match(page, /fetch\(assetPath\("\/fonts\/Cardo-Regular\.ttf"\)\)/);
  assert.match(page, /pdf\.addFont\(font\.file, "Cardo", font\.style\)/);
  assert.match(page, /value\.normalize\("NFD"\)/);
  assert.match(page, /R2L: true/);
  assert.match(page, /isInputVisual: false,[\s\S]*isInputRtl: false,[\s\S]*isOutputVisual: true,[\s\S]*isOutputRtl: false/);
  assert.match(page, /pdf\.text\(chunkLines, margin, chunkY, ltrTextOptions\)/);
  assert.match(page, /customCoverUrl \? 0\.34 : cover\.ink === "light" \? 0\.48 : 0\.34/);
});
