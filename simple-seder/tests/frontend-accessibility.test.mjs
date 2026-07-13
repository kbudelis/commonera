import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("staged intake and generated views expose keyboard and status semantics", async () => {
  const page = await readFile(new URL("app/page.tsx", projectRoot), "utf8");

  assert.match(page, /role="group" aria-labelledby={`intake-step-/);
  assert.match(page, /className="form-status" role="status" aria-live="polite"/);
  assert.match(page, /handleTabKeyDown/);
  assert.match(page, /event\.key === "ArrowRight"/);
  assert.match(page, /event\.key === "ArrowLeft"/);
  assert.match(page, /aria-pressed={selected}/);
  assert.match(page, /ref={resultRef} tabIndex={-1}/);
  assert.match(page, /resultRef\.current\?\.focus/);
});

test("reading preview is static and editing happens on a separate screen", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("app/page.tsx", projectRoot), "utf8"),
    readFile(new URL("app/globals.css", projectRoot), "utf8"),
  ]);

  const readingSection = page.slice(page.indexOf("function ReadingSection"), page.indexOf("function SourcesPage"));
  assert.match(page, /function AutoTextarea/);
  assert.match(page, /textarea\.scrollHeight/);
  assert.match(page, /new ResizeObserver/);
  assert.doesNotMatch(readingSection, /<input|<AutoTextarea/);
  assert.match(page, />Edit Haggadah</);
  assert.match(page, /className={`editor-screen type-/);
  assert.match(page, />Back to preview</);
  assert.match(page, /<EditorSection key=/);
  assert.doesNotMatch(page, /function save\(|>Save</);
  assert.match(css, /\.section-page,\.aux-page\{height:auto!important;min-height:11in!important;max-height:none!important;overflow:visible!important/);
  assert.match(css, /\.editor-screen\{min-height:100svh/);
  assert.match(css, /filter:grayscale\(1\)!important/);
});

test("intake, sources, invitation, and host guide include the requested finishing behavior", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("app/page.tsx", projectRoot), "utf8"),
    readFile(new URL("app/globals.css", projectRoot), "utf8"),
  ]);

  assert.match(page, /How long should the seder be\?/);
  assert.match(page, /20-min script/);
  assert.match(page, /About 32–36 min live \+ dinner/);
  assert.match(page, /OPTIONAL TABLE QUESTION/);
  assert.match(page, /About 55–65 min live \+ dinner/);
  assert.match(page, /About 95–110 min live \+ dinner/);
  assert.match(page, /LIVE_PLANNING_RANGES\[profile\.length\]\.label/);
  assert.match(page, /What themes should run through the story\?/);
  assert.match(page, /className="step-two-grid"/);
  assert.match(css, /\.step-two-grid\{display:grid;grid-template-columns:1fr/);
  assert.match(css, /overflow-wrap:normal;word-break:normal;hyphens:none/);
  assert.match(css, /@media screen and \(max-width:600px\)\{\s*\.choice-grid\.choices-2,\.choice-grid\.choices-3\{grid-template-columns:1fr\}/);
  assert.match(page, /type-\$\{profile\.typography\}/);
  assert.match(page, /showPicker\?\.\(\)/);
  assert.match(page, /className="cover-picker"/);
  assert.match(page, /className="intake-cover-gallery"/);
  assert.equal((page.match(/Choose your cover/g) ?? []).length, 1);
  assert.doesNotMatch(page, /className="cover-gallery"/);
  assert.match(page, /function SourcesPage/);
  assert.match(page, /<SourcesPage credits={documentCredits}/);
  assert.match(page, /document\.invitation\} minRows=\{8\}/);
  assert.match(page, /className="guide-card-grid"/);
  assert.match(page, /className="plate-card-grid"/);
  for (const image of ["zeroa", "beitzah", "maror", "charoset", "karpas", "chazeret", "orange", "pomegranate"]) assert.match(page, new RegExp(`return "${image}\\.png"`));
  assert.match(css, /\.plate-object-slot img\{filter:grayscale\(1\)!important\}/);
});

test("editorial redesign uses the cream, espresso, and cobalt chapter system", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("app/page.tsx", projectRoot), "utf8"),
    readFile(new URL("app/globals.css", projectRoot), "utf8"),
  ]);

  assert.match(page, /className="hero-frame"/);
  assert.match(page, /\/covers\/papercut\.webp/);
  assert.match(page, /A Passover Haggadah that sounds like your table/);
  assert.match(page, /ready-to-lead Passover Haggadah/);
  assert.match(page, /className="hero-cover-title"/);
  assert.doesNotMatch(page, /className="hero-quote"/);
  assert.doesNotMatch(css, /\.hero-quote\{/);
  assert.match(page, /A guided path from blank page to a night everyone remembers/);
  assert.ok(page.indexOf('intakeStep === 3') < page.indexOf('className="plate-additions"'));
  assert.doesNotMatch(page, /anti-zionist|non-zionist/i);
  assert.match(page, /pdf\.setDrawColor\(28, 98, 189\)/);
  assert.doesNotMatch(page, /pdf\.setTextColor\(35, 53, 51\)/);
  assert.match(css, /--chocolate:#29170f/);
  assert.match(css, /--clay:#1c62bd/);
  assert.match(css, /\.how\{min-height:84svh/);
  assert.match(css, /\.result\{min-height:100svh/);
  assert.match(css, /\.workspace\{max-width:850px;grid-template-columns:minmax\(0,850px\);gap:0/);
  assert.match(css, /@media screen and \(max-width:760px\)/);
});

test("intake preview uses a stable, legible modernist poster treatment", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("app/page.tsx", projectRoot), "utf8"),
    readFile(new URL("app/globals.css", projectRoot), "utf8"),
  ]);

  assert.match(page, /cover\.id === "modernist-1"/);
  assert.match(page, /className="preview-panel"/);
  assert.match(page, /className="preview-meta"/);
  assert.match(page, /profile\.themes\.length > 1/);
  assert.doesNotMatch(page, /const previewCover = useMemo/);
  assert.match(css, /\.editorial-preview>\.preview-panel\{[^}]*background:rgba\(12,48,104,\.95\)/);
  assert.match(css, /\.intake-preview\.editorial-preview h3\{[^}]*color:#fff/);
  assert.match(css, /\.editorial-preview\.type-readable>\.preview-panel\{[^}]*width:86%/);
  assert.match(css, /@media screen and \(max-width:760px\)\{\s*\.intake-preview\.editorial-preview\{min-height:148px/);
});

test("all typography choices bundle their actual offline fonts", async () => {
  const layout = await readFile(new URL("app/layout.tsx", projectRoot), "utf8");
  const css = await readFile(new URL("app/globals.css", projectRoot), "utf8");

  assert.match(layout, /@fontsource\/source-serif-4\/latin-400\.css/);
  assert.match(layout, /@fontsource\/inter\/latin-400\.css/);
  assert.match(layout, /@fontsource\/atkinson-hyperlegible\/latin-400\.css/);
  assert.match(css, /--font-readable:"Atkinson Hyperlegible"/);
});

test("print and PDF export use a dedicated US Letter document", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("app/page.tsx", projectRoot), "utf8"),
    readFile(new URL("app/globals.css", projectRoot), "utf8"),
  ]);

  assert.match(page, /function PrintableHaggadah/);
  assert.match(page, /document\.profile\.length === 20 \? "compact-print"/);
  assert.match(page, /className="workspace screen-document"/);
  assert.match(page, /<PrintableHaggadah document={document}/);
  assert.match(page, /function printHaggadah\(\)/);
  assert.match(page, /window\.print\(\)/);
  assert.match(page, /new jsPDF\(\{ unit: "pt", format: "letter" \}\)/);
  assert.match(page, /const pageW = 612, pageH = 792/);
  assert.match(page, /pdf\.getNumberOfPages\(\)/);
  assert.match(page, /pdf\.setPage\(pageNumber\)/);
  assert.match(css, /@page\{\s*size:Letter portrait;\s*margin:\.55in \.65in/);
  assert.match(css, /\.print-document \.cover\{[^}]*height:9\.9in!important/);
  assert.match(css, /\.print-document \.section-page\{[^}]*break-before:page!important/);
  assert.match(css, /\.print-document\.compact-print \.section-page\{[^}]*break-before:auto!important/);
  assert.match(css, /\.screen-document[^}]*display:none!important/);
});
