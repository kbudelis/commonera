# Decisions & Open Questions — Cosmic Calendar

Pre-roadmap decision ledger. Resolves the gaps in the PRD that a planner/executor
needs before building. Source: PRD + user decisions (2026-07-09).

> **Content authorship note:** The user is not a Judaism subject-matter expert and
> there is no CE / expert review at this stage. All Kabbalistic content is produced
> by best-judgment research with sources cited and variance flagged. Everything is
> revisable if/when CE engages.

## Resolved

| # | Decision | Choice | Notes |
|---|----------|--------|-------|
| A1 | Content generation model | **Pre-authored static** | No runtime LLM, no backend. Author 12 months of copy (AI-assisted) → stored as data → rendered. Deterministic, reviewable, instant. |
| A2 | Backend | **None** | Follows from A1. Pure client app. |
| A3 | Moon phase source | **Hebrew day-of-month** | Lunar month already encodes phase: day 1 ≈ new moon, ~day 15 ≈ full moon. Next full/new = next 15th/1st of the Hebrew month. No astronomy lib (§4 defers that to v2). |
| B4 | Missing attributions (tribe, Hebrew letter, sense) | **We research + author** | Not in PRD. Source from Sefer Yetzirah (Ch. 5) via best judgment; cite + flag variance. See `research/MONTH-ATTRIBUTIONS.md`. |
| B5 | Reading copy (archetype, grounding, tikkun, personal) | **We author** | Seeds in PRD §5/§7. No CE review now. Current month written richly first. |
| C6 | Months built for sprint | **12 authored readings + 12 compact portraits** | The prototype now supports every month in both the personal route and the browse gallery. Content depth can still vary, but no month uses a runtime-generated placeholder. |
| C7 | Leap-year Adar | **Collapse Adar I/II → single Adar (Pisces)** | 12-month model; hebcal detects leap years. |
| C7 | Sunset rollover / time | **Date-only input, no time/timezone** | §4 excludes timezones. Convert civil date; accept ±1-day edge near sunset as a known limitation. |
| C8 | Friday Pulse / moon / browse depth | **Prototype-depth Friday + moon cards and browse-all-12 ship now** | The upcoming panel computes the current Friday and Hebrew-day moon signal; deeper editorial cards and exact astronomy remain future work. |
| C9 | Sharing mechanism | **Share-export desired, design-gated** | Make the season card genuinely share-worthy (mobile 9:16) first; build Share button / image export after the design is locked. |
| D | Primary device | **Mobile-first (portrait)** | Desktop responsive is secondary. |
| D | Persistence / accounts | **No accounts now; `localStorage` for birth profile** | Rapid prototype. Architect so real accounts can be added later. |
| — | Content tone/safety | **Wisdom, not observance; discovery, not declaration** | Per PRD §7/§8. No fate claims. No explicit Jewish symbols in primary UI. |
| A2b | Framework + host | **Vite + React + TS → shared GitHub Pages** | The parent `commonera` repo builds this app through `.site/build-all.sh` and deploys only from `main`. The earlier Cloudflare Pages recommendation in `research/STACK.md` is historical research, not the active deployment. |
| B4b | Attribution lineage (resolved by research) | **Gra / GalEinai (R. Ginsburgh)** | Single coherent lineage; matches PRD zodiac. Letters + tribes (Numbers-2 camp order) verifiable; **sense/faculty column is the variant, lower-confidence part** — cross-check before published copy. See `research/MONTH-ATTRIBUTIONS.md`. |
| Lic | `@hebcal/core` GPL-2.0 licensing | **Accept for internal prototype** (not shipping) | Move fast now; licensing checkpoint (permissive alternative or clearance) deferred to **before any production / distribution**. Per user 2026-07-10. |
| WF | Prototype workflow ownership | **Codex foundation + v0 visual directions + Codex worktree finalists** | Codex owns the curated Vite base, shared contracts, interaction implementation, visual QA, and backend architecture. v0 explores 3–4 visual directions from the same baseline. Lovable is not required. |
| PRI | Build priorities | **Visual prototyping first; backend architecture second** | Freeze one shared data/service contract before branching. Visual variants may change presentation and interaction, not schemas or backend behavior. Implement the real backend only after selecting the visual winner unless scope is explicitly expanded. |
| FLOW | Welcome and skip behavior | **Birthday entry owns the skip; sections settle full-screen** | This supersedes the original welcome-level skip and proximity-snap language. It is the accepted Phase 03.1 interaction contract. |
| PERS | Personal reading presentation | **Literary portrait first; source facts remain in the authored data model** | The user-facing result prioritizes a cohesive reading over exposing a raw attribution table. Source lineage and uncertainty still belong in research/content review. |
| ROTOR | Experimental wheel interaction | **Deferred to Phase 5** | The rotor remains isolated on `codex/rotor-prototype`; do not merge it blindly into the dirty handoff branch. |

## Still open (mostly moodboard-dependent — user in progress)

| # | Question | Status |
|---|----------|--------|
| D | Final product name (working title "Cosmic Calendar") | Open — moodboard |
| D | Palette + Hebrew display typeface (OFL leads: Frank Ruhl Libre / Noto Serif Hebrew; UI: Heebo / Assistant) | Open — moodboard |
| ROTOR | Does the experimental rotor graduate into the handoff build? | Deferred to the next developer; Phase 5 remains open |

## Ownership of next artifacts

**Research → Codex** (per user; Opus does not research). Opus provides the spec at
`.planning/research/BRIEF.md`. Codex produces:
1. `research/MONTH-ATTRIBUTIONS.md` — authoritative 12-month table (name, span,
   zodiac/mazal, tribe, Hebrew letter, sense/faculty) with sources + confidence.
2. `research/STACK.md` — static mobile-first SPA stack + `hebcal` + hosting + share-export.
3. `research/PITFALLS.md` (optional) — Hebrew date edge cases, RTL typography, share gotchas.

**Planning and verification → Opus/Claude. Execution and research → Codex.** The
current contract is in `REQUIREMENTS.md`, `ROADMAP.md`, and `STATE.md`; this ledger
records why that contract changed. Content is now implemented in `src/content.ts`,
and future revisions should preserve citations, lineage notes, and uncertainty.
