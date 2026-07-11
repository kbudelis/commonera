#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const expectedSectionOrder = [
  "kadesh", "urchatz", "karpas", "yachatz", "maggid", "rachtzah",
  "motzi-matzah", "maror", "korech", "shulchan-orech", "tzafun",
  "barech", "hallel", "nirtzah",
];
const expectedTones = ["playful", "balanced", "reverent"];

function duplicateValues(values) {
  const seen = new Set();
  return [...new Set(values.filter((value) => seen.has(value) || !seen.add(value)))];
}

function isHttps(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function nonempty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateContent(pack, options = {}) {
  const coverRoot = options.coverRoot ?? path.join(projectRoot, "public");
  const errors = [];
  const warnings = [];
  const addError = (condition, message) => { if (!condition) errors.push(message); };

  const themeIds = Object.keys(pack.themeLabels ?? {});
  addError(themeIds.length === 9, `Expected 9 themes; found ${themeIds.length}.`);
  addError(
    JSON.stringify(Object.keys(pack.themeDescriptions ?? {}).sort()) === JSON.stringify([...themeIds].sort()),
    "Theme descriptions must resolve exactly to the theme IDs.",
  );

  const insertIds = [];
  for (const theme of themeIds) {
    const inserts = pack.themeInserts?.[theme];
    addError(Array.isArray(inserts), `Theme ${theme} has no insert collection.`);
    if (!Array.isArray(inserts)) continue;
    addError(inserts.length === 12, `Theme ${theme} must have 12 inserts; found ${inserts.length}.`);
    for (const insert of inserts) {
      insertIds.push(insert?.id);
      addError(nonempty(insert?.id) && nonempty(insert?.text), `Theme ${theme} contains an incomplete insert.`);
      addError(insert?.theme === theme, `Insert ${insert?.id ?? "(missing ID)"} resolves to the wrong theme.`);
      addError(insert?.approved === true, `Insert ${insert?.id ?? "(missing ID)"} is not approved.`);
    }
  }
  for (const id of duplicateValues(insertIds)) errors.push(`Duplicate insert ID: ${id}.`);

  const sections = pack.sectionBlueprints ?? [];
  addError(sections.length === 14, `Expected 14 sections; found ${sections.length}.`);
  addError(
    JSON.stringify(sections.map((section) => section.id)) === JSON.stringify(expectedSectionOrder),
    "Sections must follow the complete traditional 14-section order.",
  );
  for (const id of duplicateValues(sections.map((section) => section.id))) errors.push(`Duplicate section ID: ${id}.`);
  for (const section of sections) {
    addError(
      [section.id, section.transliteration, section.title, section.ritual, section.prompt].every(nonempty),
      `Section ${section.id ?? "(missing ID)"} is missing required copy.`,
    );
    for (const length of ["short", "medium", "full"]) {
      addError(
        Array.isArray(section[length]) && section[length].length > 0 && section[length].every(nonempty),
        `Section ${section.id ?? "(missing ID)"} needs nonempty ${length} copy.`,
      );
    }
    addError(Array.isArray(section.sourceIds) && section.sourceIds.length > 0, `Section ${section.id} has no source IDs.`);
  }

  const passages = pack.foundationalPassages ?? [];
  addError(passages.length === sections.length, `Expected one foundational passage per section; found ${passages.length}.`);
  for (const id of duplicateValues(passages.map((passage) => passage.id))) errors.push(`Duplicate foundational passage ID: ${id}.`);
  for (const passage of passages) {
    addError(
      [passage.id, passage.sectionId, passage.text, passage.sourceId, passage.treatment, passage.locator, passage.attribution].every(nonempty),
      `Foundational passage ${passage.id ?? "(missing ID)"} has incomplete provenance.`,
    );
    addError(sections.some((section) => section.id === passage.sectionId), `Foundational passage ${passage.id} references unknown section ${passage.sectionId}.`);
  }

  const toneIds = Object.keys(pack.toneOpeners ?? {});
  addError(
    JSON.stringify(toneIds.sort()) === JSON.stringify([...expectedTones].sort()),
    `Expected exactly 3 tones (${expectedTones.join(", ")}); found ${toneIds.join(", ")}.`,
  );
  for (const tone of expectedTones) {
    const openers = pack.toneOpeners?.[tone];
    addError(Array.isArray(openers) && openers.length > 0 && openers.every(nonempty), `Tone ${tone} has no valid openers.`);
  }

  const quotes = pack.quoteCatalog ?? [];
  addError(quotes.length > 0, "Quote catalog must not be empty.");
  for (const id of duplicateValues(quotes.map((quote) => quote.id))) errors.push(`Duplicate quote ID: ${id}.`);
  for (const quote of quotes) {
    addError(
      [quote.id, quote.text, quote.author, quote.work, quote.year, quote.rights].every(nonempty),
      `Quote ${quote.id ?? "(missing ID)"} has incomplete attribution or rights metadata.`,
    );
    addError(quote.approved === true, `Quote ${quote.id ?? "(missing ID)"} is not approved.`);
    addError(isHttps(quote.sourceUrl), `Quote ${quote.id ?? "(missing ID)"} must use an HTTPS source URL.`);
    addError(
      Array.isArray(quote.themes) && quote.themes.length > 0 && quote.themes.every((theme) => themeIds.includes(theme)),
      `Quote ${quote.id ?? "(missing ID)"} has an unknown or missing theme.`,
    );
    addError(
      Array.isArray(quote.sectionIds) && quote.sectionIds.length > 0 && quote.sectionIds.every((sectionId) => expectedSectionOrder.includes(sectionId)),
      `Quote ${quote.id ?? "(missing ID)"} has an unknown or missing approved section context.`,
    );
    if (quote.rights === "owner-approved-demo") {
      warnings.push(`Quote ${quote.id}: owner-approved demo excerpt; print and review permission before public distribution.`);
    }
  }

  const sources = pack.sourceCatalog ?? [];
  const sourceIds = new Set(sources.map((source) => source.id));
  addError(sources.length > 0, "Source catalog must not be empty.");
  for (const id of duplicateValues(sources.map((source) => source.id))) errors.push(`Duplicate source ID: ${id}.`);
  for (const source of sources) {
    addError(
      [source.id, source.title, source.creator, source.rights].every(nonempty),
      `Source ${source.id ?? "(missing ID)"} has incomplete attribution or rights metadata.`,
    );
    addError(isHttps(source.url), `Source ${source.id ?? "(missing ID)"} must use an HTTPS URL.`);
    addError(
      /(?:\bCC(?:0|\s+BY)|public[ -]domain|explicit permission|reuse|borrow)/i.test(source.rights ?? ""),
      `Source ${source.id ?? "(missing ID)"} needs a documented open license, public-domain basis, or explicit reuse permission.`,
    );
    if (/explicit permission|reuse|borrow|noncommercial|please don.t sell/i.test(source.rights ?? "")) {
      warnings.push(`Source ${source.id}: custom or permission-specific terms; print and follow its attribution and use constraints.`);
    }
    if (/embedded|third-party|separately credited/i.test(source.rights ?? "")) {
      warnings.push(`Source ${source.id}: embedded third-party works require independent item-level clearance.`);
    }
  }
  for (const section of sections) {
    for (const sourceId of section.sourceIds ?? []) {
      addError(sourceIds.has(sourceId), `Section ${section.id} references unknown source ID ${sourceId}.`);
    }
  }
  for (const passage of passages) {
    addError(sourceIds.has(passage.sourceId), `Foundational passage ${passage.id} references unknown source ID ${passage.sourceId}.`);
  }

  const covers = pack.coverOptions ?? [];
  addError(covers.length >= 8, `Expected at least 8 genuinely distinct cover concepts; found ${covers.length}.`);
  for (const id of duplicateValues(covers.map((cover) => cover.id))) errors.push(`Duplicate cover ID: ${id}.`);
  const masterImages = [...new Set(covers.map((cover) => cover.image))];
  addError(masterImages.length === covers.length, `Every cover option must use distinct artwork; found ${masterImages.length} artworks for ${covers.length} options.`);
  for (const image of masterImages) {
    const variants = covers.filter((cover) => cover.image === image);
    addError(variants.length === 1, `Cover artwork ${image} must appear only once; found ${variants.length} variants.`);
    addError(typeof image === "string" && image.startsWith("/covers/"), `Cover master path ${image} must be under /covers/.`);
    addError(existsSync(path.join(coverRoot, image.replace(/^\//, ""))), `Cover master asset is missing: ${image}.`);
  }
  for (const cover of covers) {
    addError(
      nonempty(cover.id) && nonempty(cover.name) && nonempty(cover.filter) && nonempty(cover.position),
      `Cover ${cover.id ?? "(missing ID)"} has incomplete treatment metadata.`,
    );
    addError(
      Array.isArray(cover.themes) && cover.themes.length > 0 && cover.themes.every((theme) => themeIds.includes(theme)),
      `Cover ${cover.id ?? "(missing ID)"} has an unknown or missing theme.`,
    );
  }

  return {
    errors,
    warnings: [...new Set(warnings)],
    counts: {
      themes: themeIds.length,
      sections: sections.length,
      inserts: insertIds.length,
      tones: toneIds.length,
      quotes: quotes.length,
      sources: sources.length,
      covers: covers.length,
      coverMasters: masterImages.length,
    },
  };
}

async function loadPack() {
  const source = await readFile(path.join(projectRoot, "content/pack.ts"), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
    fileName: "content/pack.ts",
  }).outputText.replace(/from "\.\/quotes-expanded";/, 'from "./quotes-expanded.mjs";');
  const expandedSource = await readFile(path.join(projectRoot, "content/quotes-expanded.ts"), "utf8");
  const expandedOutput = ts.transpileModule(expandedSource, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
    fileName: "content/quotes-expanded.ts",
  }).outputText;
  const directory = await mkdtemp(path.join(tmpdir(), "pesach-content-"));
  const modulePath = path.join(directory, "pack.mjs");
  await writeFile(modulePath, output);
  await writeFile(path.join(directory, "quotes-expanded.mjs"), expandedOutput);
  try {
    return await import(`${pathToFileURL(modulePath).href}?validation=${Date.now()}`);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

export async function runValidation() {
  return validateContent(await loadPack());
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const result = await runValidation();
  for (const warning of result.warnings) console.warn(`WARNING: ${warning}`);
  if (result.errors.length > 0) {
    for (const error of result.errors) console.error(`ERROR: ${error}`);
    process.exitCode = 1;
  } else {
    const counts = Object.entries(result.counts).map(([key, value]) => `${key}=${value}`).join(", ");
    console.log(`Content validation passed: ${counts}.`);
  }
}
