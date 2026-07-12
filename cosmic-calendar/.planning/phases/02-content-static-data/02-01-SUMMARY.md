---
phase: 02-content-static-data
plan: 01
subsystem: content-data
tags: [hebcal, typescript, static-content, localstorage, hebrew-calendar]
requires:
  - 01-mobile-flow-skeleton
provides:
  - Typed twelve-month correspondence and season-reading dataset
  - Deterministic civil-date to Hebrew-date conversion
  - Symbolic Hebrew-calendar moon derivation
  - Versioned localStorage birth-profile schema
affects:
  - 03-visual-assets-typography
  - 03.1-client-feedback-copy-glyph-and-month-page-visual-magic
  - 04-upcoming-qa
tech-stack:
  added: ["@hebcal/core"]
  patterns: [normalized month keys, local-noon civil dates, authored static data, stable-input persistence]
key-files:
  created:
    - src/content.ts
  modified:
    - package.json
    - package-lock.json
    - src/App.tsx
    - src/styles.css
    - flow-state.test.mjs
key-decisions:
  - "Keep authored readings outside saved profiles so content can evolve without corrupting stored user input."
  - "Treat moon state as symbolic Hebrew-calendar rhythm, not astronomical calculation."
  - "Normalize Adar I and Adar II to one content key while retaining the exact Hebrew month label."
requirements-completed:
  - CAL-01
  - READ-01
  - READ-02
  - PROF-01
  - PROF-02
  - DATA-01
  - COPY-01
  - DATA-02
completed: 2026-07-11
commit: e9d9677
---

# Phase 2 Plan 1: Content & Static Data Summary

**A deterministic client-side Hebrew-calendar and authored-content layer now
powers current-month and birthday-derived readings without a backend or runtime
model.**

## Accomplishments

- Added `@hebcal/core` and a local-noon date conversion path that avoids UTC
  date-only shifts.
- Authored and typed all twelve normalized month correspondences, readings, and
  rituals.
- Added exact-label-preserving Adar I/II normalization and symbolic moon facts.
- Added a versioned `localStorage` schema that persists stable input/facts but
  resolves mutable authored content at render time.
- Added regression coverage for current-month detection, birthday conversion,
  deterministic storage, invalid input, and leap-year Adar behavior.

## Historical note

Phase 2 was implemented inline at `e9d9677` without a phase directory. This
handoff closeout backfills the missing GSD contract. Phase 03.1 later replaced
the original shared presentation copy with twelve authored birth portraits and
changed which derived facts are visible; the typed date/content/storage
foundation remains the same.

## Verification

- `npm run test:flow`: passing in the handoff working tree
- `npm run build`: passing in the handoff working tree
- Current source continues to recompute derived data from stored input rather
  than trusting stale persisted prose or calculations

---
*Phase: 02-content-static-data*
*Completed: 2026-07-11; canonical artifacts backfilled at developer handoff*
