import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const projectRoot = new URL("../", import.meta.url);
const compiledRoot = await mkdtemp(path.join(tmpdir(), "pesach-source-spines-"));

async function compile(relativePath) {
  const source = await readFile(new URL(relativePath, projectRoot), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
    fileName: relativePath,
  }).outputText.replace(
    /(from\s+["'])(\.\.?\/[^"']+)(["'])/g,
    (_match, prefix, specifier, suffix) => `${prefix}${specifier.endsWith(".js") ? specifier : `${specifier}.js`}${suffix}`,
  );
  const outputPath = path.join(compiledRoot, relativePath.replace(/\.ts$/, ".js"));
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, output);
}

await Promise.all([
  compile("content/source-passages-shir.ts"),
  compile("content/source-passages-velveteen.ts"),
  compile("content/source-spines.ts"),
]);
const architecture = await import(new URL(`file://${path.join(compiledRoot, "content/source-spines.js")}`).href);
process.on("exit", () => void rm(compiledRoot, { recursive: true, force: true }));

function assemblyFor(spineId, tier = 20) {
  const spine = architecture.sourceSpines.find((candidate) => candidate.id === spineId);
  return {
    spineId,
    tier,
    sections: architecture.SEDER_SECTION_ORDER.map((sectionId) => ({
      sectionId,
      blocks: spine.coverage
        .filter((ref) => ref.sectionId === sectionId && ref.tiers.includes(tier))
        .map((ref) => ({
          kind: "primary-source",
          passageId: ref.passageId,
          seam: ref.seam,
          text: architecture.reviewedPassage(ref.passageId).text,
        })),
    })),
  };
}

test("both approved primary spines have exact all-section coverage at every tier", () => {
  assert.deepEqual(architecture.validateSourceSpines(), []);
  assert.equal(architecture.sourceSpines.length, 2);
  for (const spine of architecture.sourceSpines) {
    assert.equal(spine.status, "generation-ready-with-house-copy");
    for (const tier of [20, 45, 90]) {
      const covered = new Set(spine.coverage.filter((ref) => ref.tiers.includes(tier)).map((ref) => ref.sectionId));
      assert.deepEqual([...covered].sort(), [...architecture.SEDER_SECTION_ORDER].sort(), `${spine.id} ${tier}`);
    }
  }
});

test("a valid assembly keeps one source voice across all 14 ordered sections", () => {
  for (const spine of architecture.sourceSpines) {
    for (const tier of [20, 45, 90]) {
      assert.deepEqual(architecture.validateAssembly(assemblyFor(spine.id, tier)), []);
    }
  }
});

test("validator rejects rewritten text and random cross-section stitching", () => {
  const rewritten = assemblyFor("shir-geulah-primary", 20);
  rewritten.sections[0].blocks[0].text += " Added connective words.";
  const moved = rewritten.sections[1].blocks[0];
  rewritten.sections[1].blocks[0] = { ...moved, passageId: rewritten.sections[0].blocks[0].passageId };
  const errors = architecture.validateAssembly(rewritten).join("\n");
  assert.match(errors, /must remain an exact reviewed passage block/);
  assert.match(errors, /cannot move from kadesh to urchatz/);
});

test("validator rejects incomplete order and sections without primary prose", () => {
  const incomplete = assemblyFor("velveteen-rabbi-primary", 45);
  incomplete.sections.pop();
  incomplete.sections[2].blocks = [{ kind: "house-copy", role: "ritual-direction", text: "Dip the greens." }];
  const errors = architecture.validateAssembly(incomplete).join("\n");
  assert.match(errors, /requires 14 ordered sections/);
  assert.match(errors, /Assembly section 14 must be nirtzah/);
  assert.match(errors, /karpas must contain primary-source prose/);
});

test("secondary-source mixing is closed until a seam is specifically approved", () => {
  const assembly = assemblyFor("shir-geulah-primary", 20);
  const other = architecture.sourceSpines
    .find((spine) => spine.id === "velveteen-rabbi-primary")
    .coverage.find((ref) => ref.sectionId === "nirtzah" && ref.tiers.includes(20));
  assembly.sections.at(-1).blocks.push({
    kind: "secondary-source",
    passageId: other.passageId,
    seam: other.seam,
    text: architecture.reviewedPassage(other.passageId).text,
  });
  const errors = architecture.validateAssembly(assembly).join("\n");
  assert.match(errors, /not allowed/);
  assert.match(errors, /At most 0 secondary/);
});

test("metrics separate source, house, traditional, and per-source words", () => {
  const assembly = assemblyFor("shir-geulah-primary", 20);
  assembly.sections[0].blocks.unshift({
    kind: "house-copy",
    role: "beginner-orientation",
    text: "Welcome. We will take turns reading and may always pass.",
  });
  assembly.sections[0].blocks.push({
    kind: "traditional-liturgy",
    text: "Blessed are You, source of the fruit of the vine.",
  });
  const metrics = architecture.sourceShareMetrics(assembly);
  assert.ok(metrics.borrowedWords > metrics.houseWords);
  assert.ok(metrics.borrowedWordShare > 0.9);
  assert.ok(metrics.traditionalWords > 0);
  assert.ok(metrics.bySource["shir-geulah"].words > 1_100);
  assert.equal(metrics.bySource["velveteen-rabbi"], undefined);
});

test("reader credits list each used Haggadah once and never expose page locators", () => {
  const assembly = assemblyFor("velveteen-rabbi-primary", 90);
  const credits = architecture.readerCredits(assembly);
  assert.equal(credits.length, 1);
  assert.equal(new Set(credits).size, credits.length);
  assert.match(credits[0], /Velveteen Rabbi/);
  assert.doesNotMatch(credits.join(" "), /PDF p\.|p\.\s*\d+/i);
});

test("internal provenance retains printed attribution and containing Haggadah", () => {
  const provenance = architecture.internalProvenance("vr9-yachatz-broken");
  assert.match(provenance.originalAttribution, /Jill Hammer/);
  assert.match(provenance.containingHaggadah, /Velveteen Rabbi/);
  assert.match(provenance.locator, /PDF p\. 16/);
});
