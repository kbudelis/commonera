#!/usr/bin/env node

/**
 * Build two deliberately separate artifacts:
 *
 * 1. research/generated/source-segments/*.jsonl — exhaustive, non-runtime
 *    segments from every locally acquired source extract. These records remain
 *    candidate-review or quarantined until rights, OCR, context, and editorial
 *    review are complete.
 * 2. content/generated/* — only exact passages already approved in
 *    research/source-runtime-index.json, split into per-source packs so the web
 *    client can load the featured/supporting works without downloading the
 *    whole research corpus.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { assertComprehensiveCorpusApproval } from "./corpus-approval-gate.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const researchRoot = path.join(root, "research");
const extractRoot = path.join(researchRoot, "source-extracts");
const researchSegmentRoot = path.join(researchRoot, "generated", "source-segments");
const generatedRoot = path.join(root, "content", "generated");
const sourcePackRoot = path.join(generatedRoot, "source-packs");
const indexPath = path.join(researchRoot, "source-runtime-index.json");
const approvalPath = path.join(researchRoot, "full-corpus-approval.json");
const segmentManifestPath = path.join(researchRoot, "generated", "source-segment-manifest.json");

const normalize = (value) => value.normalize("NFC").replace(/\s+/gu, " ").trim();
const sha256 = (value) => createHash("sha256").update(value, "utf8").digest("hex");

async function readJson(filename, fallback) {
  try {
    return JSON.parse(await readFile(filename, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function extractBody(value) {
  const lineNormalized = value.replace(/\r\n?/g, "\n");
  const headerEnd = lineNormalized.indexOf("\n\n");
  return headerEnd >= 0 ? lineNormalized.slice(headerEnd + 2) : lineNormalized;
}

function pageUnits(body) {
  const marker = /^===== ([^\n=]+) =====$/gm;
  const matches = [...body.matchAll(marker)];
  if (matches.length === 0) {
    return [{ locator: "official source snapshot", pageNumber: null, text: normalize(body) }];
  }
  const units = [];
  const preface = normalize(body.slice(0, matches[0].index));
  if (preface) units.push({ locator: "source preface", pageNumber: null, text: preface });
  matches.forEach((match, index) => {
    const label = match[1].trim();
    const pageMatch = label.match(/^PDF PAGE (\d+)$/i);
    const text = normalize(body.slice(match.index + match[0].length, matches[index + 1]?.index ?? body.length));
    if (!text) return;
    units.push({
      locator: pageMatch ? `PDF p. ${pageMatch[1]}` : label.toLowerCase(),
      pageNumber: pageMatch ? Number(pageMatch[1]) : null,
      text,
    });
  });
  return units;
}

function coherentChunks(text, { minimumWords = 40, targetWords = 140, maximumWords = 250 } = {}) {
  const words = [...text.matchAll(/\S+/gu)];
  if (!words.length) return [];
  const chunks = [];
  let firstWord = 0;
  while (firstWord < words.length) {
    const remaining = words.length - firstWord;
    let afterLastWord;
    if (remaining <= maximumWords) {
      afterLastWord = words.length;
    } else {
      const minimumBoundary = firstWord + minimumWords;
      const maximumBoundary = Math.min(firstWord + maximumWords, words.length - minimumWords);
      const preferredBoundary = Math.min(firstWord + targetWords, maximumBoundary);
      const candidates = [];
      for (let boundary = minimumBoundary; boundary <= maximumBoundary; boundary += 1) {
        const lastWord = words[boundary - 1][0];
        if (/[.!?。׃][”’"')\]]*$/u.test(lastWord)) {
          candidates.push({ boundary, score: Math.abs(boundary - preferredBoundary) });
        } else if (/[;:][”’"')\]]*$/u.test(lastWord)) {
          candidates.push({ boundary, score: Math.abs(boundary - preferredBoundary) + 20 });
        }
      }
      candidates.sort((left, right) => left.score - right.score || left.boundary - right.boundary);
      afterLastWord = candidates[0]?.boundary ?? preferredBoundary;
    }
    const startOffset = words[firstWord].index;
    const finalWord = words[afterLastWord - 1];
    const endOffset = finalWord.index + finalWord[0].length;
    chunks.push({ exactText: text.slice(startOffset, endOffset), startOffset, endOffset });
    firstWord = afterLastWord;
  }
  return chunks;
}

function preliminarySections(text) {
  const rules = [
    ["kadesh", /kadd?e?sh|kiddush|first cup|fruit of the vine/i],
    ["urchatz", /urchatz|wash(?:ing)? without a blessing|first washing/i],
    ["karpas", /karpas|green vegetable|salt water/i],
    ["yachatz", /yachatz|break(?:ing)? the middle matzah/i],
    ["maggid", /magg?id|four questions|exodus|pharaoh|plagues?|dayenu/i],
    ["rachtzah", /rachtz|second washing|washing of hands/i],
    ["motzi-matzah", /motzi|eat matzah|bread from the earth/i],
    ["maror", /maror|bitter herb/i],
    ["korech", /korech|hillel sandwich/i],
    ["shulchan-orech", /shulchan|festive meal/i],
    ["tzafun", /tzafun|afikoman/i],
    ["barech", /barech|grace after (?:the )?meal|third cup/i],
    ["hallel", /hallel|psalm|fourth cup/i],
    ["nirtzah", /nirtzah|seder (?:is )?complete|next year/i],
  ];
  return rules.filter(([, pattern]) => pattern.test(text)).map(([sectionId]) => sectionId);
}

function qualityFlags(text, sourceId) {
  const flags = [];
  if (!text || /\[no searchable text on this page\]/i.test(text)) flags.push("no-searchable-text");
  const wordCount = text.split(/\s+/u).filter(Boolean).length;
  if (wordCount < 40) flags.push("short-complete-unit");
  const words = text.split(/\s+/u).filter(Boolean);
  if (words.some((word) => word.length > 80)) flags.push("run-together-ocr");
  const replacementCount = (text.match(/[�□■]/g) ?? []).length;
  if (replacementCount > Math.max(2, text.length * 0.005)) flags.push("corrupt-glyphs");
  if (sourceId === "rittangel-latin") flags.push("historical-ocr-needs-visual-review");
  return [...new Set(flags)];
}

function preliminaryThemes(text, source) {
  const rules = [
    ["environment", /earth|climate|water|river|sea|land|ecolog|garden|creation/i],
    ["social-justice", /justice|oppress|freedom|liberat|slavery|worker|labor|rights|refugee|poverty|racis/i],
    ["feminist", /women|woman|miriam|feminis|gender|daughter/i],
    ["lgbtq", /lgbt|queer|transgender|lesbian|gay|bisexual/i],
    ["family-storytelling", /family|child|children|parent|grandparent|story|memory|ancestor/i],
    ["interfaith", /interfaith|christian|muslim|islam|church|mosque|shared humanity/i],
    ["mindfulness", /breath|mindful|meditat|inner|attention|contemplat/i],
    ["secular", /secular|socialist|movement|union|fandom|battlestar/i],
    ["traditional", /torah|mitzv|bless|seder|haggadah|matzah|pesach|passover/i],
  ];
  return [...new Set([
    ...source.themeTags,
    ...rules.filter(([, pattern]) => pattern.test(text)).map(([theme]) => theme),
  ])];
}

function preliminaryAudience(source) {
  const tags = source.audienceTags.map((tag) => tag.toLowerCase());
  const audience = ["adults"];
  if (tags.some((tag) => /mixed|family|beginner|community|participatory/.test(tag))) audience.push("mixed-ages");
  if (tags.some((tag) => /mixed|family|beginner/.test(tag))) audience.push("children");
  if (tags.some((tag) => /specialist|historical|ritually-familiar/.test(tag))) audience.push("specialist");
  return [...new Set(audience)];
}

function preliminaryTones(text, source) {
  const tags = `${source.voiceTags.join(" ")} ${source.family}`.toLowerCase();
  const tones = ["balanced"];
  if (/contemplat|poetic|traditional|liturg|formal|spiritual|historical/.test(tags)) tones.push("reverent");
  if (/playful|fandom/.test(tags) || /game|challenge|joke|laugh/i.test(text)) tones.push("playful");
  return [...new Set(tones)];
}

function preliminarySeam(text, sectionIds, previousSection) {
  if (sectionIds.length && sectionIds.at(-1) !== previousSection) return "section-opening";
  if (/\?/.test(text) && /ask|question|discuss|wonder|what|why|how/i.test(text)) return "discussion-prompt";
  if (/\b(?:take|pour|wash|dip|eat|drink|lift|break|recite|say|fill|pass|hide|open)\b/i.test(text)) return "ritual-setup";
  if (/blessed are|barukh|baruch/i.test(text)) return "before-blessing";
  if (sectionIds.includes("shulchan-orech")) return "meal-transition";
  if (sectionIds.includes("nirtzah")) return "closing-reflection";
  if (/\b(?:century|published|edition|manuscript|histor|\d{4})\b/i.test(text)) return "historical-sidebar";
  if (sectionIds.includes("maggid")) return "story-reflection";
  return "ritual-explanation";
}

function sourcePresentedAttribution(text) {
  const matches = [];
  const patterns = [
    /(?:copyright|©)[^.!?]{0,180}/giu,
    /(?:adapted|translated|translation|written|compiled|assembled)\s+by\s+[^.!?]{2,180}/giu,
    /\([^()]{0,160}(?:Rabbi|Rev\.|Dr\.|source:|translation by|adapted from)[^()]{0,160}\)/giu,
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) matches.push(normalize(match[0]));
  }
  return [...new Set(matches)].slice(0, 8);
}

function segmentsForSource(source, extract, sourceOrder) {
  const records = [];
  const units = pageUnits(extractBody(extract)).filter((unit) => unit.text);
  let sourceOffset = 0;
  let order = 0;
  let currentSection = "kadesh";
  units.forEach((unit, unitOrder) => {
    const unitStartOffset = sourceOffset;
    const chunks = coherentChunks(unit.text);
    chunks.forEach((chunk, unitSegmentOrder) => {
      const exactText = chunk.exactText;
      const flags = qualityFlags(exactText, source.sourceId);
      const quarantineReasons = flags.filter((flag) => [
        "no-searchable-text",
        "run-together-ocr",
        "corrupt-glyphs",
      ].includes(flag));
      const hash = sha256(exactText);
      const detectedSections = preliminarySections(exactText);
      const previousSection = currentSection;
      if (detectedSections.length) currentSection = detectedSections.at(-1);
      const sectionIds = detectedSections.length ? detectedSections : [currentSection];
      const presentedAttribution = sourcePresentedAttribution(exactText);
      const normalizedStartOffset = unitStartOffset + chunk.startOffset;
      records.push({
        id: `research-${source.sourceId}-${normalizedStartOffset.toString(36)}-${hash.slice(0, 12)}`,
        sourceId: source.sourceId,
        family: source.family,
        sourceOrder,
        order,
        unitOrder,
        unitSegmentOrder,
        exactText,
        sourceLocation: `${unit.locator}, segment ${unitSegmentOrder + 1}`,
        locator: {
          label: unit.locator,
          pageNumber: unit.pageNumber,
          localExtract: source.acquisition.extractFile,
          sourceSha256: source.acquisition.sha256,
          extractSha256: source.acquisition.extractSha256,
          normalizedStartOffset,
          normalizedEndOffset: unitStartOffset + chunk.endOffset,
        },
        provenanceHash: hash,
        wordCount: exactText.split(/\s+/u).filter(Boolean).length,
        characterCount: exactText.length,
        sectionIds,
        themes: preliminaryThemes(exactText, source),
        audience: preliminaryAudience(source),
        tones: preliminaryTones(exactText, source),
        seam: preliminarySeam(exactText, sectionIds, previousSection),
        sourcePresentedAttribution: presentedAttribution,
        attribution: {
          creator: source.creator,
          containingSource: source.title,
          readerCredit: `From ${source.title} by ${source.creator}.`,
        },
        classificationStatus: "machine-classified",
        approvalStatus: quarantineReasons.length ? "quarantined" : "approved",
        approvalScope: "source-provenance-and-license-precompute",
        editorialReviewStatus: "pending-context-review",
        runtimeEligible: false,
        qualityFlags: flags,
        quarantineReasons,
        sourceRightsLicense: source.rights.license,
        sourceRightsConditions: source.rights.conditions,
        embeddedMaterialRequiresItemReview: source.rights.embeddedMaterialRequiresItemReview,
        sourceSha256: source.acquisition.sha256,
        extractSha256: source.acquisition.extractSha256,
      });
      order += 1;
    });
    sourceOffset += unit.text.length + (unitOrder === units.length - 1 ? 0 : 1);
  });
  const normalizedContent = units.map((unit) => unit.text).join(" ");
  const reconstructedContent = records.map((record) => record.exactText).join(" ");
  return { records, units, normalizedContent, reconstructedContent };
}

function compactModule(passage) {
  return {
    id: passage.id,
    sourceId: passage.sourceId,
    family: passage.family,
    sectionIds: passage.sectionIds,
    themes: passage.themes,
    audience: passage.audience,
    tones: passage.tones,
    lengthTiers: passage.lengthTiers,
    seam: passage.seam,
    wordCount: passage.wordCount,
    approvalStatus: passage.approvalStatus,
    runtimeEligible: passage.rights.runtimeEligible,
    provenanceHash: passage.provenanceHash,
  };
}

function supportIsCompatible(featured, supporting) {
  if (featured.sourceId === supporting.sourceId) return false;
  return featured.family === supporting.family || (
    featured.compatibleFamilies.includes(supporting.family) &&
    !featured.incompatibleFamilies.includes(supporting.family)
  );
}

async function main() {
  const index = await readJson(indexPath, null);
  if (!index?.sources?.length) throw new Error(`Missing source index: ${indexPath}`);
  const approval = await readJson(approvalPath, { comprehensiveApproval: false });
  await Promise.all([
    mkdir(researchSegmentRoot, { recursive: true }),
    mkdir(sourcePackRoot, { recursive: true }),
  ]);

  const researchBySource = [];
  for (const [sourceOrder, source] of index.sources.entries()) {
    const extract = await readFile(path.join(extractRoot, `${source.sourceId}.txt`), "utf8");
    const segmented = segmentsForSource(source, extract, sourceOrder);
    if (segmented.reconstructedContent !== segmented.normalizedContent) {
      throw new Error(`${source.sourceId}: segment reconstruction does not match normalized source content`);
    }
    researchBySource.push({ source, ...segmented });
    await writeFile(
      path.join(researchSegmentRoot, `${source.sourceId}.jsonl`),
      `${segmented.records.map((segment) => JSON.stringify(segment)).join("\n")}\n`,
    );
  }

  const catalog = [];
  for (const source of index.sources) {
    const approved = source.passages.filter(
      (passage) => passage.approvalStatus === "approved" && passage.rights.runtimeEligible,
    );
    catalog.push({
      sourceId: source.sourceId,
      family: source.family,
      sourceTags: {
        voice: source.voiceTags,
        audience: source.audienceTags,
        themes: source.themeTags,
        politicalFraming: source.politicalFramingTags,
      },
      compatibleFamilies: source.compatibleFamilies,
      incompatibleFamilies: source.incompatibleFamilies,
      requiresExplicitOptIn: source.requiresExplicitOptIn ?? [],
      primarySpineEligible: source.primarySpineEligible,
      runtimeSpineAvailable: source.runtimeSpineAvailable,
      secondaryPassageCap: source.secondaryPassageCap,
      modules: approved.map(compactModule),
    });
    await writeFile(
      path.join(sourcePackRoot, `${source.sourceId}.json`),
      `${JSON.stringify({
        schemaVersion: "1.0.0",
        sourceId: source.sourceId,
        sourceTitle: source.title,
        modules: approved,
      }, null, 2)}\n`,
    );
  }

  const backbones = index.sources.filter((source) => source.runtimeSpineAvailable);
  const sequences = backbones.flatMap((backbone) =>
    index.sources
      .filter((featured) =>
        featured.sourceId === backbone.sourceId ||
        (backbone.compatibleFamilies.includes(featured.family) &&
          !backbone.incompatibleFamilies.includes(featured.family)),
      )
      .map((featured) => ({
        id: `${backbone.sourceId}--${featured.sourceId}`,
        proceduralBackboneSourceId: backbone.sourceId,
        featuredSourceId: featured.sourceId,
        compatibleSupportingSourceIds: index.sources
          .filter((supporting) =>
            supporting.sourceId !== backbone.sourceId &&
            supportIsCompatible(featured, supporting),
          )
          .map((supporting) => supporting.sourceId),
        conciseFeaturedPassageTarget: [1, Math.min(2, featured.secondaryPassageCap)],
        longerFeaturedPassageTarget: [
          Math.min(2, featured.secondaryPassageCap),
          Math.min(3, featured.secondaryPassageCap),
        ],
        maximumSupportingPassages: 1,
      })),
  );

  const approvedModules = catalog.flatMap((source) => source.modules);
  const researchSegments = researchBySource.flatMap((source) => source.records);
  const segmentSources = researchBySource.map(({ source, records, units, normalizedContent, reconstructedContent }) => ({
    sourceId: source.sourceId,
    title: source.title,
    creator: source.creator,
    sourceOrder: records[0]?.sourceOrder ?? index.sources.findIndex((candidate) => candidate.sourceId === source.sourceId),
    file: `research/generated/source-segments/${source.sourceId}.jsonl`,
    acquisitionKind: source.acquisition.kind,
    pageCount: source.acquisition.pageCount,
    extractMode: source.acquisition.extractMode,
    extractCharacters: source.acquisition.extractCharacters,
    sourceSha256: source.acquisition.sha256,
    extractSha256: source.acquisition.extractSha256,
    license: source.rights.license,
    credit: `From ${source.title} by ${source.creator}.`,
    normalizedContentCharacters: normalizedContent.length,
    normalizedContentSha256: sha256(normalizedContent),
    reconstructedContentSha256: sha256(reconstructedContent),
    coverageVerified: normalizedContent === reconstructedContent,
    unitCount: units.length,
    segmentCount: records.length,
    approvedPrecomputeCount: records.filter((segment) => segment.approvalStatus === "approved").length,
    quarantinedCount: records.filter((segment) => segment.approvalStatus === "quarantined").length,
    firstSegmentId: records[0]?.id ?? null,
    lastSegmentId: records.at(-1)?.id ?? null,
    qualityFlagCounts: Object.fromEntries(
      [...new Set(records.flatMap((segment) => segment.qualityFlags))]
        .sort()
        .map((flag) => [flag, records.filter((segment) => segment.qualityFlags.includes(flag)).length]),
    ),
  }));
  const segmentManifest = {
    schemaVersion: "1.0.0",
    generatedAt: index.compiledAt,
    normalization: "Unicode NFC; every whitespace run becomes one ASCII space; trim outer whitespace; extraction metadata and ===== markers are excluded.",
    segmentation: {
      minimumTargetWords: 40,
      preferredWords: 140,
      maximumWords: 250,
      rule: "Split each source page or official-source block in order at the closest sentence or clause boundary; a complete block shorter than 40 words remains intact.",
    },
    approvalSemantics: {
      approved: "Exact source-derived segment with a verified source-level reuse basis, accepted as offline precompute input only.",
      quarantined: "Extraction failure such as missing text, corrupt glyphs, or run-together OCR.",
      runtimeEligible: "Always false until passage-level context, attribution, political, and narrative review promotes the segment into the runtime index.",
    },
    sourceCount: segmentSources.length,
    pdfPageCount: segmentSources.reduce((sum, source) => sum + (source.pageCount ?? 0), 0),
    sourceExtractCharacters: segmentSources.reduce((sum, source) => sum + source.extractCharacters, 0),
    normalizedContentCharacters: segmentSources.reduce((sum, source) => sum + source.normalizedContentCharacters, 0),
    segmentCount: researchSegments.length,
    approvedPrecomputeCount: researchSegments.filter((segment) => segment.approvalStatus === "approved").length,
    quarantinedCount: researchSegments.filter((segment) => segment.approvalStatus === "quarantined").length,
    allSourcesCoverageVerified: segmentSources.every((source) => source.coverageVerified),
    sources: segmentSources,
  };
  const manifest = {
    schemaVersion: "1.0.0",
    generatedAt: index.compiledAt,
    distinction: {
      researchCorpus: "Exhaustive local extract segments. Never shipped to generation unless separately approved.",
      approvedRuntimePack: "Exact reviewed modules only, split per source and allowlisted by compact metadata.",
    },
    researchCorpus: {
      sourceCount: researchBySource.length,
      segmentCount: researchSegments.length,
      characterCount: researchSegments.reduce((sum, segment) => sum + segment.characterCount, 0),
      approvedPrecomputeCount: researchSegments.filter((segment) => segment.approvalStatus === "approved").length,
      quarantinedCount: researchSegments.filter((segment) => segment.approvalStatus === "quarantined").length,
      machineClassifiedCount: researchSegments.filter((segment) => segment.classificationStatus === "machine-classified").length,
      pendingContextReviewCount: researchSegments.filter((segment) => segment.editorialReviewStatus === "pending-context-review").length,
      allSourcesCoverageVerified: segmentManifest.allSourcesCoverageVerified,
      sourceSegmentManifest: "research/generated/source-segment-manifest.json",
    },
    approvedRuntimePack: {
      sourceCount: catalog.filter((source) => source.modules.length > 0).length,
      moduleCount: approvedModules.length,
      exactCharacterCount: approvedModules.reduce((sum, module) => {
        const passage = index.sources.flatMap((source) => source.passages).find((item) => item.id === module.id);
        return sum + (passage?.exactText.length ?? 0);
      }, 0),
      maturity: approval.comprehensiveApproval ? "comprehensive-reviewed-pack" : "smoke-test-fixtures",
      comprehensiveApproval: approval.comprehensiveApproval === true,
      activeRuntimeLoadingMode: "embedded-smoke-index",
      availableComprehensiveLoadingMode: "per-source-dynamic",
      note: approval.comprehensiveApproval
        ? "Editorial approval manifest marks the compiled pack comprehensive."
        : "The approved pack is not yet a comprehensive representation of the full research corpus.",
    },
    sequenceCount: sequences.length,
  };

  assertComprehensiveCorpusApproval({
    approval,
    manifest,
    expectedSourceCount: index.sources.length,
  });

  const loaderEntries = index.sources.map((source) =>
    `  ${JSON.stringify(source.sourceId)}: () => import("./source-packs/${source.sourceId}.json", { with: { type: "json" } }),`,
  ).join("\n");
  const loaderSource = `/* Generated by scripts/build-corpus-content-pack.mjs. */\n` +
    `export const approvedSourcePackLoaders = {\n${loaderEntries}\n} as const;\n\n` +
    `export type ApprovedSourcePackId = keyof typeof approvedSourcePackLoaders;\n`;

  await Promise.all([
    writeFile(segmentManifestPath, `${JSON.stringify(segmentManifest, null, 2)}\n`),
    writeFile(path.join(generatedRoot, "source-module-catalog.json"), `${JSON.stringify({ schemaVersion: "1.0.0", sources: catalog }, null, 2)}\n`),
    writeFile(path.join(generatedRoot, "source-sequences.json"), `${JSON.stringify({ schemaVersion: "1.0.0", sequences }, null, 2)}\n`),
    writeFile(path.join(generatedRoot, "corpus-pack-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`),
    writeFile(path.join(generatedRoot, "source-pack-loaders.ts"), loaderSource),
  ]);

  console.log(
    `Segmented ${manifest.researchCorpus.segmentCount} research modules across ${manifest.researchCorpus.sourceCount} sources; ` +
    `compiled ${manifest.approvedRuntimePack.moduleCount} approved runtime modules across ${manifest.approvedRuntimePack.sourceCount} sources (${manifest.approvedRuntimePack.maturity}).`,
  );
}

await main();
