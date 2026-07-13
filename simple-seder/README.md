# Let My People Host

[Let My People Host](https://letmypeoplehost.com) is a local-first Haggadah builder that turns a host's time, audience, tone, language, and themes into a complete 14-step seder. The editorial pack is deterministic; an OpenAI API key can optionally improve matching without becoming a runtime requirement.

## Run locally

Requirements: Node.js 22.13 or newer (the project uses the built-in `node:sqlite` module) and npm.

```bash
npm install
cp .env.example .env.local   # optional
npm run dev
```

Open `http://localhost:3000`. Projects are stored in `data/demo.sqlite` by default; set `DATABASE_URL=:memory:` for ephemeral storage or another local path to move the database.

`OPENAI_API_KEY` is optional. With a key, `/api/match` may ask OpenAI to rerank only the approved source-passage, quote, cover, and section IDs supplied by deterministic code. Unknown, unapproved, or incompatible IDs are rejected. With no key—or if matching times out, fails, or returns invalid data—the same request succeeds using the complete deterministic local draft. Set `OPENAI_MODEL` to override the default matching model.

## Public demo

The shared `kbudelis/commonera` GitHub Pages workflow builds this project with `BASE_PATH=/commonera/simple-seder/` and publishes it at:

https://kbudelis.github.io/commonera/simple-seder/

The public build supports intake, deterministic generation, editing, all cover concepts, the host guide, invitation, print, copy, and PDF download. It intentionally omits server-side draft saving and live model refinement. Local development and a Node deployment retain the SQLite and optional model endpoints.

## What is included

The current content pack contains:

- 9 themes, each with 12 approved inserts (108 inserts total)
- 14 seder sections in traditional order, with short, medium, and full copy
- 3 tone families with 3 opening options each
- 56 approved, section-mapped quotation records; modern copyrighted candidates remain excluded until permission is verified
- A 20/20 locally acquired and reproducible Haggadah corpus, with tracked source/extract hashes, rights decisions, exact passage locators, and source-level credits
- 2 complete beginner procedural backbones—Shir Ge’ulah and The Velveteen Rabbi’s Haggadah—each covering all 14 sections at the three content-length tiers
- Full-corpus featured-source matching, with a small number of exact approved passages from one featured work and at most one compatible supporting work
- 8 genuinely distinct original cover artworks; one gallery choice per composition

The 20 acquired full-text extracts feed a local-only organization and precomposition pipeline; no source collection is uploaded to an external model API. The tracked research library reconstructs approximately 1.846 million normalized source characters in source order across all 20 works, including 867 PDF pages plus four complete official-source snapshots, as 1,999 coherent segments. Each source receives a local editorial dossier describing its voice, best uses, beginner risks, political context, credits, exclusions, and coherent same-source passage sequences. The complete exact library is split into lazy per-source packs, while only reviewed source-order sequences can be selected for automatic insertion.

Dates entered by a host are ordinary Common Era calendar dates. The generated deliverables are a screen reading view, a print layout, and client-side PDF export; all three content tiers retain all 14 sections. The 20-, 45-, and 90-minute choices describe script length, while the app displays honest live group estimates of roughly 32–36, 55–65, and 95–110 minutes before dinner. In the concise tier, table questions are visibly optional and are not included in the core live estimate.

At generation time, the app first selects `shir-geulah-primary` or `velveteen-rabbi-primary` as a complete procedural backbone so a first-time host always receives a coherent 14-step ritual. Separately, the full 20-source matcher chooses a first-class featured editorial source by profile. The concise tier prefers 1–2 compatible passages from that work; the longer tiers prefer 2–3 across distinct sections and may add at most one passage from one compatible supporting source. Exact approved passage text, locator, provenance hash, rights state, and source ID remain immutable. Concise house copy supplies beginner directions, transitions, accessibility notes, and discussion prompts, while structural validation keeps reviewed wording in the majority.

The deterministic matcher assembles the finished document without a network call. If enabled at runtime, the small optional matching call receives only a compact allowlist of already reviewed IDs and may rerank those IDs or write short bridges; it never receives the 20-source collection and cannot rewrite source passages, foundational ritual text, or quotations. A timeout or invalid response leaves the deterministic draft unchanged.

## Validate and test

```bash
npm run content:validate
npm run sources:local:build
npm test
npm run build
```

The validator checks pack shape, IDs, HTTPS citations, cover assets, the 20-source acquisition manifest, exact-text hashes, source compatibility, runtime eligibility, and attribution metadata. Permission-specific or embedded-work issues print provenance reminders instead of incorrectly excluding an otherwise reusable source.

## PDF and printing

PDF export is generated in the browser with jsPDF and does not upload the Haggadah. The print stylesheet is the higher-fidelity option when typography, page breaks, or browser font rendering matter: choose **Print / Save PDF** and use the system print dialog. Review attribution and any permission-specific conditions before distributing a file.

## Sharing status

The GitHub Pages build is a public, noncommercial demo. Generated drafts remain in the visitor's browser unless they download, print, or copy them. Before commercial distribution, re-check the rights and attribution review in [`research/quotation-policy.md`](research/quotation-policy.md). Embedded material from an approved Haggadah must preserve the source-presented attribution exactly and also credit the containing Haggadah with locator, treatment, and hash.

## Future features

- **AI Companion:** an optional, clearly labeled guide that can answer beginner questions during planning and the seder, explain unfamiliar ritual objects or vocabulary in plain language, and suggest approved discussion prompts without replacing the reviewed Haggadah text.

## Editorial and rights notes

This is a free, noncommercial demo, not a blanket relicensing of source material. It accepts both standardized open licenses and explicit reuse or borrowing permission when attribution and stated constraints are followed. Two complete reviewed procedural backbones protect beginner coherence; the featured-source layer draws from locally reviewed source-order sequences and enforces strict source, section, compatibility, and passage-count limits. Exact page locators, printed attributions, treatments, and hashes remain internal; the final PDF lists each Haggadah actually used once in a compact source-level credit. See [`research/corpus-pregeneration-pipeline.md`](research/corpus-pregeneration-pipeline.md), [`research/corpus-editorial-acceptance.md`](research/corpus-editorial-acceptance.md), [`research/content-provenance-audit.md`](research/content-provenance-audit.md), [`research/cohesion-architecture.md`](research/cohesion-architecture.md), [`research/editorial-policy.md`](research/editorial-policy.md), [`research/quotation-policy.md`](research/quotation-policy.md), [`research/source-permission-evidence.md`](research/source-permission-evidence.md), and [`public/covers/README.md`](public/covers/README.md).
