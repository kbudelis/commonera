# kinda jewish

**Kinda Jewish, fully welcome. No Hebrew or Jewish guilt required.**

A front door back into Jewish life for the majority of American Jews who are culturally or ethnically Jewish but don't connect with synagogue life — the curious, the intermarried, the "haven't thought about it since my bar mitzvah" crowd. Think Chabad.org's comprehensiveness and utility, in the register of an independent culture publication.

A Common Era project.

## Sections

- **Home** — a few clear entry points: what's coming up, learn something, meet people, just curious
- **Holidays** — 7 holidays, each with what it is, why it might matter belief-aside, one easy way to mark it, and a recipe. Dates come live from the [Hebcal](https://www.hebcal.com/) API at build time
- **Culture** — food, humor, podcasts, shows, and creators; the front door for people who'd never click "Learn"
- **Learn** — organized by actual question, not textbook category
- **Community** — real ways to show up in person (OneTable, Mem Global, Reboot, 18Doors)
- **Life Moments** — judgment-free life-cycle guidance for people without a rabbi on speed dial
- **Ask** — a curated FAQ (identity basics + what-to-wear-and-say etiquette), links to real humans who answer questions, and a stub for a future live Q&A

## Editorial rules

- Assume zero background: no unexplained Hebrew, no synagogue familiarity, no guilt
- Every external resource links out and credits its source — this is a curated guide
- No invented statistics, quotes, organizations, or URLs
- The site's own copy takes no position on Israel/Zionism; linked sources with a point of view are fine
- Photography is openly licensed (public domain / Creative Commons via Wikimedia Commons), credited in situ, and treated with a grayscale + accent-tint duotone

## Stack

Next.js (App Router) + Tailwind CSS v4, fully static output. Space Grotesk + Inter, dark oklch-based palette with a five-accent rotation (one accent per section).

## Development

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # static production build
```

Holiday dates are fetched from Hebcal during the build and revalidate daily on a server deployment; if the fetch fails, hand-written fallback dates are used.

The build is a full static export (`out/`). For the commonera GitHub Pages gallery, the deploy workflow sets `BASE_PATH=/commonera/kindajewish/` and the config picks it up automatically.

## Sprint notes

- **What works:** all 7 sections are built and linked; 7 holiday guides with live Hebcal dates; 16 culture cards; a two-part FAQ (identity + event etiquette); real openly-licensed photography with a duotone treatment and per-image credits; mobile nav; static export.
- **What's rough:** the Ask form is a stub (nothing is stored); culture card headlines link to publication homepages rather than specific articles in several cases; Community isn't location-aware; photo art direction is "best available on Wikimedia Commons," not a real shoot.
- **Tools/models:** built with Claude Code (Claude Fable 5); design handoff prototyped separately and recreated in Next.js; resources curated from the Common Era knowledge base docs; photos from Wikimedia Commons; dates from the Hebcal API.
- **Next time:** wire the Ask form to real storage + a commissioned answer column, deep-link every culture card to a specific piece, add location-aware community listings, and commission real editorial photography.
