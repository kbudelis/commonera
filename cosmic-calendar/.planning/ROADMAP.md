# Roadmap: Cosmic Calendar

## Overview

The v1.0 prototype is implemented through its welcome, birthday/skip paths,
Hebrew-calendar content, personal portraits, twelve-month gallery, and
Friday/moon return frame. Public developer-handoff hygiene is complete. The
isolated zodiac rotor remains the only open implementation decision.

## Phases

- [x] **Phase 1: Mobile Flow Skeleton** — Birthday and skip paths,
  accessibility foundation, and reduced-motion guard. (2026-07-11)
- [x] **Phase 2: Content & Static Data** — Hebrew-date logic, authored readings,
  and local profile persistence. (2026-07-11)
- [x] **Phase 3: Visual Assets & Typography** — Approved visual system and local
  assets with the rotor kept isolated. (2026-07-11)
- [x] **Phase 03.1: Client Feedback** — Shorter welcome, authored portraits, and
  twelve-month constellation gallery. (2026-07-11)
- [x] **Phase 4: Upcoming & QA** — Friday/moon return frame and prototype QA.
  (2026-07-11)
- [x] **Phase 04.1: Public Handoff Hygiene** — Keep generated runtime output and
  raw working notes local, retain core GSD documents, disclose prototype-only
  assets, and verify the app still works. (2026-07-12)
- [ ] **Phase 5: Zodiac Rotor Integration** — Selectively integrate the isolated
  rotor or formally defer it.

## Phase Details

### Phase 1: Mobile Flow Skeleton

**Status:** Complete and verified

**Requirements:** FLOW-01 through FLOW-05

**Plan:** `01-mobile-flow-skeleton/01-01-PLAN.md`

### Phase 2: Content & Static Data

**Status:** Complete and verified

**Requirements:** CAL-01, READ-01, READ-02, PROF-01, PROF-02, DATA-01, COPY-01, DATA-02

**Plan:** `02-content-static-data/02-01-PLAN.md`

### Phase 3: Visual Assets & Typography

**Status:** Complete and verified

**Requirements:** VIS-01 through VIS-04

**Plan:** `03-visual-assets-typography/03-01-PLAN.md`

### Phase 03.1: Client Feedback

**Status:** Implementation complete and verified for handoff

**Requirements:** FLOW-01, FLOW-02, FLOW-04, PROF-01, PROF-02, DATA-01, VIS-03, VIS-04, BROWSE-01

**Plan:** `03.1-client-feedback-copy-glyph-and-month-page-visual-magic/03.1-01-PLAN.md`

### Phase 4: Upcoming & QA

**Status:** Complete and verified for prototype handoff

**Requirements:** UP-01, UP-02, QA-01, QA-02

**Plan:** `04-upcoming-qa/04-01-PLAN.md`

### Phase 04.1: Public Handoff Hygiene

**Status:** Complete

**Requirements:** PUB-01, PUB-02, DISC-01, SEC-01

The application behavior is unchanged, core GSD documents remain, visual assets
are labeled prototype-only, and the best-effort local preflight passes.

### Phase 5: Zodiac Rotor Integration

**Status:** Not implemented; next-developer decision

**Requirements:** MOT-01, MOT-02

**Plan:** `05-zodiac-rotor-integration/05-01-PLAN.md`

Next steps:

1. Inspect the isolated rotor without merging its worktree wholesale.
2. Choose selective integration or formal deferral.
3. If integrated, preserve the current gallery, both routes, keyboard support,
   focus, overflow behavior, and reduced-motion parity.
4. Re-run tests/build and complete visual/device review.

## Progress

| Phase | Status | Date |
|---|---|---|
| 1. Mobile Flow Skeleton | Complete | 2026-07-11 |
| 2. Content & Static Data | Complete | 2026-07-11 |
| 3. Visual Assets & Typography | Complete | 2026-07-11 |
| 03.1 Client Feedback | Complete for handoff | 2026-07-11 |
| 4. Upcoming & QA | Complete for handoff | 2026-07-11 |
| 04.1 Public Handoff Hygiene | Complete | 2026-07-12 |
| 5. Zodiac Rotor Integration | Decision pending | — |

## Handoff Boundary

The prototype is usable without Phase 5. It remains a prototype: final
screenshots, physical-device review, asset/library clearance, expert content
review, and astronomical accuracy are still required before production.
