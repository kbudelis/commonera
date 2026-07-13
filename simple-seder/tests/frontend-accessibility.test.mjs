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
  assert.match(page, /aria-pressed={isActive}/);
  assert.match(page, /ref={resultRef} tabIndex={-1}/);
  assert.match(page, /resultRef\.current\?\.focus/);
});

test("editable generated copy grows with its content and has print-safe mirrors", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("app/page.tsx", projectRoot), "utf8"),
    readFile(new URL("app/globals.css", projectRoot), "utf8"),
  ]);

  assert.match(page, /function AutoTextarea/);
  assert.match(page, /textarea\.scrollHeight/);
  assert.match(page, /new ResizeObserver/);
  assert.match(page, /className="print-copy"/);
  assert.match(page, /className="print-section-title"/);
  assert.match(css, /\.section-page,\.aux-page\{height:auto!important;min-height:11in!important;max-height:none!important;overflow:visible!important/);
  assert.match(css, /\.section-page textarea,\.section-title,\.invitation textarea\{display:none!important\}/);
  assert.match(css, /\.print-copy,\.print-section-title\{display:block!important/);
  assert.match(css, /filter:grayscale\(1\)!important/);
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
  assert.match(css, /\.cover-gallery\{grid-template-columns:repeat\(2,1fr\)/);
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
  assert.match(css, /@media screen and \(max-width:760px\)\{\s*\.intake-preview\.editorial-preview\{min-height:148px/);
});
