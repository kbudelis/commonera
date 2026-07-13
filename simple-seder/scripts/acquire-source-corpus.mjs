#!/usr/bin/env node

/**
 * Download the exact source editions used by research/source-runtime-index.json.
 *
 * Original files and official source snapshots are intentionally gitignored.
 * The tracked runtime index stores their expected hashes after a verified audit.
 * Run from the project root with network access:
 *
 *   node scripts/acquire-source-corpus.mjs
 *
 * This script never substitutes an HTML error page for a PDF. A failed source is
 * reported and left unavailable for passage selection.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const materialRoot = path.join(projectRoot, "research", "source-materials");
const snapshotRoot = path.join(materialRoot, "official-json");

const openSiddurRawRoot =
  "https://raw.githubusercontent.com/aharonium/opensiddur.org/master/posts";

const sources = [
  {
    id: "traditional-core",
    filename: "Paltiel Birnbaum Haggadah 1953.pdf",
    url: "https://archive.org/download/sederhaggadahshelpesahpaltielbirnbaum1953/Seder%20Haggadah%20shel%20Pesah%20%28Paltiel%20Birnbaum%201953%29.pdf",
    snapshot: "compilations/table-guides-and-haggadot/passover-seder/seder-haggadah-shel-pesah-translated-and-annotated-by-paltiel-birnbaum-1953_(28052).json",
  },
  {
    id: "wandering-is-over",
    filename: "Wandering Is Over Including Womens Voices 2011.pdf",
    url: "https://archive.org/download/TheWanderingIsOverHaggadahIncludingWomensVoices/The%20Wandering%20is%20Over%20Haggadah%20Including%20Women%27s%20Voices%20%28JewishBoston%2C%20JWA%202011%29.pdf",
    snapshot: "compilations/table-guides-and-haggadot/passover-seder/the-wandering-is-over-haggadah-including-womens-voices-by-jewish-boston-and-jewish-womens-archive-2011_(19085).json",
  },
  {
    id: "inner-seder",
    filename: "Haggadah of the Inner Seder 2026.pdf",
    url: "https://archive.org/download/HaggadahOfTheInnerSeder/Haggadah%20of%20the%20Inner%20Seder%20%28David%20Seidenberg%2C%20neohasid.org%202026%29.pdf",
    snapshot: "compilations/table-guides-and-haggadot/passover-seder/haggadah-of-the-inner-seder-by-david-seidenberg-neohasid-org_(11018).json",
  },
  {
    id: "other-side-of-sea",
    filename: "Truah Human Rights Haggadah 2020.pdf",
    url: "https://www.truah.org/wp-content/uploads/2020/03/Print-at-Home-PDF.pdf",
    snapshot: "compilations/table-guides-and-haggadot/passover-seder/the-other-side-of-the-sea-a-haggadah-for-fighting-modern-day-slavery-by-truah-the-rabbinic-call-for-human-rights_(10900).json",
  },
  {
    id: "freedom-seder-earth",
    filename: "Freedom Seder for the Earth 2009.pdf",
    url: "https://archive.org/download/FreedomSederForTheEarthPassoverHaggadahTheShalomCenter2009/FreedomSederForTheEarthPassoverHaggadahtheShalomCenter2009.pdf",
    snapshot: "compilations/table-guides-and-haggadot/passover-seder/the-freedom-seder-haggadah-for-passover-by-the-shalom-center-and-rabbi-arthur-waskow_(8852).json",
  },
  {
    id: "shir-geulah",
    filename: "Haggadah Shir Geulah v2.1.pdf",
    url: "https://archive.org/download/HaggadahShirGeulahEmilyAvivaKapor2ndEd.2015/Haggadah%20Shir%20Geulah%20%28Emily%20Aviva%20Kapor%2C%202nd%20ed.%202015%29.pdf",
    snapshot: "compilations/table-guides-and-haggadot/passover-seder/haggadah-shir-geulah-song-of-liberation-by-emily-aviva-kapor_(8819).json",
  },
  {
    id: "velveteen-rabbi",
    filename: "Velveteen Rabbi Haggadah v9.pdf",
    // Version 9 is hosted by the creator; the Open Siddur record still links an older edition.
    url: "https://velveteenrabbi.com/wp-content/uploads/2025/04/velveteen-rabbi-haggadah-for-pesach-v9.pdf",
    snapshot: null,
  },
  {
    id: "nusach-eretz-yisrael",
    filename: null,
    url: null,
    snapshot: "compilations/table-guides-and-haggadot/passover-seder/pesah-haggadah-nusah-erets-yisrael-based-on-multiple-cairo-geniza-manuscripts-compiled-and-translated-by-isaac-gantwerk-mayer_(30641).json",
  },
  {
    id: "seder-in-the-streets",
    filename: null,
    url: null,
    snapshot: "compilations/table-guides-and-haggadot/passover-seder/seder-in-the-streets-haggadah-compiled-by-danielle-gershkoff-rachel-lerman-rachel-beck-and-margot-seigle_(10879).json",
  },
  {
    id: "tropified-haggadah",
    filename: "Passover Seder Haggadah Tropified.pdf",
    url: "https://archive.org/download/ThePassoverSederHaggadahTropifiedIsaacGantwerkMayer2019/The%20Passover%20Seder%20Haggadah%20Tropified%20%28Isaac%20Gantwerk%20Mayer%202019%29.pdf",
    snapshot: "compilations/table-guides-and-haggadot/passover-seder/the-passover-seder-haggadah-tropified-by-isaac-gantwerk-mayer_(24582).json",
    supplemental: [
      {
        filename: "Passover Seder Haggadah Tropified.odt",
        url: "https://archive.org/download/ThePassoverSederHaggadahTropifiedIsaacGantwerkMayer2019/The%20Passover%20Seder%20Haggadah%20Tropified%20%28Isaac%20Gantwerk%20Mayer%202019%29.odt",
        kind: "odt",
      },
    ],
  },
  {
    id: "feinstein-haggadah",
    filename: "Feinstein Haggadat Mah Zot 2009.pdf",
    url: "https://archive.org/download/haggadatmahzotjewishliturgyproject2009/Haggadat%20Mah%20Zot%20%28Jewish%20Liturgy%20Project%202009%29.pdf",
    snapshot: "compilations/table-guides-and-haggadot/passover-seder/haggadah-for-pesah-an-english-translation_(6207).json",
  },
  {
    id: "socialist-hagode",
    filename: "Socialist Hagode 2025.pdf",
    url: "https://archive.org/download/hagode-shel-peysekh-in-a-socialist-mode/Hagode%20shel%20Peysekh%20in%20a%20socialist%20mode%20%281900%2C1919%2C%20English%20translation%20by%20Shlomo%20Enkin%20Lewis%202025%29.pdf",
    snapshot: "compilations/table-guides-and-haggadot/passover-seder/hagode-shel-peysekh-in-a-socialist-mode-1887-1919-trans-shlomo-enkin-lewis-2025_(61621).json",
  },
  {
    id: "mlk-freedom-seder",
    filename: "MLK50 Interfaith Freedom Seder 2018.pdf",
    url: "https://archive.org/download/MLK50InterfaithFreedomSeder/MLK%2B50%20Interfaith%20Freedom%20Seder%20%28The%20Shalom%20Center%202018%29.pdf",
    snapshot: "compilations/table-guides-and-haggadot/passover-seder/mlk-plus-50-labor-justice-interfaith-freedom-seder-by-arthur-waskow-and-the-shalom-center_(19204).json",
  },
  {
    id: "second-seder-plate",
    filename: "Second Seder Plate 2019.pdf",
    url: "https://archive.org/download/ItemsForTheSecondSederPlateIsaacGantwerkMayer2019/Items%20for%20the%20Second%20Seder%20Plate%20%28Isaac%20Gantwerk%20Mayer%202019%29.pdf",
    snapshot: "compilations/table-guides-and-haggadot/passover-seder/second-passover-seder-plate-with-seven-additions-by-isaac-gantwerk-mayer_(24587).json",
  },
  {
    id: "mayer-ashkenaz",
    filename: "Mayer Ashkenaz Haggadah 2026.pdf",
    url: "https://archive.org/download/haggadah-for-any-year-5786-isaac-gantwerk-mayer-2026/Haggadah%20for%20Any%20Year%205786%20%28Isaac%20Gantwerk%20Mayer%202026%29.pdf",
    snapshot: "compilations/table-guides-and-haggadot/passover-seder/haggadah-for-pesah-nusah-ashkenaz-with-unique-additions-from-across-the-jewish-world-by-isaac-gantwerk-mayer-2025_(61266).json",
  },
  {
    id: "english-jews-seder",
    filename: null,
    url: null,
    snapshot: "miscellanea/traditions/ritual-of-the-seder-and-the-agada-of-the-english-jews-before-the-expulsion_(4609).json",
  },
  {
    id: "rittangel-latin",
    filename: "Rittangel Liber Rituum Paschalium 1644.pdf",
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Liber_Rituum_Paschalium.pdf",
    snapshot: "compilations/table-guides-and-haggadot/passover-seder/liber-rituum-paschalium-by-johann-stephan-rittangel-1644_(19649).json",
    supplemental: [
      {
        filename: "rittangel-latin-dayenu.opensiddur.json",
        snapshot: "prayers/lunisolar/pilgrimage/pesah/leil-pesah/magid/daiyenu-in-its-latin-translation-by-johann-stephan-rittangel-1644_(36451).json",
        kind: "snapshot",
      },
    ],
  },
  {
    id: "levy-home-service",
    filename: "Levy Home Service 1896.pdf",
    url: "https://archive.org/download/haggadah-or-home-service-for-the-festival-of-passover-j-leonard-levy/Haggadah%20for%20Passover%20%28J.%20Leonard%20Levy%2C%201896%29%20-%201st%20edition.pdf",
    snapshot: "compilations/table-guides-and-haggadot/passover-seder/haggadah-or-home-service-for-the-festival-of-passover-by-j-leonard-levy_(62228).json",
  },
  {
    id: "barros-basto",
    filename: "Barros Basto Hagadah 1928.pdf",
    url: "https://archive.org/download/hagadah-shel-pessah-artur-carlos-de-barros-basto-1928/Hagadah%20shel%20Pessah%20%28A.C.%20de%20Barros%20Basto%201928%29.pdf",
    snapshot: "compilations/table-guides-and-haggadot/passover-seder/hagadah-shel-pessah-compiled-by-artur-carlos-de-barros-basto-1928_(52004).json",
  },
  {
    id: "battlestar-seder",
    filename: null,
    url: null,
    snapshot: "compilations/table-guides-and-haggadot/passover-seder/the-first-battlestar-galactica-passover-seder-haggadah-2008_(19097).json",
  },
];

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function download(url, destination, validator) {
  const partial = `${destination}.partial`;
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  validator(bytes, response.headers.get("content-type") ?? "");
  await writeFile(partial, bytes);
  await rename(partial, destination);
  return { bytes: bytes.length, sha256: sha256(bytes) };
}

function validatePdf(bytes, contentType) {
  if (bytes.length < 1_000 || !bytes.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    throw new Error(`not a PDF (content-type ${contentType || "unknown"})`);
  }
}

function validateSnapshot(bytes, contentType) {
  let parsed;
  try {
    parsed = JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new Error(`not JSON (content-type ${contentType || "unknown"})`);
  }
  if (!Number.isInteger(parsed.post_id) || !parsed.title || !parsed.content) {
    throw new Error("Open Siddur snapshot lacks post_id, title, or content");
  }
}

function validateOdt(bytes, contentType) {
  if (bytes.length < 1_000 || !bytes.subarray(0, 2).equals(Buffer.from("PK"))) {
    throw new Error(`not an ODT/ZIP file (content-type ${contentType || "unknown"})`);
  }
}

async function existingResult(destination, validator) {
  const bytes = await readFile(destination);
  validator(bytes, "local file");
  return { bytes: (await stat(destination)).size, sha256: sha256(bytes), existing: true };
}

async function acquire() {
  await mkdir(materialRoot, { recursive: true });
  await mkdir(snapshotRoot, { recursive: true });
  const results = [];

  for (const source of sources) {
    const result = { id: source.id, pdf: null, snapshot: null, supplemental: [], errors: [] };
    if (source.filename && source.url) {
      const destination = path.join(materialRoot, source.filename);
      try {
        result.pdf = await existingResult(destination, validatePdf);
      } catch {
        try {
          await rm(`${destination}.partial`, { force: true });
          result.pdf = await download(source.url, destination, validatePdf);
        } catch (error) {
          result.errors.push(`PDF: ${error.message}`);
        }
      }
    }

    if (source.snapshot) {
      const destination = path.join(snapshotRoot, `${source.id}.opensiddur.json`);
      const url = `${openSiddurRawRoot}/${source.snapshot
        .split("/")
        .map((part) => encodeURIComponent(part))
        .join("/")}`;
      try {
        result.snapshot = await existingResult(destination, validateSnapshot);
      } catch {
        try {
          await rm(`${destination}.partial`, { force: true });
          result.snapshot = await download(url, destination, validateSnapshot);
        } catch (error) {
          result.errors.push(`snapshot: ${error.message}`);
        }
      }
    }

    for (const asset of source.supplemental ?? []) {
      const destinationRoot = asset.kind === "snapshot" ? snapshotRoot : materialRoot;
      const destination = path.join(destinationRoot, asset.filename);
      const url = asset.url ?? `${openSiddurRawRoot}/${asset.snapshot
        .split("/")
        .map((part) => encodeURIComponent(part))
        .join("/")}`;
      const validator = asset.kind === "snapshot" ? validateSnapshot : validateOdt;
      try {
        result.supplemental.push(await existingResult(destination, validator));
      } catch {
        try {
          await rm(`${destination}.partial`, { force: true });
          result.supplemental.push(await download(url, destination, validator));
        } catch (error) {
          result.errors.push(`supplemental ${asset.filename}: ${error.message}`);
        }
      }
    }

    results.push(result);
    const state = result.errors.length ? `ERROR ${result.errors.join("; ")}` : "ok";
    console.log(`${source.id}: ${state}`);
  }

  const acquired = results.filter((result) => result.pdf || result.snapshot).length;
  const failed = results.filter((result) => !result.pdf && !result.snapshot);
  const incomplete = results.filter((result) => result.errors.length);
  console.log(`Acquired ${acquired}/${sources.length} source records.`);
  if (failed.length) {
    console.error(`Unavailable: ${failed.map((result) => result.id).join(", ")}`);
  }
  if (incomplete.length) console.error(`Incomplete source records: ${incomplete.map((result) => result.id).join(", ")}`);
  if (failed.length || incomplete.length) process.exitCode = 1;
}

await acquire();
