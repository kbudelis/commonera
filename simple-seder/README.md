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

`OPENAI_API_KEY` is optional. With a key, `/api/match` may ask OpenAI to select only from approved quote, cover, and section IDs. With no key—or if matching times out, fails, or returns invalid data—the same request succeeds using deterministic local selection. Set `OPENAI_MODEL` to override the default matching model.

## Public demo

The shared `kbudelis/commonera` GitHub Pages workflow builds this project with `BASE_PATH=/commonera/simple-seder/` and publishes it at:

https://kbudelis.github.io/commonera/simple-seder/

The public build supports intake, deterministic generation, editing, all cover concepts, the host guide, invitation, print, copy, and PDF download. It intentionally omits server-side draft saving and live model refinement. Local development and a Node deployment retain the SQLite and optional model endpoints.

## What is included

The current content pack contains:

- 9 themes, each with 12 approved inserts (108 inserts total)
- 14 seder sections in traditional order, with short, medium, and full copy
- 3 tone families with 3 opening options each
- 53 approved, section-mapped quotation records; modern copyrighted candidates remain excluded until permission is verified
- 20 source records, including Shir Ge’ulah and The Velveteen Rabbi’s Haggadah
- 2 complete reviewed primary source spines, each covering all 14 sections at 20, 45, and 90 minutes
- 8 genuinely distinct original cover artworks; one gallery choice per composition

Dates entered by a host are ordinary Common Era calendar dates. The generated deliverables are a screen reading view, a print layout, and client-side PDF export; all 20-, 45-, and 90-minute formats retain all 14 sections.

At generation time, the app selects exactly one primary voice—`shir-geulah-primary` or `velveteen-rabbi-primary`—for the complete Haggadah. Concise original copy supplies beginner directions, transitions, accessibility notes, and discussion prompts. Structural validation requires exact reviewed passage blocks in every section and at least 50% reviewed-source wording overall. Secondary-source mixing is currently disabled.

## Validate and test

```bash
npm run content:validate
npm test
npm run build
```

The validator checks pack shape, IDs, HTTPS citations, cover assets, and attribution metadata. Permission-specific or embedded-work issues print provenance reminders instead of incorrectly excluding an otherwise reusable source.

## PDF and printing

PDF export is generated in the browser with jsPDF and does not upload the Haggadah. The print stylesheet is the higher-fidelity option when typography, page breaks, or browser font rendering matter: choose **Print / Save PDF** and use the system print dialog. Review attribution and any permission-specific conditions before distributing a file.

## Sharing status

The GitHub Pages build is a public, noncommercial demo. Generated drafts remain in the visitor's browser unless they download, print, or copy them. Before commercial distribution, re-check the rights and attribution review in [`research/quotation-policy.md`](research/quotation-policy.md). Embedded material from an approved Haggadah must preserve the source-presented attribution exactly and also credit the containing Haggadah with locator, treatment, and hash.

## Future features

- **AI Companion:** an optional, clearly labeled guide that can answer beginner questions during planning and the seder, explain unfamiliar ritual objects or vocabulary in plain language, and suggest approved discussion prompts without replacing the reviewed Haggadah text.

## Editorial and rights notes

This is a free, noncommercial demo, not a blanket relicensing of source material. It accepts both standardized open licenses and explicit reuse or borrowing permission when attribution and stated constraints are followed. The runtime uses one of two complete reviewed primary spines and enforces a majority-source floor while keeping original beginner directions separate. Exact page locators, printed attributions, treatments, and hashes remain internal; the final PDF lists the selected Haggadah once in a compact source-level credit. See [`research/content-provenance-audit.md`](research/content-provenance-audit.md), [`research/cohesion-architecture.md`](research/cohesion-architecture.md), [`research/editorial-policy.md`](research/editorial-policy.md), [`research/quotation-policy.md`](research/quotation-policy.md), [`research/source-permission-evidence.md`](research/source-permission-evidence.md), and [`public/covers/README.md`](public/covers/README.md).
