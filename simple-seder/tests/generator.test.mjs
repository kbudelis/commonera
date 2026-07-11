import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test, { after } from "node:test";
import ts from "typescript";

const projectRoot = new URL("../", import.meta.url);
const compiledRoot = await mkdtemp(path.join(tmpdir(), "pesach-generator-"));

async function compile(relativePath) {
  const source = await readFile(new URL(relativePath, projectRoot), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: relativePath,
  }).outputText;
  const withExtensions = output.replace(
    /(from\s+["'])(\.\.?\/[^"']+)(["'])/g,
    (_match, prefix, specifier, suffix) =>
      `${prefix}${specifier.endsWith(".js") ? specifier : `${specifier}.js`}${suffix}`,
  );
  const outputPath = path.join(compiledRoot, relativePath.replace(/\.ts$/, ".js"));
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, withExtensions);
}

await Promise.all([
  compile("content/pack.ts"),
  compile("content/quotes-expanded.ts"),
  compile("content/source-passages-shir.ts"),
  compile("content/source-passages-velveteen.ts"),
  compile("content/source-spines.ts"),
  compile("lib/types.ts"),
  compile("lib/editorial.ts"),
  compile("lib/generator.ts"),
]);

const generator = await import(
  new URL(`file://${path.join(compiledRoot, "lib/generator.js")}`).href
);
const editorial = await import(
  new URL(`file://${path.join(compiledRoot, "lib/editorial.js")}`).href
);

after(async () => {
  await rm(compiledRoot, { recursive: true, force: true });
});

const baseProfile = {
  length: 45,
  audience: "mixed",
  interaction: "balanced",
  tone: "balanced",
  typography: "classic",
  language: "transliteration",
  themes: ["family-storytelling", "social-justice"],
  sederPlateAdditions: [],
  customTheme: "intergenerational courage",
  hostName: "Leah",
  sederDate: "2027-04-21",
  coverQuote: "",
};

test("peace-focused framing is universal and no political checkbox remains in the profile", async () => {
  const typesSource = await readFile(new URL("lib/types.ts", projectRoot), "utf8");
  assert.doesNotMatch(typesSource, /antiZionist/);
  assert.match(typesSource, /themes:\s*\[\]/);
});

test("generates a deterministic, complete 14-section Haggadah", () => {
  const first = generator.generateHaggadah(baseProfile);
  const second = generator.generateHaggadah(structuredClone(baseProfile));

  assert.deepEqual(first, second);
  assert.deepEqual(
    first.sections.map((section) => section.id),
    generator.SECTION_ORDER,
  );
  assert.deepEqual(
    first.sections.map((section) => section.order),
    Array.from({ length: 14 }, (_unused, index) => index + 1),
  );
  assert.equal(
    first.sections.reduce((total, section) => total + section.minutes, 0),
    45,
  );
  assert.equal(first.editorialWarnings.length, 0);
  assert.match(first.id, /^haggadah-[a-z0-9]+$/);
  assert.equal(first.createdAt, "2027-04-21T00:00:00.000Z");
});

test("uses one complete primary source voice and keeps reviewed wording in the majority", () => {
  const shir = generator.generateHaggadah({ ...baseProfile, length: 20 });
  const velveteen = generator.generateHaggadah({
    ...baseProfile,
    length: 45,
    audience: "adults",
    tone: "reverent",
    themes: ["family-storytelling", "environment"],
  });

  assert.equal(shir.sourceSpineId, "shir-geulah-primary");
  assert.equal(shir.sourceMetrics.primarySourceId, "shir-geulah");
  assert.equal(velveteen.sourceSpineId, "velveteen-rabbi-primary");
  assert.equal(velveteen.sourceMetrics.primarySourceId, "velveteen-rabbi");

  for (const document of [shir, velveteen]) {
    assert.ok(document.sourceMetrics.borrowedWordShare >= 0.5);
    assert.ok(document.sourceMetrics.borrowedWords > document.sourceMetrics.houseWords);
    assert.ok(document.sections.every((section) => section.sourceIds.length === 1));
    assert.ok(document.sections.every((section) => section.sourceIds[0] === document.sourceMetrics.primarySourceId));
    assert.ok(document.sections.every((section) => section.passageIds.length >= 1));
  }

  assert.match(shir.sections.find((section) => section.id === "yachatz").body.join(" "), /The bread of oppression is literally broken/);
  assert.match(velveteen.sections.find((section) => section.id === "maggid").body.join(" "), /In re-telling the story of the Exodus/);
  assert.doesNotMatch(velveteen.sections.flatMap((section) => section.body).join(" "), /The bread of oppression is literally broken/);
});

test("honors length, audience, tone, and language settings", () => {
  const shortKids = generator.generateHaggadah({
    ...baseProfile,
    length: 20,
    audience: "kids",
    tone: "playful",
    language: "english",
  });
  const fullAdults = generator.generateHaggadah({
    ...baseProfile,
    length: 90,
    audience: "adults",
    tone: "reverent",
    language: "transliteration",
  });

  assert.ok(
    shortKids.sections.reduce((sum, section) => sum + section.body.length, 0) <
      fullAdults.sections.reduce((sum, section) => sum + section.body.length, 0),
  );
  assert.ok(shortKids.sections.every((section) => section.transliteration === ""));
  assert.ok(
    shortKids.sections.every((section) =>
      section.prompt.length > 10 && !section.prompt.startsWith("Kid-friendly question:"),
    ),
  );
  assert.ok(
    shortKids.sections.every((section) =>
      section.bridge.length > 20 && !section.bridge.startsWith("For younger guests:"),
    ),
  );
  const kidCopy = shortKids.sections
    .flatMap((section) => [...section.body, section.bridge, section.prompt])
    .join(" ");
  assert.doesNotMatch(kidCopy, /sea is not a prop|set down|renewal|repair.not perfection/i);
  assert.match(shortKids.sections.find((section) => section.id === "urchatz").bridge, /own hands.+partner.+basin/i);
  assert.match(shortKids.sections.find((section) => section.id === "yachatz").bridge, /children.+afikoman.+prize/i);
  assert.ok(
    fullAdults.sections.some((section) =>
      section.body.some((paragraph) => paragraph.startsWith("Barukh atah")),
    ),
  );
  assert.ok(
    [
      "We enter this evening with attention and care.",
      "Across generations, this order has carried memory into action.",
      "May the telling open a path toward freedom, dignity, and peace.",
    ].some((opener) => fullAdults.sections[0].body.slice(0, 3).includes(opener)),
  );
});

test("mixed-age prompts use plain questions that children and adults can answer", () => {
  const document = generator.generateHaggadah({
    ...baseProfile,
    length: 20,
    audience: "mixed",
    themes: ["environment", "family-storytelling"],
    tone: "reverent",
  });
  const prompts = Object.fromEntries(document.sections.map((section) => [section.id, section.prompt]));
  assert.equal(prompts.urchatz, "Everyone can answer or pass: What is one worry you would like to let go of?");
  assert.equal(prompts.karpas, "Everyone can answer or pass: What is something new you have seen growing this spring?");
  assert.equal(prompts.yachatz, "Everyone can answer or pass: When something breaks, who can help put it back together?");
  assert.doesNotMatch(Object.values(prompts).join(" "), /renewal|repair.not perfection|set down/i);
});

test("uses a restrained number of unique, context-approved quotes", () => {
  for (const [length, expected] of [[20, 2], [45, 2], [90, 2]]) {
    const document = generator.generateHaggadah({ ...baseProfile, length });
    const placements = document.sections.flatMap((section) =>
      section.quote ? [{ section, quote: section.quote }] : [],
    );
    assert.equal(placements.length, expected);
    assert.equal(new Set(placements.map(({ quote }) => quote.id)).size, expected);
    assert.ok(
      placements.every(({ section, quote }) => quote.sectionIds.includes(section.id)),
    );
  }
});

test("every single-theme profile receives quotes approved for that theme", () => {
  const themes = ["feminist", "lgbtq", "social-justice", "environment", "interfaith", "secular", "mindfulness", "traditional", "family-storytelling"];
  for (const theme of themes) {
    const document = generator.generateHaggadah({ ...baseProfile, length: 90, themes: [theme] });
    assert.ok(document.sections.filter((section) => section.quote).every((section) => section.quote.themes.includes(theme)), theme);
  }
});

test("beginner host guide explains setup and every seder plate element", () => {
  const document = generator.generateHaggadah(baseProfile);
  const guide = document.hostGuide.join(" ");
  for (const topic of ["four cups", "Matzah", "handwashings", "afikoman", "festive meal", "minutes before guests arrive"]) {
    assert.match(guide, new RegExp(topic, "i"));
  }
  assert.ok(document.sederPlateGuide.length >= 6);
  assert.ok(document.sederPlateGuide.some((entry) => entry.element === "Charoset"));
  assert.ok(document.sederPlateGuide.every((entry) => entry.element && entry.meaning && entry.ingredients && entry.preparation));
});

test("closing uses Jerusalem only for Traditional, with Social Justice taking precedence", () => {
  const cases = [
    { themes: ["traditional"], jerusalem: true },
    { themes: ["traditional", "family-storytelling"], jerusalem: true },
    { themes: ["social-justice"], jerusalem: false },
    { themes: ["traditional", "social-justice"], jerusalem: false },
    { themes: [], jerusalem: false },
  ];

  for (const { themes, jerusalem } of cases) {
    const document = generator.generateHaggadah({ ...baseProfile, themes });
    const text = document.sections.find((section) => section.id === "nirtzah").body.join(" ");
    assert.equal(/next year in jerusalem/i.test(text), jerusalem, themes.join(", "));
    assert.equal(/next year in peace/i.test(text), !jerusalem, themes.join(", "));
    assert.match(text, /every people|safety, dignity, equality, and peace|shared freedom/i);
    assert.deepEqual(editorial.validateEditorial(document), []);
  }
});

test("every Haggadah opens with newcomer orientation and turn-taking guidance", () => {
  for (const length of [20, 45, 90]) {
    const document = generator.generateHaggadah({ ...baseProfile, length });
    const opening = document.sections[0].body.slice(0, 3).join(" ");
    assert.match(opening, /fourteen steps|symbolic foods|Exodus story|festive meal/i);
    assert.match(opening, /take turns reading a paragraph or a whole section/i);
    assert.match(opening, /No prior knowledge|No Passover.*experience/i);
    assert.match(opening, /listen.*or pass|ask a question/i);
  }
});

test("both handwashings offer self-washing and partner-pouring in every length", () => {
  for (const length of [20, 45, 90]) {
    const document = generator.generateHaggadah({ ...baseProfile, length });
    for (const sectionId of ["urchatz", "rachtzah"]) {
      const section = document.sections.find((candidate) => candidate.id === sectionId);
      const copy = [...section.body, section.bridge].join(" ");
      assert.match(copy, /own hands|self-washing/i, `${sectionId} ${length}`);
      assert.match(copy, /partner|one another/i, `${sectionId} ${length}`);
      assert.match(copy, /basin/i, `${sectionId} ${length}`);
    }
  }
});

test("invitation explains that a seder is participatory and passing is welcome", () => {
  const document = generator.generateHaggadah(baseProfile);
  assert.match(document.invitation, /participatory Passover meal/i);
  assert.match(document.invitation, /take turns reading/i);
  assert.match(document.invitation, /No Passover or Hebrew experience is needed/i);
  assert.match(document.invitation, /listen, or pass/i);
});

test("kids receive section-specific roles and safe plague craft guidance", () => {
  const document = generator.generateHaggadah({ ...baseProfile, audience: "kids" });
  const maggid = document.sections.find((section) => section.id === "maggid");
  assert.match(maggid.bridge, /ten plague picture cards/i);
  assert.match(maggid.bridge, /paper and crayons/i);
  const guide = document.hostGuide.join(" ");
  assert.match(guide, /avoid small loose pieces/i);
  assert.match(guide, /rather than acting out anyone’s suffering/i);
});

test("editorial validation rejects structural, quote, bridge, framing, and blame violations", () => {
  const document = generator.generateHaggadah(baseProfile);

  const wrongOrder = structuredClone(document);
  [wrongOrder.sections[0], wrongOrder.sections[1]] = [
    wrongOrder.sections[1],
    wrongOrder.sections[0],
  ];
  assert.ok(
    editorial.validateEditorial(wrongOrder).some((error) =>
      error.includes("Section 1 must be kadesh"),
    ),
  );

  const alteredQuote = structuredClone(document);
  alteredQuote.sections.find((section) => section.quote).quote.text += " Not in the source.";
  assert.ok(
    editorial.validateEditorial(alteredQuote).some((error) =>
      error.includes("exactly match"),
    ),
  );

  const shortBridge = structuredClone(document);
  shortBridge.sections[0].bridge = "Too short.";
  assert.ok(
    editorial.validateEditorial(shortBridge).some((error) =>
      error.includes("Bridge for kadesh"),
    ),
  );

  const collectiveBlame = structuredClone(document);
  collectiveBlame.sections[0].body.push("All Palestinians are responsible.");
  assert.ok(
    editorial.validateEditorial(collectiveBlame).some((error) =>
      error.includes("collective blame"),
    ),
  );

  const unframed = structuredClone(document);
  unframed.profile.themes = ["traditional"];
  unframed.sections.forEach((section) => {
    section.body = section.body.filter(
      (paragraph) => !/shared freedom|every people|all who call the land home/i.test(paragraph),
    );
  });
  unframed.sections.at(-1).body = ["Next year in Jerusalem."];
  assert.ok(
    editorial.validateEditorial(unframed).some((error) =>
      error.includes("requires explicit inclusive"),
    ),
  );
});

test("model enhancements are allowlisted and revalidated", () => {
  const document = generator.generateHaggadah(baseProfile);
  const enhanced = generator.mergeModelEnhancement(document, {
    coverId: "moonlit-1",
    quoteIds: ["q-exodus-stranger", "q-avot-free"],
    bridges: {
      kadesh: "We enter this inherited story together, making room for honest questions and shared freedom.",
    },
  });

  assert.equal(enhanced.coverId, "moonlit-1");
  assert.equal(enhanced.sections.find((section) => section.id === "maggid").quote.id, "q-exodus-stranger");
  assert.deepEqual(editorial.validateEditorial(enhanced), []);
  assert.notEqual(enhanced, document);
  assert.notEqual(enhanced.sections[0], document.sections[0]);

  assert.throws(
    () =>
      generator.mergeModelEnhancement(document, {
        quoteIds: ["invented-quote"],
      }),
    /unknown or unapproved quote/,
  );
  assert.throws(
    () =>
      generator.mergeModelEnhancement(document, {
        bridges: { kadesh: "All Jews are responsible." },
      }),
    /Editorial validation failed/,
  );
  assert.throws(
    () =>
      generator.mergeModelEnhancement(document, {
        bridges: { kadesh: "Freedom is not a finished possession, but a practice renewed around this table." },
      }),
    /canned contrast template/,
  );
  assert.throws(
    () =>
      generator.mergeModelEnhancement(document, {
        quoteIds: ["q-thoreau"],
      }),
    /outside its approved context/,
  );
});
