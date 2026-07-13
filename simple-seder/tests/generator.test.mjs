import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { copyFile, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
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
      `${prefix}${specifier.endsWith(".js") || specifier.endsWith(".json") ? specifier : `${specifier}.js`}${suffix}`,
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
  compile("content/source-runtime.ts"),
  compile("content/generated/local-corpus/source-pack-loaders.ts"),
  compile("content/runtime-pack-adapter.ts"),
  compile("lib/types.ts"),
  compile("lib/editorial.ts"),
  compile("lib/generator.ts"),
]);
await mkdir(path.join(compiledRoot, "research"), { recursive: true });
await copyFile(
  new URL("research/source-runtime-index.json", projectRoot),
  path.join(compiledRoot, "research/source-runtime-index.json"),
);
await mkdir(path.join(compiledRoot, "content", "generated", "local-corpus"), { recursive: true });
await mkdir(path.join(compiledRoot, "content", "generated", "local-corpus", "source-packs"), { recursive: true });
const localSourcePackFiles = (await readdir(
  new URL("content/generated/local-corpus/source-packs/", projectRoot),
)).filter((filename) => filename.endsWith(".json"));
await Promise.all([
  copyFile(
    new URL("content/generated/local-corpus/source-module-catalog.json", projectRoot),
    path.join(compiledRoot, "content/generated/local-corpus/source-module-catalog.json"),
  ),
  copyFile(
    new URL("content/generated/local-corpus/local-corpus-manifest.json", projectRoot),
    path.join(compiledRoot, "content/generated/local-corpus/local-corpus-manifest.json"),
  ),
  ...localSourcePackFiles.map((filename) => copyFile(
    new URL(`content/generated/local-corpus/source-packs/${filename}`, projectRoot),
    path.join(compiledRoot, "content/generated/local-corpus/source-packs", filename),
  )),
]);

const generator = await import(
  new URL(`file://${path.join(compiledRoot, "lib/generator.js")}`).href
);
const editorial = await import(
  new URL(`file://${path.join(compiledRoot, "lib/editorial.js")}`).href
);
const pack = await import(
  new URL(`file://${path.join(compiledRoot, "content/pack.js")}`).href
);
const sourceRuntime = await import(
  new URL(`file://${path.join(compiledRoot, "content/source-runtime.js")}`).href
);
const runtimeAdapter = await import(
  new URL(`file://${path.join(compiledRoot, "content/runtime-pack-adapter.js")}`).href
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

async function syntheticComprehensivePackFixture({
  provenanceHash,
  exactText: exactTextOverride,
  packBeginnerContext,
  requiresExplicitOptIn = false,
  editorialGates = [],
} = {}) {
  const catalog = structuredClone(JSON.parse(
    await readFile(new URL("content/generated/local-corpus/source-module-catalog.json", projectRoot), "utf8"),
  ));
  const exactText = exactTextOverride ?? "At this telling, each person hears the Exodus story and considers how shared memory can guide practical work for freedom and dignity today.";
  const beginnerContext = "Read this reviewed source-order passage after briefly naming where it belongs in the Seder.";
  const wordCount = exactText.split(/\s+/u).length;
  const hash = provenanceHash ?? createHash("sha256").update(exactText, "utf8").digest("hex");
  const compactModule = {
    id: "synthetic-wandering-maggid-reviewed",
    sourceId: "wandering-is-over",
    family: "family-feminist",
    sectionIds: ["maggid"],
    sourceSectionIds: ["maggid"],
    insertionSectionId: "maggid",
    beginnerContext,
    themes: ["family-storytelling", "social-justice"],
    audience: ["mixed-ages", "adults"],
    tones: ["balanced"],
    lengthTiers: ["20", "45", "90"],
    seam: "story-reflection",
    wordCount,
    approvalStatus: "approved",
    runtimeEligible: true,
    provenanceHash: hash,
    beginnerSuitable: true,
    requiresExplicitOptIn,
    politicalRisk: "none",
    editorialGates,
    editorialReviewStatus: "local-agent-reviewed-demo",
    containsThirdPartyAttribution: false,
    evaluatorAttributionClear: true,
    approvalBasis: "local-source-dossier-review",
  };
  for (const source of catalog.sources) {
    source.modules = [0, 1].map((index) => ({
      ...compactModule,
      id: `synthetic-${source.sourceId}-${index + 1}`,
      sourceId: source.sourceId,
      family: source.family,
      themes: ["traditional"],
      provenanceHash: createHash("sha256").update(`${source.sourceId}:${index}`, "utf8").digest("hex"),
    }));
  }
  const wandering = catalog.sources.find((source) => source.sourceId === "wandering-is-over");
  wandering.modules = [compactModule, {
    ...compactModule,
    id: "synthetic-wandering-maggid-reviewed-two",
    provenanceHash: createHash("sha256").update("wandering-two", "utf8").digest("hex"),
  }];

  const packModule = {
    ...compactModule,
    exactText,
    beginnerContext: packBeginnerContext ?? beginnerContext,
    sourceLocation: "synthetic reviewed locator",
    locator: {},
    beginnerSuitable: true,
    requiresExplicitOptIn,
    politicalRisk: "none",
    editorialGates,
    sourcePresentedAttribution: [],
    attribution: {
      creator: "JewishBoston.com",
      containingSource: "The Wandering Is Over Haggadah",
      readerCredit: "From The Wandering Is Over Haggadah by JewishBoston.com.",
    },
    rights: {
      runtimeEligible: true,
      license: "approved demo reuse",
      conditions: ["Credit the containing Haggadah."],
    },
    editorialReviewStatus: "local-agent-reviewed-demo",
    approvalBasis: "local-source-dossier-review",
  };
  const calls = [];
  const loaders = Object.fromEntries(catalog.sources.map((source) => [
    source.sourceId,
    async () => {
      calls.push(source.sourceId);
      return {
        schemaVersion: "2.0.0",
        sourceId: source.sourceId,
        modules: source.sourceId === "wandering-is-over" ? [packModule] : [],
      };
    },
  ]));
  return {
    exactText,
    beginnerContext,
    compactModule,
    catalog,
    loaders,
    calls,
    manifest: {
      externalModelApiUsed: false,
      completeLocalCorpus: {
        sourceCount: 20,
        segmentCount: 1999,
        exactCharacterCount: 1_845_812,
        canonicalReconstructionVerified: true,
      },
      localEditorialReview: {
        reviewedSourceCount: 20,
        missingSourceIds: [],
        reviewedSequenceCount: 40,
        status: "complete-local-agent-review",
      },
      runtimePack: {
        sourceCount: 20,
        moduleCount: 40,
        exactCharacterCount: 50_000,
        maturity: "local-reviewed-demo-pack",
        activeRuntimeLoadingMode: "per-source-dynamic",
        comprehensiveLocalOrganization: true,
      },
    },
  };
}

test("peace-focused framing is universal and no political checkbox remains in the profile", async () => {
  const typesSource = await readFile(new URL("lib/types.ts", projectRoot), "utf8");
  assert.doesNotMatch(typesSource, /antiZionist/);
  assert.match(typesSource, /themes:\s*\[\]/);
});

test("the tracked runtime corpus distinguishes 20 editorial sources from two complete procedural backbones", () => {
  assert.deepEqual(sourceRuntime.runtimeSourceErrors, []);
  assert.equal(sourceRuntime.runtimeSources.length, 20);
  assert.deepEqual(
    sourceRuntime.runtimeSources
      .filter((source) => source.runtimeSpineAvailable)
      .map((source) => source.sourceId)
      .sort(),
    ["shir-geulah", "velveteen-rabbi"],
  );
  assert.equal(sourceRuntime.runtimeSourceIndex.cohesionPolicy.maximumSecondarySources, 2);
  assert.equal(sourceRuntime.runtimeSourceIndex.cohesionPolicy.compatibilityDirection, "dominant-to-secondary");
});

test("local runtime stays fail-closed and does not load source packs before all dossiers are complete", async () => {
  const fixture = await syntheticComprehensivePackFixture();
  const incompleteManifest = structuredClone(fixture.manifest);
  incompleteManifest.localEditorialReview.reviewedSourceCount = 19;
  incompleteManifest.localEditorialReview.missingSourceIds = ["traditional-core"];
  incompleteManifest.localEditorialReview.status = "in-progress";
  const loaded = await runtimeAdapter.loadRuntimeContextForProfile(
    baseProfile,
    "shir-geulah",
    {
      manifest: incompleteManifest,
      catalog: fixture.catalog,
      loaders: fixture.loaders,
    },
  );
  assert.equal(loaded.usedComprehensivePack, false);
  assert.equal(loaded.context.mode, "embedded-smoke-index");
  assert.deepEqual(fixture.calls, []);
});

test("the tracked complete local corpus activates reviewed source sequences", async () => {
  assert.equal(runtimeAdapter.comprehensiveRuntimeStatus.enabled, true,
    runtimeAdapter.comprehensiveRuntimeStatus.errors.join("\n"));
  const document = await generator.generateHaggadahWithRuntimePacks(baseProfile);
  assert.equal(document.runtimeContentMode, "per-source-dynamic");
  assert.notEqual(document.featuredSourceId, document.sourceMetrics.proceduralBackboneSourceId);
  assert.ok(document.runtimePassageCandidateIds.some((id) => id.startsWith("local-sequence-")));

  const loaded = await runtimeAdapter.loadRuntimeContextForProfile(
    baseProfile,
    document.sourceMetrics.proceduralBackboneSourceId,
    { featuredSourceId: document.featuredSourceId },
  );
  assert.equal(loaded.usedComprehensivePack, true, loaded.fallbackReasons.join("\n"));
  const insertedPassages = loaded.context.approvedPassages.filter((passage) =>
    document.sections.some((section) => section.passageIds.includes(passage.id)));
  assert.ok(insertedPassages.length > 0);
  for (const passage of insertedPassages) {
    const section = document.sections.find((candidate) => candidate.passageIds.includes(passage.id));
    const sourceIndex = section.body.indexOf(passage.exactText);
    assert.ok(sourceIndex > 0, passage.id);
    assert.equal(section.body[sourceIndex - 1], passage.beginnerContext, passage.id);
  }
});

test("complete local runtime loads only a featured pack and selects its exact reviewed sequence", async () => {
  const fixture = await syntheticComprehensivePackFixture();
  const shortProfile = { ...baseProfile, length: 20 };
  assert.deepEqual(
    runtimeAdapter.comprehensiveRuntimeGateErrors(
      fixture.manifest,
      fixture.catalog,
      Object.keys(fixture.loaders),
    ),
    [],
  );
  const loaded = await runtimeAdapter.loadRuntimeContextForProfile(
    shortProfile,
    "shir-geulah",
    {
      manifest: fixture.manifest,
      catalog: fixture.catalog,
      loaders: fixture.loaders,
    },
  );
  assert.equal(loaded.usedComprehensivePack, true, loaded.fallbackReasons.join("\n"));
  assert.equal(loaded.context.mode, "per-source-dynamic");
  assert.equal(loaded.featuredSourceId, "wandering-is-over");
  assert.deepEqual(fixture.calls, ["wandering-is-over"]);
  assert.equal(loaded.context.approvedPassages[0].exactText, fixture.exactText);

});

test("multiline reviewed source text remains byte-exact through dynamic-pack validation", async () => {
  const fixture = await syntheticComprehensivePackFixture({
    exactText: "The first source paragraph stays whole.\n\nThe second source paragraph remains in source order.",
  });
  const profile = { ...baseProfile, length: 20 };
  const loaded = await runtimeAdapter.loadRuntimeContextForProfile(profile, "shir-geulah", {
    manifest: fixture.manifest,
    catalog: fixture.catalog,
    loaders: fixture.loaders,
    featuredSourceId: "wandering-is-over",
  });
  assert.equal(loaded.usedComprehensivePack, true, loaded.fallbackReasons.join("\n"));
  assert.equal(loaded.context.approvedPassages[0].exactText, fixture.exactText);
  assert.equal(loaded.context.approvedPassages[0].beginnerContext, fixture.beginnerContext);
});

test("beginner context is integrity-checked against the compact reviewed catalog", async () => {
  const fixture = await syntheticComprehensivePackFixture({
    packBeginnerContext: "A changed context that was not approved in the compact catalog must be rejected.",
  });
  const loaded = await runtimeAdapter.loadRuntimeContextForProfile(
    { ...baseProfile, length: 20 },
    "shir-geulah",
    {
      manifest: fixture.manifest,
      catalog: fixture.catalog,
      loaders: fixture.loaders,
      featuredSourceId: "wandering-is-over",
    },
  );
  assert.equal(loaded.usedComprehensivePack, false);
  assert.match(loaded.fallbackReasons.join("\n"), /no exact approved module/i);
});

test("module-level source opt-ins fail closed even when the source has no global opt-in aliases", async () => {
  const fixture = await syntheticComprehensivePackFixture({
    requiresExplicitOptIn: true,
    editorialGates: ["historical-latin-specialist-opt-in"],
  });
  const blocked = await runtimeAdapter.loadRuntimeContextForProfile(
    { ...baseProfile, length: 20, customTheme: "" },
    "shir-geulah",
    {
      manifest: fixture.manifest,
      catalog: fixture.catalog,
      loaders: fixture.loaders,
      featuredSourceId: "wandering-is-over",
    },
  );
  assert.equal(blocked.usedComprehensivePack, false);
  assert.deepEqual(fixture.calls, []);

  const allowed = await runtimeAdapter.loadRuntimeContextForProfile(
    { ...baseProfile, length: 20, customTheme: "historical Latin specialist" },
    "shir-geulah",
    {
      manifest: fixture.manifest,
      catalog: fixture.catalog,
      loaders: fixture.loaders,
      featuredSourceId: "wandering-is-over",
    },
  );
  assert.equal(allowed.usedComprehensivePack, true, allowed.fallbackReasons.join("\n"));
});

test("editorial gate policy is explicit and unknown safety gates remain blocked", async () => {
  assert.deepEqual(
    runtimeAdapter.runtimeEditorialGatePolicy("social-justice-theme-only"),
    { disposition: "machine-enforced", evidence: "profile" },
  );
  assert.deepEqual(
    runtimeAdapter.runtimeEditorialGatePolicy("plain-language-context-required"),
    { disposition: "build-time-satisfied", evidence: "beginner-context" },
  );
  assert.equal(
    runtimeAdapter.runtimeEditorialGatePolicy("facsimile-visual-check-required").disposition,
    "unresolved",
  );
  assert.equal(
    runtimeAdapter.runtimeEditorialGatePolicy("future-unreviewed-safety-gate").disposition,
    "unresolved",
  );

  const fixture = await syntheticComprehensivePackFixture({
    editorialGates: ["future-unreviewed-safety-gate"],
  });
  const loaded = await runtimeAdapter.loadRuntimeContextForProfile(
    { ...baseProfile, length: 20 },
    "shir-geulah",
    {
      manifest: fixture.manifest,
      catalog: fixture.catalog,
      loaders: fixture.loaders,
      featuredSourceId: "wandering-is-over",
    },
  );
  assert.equal(loaded.usedComprehensivePack, false);
  assert.deepEqual(fixture.calls, []);
});

test("the tracked editorial-gate report keeps unresolved review work visible and fail-closed", () => {
  const report = runtimeAdapter.runtimeEditorialGateReport();
  assert.deepEqual(report.unresolved, [
    "age-appropriate-language-review",
    "cantillation-rendering-check",
    "checked-english-meaning-required",
    "embedded-franchise-and-prayer-rights-review",
    "embedded-franchise-rights-review",
    "embedded-rights-and-credit-review",
    "facsimile-visual-check-required",
    "hebrew-and-transliteration-render-check",
    "multilingual-render-check",
    "must-precede-all-other-source-sequences",
    "ocr-and-page-layout-check",
    "origin-story-fact-check",
    "rendered-page-ocr-check",
    "review-civic-and-civilizational-assumptions",
    "review-dated-theology-and-gender",
    "traditional-land-language-review",
    "traditional-land-lines-review",
    "translate-hebrew-excerpt-before-display",
  ]);
  assert.ok(report.blockedModuleIds.length > 0);
  assert.ok(report.machineEnforced.length > 0);
  assert.ok(report.buildTimeSatisfied.length > 0);
});

test("a local reviewed pack with altered exact text falls back to the smoke index", async () => {
  const fixture = await syntheticComprehensivePackFixture({ provenanceHash: "a".repeat(64) });
  const loaded = await runtimeAdapter.loadRuntimeContextForProfile(
    { ...baseProfile, length: 20 },
    "shir-geulah",
    {
      manifest: fixture.manifest,
      catalog: fixture.catalog,
      loaders: fixture.loaders,
    },
  );
  assert.equal(loaded.usedComprehensivePack, false);
  assert.equal(loaded.context.mode, "embedded-smoke-index");
  assert.match(loaded.fallbackReasons.join("\n"), /no exact approved module/i);
  assert.deepEqual(fixture.calls, ["wandering-is-over"]);
});

test("representative profile matrix can feature every approved editorial source", () => {
  if (sourceRuntime.approvedRuntimePassages.length === 0) return;
  const featured = new Set();
  const themes = Object.keys(pack.themeLabels);
  for (const length of [20, 45, 90]) {
    for (const audience of ["kids", "mixed", "adults"]) {
      for (const interaction of ["reflective", "balanced", "participatory"]) {
        for (const tone of ["playful", "balanced", "reverent"]) {
          for (const theme of themes) {
            const profile = {
              ...baseProfile,
              length,
              audience,
              interaction,
              tone,
              themes: [theme],
              customTheme: "",
            };
            const source = sourceRuntime.runtimeFeaturedSource(profile, "shir-geulah");
            if (source) featured.add(source.sourceId);
          }
        }
      }
    }
  }
  const fandom = sourceRuntime.runtimeFeaturedSource({
    ...baseProfile,
    length: 45,
    audience: "adults",
    interaction: "participatory",
    tone: "playful",
    themes: ["secular", "family-storytelling"],
    customTheme: "Battlestar Galactica seder",
  }, "shir-geulah");
  if (fandom) featured.add(fandom.sourceId);

  const expected = sourceRuntime.runtimeSources.map((source) => source.sourceId).sort();
  assert.deepEqual([...featured].sort(), expected);
});

test("featured-source assembly stays cohesive and preserves exact approved blocks", () => {
  if (sourceRuntime.approvedRuntimePassages.length === 0) return;
  for (const length of [20, 45, 90]) {
    for (const theme of Object.keys(pack.themeLabels)) {
      const profile = {
        ...baseProfile,
        length,
        audience: "adults",
        tone: theme === "mindfulness" ? "reverent" : "balanced",
        themes: [theme],
        customTheme: "",
      };
      const featured = sourceRuntime.runtimeFeaturedSource(profile, "shir-geulah");
      assert.ok(featured);
      const selected = sourceRuntime.selectRuntimePassages(
        profile,
        "shir-geulah",
        featured.sourceId,
      );
      const featuredSelections = selected.filter((item) => item.source.sourceId === featured.sourceId);
      const supportingSelections = selected.filter((item) => item.source.sourceId !== featured.sourceId);
      assert.ok(featured.sourceId === "shir-geulah" || featuredSelections.length >= 1);
      assert.ok(featuredSelections.length <= (length === 20 ? 2 : 3));
      assert.ok(supportingSelections.length <= (length === 20 ? 0 : 1));
      assert.ok(new Set(supportingSelections.map((item) => item.source.sourceId)).size <= 1);
      assert.equal(new Set(selected.map((item) => item.sectionId)).size, selected.length);
      for (const item of selected) {
        assert.equal(sourceRuntime.runtimePassageById(item.passage.id).exactText, item.passage.exactText);
        assert.ok(item.passage.sectionIds.includes(item.sectionId));
        assert.match(item.passage.provenanceHash, /^[a-f0-9]{64}$/);
        assert.ok(item.passage.locator.sourceLocation);
      }
    }
  }
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
    60,
  );
  assert.equal(first.editorialWarnings.length, 0);
  assert.match(first.id, /^haggadah-[a-z0-9]+$/);
  assert.equal(first.createdAt, "2027-04-21T00:00:00.000Z");
});

test("section times budget for live group rituals and stay coherent at every length", () => {
  for (const length of [20, 45, 90]) {
    const document = generator.generateHaggadah({ ...baseProfile, length });
    const minutes = Object.fromEntries(document.sections.map((section) => [section.id, section.minutes]));
    const total = document.sections.reduce((sum, section) => sum + section.minutes, 0);
    const range = generator.LIVE_PLANNING_RANGES[length];

    assert.ok(total >= range.minimum && total <= range.maximum);
    assert.deepEqual(minutes, generator.LIVE_SECTION_MINUTES[length]);
    assert.ok(Object.values(minutes).every((value) => value >= 2), `${length}: no live activity may be shown as one minute`);
    assert.ok(minutes.urchatz >= 3, `${length}: Urchatz must include actual washing time`);
    assert.ok(minutes.rachtzah >= 3, `${length}: Rachtzah must include actual washing time`);
    assert.ok(minutes.maggid >= 4, `${length}: Maggid must include story and plague activity`);
    assert.ok(minutes.tzafun >= 2, `${length}: Tzafun must include an afikoman search`);
    assert.ok(minutes.hallel >= 2, `${length}: Hallel must include communal song or response`);
    assert.equal(minutes["shulchan-orech"], 2, "the meal transition is timed; dinner remains additional");

    const guide = document.hostGuide.join(" ");
    assert.match(guide, new RegExp(`chose the ${length}-minute content tier`, "i"));
    assert.match(guide, new RegExp(`displayed small-table estimates total ${total} minutes`, "i"));
    assert.match(guide, new RegExp(`plan roughly ${range.label}`, "i"));
    assert.match(guide, /core readings, pouring, washing, dipping, plague activity, afikoman search, and songs/i);
    assert.match(guide, /festive dinner is additional/i);
    assert.match(guide, /each optional question.+2–5 minutes/i);
    assert.match(guide, /10–15 guests.+add at least 10–20 minutes/i);
    assert.match(guide, /at least 5 minutes for about 15 people or for ceremonial partner-pouring/i);
  }
});

test("concise tier stays within an audited small-table reading and action budget", async () => {
  const profiles = [
    { audience: "adults", tone: "balanced", language: "english", themes: ["social-justice"] },
    { audience: "mixed", tone: "reverent", language: "transliteration", themes: ["environment", "family-storytelling"] },
    { audience: "kids", tone: "playful", language: "english", themes: ["traditional"] },
  ];

  for (const profilePatch of profiles) {
    const document = await generator.generateHaggadahWithRuntimePacks({
      ...baseProfile,
      ...profilePatch,
      length: 20,
    });
    const audit = generator.auditConciseTiming(document);
    const range = generator.LIVE_PLANNING_RANGES[20];
    const optionalPrompts = document.sections.filter((section) => section.prompt);
    const selectedRuntimeIds = document.sections
      .flatMap((section) => section.passageIds)
      .filter((passageId) => document.runtimePassageCandidateIds.includes(passageId));

    assert.equal(document.sections.length, 14);
    assert.ok(audit.bodyWords <= 1_650, `${profilePatch.audience}: ${audit.bodyWords} body words`);
    assert.ok(audit.requiredSpokenWords <= 1_800, `${profilePatch.audience}: ${audit.requiredSpokenWords} required spoken words`);
    assert.ok(audit.totalRenderedWords <= 1_900, `${profilePatch.audience}: ${audit.totalRenderedWords} rendered words`);
    assert.ok(audit.optionalPromptWords > 0);
    assert.equal(audit.totalRenderedWords, audit.requiredSpokenWords + audit.optionalPromptWords);
    assert.ok(audit.realisticActionMinutes >= 20);
    assert.ok(audit.estimatedCoreLiveMinutes >= range.minimum);
    assert.ok(audit.estimatedCoreLiveMinutes <= range.maximum);
    assert.equal(audit.displayedLiveMinutes, 34);
    assert.ok(optionalPrompts.length >= 2 && optionalPrompts.length <= 5);
    assert.ok(selectedRuntimeIds.length <= 1, "the concise tier may add at most one reviewed featured insert");
    assert.ok(document.sourceMetrics.borrowedWordShare >= 0.5);
  }

  assert.ok(generator.CONCISE_ACTION_MINUTES.urchatz >= 2.5);
  assert.ok(generator.CONCISE_ACTION_MINUTES.rachtzah >= 2.5);
  assert.ok(generator.CONCISE_ACTION_MINUTES.maggid >= 2.5);
  assert.ok(generator.CONCISE_ACTION_MINUTES.tzafun >= 2);
});

test("uses one complete procedural backbone, a featured source, and a reviewed-wording majority", () => {
  const shir = generator.generateHaggadah({ ...baseProfile, length: 20 });
  const velveteen = generator.generateHaggadah({
    ...baseProfile,
    length: 45,
    audience: "adults",
    tone: "reverent",
    themes: ["family-storytelling", "environment"],
  });

  assert.equal(shir.sourceSpineId, "shir-geulah-primary");
  assert.equal(shir.sourceMetrics.proceduralBackboneSourceId, "shir-geulah");
  assert.equal(velveteen.sourceSpineId, "velveteen-rabbi-primary");
  assert.equal(velveteen.sourceMetrics.proceduralBackboneSourceId, "velveteen-rabbi");

  for (const document of [shir, velveteen]) {
    assert.ok(document.sourceMetrics.borrowedWordShare >= 0.5);
    assert.ok(document.sourceMetrics.borrowedWords > document.sourceMetrics.houseWords);
    assert.ok(document.sections.every((section) => new Set(section.sourceIds).size === section.sourceIds.length));
    assert.equal(document.featuredSourceId, document.sourceMetrics.featuredSourceId);
    assert.ok(document.sourceMetrics.featuredSourceWords > 0);
    assert.ok(document.sourceMetrics.supportingSourceIds.length <= 1);
    assert.ok(document.sections.every((section) => section.sourceIds.includes(document.sourceMetrics.proceduralBackboneSourceId)));
    assert.ok(document.sections.every((section) => section.sourceIds.every((id) => pack.sourceCatalog.some((source) => source.id === id))));
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
  const concisePrompts = shortKids.sections.map((section) => section.prompt).filter(Boolean);
  const conciseBridges = shortKids.sections.map((section) => section.bridge).filter(Boolean);
  assert.ok(concisePrompts.length >= 2 && concisePrompts.length <= 5);
  assert.ok(concisePrompts.every((prompt) => prompt.length > 10 && !prompt.startsWith("Kid-friendly question:")));
  assert.equal(conciseBridges.length, 3);
  assert.ok(conciseBridges.every((bridge) => bridge.length > 20 && !bridge.startsWith("For younger guests:")));
  const kidCopy = shortKids.sections
    .flatMap((section) => [...section.body, section.bridge, section.prompt])
    .join(" ");
  assert.doesNotMatch(kidCopy, /sea is not a prop|set down|renewal|repair.not perfection/i);
  assert.match(shortKids.sections.find((section) => section.id === "urchatz").body.join(" "), /own hands.+partner.+basin/i);
  const conciseYachatz = shortKids.sections.find((section) => section.id === "yachatz").body.join(" ");
  assert.match(conciseYachatz, /children|other guests/i);
  assert.match(conciseYachatz, /afikoman/i);
  assert.match(conciseYachatz, /prize|chooses a song/i);
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

test("Maggid narration is complete, genuinely length-specific, and never announces an outline", () => {
  const documents = new Map([20, 45, 90].map((length) => [
    length,
    generator.generateHaggadah({
      ...baseProfile,
      length,
      audience: "mixed",
      themes: ["family-storytelling"],
    }),
  ]));
  const narrativeWords = [];

  for (const length of [20, 45, 90]) {
    const document = documents.get(length);
    const maggid = document.sections.find((section) => section.id === "maggid");
    const text = maggid.body.join(" ");
    const narrative = pack.maggidNarratives[length];
    assert.ok(narrative.approved);
    assert.equal(narrative.rights, "original");
    assert.ok(narrative.paragraphs.every((paragraph) => maggid.body.includes(paragraph)));
    assert.doesNotMatch(text, /Here is the story(?:’s|'s) outline/i);
    for (const beat of [
      /Pharaoh.+enslaved/is,
      /Shifra and Puah/is,
      /Moses.+fled/is,
      /burning bush|bush that burned/is,
      /ten plagues/is,
      /left in haste|hurried departure|prepared to leave quickly/is,
      /sea.+crossed|crossed.+water/is,
      /wilderness/is,
    ]) assert.match(text, beat, `${length}: ${beat}`);
    narrativeWords.push(narrative.paragraphs.join(" ").split(/\s+/).length);
  }

  assert.ok(narrativeWords[0] < narrativeWords[1]);
  assert.ok(narrativeWords[1] < narrativeWords[2]);
  assert.match(documents.get(45).sections.find((section) => section.id === "maggid").body.join(" "), /Joseph’s family|increasing the labor|Miriam and the women sang/i);
  assert.match(documents.get(90).sections.find((section) => section.id === "maggid").body.join(" "), /withholding straw|received manna|covenant of responsibilities/i);
});

test("selected themes receive approved transitions and context-rich prompts", () => {
  const themes = Object.keys(pack.themeMoments);
  for (const theme of themes) {
    const document = generator.generateHaggadah({
      ...baseProfile,
      length: 45,
      audience: "mixed",
      themes: [theme],
    });
    const moments = pack.themeMoments[theme];
    const applied = moments.filter((moment) => {
      const section = document.sections.find((candidate) => candidate.id === moment.sectionId);
      return section?.bridge.includes(moment.transition) && section.prompt.includes(moment.kidPrompt);
    });
    assert.equal(applied.length, 3, `${theme} should receive all three predeveloped moments when selected alone`);
    assert.ok(document.sections.filter((section) => section.quote).every((section) => section.quote.themes.includes(theme)), theme);
  }

  const selected = ["feminist", "environment", "mindfulness"];
  const combined = generator.generateHaggadah({ ...baseProfile, length: 45, audience: "mixed", themes: selected });
  for (const theme of selected) {
    assert.ok(
      pack.themeMoments[theme].some((moment) => {
        const section = combined.sections.find((candidate) => candidate.id === moment.sectionId);
        return section?.bridge.includes(moment.transition) && section.prompt.includes(moment.kidPrompt);
      }),
      `${theme} needs a visible transition and prompt`,
    );
  }
});

test("every three-theme combination gives each selected theme a distinct visible moment", () => {
  const themes = Object.keys(pack.themeMoments);
  for (let first = 0; first < themes.length - 2; first += 1) {
    for (let second = first + 1; second < themes.length - 1; second += 1) {
      for (let third = second + 1; third < themes.length; third += 1) {
        const selected = [themes[first], themes[second], themes[third]];
        const document = generator.generateHaggadah({
          ...baseProfile,
          length: 45,
          audience: "mixed",
          themes: selected,
        });
        const matchedSections = new Set();
        for (const theme of selected) {
          const matched = pack.themeMoments[theme].find((moment) => {
            const section = document.sections.find((candidate) => candidate.id === moment.sectionId);
            return section?.bridge.includes(moment.transition) && section.prompt.includes(moment.kidPrompt);
          });
          assert.ok(matched, `${selected.join(", ")}: missing ${theme}`);
          matchedSections.add(matched.sectionId);
        }
        assert.equal(matchedSections.size, 3, `${selected.join(", ")}: moments must occupy distinct sections`);
      }
    }
  }
});

test("mindfulness adds concrete contemplative practice and at most one verified external text", () => {
  const document = generator.generateHaggadah({
    ...baseProfile,
    length: 90,
    audience: "adults",
    tone: "reverent",
    themes: ["mindfulness"],
  });
  const fullText = document.sections.flatMap((section) => [section.bridge, section.prompt]).join(" ");
  for (const phrase of ["water’s temperature", "first sharp sensation", "one quiet breath"]) {
    assert.match(fullText, new RegExp(phrase.replace("’", "[’']"), "i"));
  }
  const external = document.sections.flatMap((section) => section.quote?.externalContemplative ? [section] : []);
  assert.equal(external.length, 1);
  assert.equal(external[0].id, "nirtzah");
  assert.ok(["Buddhist", "Hindu", "Vedantic"].includes(external[0].quote.traditionLabel));
  assert.match(external[0].quoteContext, /Buddhist|Hindu|Vedantic/);
  assert.equal(editorial.validateEditorial(document).length, 0);
});

test("external contemplative catalog entries preserve verified historical translations and narrow seams", () => {
  const byId = Object.fromEntries(pack.quoteCatalog.map((quote) => [quote.id, quote]));
  assert.equal(byId["q-dhammapada-hatred"].text, "For hatred does not cease by hatred at any time: hatred ceases by love, this is an old rule.");
  assert.equal(byId["q-gita-right-action"].text, "Find full reward Of doing right in right! Let right deeds be Thy motive, not the fruit which comes from them.");
  assert.equal(byId["q-isha-self"].text, "He who sees all beings in the Self and the Self in all beings, he never turns away from It (the Self).");
  for (const id of ["q-dhammapada-hatred", "q-gita-right-action", "q-isha-self"]) {
    const quote = byId[id];
    assert.equal(quote.rights, "public-domain");
    assert.deepEqual(quote.sectionIds, ["nirtzah"]);
    assert.equal(quote.externalContemplative, true);
    assert.ok(quote.placementNote.length > 30);
    assert.ok(editorial.CONTEXTUAL_QUOTE_IDS.nirtzah.has(id));
    assert.ok(!editorial.CONTEXTUAL_QUOTE_IDS.maggid.has(id));
  }
});

test("external contemplative quotations never enter profiles without mindfulness", () => {
  for (const theme of ["interfaith", "social-justice", "environment"]) {
    const document = generator.generateHaggadah({ ...baseProfile, themes: [theme] });
    assert.equal(document.sections.filter((section) => section.quote?.externalContemplative).length, 0, theme);
  }
  const interfaith = generator.generateHaggadah({ ...baseProfile, themes: ["interfaith"] });
  assert.throws(
    () => generator.mergeModelEnhancement(interfaith, { quoteIds: ["q-exodus-stranger", "q-dhammapada-hatred"] }),
    /without the Mindfulness & spiritual depth theme/,
  );
});

test("section source IDs include the procedural backbone, featured source, and traditional liturgy without duplicates", () => {
  const document = generator.generateHaggadah({ ...baseProfile, language: "transliteration" });
  const catalogIds = new Set(pack.sourceCatalog.map((source) => source.id));
  const usedIds = new Set(document.sections.flatMap((section) => section.sourceIds));
  assert.ok(usedIds.has(document.sourceMetrics.proceduralBackboneSourceId));
  assert.ok(usedIds.has("traditional-core"));
  assert.ok(usedIds.has(document.featuredSourceId));
  assert.ok(document.sourceMetrics.supportingSourceIds.every((sourceId) => usedIds.has(sourceId)));
  for (const section of document.sections) {
    assert.equal(section.sourceIds.length, new Set(section.sourceIds).size, section.id);
    assert.ok(section.sourceIds.includes(document.sourceMetrics.proceduralBackboneSourceId), section.id);
    assert.ok(section.sourceIds.every((id) => catalogIds.has(id)), section.id);
  }
  const quoteCredits = document.sections.flatMap((section) => section.quote ? [`${section.quote.work}|${section.quote.author}|${section.quote.sourceUrl}`] : []);
  assert.equal(quoteCredits.length, new Set(quoteCredits).size);
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
  const activePrompts = Object.values(prompts).filter(Boolean);
  assert.equal(prompts.urchatz, "Everyone can answer or pass: What is one way people can keep water clean and available for others?");
  assert.ok(activePrompts.length >= 2 && activePrompts.length <= 5);
  assert.ok(activePrompts.every((prompt) => /^Everyone can answer or pass:/i.test(prompt)));
  assert.doesNotMatch(activePrompts.join(" "), /renewal|repair.not perfection|set down/i);
  assert.doesNotMatch(activePrompts.join(" "), /What does the matzah taste and feel like/i);
});

test("20-minute kids, mixed, and adults versions supply every missing ritual essential", () => {
  for (const audience of ["kids", "mixed", "adults"]) {
    const document = generator.generateHaggadah({
      ...baseProfile,
      length: 20,
      audience,
      language: "english",
      themes: ["environment", "family-storytelling"],
    });
    const section = (id) => document.sections.find((candidate) => candidate.id === id);
    const kadesh = section("kadesh").body.join(" ");
    const maggid = section("maggid").body.join(" ");
    const rachtzah = [
      ...section("rachtzah").body,
      section("rachtzah").bridge,
      section("rachtzah").prompt,
    ].join(" ");
    const hallel = section("hallel").body.join(" ");
    const nirtzah = section("nirtzah").body.join(" ");

    assert.match(kadesh, /first cup of wine or grape juice/i, audience);
    assert.match(kadesh, /each person lifts their own cup/i, audience);
    assert.match(kadesh, /creates the fruit of the vine/i, audience);
    assert.match(maggid, /pour the second cup of wine or grape juice/i, audience);
    assert.match(maggid, /Why is this night different from all other nights/i, audience);
    assert.match(maggid, /blood, frogs, lice, wild beasts, livestock disease, boils, hail, locusts, darkness, and death of the firstborn/i, audience);
    assert.match(maggid, /Dayenu means.+everyone answers/s, audience);
    assert.match(maggid, /lifts their own second cup.+drink together/s, audience);
    assert.match(rachtzah, /remain quiet|stay quiet/i, audience);
    assert.match(rachtzah, /after washing.+until everyone has blessed and eaten the matzah|after you eat the matzah/is, audience);
    assert.match(hallel, /No one needs to know a tune/i, audience);
    assert.match(hallel, /May love and freedom grow/i, audience);
    assert.match(hallel, /fourth cup with wine or grape juice/i, audience);
    assert.match(nirtzah, /The seder has concluded as it should/i, audience);
    assert.doesNotMatch(nirtzah, /count seven weeks|omer is a measure|diversity of life/i, audience);

    const guide = document.hostGuide.join(" ");
    assert.match(guide, /festive dinner is additional/i, audience);
    assert.match(guide, /first opens Kadesh.+second.+Maggid.+third.+fourth.+Hallel/is, audience);
    assert.match(guide, /Miriam’s cup is optional/i, audience);
  }
});

test("every runtime section names enough of the actor, object, and action for a first-time host", () => {
  const document = generator.generateHaggadah({
    ...baseProfile,
    length: 20,
    audience: "mixed",
    language: "english",
  });
  const required = {
    kadesh: [/each person/i, /cup of wine or grape juice/i, /lifts?.+sip/i],
    urchatz: [/each person|partner/i, /pitcher.+basin.+towel/is, /pour.+hands/i],
    karpas: [/each person/i, /parsley|celery|green vegetable/i, /dip.+salt water.+eat/is],
    yachatz: [/middle of the three matzot/i, /wrap and hide.+afikoman/is, /finder.+prize/i],
    maggid: [/youngest willing guest|anyone who wishes/i, /second cup of wine or grape juice/i, /move one drop.+for each/is],
    rachtzah: [/guests|partner/i, /hands.+basin/is, /wash.+dry.+return/is],
    "motzi-matzah": [/host/i, /matzah/i, /pass.+every person.+eat/is],
    maror: [/each person/i, /bitter herb.+charoset/is, /dip.+taste/is],
    korech: [/each person|anyone/i, /maror.+charoset.+matzah/is, /make.+sandwich|place.+between/is],
    "shulchan-orech": [/guests|people/i, /dishes.+allergens/is, /begin the meal|serve.+meal/is],
    tzafun: [/children|guests/i, /afikoman/i, /find.+prize.+divide.+eat/is],
    barech: [/each person/i, /third cup.+wine or grape juice/is, /lifts?.+drinks?/is],
    hallel: [/one person.+everyone/is, /fourth cup.+wine or grape juice/is, /read.+answer|sing.+hum.+listen/is],
    nirtzah: [/each person/i, /closing hope|seder/i, /name.+carry/is],
  };

  for (const section of document.sections) {
    const copy = [...section.body, section.bridge, section.prompt].join(" ");
    for (const pattern of required[section.id]) {
      assert.match(copy, pattern, `${section.id}: ${pattern}`);
    }
  }
});

test("English-only mode never points to an absent blessing", () => {
  const document = generator.generateHaggadah({
    ...baseProfile,
    length: 20,
    audience: "adults",
    language: "english",
    tone: "reverent",
    themes: ["environment", "family-storytelling"],
  });
  const expectedBlessingSections = [
    "kadesh", "karpas", "maggid", "rachtzah", "motzi-matzah", "maror", "barech", "hallel",
  ];
  for (const sectionId of expectedBlessingSections) {
    const copy = document.sections.find((section) => section.id === sectionId).body.join(" ");
    assert.match(copy, /Blessed are You|Praised are You/i, sectionId);
  }
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
    assert.ok(
      placements.every(({ section, quote }) => editorial.CONTEXTUAL_QUOTE_IDS[section.id].has(quote.id)),
    );
  }
});

test("environment and family quotes pass exact-seam review rather than theme matching alone", () => {
  const document = generator.generateHaggadah({
    ...baseProfile,
    length: 20,
    audience: "adults",
    tone: "reverent",
    themes: ["environment", "family-storytelling"],
  });
  const placements = document.sections.filter((section) => section.quote);
  assert.deepEqual(placements.map((section) => section.id), ["maggid", "nirtzah"]);
  assert.ok(placements.every((section) => editorial.CONTEXTUAL_QUOTE_IDS[section.id].has(section.quote.id)));
  assert.doesNotMatch(placements.map((section) => section.quote.text).join(" "), /Be yourself|hitched to everything else/i);
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
    assert.match(opening, /take turns reading (?:a )?paragraphs? or (?:a )?whole sections?/i);
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
  assert.match(document.invitation, /^Leah invites you/);
  assert.match(document.invitation, /on April 21, 2027/);
  assert.doesNotMatch(document.invitation, /2027-04-21/);
  assert.match(document.invitation, /participatory Passover meal/i);
  assert.match(document.invitation, /take turns reading/i);
  assert.match(document.invitation, /No Passover or Hebrew experience is needed/i);
  assert.match(document.invitation, /listen, or pass/i);
  assert.match(document.invitation, /[.!?][”’)]?$/);
});

test("invitation handles missing host or date without placeholder-like wording", () => {
  const noHost = generator.generateHaggadah({ ...baseProfile, hostName: "" });
  const noDate = generator.generateHaggadah({ ...baseProfile, sederDate: "" });
  const neither = generator.generateHaggadah({ ...baseProfile, hostName: "", sederDate: "" });

  assert.match(noHost.invitation, /^You’re invited.+on April 21, 2027/);
  assert.match(noDate.invitation, /^Leah invites you.+on Passover night/);
  assert.match(neither.invitation, /^You’re invited.+on Passover night/);
  for (const invitation of [noHost.invitation, noDate.invitation, neither.invitation]) {
    assert.doesNotMatch(invitation, /your host|undefined|invalid date/i);
  }
});

test("every invitation is complete across profile combinations", () => {
  for (const length of [20, 45, 90]) {
    for (const audience of ["kids", "mixed", "adults"]) {
      const document = generator.generateHaggadah({
        ...baseProfile,
        length,
        audience,
        themes: audience === "kids" ? ["traditional"] : ["mindfulness", "interfaith"],
        customTheme: audience === "mixed" ? "welcoming a first-time guest" : "",
      });
      assert.match(document.invitation, /[.!?][”’)]?$/, `${length} ${audience}`);
      assert.doesNotMatch(document.invitation, /(?:\.\.\.|…)$|\b(?:and|or|with|to)$/i, `${length} ${audience}`);
    }
  }
});

test("kids receive section-specific roles and safe plague craft guidance", () => {
  const document = generator.generateHaggadah({ ...baseProfile, audience: "kids" });
  const maggid = document.sections.find((section) => section.id === "maggid");
  assert.match(maggid.bridge, /ten plague picture cards/i);
  assert.match(maggid.bridge, /crayons on paper/i);
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

  const broadThemeOnly = structuredClone(document);
  const maggid = broadThemeOnly.sections.find((section) => section.id === "maggid");
  maggid.quote = pack.quoteCatalog.find((quote) => quote.id === "q-muir");
  assert.ok(
    editorial.validateEditorial(broadThemeOnly).some((error) =>
      error.includes("seam-specific review"),
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
    () => generator.mergeModelEnhancement(document, { passageIds: ["invented-passage"] }),
    /outside its allowlisted shortlist/,
  );
  const selectedPassageIds = document.sections.flatMap((section) =>
    section.passageIds.filter((passageId) => sourceRuntime.runtimePassageById(passageId)),
  );
  if (selectedPassageIds.length > 0) {
    const reranked = generator.mergeModelEnhancement(document, {
      passageIds: selectedPassageIds,
    });
    for (const passageId of selectedPassageIds) {
      const passage = sourceRuntime.runtimePassageById(passageId);
      const section = reranked.sections.find((item) => item.passageIds.includes(passageId));
      assert.ok(section);
      assert.ok(section.body.includes(passage.exactText));
      assert.ok(section.sourceIds.includes(passage.sourceId));
    }
    assert.equal(reranked.featuredSourceId, document.featuredSourceId);
    assert.deepEqual(editorial.validateEditorial(reranked), []);
  }
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
