# Source corpus manifest

Last audited: **July 11, 2026**

This is the acquisition, provenance, and editorial ledger for the Passover for Beginners source corpus. The canonical machine-readable record is [`source-runtime-index.json`](./source-runtime-index.json); this document explains how to interpret and reproduce it.

## Current verified status

- **20/20 catalogued Haggadah records are locally acquired and usable.**
- The local corpus contains **16 PDFs (867 PDF pages)** and **4 complete official Open Siddur source-data snapshots**.
- All 20 sources have searchable extracts, totaling **1,885,291 characters** at the latest extraction pass.
- `research/source-materials/` and `research/source-extracts/` are intentionally gitignored. Their cryptographic hashes, extraction methods, source URLs, rights terms, and approved exact passages are tracked in the runtime index.
- `research/source-runtime-passages.json` contains the first **40 provenance-verified runtime passages: exactly two per source**. This is a validation floor and smoke-test set, **not the finished content depth**.
- `research/generated/source-segments/*.jsonl` is the reproducible, whole-corpus precompute input. It is deliberately separate from the runtime allowlist. Machine segmentation or source-level reuse permission alone does not prove that a fragment will read coherently in a particular Seder location.
- Only Shir Ge'ulah and the Velveteen Rabbi currently have implemented procedural runtime spines. `primarySpineEligible` in the index records editorial potential; it does not mean a complete spine has already been implemented.

## Acquisition and extraction ledger

Every row below has acquisition status `acquired-verified`. Hashes and original filenames are in the runtime index and local `.meta.json` files.

| Source ID | Local acquisition | Searchable extraction | Pages | Characters | Reuse basis | Runtime spine |
|---|---|---|---:|---:|---|---|
| `traditional-core` | PDF + IA OCR sidecar | IA DjVu OCR + audited correction | 118 | 163,221 | CC0 1.0 | No |
| `wandering-is-over` | PDF | PDF text layer | 33 | 62,136 | CC BY-SA 3.0 | No |
| `inner-seder` | PDF | PDF text layer | 22 | 107,140 | CC BY-SA 4.0 | No |
| `other-side-of-sea` | PDF | PDF text layer | 38 | 129,857 | CC BY-SA 4.0 | No |
| `freedom-seder-earth` | PDF | PDF text layer | 25 | 62,693 | CC BY-SA 4.0 | No |
| `shir-geulah` | PDF | PDF text layer + audited ligature normalization | 74 | 174,563 | CC BY 4.0 | **Yes** |
| `velveteen-rabbi` | PDF v9 | PDF text layer + audited column-order transcription | 84 | 132,046 | Creator's explicit reuse permission | **Yes** |
| `nusach-eretz-yisrael` | Official source-data snapshot | Open Siddur HTML/source extraction | — | 55,373 | CC BY-SA 4.0 | No |
| `seder-in-the-streets` | Official source-data snapshot | Open Siddur HTML/source extraction | — | 28,890 | CC BY-SA 4.0 | No |
| `tropified-haggadah` | PDF + authoritative ODT | PDF text layer + ODT text | 37 | 109,377 | CC BY-SA 4.0 | No |
| `feinstein-haggadah` | PDF | PDF text layer | 108 | 189,037 | CC BY-SA 4.0 | No |
| `socialist-hagode` | PDF | PDF text layer | 47 | 76,632 | CC BY-SA 4.0 | No |
| `mlk-freedom-seder` | PDF | PDF text layer | 24 | 46,504 | CC BY 4.0 for creator material; printed credits preserved | No |
| `second-seder-plate` | PDF | PDF text layer | 8 | 15,594 | CC BY-SA 4.0 | No |
| `mayer-ashkenaz` | PDF | PDF text layer | 83 | 255,595 | CC BY-SA 4.0 | No |
| `english-jews-seder` | Official source-data snapshot | Open Siddur HTML/source extraction | — | 26,103 | Public domain + CC BY-SA 4.0 transcription | No |
| `rittangel-latin` | PDF + IA OCR + official Dayenu transcription | IA DjVu OCR + Open Siddur transcription | 78 | 110,761 | Public domain + CC BY-SA 4.0 transcription | No |
| `levy-home-service` | PDF | PDF text layer | 44 | 71,406 | Public domain | No |
| `barros-basto` | PDF + IA OCR sidecar | IA DjVu OCR | 44 | 54,698 | CC0 1.0 | No |
| `battlestar-seder` | Official source-data snapshot | Open Siddur HTML/source extraction | — | 13,665 | CC BY-SA 4.0 + GFDL provenance | No; explicit opt-in only |

### Rittangel verification

The 1644 Rittangel scan has poor historical OCR, so its two runtime smoke-test passages do not rely on guessed OCR. They use the exact Latin and Hebrew Dayenu text from official Open Siddur post 36451, whose transcription is stored locally and whose text was visually cross-checked against scan PDF page 27 (printed page 19). The extract records both the scan/OCR and the authoritative transcription. Any additional Rittangel segment that comes only from historical OCR remains subject to visual review before runtime use.

### Audited transcription sidecars

`research/audited-source-transcriptions.json` records a small number of visually checked corrections where PDF/OCR extraction damaged otherwise verifiable prose: Birnbaum's OCR error “aim” for “arm,” Shir Ge'ulah's `fi` ligature, and the Velveteen Rabbi's multi-column word order. The extraction script appends these labeled transcriptions and records the sidecar hash. This makes local exact-text validation reproducible without pretending the raw OCR was correct.

## Reuse and attribution policy

- Public-domain works, standardized open licenses, and explicit creator permission are accepted according to their actual terms. Shir Ge'ulah and the Velveteen Rabbi are included on this basis.
- Preserve creator, containing Haggadah, edition, locator, license, required license link/change notice, and exact source-presented attribution in internal provenance.
- Material printed inside a reusable Haggadah may be retained for precompute review when its printed credit is preserved. Embedded third-party passages still receive item-level attribution and context review before entering the runtime allowlist.
- Runtime quotations and foundational text remain exact. Adaptation belongs in separately identified bridge copy, never in a silently altered quotation.
- Reader-facing credits list each source actually used, on the final PDF credits page. Detailed hashes and internal locators stay in the research data rather than interrupting the Seder flow.
- ShareAlike, noncommercial, attribution, license-link, and change-notice conditions remain binding. This ledger is not a substitute for release-specific rights review.

## Cohesion and matching rules

The runtime index uses a dominant-source architecture:

1. Choose one procedural spine that supplies all 14 Seder sections in order.
2. Choose one featured source and prefer multiple passages from that same work so its voice and argument can develop.
3. Add at most one supporting source passage unless an editorially reviewed sequence explicitly allows more.
4. Match at the ritual moment and narrative function—not merely by theme keywords.
5. Use only records with exact provenance, compatible rights, section placement, and editorial approval.
6. Battlestar material requires explicit fandom opt-in and never appears from generic “playful” matching alone.

## Reproduction and validation

Run these from the repository root:

```bash
node scripts/acquire-source-corpus.mjs
python3 scripts/extract-source-corpus.py
node scripts/build-source-runtime-index.mjs
node scripts/build-corpus-content-pack.mjs
npm run sources:validate
npm run sources:audit-local
npm run sources:segments:validate
npm run sources:segments:audit-local
```

The two validation levels are intentional:

- `sources:validate` checks the tracked 20-source index, schema, rights and attribution fields, exact word counts, provenance hashes, locator hashes, and the two-per-source approved runtime floor. It works in GitHub without the ignored source files.
- `sources:audit-local` additionally hashes every local extract and proves that every approved runtime passage occurs as an exact NFC/whitespace-normalized substring of that extract.
- `sources:segments:validate` checks all generated JSONL records, stable order and offsets, schema/classification fields, source credits, hashes, 40–250-word targets, quarantine reasons, per-source counts, and complete reconstruction hashes without requiring ignored source files.
- `sources:segments:audit-local` additionally proves that all 1,999 exact segments occur in their local extracts and that their ordered reconstruction equals all 1,847,791 normalized, non-metadata source characters across the 20 works.

The whole-corpus precompute library must also retain per-source order, locators, extract hashes, quarantine reasons, and enough coverage metadata to prove that the complete searchable body—not a handpicked subset—fed the offline pipeline. Corpus-scale machine segmentation is an input to classification and editorial review; it is not, by itself, permission for arbitrary runtime insertion.

## Content-depth priorities

The following substantial works should receive deeper, section-mapped kits because they can sustain a coherent Haggadah voice or provide meaningful sequences across several ritual moments:

- Shir Ge'ulah
- The Velveteen Rabbi's Haggadah
- The Wandering Is Over
- Haggadah of the Inner Seder
- The Freedom Seder for the Earth
- Feinstein / Haggadat Mah Zot
- Mayer's Ashkenaz Haggadah
- Birnbaum's traditional Haggadah
- The Other Side of the Sea
- Seder in the Streets
- MLK +50 Freedom Seder
- Socialist Hagode, for explicitly selected secular/labor profiles

These specialist works are appropriately narrower unless a user explicitly chooses a historical, liturgical, cultural, plate-customization, or fandom experience:

- Nusaḥ Erets Yisrael
- Tropified Haggadah
- Second Seder Plate
- English Jews Before the Expulsion
- Rittangel's Latin Haggadah
- Levy Home Service
- Barros Basto's Portuguese Haggadah
- Battlestar Galactica Seder

“Narrow” does not mean excluded. It means their strongest verified passages should be used as coherent historical, ritual, cultural, or opt-in modules rather than treated as a universal beginner spine.
