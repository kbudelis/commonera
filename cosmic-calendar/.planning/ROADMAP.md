# Roadmap: Cosmic Calendar

## Overview

Milestone v1.0 produced a handoff-ready mobile prototype in five completed
delivery boundaries: flow, typed calendar/content data, approved visual assets,
an inserted client-feedback pass, and a computed Friday/moon return frame with
prototype QA. The sixth boundary—the isolated zodiac rotor—is intentionally
deferred to the next developer rather than falsely marked complete.

This roadmap describes the handoff feature branch. The latest Phase 03.1 and
Phase 4 implementation is captured there but still needs PR review and merge
before it is part of the public GitHub Pages build.

## Phases

- [x] **Phase 1: Mobile Flow Skeleton** — Establish the birthday and skip paths,
  ordered reading landmarks, accessibility foundation, and reduced-motion guard.
  (completed 2026-07-11)
- [x] **Phase 2: Content & Static Data** — Add deterministic Hebrew-date logic,
  twelve authored month readings, profile persistence, and grounding content.
  (implemented at `e9d9677`; GSD artifacts backfilled 2026-07-11)
- [x] **Phase 3: Visual Assets & Typography** — Apply the blue/paper system,
  Vollkorn titles, Lalou Hebrew glyphs, and constellation artwork while keeping
  the rotor isolated. (completed 2026-07-11)
- [x] **Phase 03.1: Client Feedback — Copy, Glyph, and Month-Page Visual Magic**
  — Shorten the welcome, author month-specific portraits, and add the
  twelve-month constellation gallery. (implementation complete 2026-07-11)
- [x] **Phase 4: Upcoming & QA** — Replace the placeholder with computed
  Friday/moon cards and run automated plus portrait-browser smoke checks.
  (implementation complete 2026-07-11)
- [ ] **Phase 5: Zodiac Rotor Integration** — Deferred to the next developer;
  the isolated prototype remains on `codex/rotor-prototype`.

## Phase Details

### Phase 1: Mobile Flow Skeleton

**Goal:** Establish a deterministic, accessible mobile journey through welcome,
birthday or skip, personal reading, month reading, and upcoming.
**Depends on:** Nothing
**Requirements:** FLOW-01, FLOW-02, FLOW-03, FLOW-04, FLOW-05
**Plans:** 1/1 complete
**Verification:** Passed

Plans:

- [x] `01-01-PLAN.md` — Build and validate the mobile flow foundation.

Phase 03.1 intentionally evolved the placeholder-era welcome/scroll presentation
while retaining Phase 1's reducer, landmark, validation, accessibility, and
reduced-motion foundations. Current accepted behavior lives in
`REQUIREMENTS.md`, not in the historical Phase 1 plan wording.

### Phase 2: Content & Static Data

**Goal:** Power current-month and birthday-derived readings with deterministic
typed data and versioned local persistence.
**Depends on:** Phase 1
**Requirements:** CAL-01, READ-01, READ-02, PROF-01, PROF-02, DATA-01, COPY-01,
DATA-02
**Plans:** 1/1 complete
**Verification:** Passed; historical artifacts backfilled from `e9d9677`, current
source, and tests

Plans:

- [x] `02-01-PLAN.md` — Implement the static calendar/content foundation.

### Phase 3: Visual Assets & Typography

**Goal:** Apply the approved visual system using the real local type, Hebrew
letter, and constellation assets without importing the separate rotor.
**Depends on:** Phases 1 and 2
**Requirements:** VIS-01, VIS-02, VIS-03, VIS-04
**Plans:** 1/1 complete
**Verification:** Passed

Plans:

- [x] `03-01-PLAN.md` — Integrate and refine the Phase 3 visual composition.

### Phase 03.1: Client Feedback — Copy, Glyph, and Month-Page Visual Magic

**Goal:** Tighten onboarding, deepen the personal/month copy, and make all
twelve readings explorable through a celestial constellation gallery.
**Depends on:** Phase 3
**Requirements:** FLOW-01, FLOW-02, FLOW-04, PROF-01, PROF-02, DATA-01,
VIS-03, VIS-04, BROWSE-01
**Plans:** 1/1 complete
**Verification:** Passed for functional handoff; screenshots remain paused

Plans:

- [x] `03.1-01-PLAN.md` — Apply the accepted client-feedback direction.

### Phase 4: Upcoming & QA

**Goal:** End both app paths on a credible computed Friday/moon return frame and
verify the locked portrait shell.
**Depends on:** Phases 2 and 03.1
**Requirements:** UP-01, UP-02, QA-01, QA-02
**Plans:** 1/1 complete
**Verification:** Passed for prototype handoff

Plans:

- [x] `04-01-PLAN.md` — Implement return-cadence data/UI and run QA.

### Phase 5: Zodiac Rotor Integration — Deferred Handoff Boundary

**Goal:** Decide whether and how the isolated rotor becomes the persistent zodiac
renderer without competing with the completed month gallery or regressing either
mobile path.
**Depends on:** Phase 4
**Requirements:** MOT-01, MOT-02
**Plans:** 0/1 complete; pending plan exists
**Status:** Not implemented; next developer decision

Planned work:

- [ ] `05-01-PLAN.md` — Decide selective integration versus formal deferral,
  execute the approved boundary, and reverify the milestone.
- [ ] Inspect `codex/rotor-prototype` at `84a8963` and the retained worktree.
- [ ] Choose either selective rotor integration or formal deferral to a later
  milestone; do not merge the entire worktree blindly.
- [ ] If integrated, adapt it behind the existing zodiac visual boundary and
  rerun every flow, portrait, keyboard, and reduced-motion check.
- [ ] Update MOT-01/MOT-02 verification and deploy only after both paths pass.

## Progress

**Execution order:** 1 → 2 → 3 → 03.1 → 4 → 5
**Prototype handoff:** 5 of 6 phase boundaries resolved; Phase 5 intentionally
deferred.

| Phase | Plans Complete | Status | Date |
|---|---:|---|---|
| 1. Mobile Flow Skeleton | 1/1 | Complete, verified | 2026-07-11 |
| 2. Content & Static Data | 1/1 | Complete, verified; artifacts backfilled | 2026-07-11 |
| 3. Visual Assets & Typography | 1/1 | Complete, verified | 2026-07-11 |
| 03.1 Client Feedback | 1/1 | Implementation complete, verified for handoff | 2026-07-11 |
| 4. Upcoming & QA | 1/1 | Implementation complete, verified for handoff | 2026-07-11 |
| 5. Zodiac Rotor Integration | 0/1 | Pending plan; deferred to next developer | — |

## Closeout boundary

The v1.0 sprint prototype is usable without Phase 5, but the milestone is not a
production release. Legal/content review, final screenshot selection, merge to
`main`, and public Pages verification remain explicit handoff tasks.
