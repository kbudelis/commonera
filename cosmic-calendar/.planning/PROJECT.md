# Cosmic Calendar

## What This Is

A mobile-first seasonal-reflection experience rooted in the Jewish mystical
astrology tradition of *Sefer Yetzirah*. A visitor can enter a name and birthday
for a personal Hebrew birth-month portrait or skip directly to the current
month, then explore authored month readings, a small ritual, and lightweight
Friday/moon return cues.

The product begins with familiar Western zodiac recognition, then reveals the
Hebrew month as a deeper rhythm of reflection, repair, and seasonal practice.
It is reflective rather than predictive and does not require religious
knowledge or observance.

## Core Value

A user with zero knowledge of the Hebrew calendar receives a meaningful,
beautiful season reading and personal portrait in under 60 seconds, while the
Jewish mystical layer lands as discovery rather than prerequisite.

## Business Context

- **Customer:** Culturally Jewish millennials and Gen Z who already understand
  astrology, wellness, or lunar ritual; secondarily, spiritually curious
  non-Jews.
- **Prototype purpose:** Validate the Common Era concept and emotional/visual
  direction; no sprint revenue model.
- **Success signal:** Users recognize themselves in the portrait, understand
  the monthly/weekly return cadence, and find the Hebrew-calendar reveal
  interesting rather than alienating.
- **Strategy source:** `Cosmic Calendar PRD __ COMMON ERA × VIBE CODING.md`,
  superseded where later client feedback and accepted planning decisions are
  explicit.

## Current Milestone: v1.0 Prototype Handoff

**Status:** Handoff-ready feature branch; not a production release.
**Completed boundaries:** Phases 1, 2, 3, inserted 03.1, and 4.
**Deferred boundary:** Phase 5 zodiac rotor integration.
**Deployment caveat:** The public GitHub Pages build follows `main`; the latest
feature-branch implementation is not public until the handoff PR is merged and
Pages redeploys.

### Implemented

- Two-page cinematic welcome and automatic zodiac transition
- Name/date personal path plus birthday-level skip to the current month
- Deterministic Hebrew-date/month derivation and versioned local persistence
- Twelve authored month readings and twelve authored birth portraits
- Western sign + Hebrew month/letter personal composition
- Touch/click/keyboard twelve-month constellation gallery
- Ritual and discoverable Gra / Arizal-Gra grounding
- Derived Friday/Shabbat state and symbolic upcoming moon windows
- Locked portrait shell, full-screen reading settlement, focus, keyboard, and
  reduced-motion contracts

### Validation

- `npm run test:flow` — 24/24 passing
- `npm run build` — passing
- 390 × 844 no-screenshot Chrome smoke — both paths, twelve gallery options,
  keyboard selection, full-screen section geometry, no horizontal overflow,
  and reduced-motion preference all passed

## Requirements

### Validated for the prototype handoff

- Mobile welcome-to-upcoming journey through personal and skip paths
- Deterministic Hebrew calendar, month, storage, and symbolic moon data
- Twelve season readings, twelve birth portraits, and concrete rituals
- Approved local type, letter art, constellation art, and blue/paper composition
- Browse-all-twelve constellation gallery
- Friday/moon teaser and prototype accessibility/viewport QA

### Active / next developer

- [x] Capture the current application source and GSD closeout records in one
  intentional feature-branch handoff commit.
- [ ] Run the paused final screenshot and physical-device visual review.
- [ ] Decide Phase 5: selectively integrate `codex/rotor-prototype` or formally
  move it to a later milestone.
- [ ] Rerun all flow, portrait, keyboard, overflow, and reduced-motion checks if
  rotor behavior is introduced.
- [ ] Merge the accepted feature commit to `main` and verify GitHub Pages.
- [ ] Resolve production library, asset, content, and calendar-accuracy gates.

### Out of Scope for v1.0

- Full planetary Mazal/Sefirot chart
- Full Jewish holiday calendar
- Runtime AI, CMS, database, server, login, accounts, social, or community
- Prediction or fate claims
- Astronomically exact moon data, birth time, sunset, location, or timezone
- Full standalone Friday Pulse/moon experiences, notifications, or share export
- Production distribution without explicit legal/editorial review

## Current Architecture

- **Runtime:** Vite + React + TypeScript static SPA
- **Date engine:** `@hebcal/core`; accepted for prototype use only pending a
  production licensing decision
- **State:** Pure reducer for flow plus local React state; no routing library
- **Content:** Authored typed records in `src/content.ts`; no runtime model
- **Persistence:** `localStorage` key `cosmic-calendar.birth-profile.v1`
- **Backend:** None
- **Deployment:** Shared monorepo GitHub Pages workflow; `BASE_PATH` is injected
  as `/commonera/cosmic-calendar/`
- **Testing:** TypeScript test build plus Node's built-in test runner and a
  temporary Chrome portrait smoke check

The main implementation is concentrated in `src/flow.ts`, `src/content.ts`,
`src/App.tsx`, and `src/styles.css`. The code is intentionally prototype-sized;
modularize only after preserving the accepted visual behavior.

## Constraints

- Mobile-first portrait composition; desktop is a centered shell, not a separate
  product experience.
- No backend or runtime network dependency may be added casually.
- Moon language must remain symbolic until an astronomy layer exists.
- Civil date conversion is not sunset-accurate; after-sunset births may shift
  the Hebrew day.
- Correspondences follow the documented Gra / Arizal-Gra lineage and must not be
  represented as universal across traditions.
- Wisdom, not observance; discovery, not declaration; no fate claims.
- The Hebrew glyph and reading remain the focal point; visual effects support
  rather than replace the content.
- The public site deploys only through the parent repo's `main` workflow.
- Before production, resolve Hebcal licensing, Hebrew-art provenance, font
  terms, constellation sources, and expert review of authored spiritual copy.

## Key Decisions

| Decision | Rationale | Outcome |
|---|---|---|
| Use the Hebrew calendar as the hidden engine and Western zodiac as the familiar entry | Recognition builds trust before the distinctive Hebrew-month discovery | Validated by client feedback |
| Keep content authored and deterministic | Sprint speed, instant results, reviewability, and no backend requirement | Good for prototype |
| Persist stable input/facts rather than authored prose | Copy can evolve without corrupting saved profiles | Good |
| Use local-noon civil dates | Avoid JavaScript UTC date-only shifts | Good; sunset accuracy still deferred |
| Treat moon phases as symbolic Hebrew-month rhythm | Avoid unsupported astronomy claims in sprint scope | Good for prototype |
| Normalize Adar I/II to one content key while retaining exact facts | Maintain a twelve-entry content model without losing calendar identity | Good |
| Use twelve authored personal portraits | Client feedback favored specific recognition/depth over one generic template | Accepted in Phase 03.1 |
| Put skip on the birthday frame | Preserve the poetic two-page welcome while keeping personalization optional | Accepted in Phase 03.1 |
| Use full-screen post-birth settlement | Protect each screenshot-oriented composition and prevent partial frames | Accepted in Phase 03.1 |
| Promote browse-all-twelve into the prototype | The constellation gallery became the chosen static exploration mechanism | Accepted in Phase 03.1 |
| Keep Friday/moon concise | Communicate return cadence without expanding into full weekly/monthly products | Good for v1.0 |
| Keep the rotor isolated | Avoid destabilizing the finished static flow before a deliberate integration pass | Correct; Phase 5 remains open |
| Deploy through shared GitHub Pages | Matches the actual monorepo workflow and public URL | Current source of truth |

## GSD Operating Boundary

The local GSD installation is shared between `.claude/` and `.codex/`.
`.planning/STATE.md`, `ROADMAP.md`, and `REQUIREMENTS.md` are the current contract;
phase plans/summaries/verifications are historical execution evidence. Planning
and verification belong to Opus/Claude; implementation and all research belong
to Codex unless the user explicitly changes that split.

On resume, read `README.md`, then `STATE.md`, `ROADMAP.md`, `REQUIREMENTS.md`,
`HANDOFF.json`, and `.continue-here.md` before acting.

---
*Last updated: 2026-07-11 after GSD prototype-handoff reconciliation*
