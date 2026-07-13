---
phase: 04-upcoming-qa
plan: 01
subsystem: ui-content
tags: [friday, shabbat, moon, calendar, qa, accessibility]
requires:
  - 02-content-static-data
  - 03.1-client-feedback-copy-glyph-and-month-page-visual-magic
provides:
  - Derived Friday/Shabbat/countdown state
  - Event-month-honest symbolic new/full moon windows
  - Final Friday and moon card composition
  - Expanded flow, date-boundary, accessibility-structure, and layout-contract tests
affects:
  - 05-zodiac-rotor-integration
tech-stack:
  added: []
  patterns: [local-noon date arithmetic, fixed-date boundary tests, symbolic lunar windows]
key-files:
  modified:
    - src/content.ts
    - src/App.tsx
    - src/styles.css
    - flow-state.test.mjs
key-decisions:
  - "Keep moon timing explicitly symbolic and based on Hebrew day windows."
  - "Resolve an upcoming moon event against its own Hebrew month rather than reusing the current month's label."
  - "Keep the sprint panel concise; full standalone Friday and moon experiences remain future work."
requirements-completed:
  - UP-01
  - UP-02
  - QA-01
  - QA-02
completed: 2026-07-11
commit: "handoff commit containing this summary"
---

# Phase 4 Plan 1: Upcoming & QA Summary

**The final placeholder is now a computed Friday/moon return panel backed by
fixed-date boundary tests and the existing accessible mobile flow.**

## Accomplishments

- Added Friday, Shabbat, and countdown states with civil and Hebrew date labels.
- Added seven-day symbolic new/full moon-window discovery that correctly handles
  month boundaries.
- Rendered the final Friday and moon cards with local moon-phase artwork.
- Extended regression coverage for late Tammuz/new Av, live Friday, full-moon
  windows, touch/keyboard semantics, reduced motion, and screen composition.

## Scope retained for later

- Full standalone Friday Pulse and moon-card experiences
- Notifications or accounts
- Astronomical moon calculations
- Final screenshot production and subjective visual acceptance

## Handoff note

The Phase 4 implementation shares the same handoff commit as Phase 03.1. Its
functional logic and automated checks are complete; confirm a clean checkout
before branch switching.

---
*Phase: 04-upcoming-qa*
*Implementation complete: 2026-07-11*
