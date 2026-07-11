# Roadmap: Cosmic Calendar

## Overview

Milestone v1.0 compresses the PRD's core experience into four short delivery
boundaries: first make the entire mobile journey navigable, then make its readings
real, then apply the approved Blue Zodiac visual/motion system, and finally complete
the moon/Friday return cadence and mobile QA. Production hardening and nice-to-have
experiences remain explicitly deferred.

## Phases

- [ ] **Phase 1: Mobile Flow Skeleton** - Complete the placeholder welcome, optional birthday, personal, month, and upcoming journey.
- [ ] **Phase 2: Content & Static Data** - Make the current month and all twelve lightweight birth profiles deterministic and meaningful.
- [ ] **Phase 3: Visual System & Motion** - Apply the Blue Zodiac, light-paper system, Hebrew/constellation elements, and approved motion language.
- [ ] **Phase 4: Upcoming & QA** - Finish the moon/Friday return panel and verify both mobile paths.

## Phase Details

### Phase 1: Mobile Flow Skeleton
**Goal**: Users can traverse the complete placeholder experience through either the birthday or skip path.
**Depends on**: Nothing (first phase)
**Requirements**: FLOW-01, FLOW-02, FLOW-03, FLOW-04, FLOW-05
**Success Criteria** (what must be TRUE):
  1. Welcome phrases appear sequentially over the full-screen Blue Zodiac placeholder.
  2. User can advance to optional birthday input or skip directly to the month placeholder.
  3. A submitted birthday reveals the personal placeholder; skipping removes that section.
  4. Personal, month, and upcoming placeholders form one continuous softly settling mobile page without login.
**Plans**: 1 plan
**UI hint**: yes

Plans:
- [ ] 01-01: Build and validate the six-state mobile wireframe.

### Phase 2: Content & Static Data
**Goal**: Users receive a complete current-month reading and a coherent profile for any valid birthday.
**Depends on**: Phase 1
**Requirements**: CAL-01, READ-01, READ-02, PROF-01, PROF-02, DATA-01, COPY-01, DATA-02
**Success Criteria** (what must be TRUE):
  1. The current Hebrew month is detected and displays every required reading field plus a concrete ritual.
  2. Any valid birthday returns its Hebrew date and complete compact profile, including Adar normalization.
  3. The Jewish/Kabbalistic grounding is discoverable while the primary hook remains universal.
  4. Identical dates produce identical immediate, non-predictive results without a server.
**Plans**: 1 plan
**UI hint**: yes

Plans:
- [ ] 02-01: Add the typed calendar/content model and replace placeholder copy.

### Phase 3: Visual System & Motion
**Goal**: Users experience the approved Blue Zodiac direction as a coherent, screenshot-ready mobile composition.
**Depends on**: Phase 1; may overlap Phase 2 and integrate after its content slots stabilize
**Requirements**: VIS-01, VIS-02, VIS-03, VIS-04, MOT-01, MOT-02
**Success Criteria** (what must be TRUE):
  1. The zodiac moves from full-screen to full-width to top arc with `easeInOutCubic` visual transitions.
  2. Paper background, typography, Hebrew glyph, and constellation read as separate intentional elements.
  3. Personal and month compositions remain legible and complete in a 9:16 screenshot.
  4. Reduced-motion mode retains the full experience without large spatial motion.
**Plans**: 1 plan
**UI hint**: yes

Plans:
- [ ] 03-01: Integrate the visual assets, persistent zodiac renderer, and motion system.

### Phase 4: Upcoming & QA
**Goal**: Users finish on a credible return-cadence panel and can complete either path reliably.
**Depends on**: Phases 2 and 3
**Requirements**: UP-01, UP-02, QA-01, QA-02
**Success Criteria** (what must be TRUE):
  1. The final section communicates the next Friday Pulse or current Friday state.
  2. It presents the symbolic current moon and a relevant upcoming new/full moon window.
  3. Both birthday and skip paths work on target mobile viewports without clipping or scroll traps.
  4. Essential controls work by touch and keyboard with reduced-motion parity.
**Plans**: 1 plan
**UI hint**: yes

Plans:
- [ ] 04-01: Complete the upcoming panel and run final mobile/accessibility QA.

## Progress

**Execution Order:** Phase 1 → Phase 2 and Phase 3 → Phase 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Mobile Flow Skeleton | 0/1 | Not started | - |
| 2. Content & Static Data | 0/1 | Not started | - |
| 3. Visual System & Motion | 0/1 | Not started | - |
| 4. Upcoming & QA | 0/1 | Not started | - |
