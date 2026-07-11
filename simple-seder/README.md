# A Haggadah for Beginners

A local-first Haggadah builder that turns a host's time, audience, tone, language, and themes into a complete 14-step seder. The editorial pack is deterministic; an OpenAI API key can optionally improve matching without becoming a runtime requirement.

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
- 8 genuinely distinct original cover artworks; one gallery choice per composition

Dates entered by a host are ordinary Common Era calendar dates. The generated deliverables are a screen reading view, a print layout, and client-side PDF export; all 20-, 45-, and 90-minute formats retain all 14 sections.

## Validate and test

```bash
npm run content:validate
npm test
npm run build
```

The validator checks pack shape, IDs, HTTPS citations, cover assets, and attribution metadata. Permission-specific or embedded-work issues print review warnings instead of incorrectly excluding an otherwise reusable source.

## PDF and printing

PDF export is generated in the browser with jsPDF and does not upload the Haggadah. The print stylesheet is the higher-fidelity option when typography, page breaks, or browser font rendering matter: choose **Print / Save PDF** and use the system print dialog. Review attribution and any permission-specific conditions before distributing a file.

## Sharing status

The GitHub Pages build is a public, noncommercial demo. Generated drafts remain in the visitor's browser unless they download, print, or copy them. Before commercial distribution, re-check the rights and attribution review in [`research/quotation-policy.md`](research/quotation-policy.md) and confirm that every embedded third-party work is independently cleared.

## Editorial and rights notes

This is a free, noncommercial demo, not a blanket relicensing of source material. It accepts both standardized open licenses and explicit reuse or borrowing permission when attribution and stated constraints are followed. See [`research/editorial-policy.md`](research/editorial-policy.md), [`research/quotation-policy.md`](research/quotation-policy.md), [`research/source-permission-evidence.md`](research/source-permission-evidence.md), and [`public/covers/README.md`](public/covers/README.md).
