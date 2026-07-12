# Requirements: Cosmic Calendar

**Defined:** 2026-07-10

**Reconciled for developer handoff:** 2026-07-12

**Core value:** A user with zero knowledge of the Hebrew calendar gets a
meaningful, beautiful season reading in under 60 seconds, while the Jewish
mystical layer lands as discovery rather than prerequisite.

## v1.0 Prototype Requirements

### Mobile Flow

- [x] **FLOW-01**: The approved two-page welcome advances into birthday entry.
- [x] **FLOW-02**: Birthday accepts name plus `MM/DD/YYYY` and offers **Skip to this month**.
- [x] **FLOW-03**: Personal input renders personal, month, and upcoming; skip renders month and upcoming.
- [x] **FLOW-04**: Post-birth content remains one native vertical document without horizontal overflow or scroll interception.
- [x] **FLOW-05**: Both paths work without login, backend, or network request.

### Content and Static Data

- [x] **CAL-01**: Current Hebrew month is derived deterministically; Adar I/II share the Adar content key while retaining their exact label.
- [x] **READ-01**: Every month has a zodiac label, Hebrew letter art, archetype, short reading, and ritual.
- [x] **READ-02**: Jewish mystical grounding is available without leading the welcome.
- [x] **PROF-01**: Valid input produces stable Hebrew date/month facts and the corresponding Western sign.
- [x] **PROF-02**: Personal portraits include name, sign, Hebrew month, letter art, narrative, Light, Shadow Wisdom, and a return question.
- [x] **DATA-01**: Twelve season readings and twelve birth portraits are bundled by normalized Hebrew month.
- [x] **COPY-01**: Copy is poetic, specific, non-predictive, and wisdom-focused.
- [x] **DATA-02**: Results are deterministic from bundled typed data; there is no runtime AI, CMS, database, API, or server.

### Visual System, Browse, and Motion

- [x] **VIS-01**: Welcome and post-welcome surfaces use the approved visual system.
- [x] **VIS-02**: Local typography and Hebrew letter artwork remain legible.
- [x] **VIS-03**: Personal renders the correct letter art; month browsing renders all twelve constellation assets with meaningful labels.
- [x] **VIS-04**: Personal, month, and upcoming remain complete in a portrait 9:16 shell without displaying the raw birthday.
- [x] **BROWSE-01**: All twelve readings support swipe, click/tap, Arrow keys, Home/End, and return-to-current behavior.
- [ ] **MOT-01**: The isolated rotor is deliberately integrated without replacing or competing with the month gallery.
- [ ] **MOT-02**: Any rotor integration preserves all routes and reduced-motion parity.

### Upcoming and Quality

- [x] **UP-01**: The final frame shows a derived Friday countdown, live Friday state, or Shabbat state.
- [x] **UP-02**: The final frame presents symbolic current moon state and a relevant upcoming new/full window.
- [x] **QA-01**: Essential controls have labels, visible focus, touch-sized targets, keyboard behavior, and reduced-motion parity.
- [x] **QA-02**: Birthday and skip paths complete in a 390 × 844 portrait shell without horizontal overflow or inaccessible sections.

### Public Handoff Hygiene

- [x] **PUB-01**: Generated agent runtimes, raw working notes, and machine-specific paths are not part of the tracked public handoff.
- [x] **PUB-02**: Core GSD project documents remain tracked, and a clean checkout can recreate the supported local runtime from pinned guidance.
- [x] **DISC-01**: README states that visual assets are prototype-only and not production/commercially cleared.
- [x] **SEC-01**: The best-effort local preflight passes tests, build, dependency, metadata, retained-document, artifact, and secret checks.

## Accepted Scope Changes

- Birthday, not welcome, owns **Skip to this month**.
- Post-birth readings settle one full screen at a time.
- Personal favors an authored literary portrait over a dense facts table.
- Twelve authored portraits replace the shared placeholder template.
- Browse-all-twelve is included through the constellation gallery.
- Friday/moon is a concise teaser; standalone return experiences remain future work.
- Public handoff hygiene keeps generated runtime output and raw working notes out
  of the tracked project while preserving the working app and core GSD handoff.

## Future Requirements

- **FUT-01**: Standalone Friday Pulse and moon experiences, reminders, and return-state persistence.
- **FUT-02**: Deeper month browsing and direct links.
- **FUT-03**: Long-form readings and editorial review.
- **FUT-04**: Production rotor hardening.
- **FUT-05**: Astronomically exact moon data plus time, sunset, location, and timezone handling.
- **FUT-06**: Custom 9:16 share/download export.
- **FUT-07**: Asset, font, glyph, library, and project-license review; Hebcal disposition; legal, spiritual-content, and astronomical validation.

## Out of Scope

| Feature | Reason |
|---|---|
| Full planetary Mazal/Sefirot chart | Requires astronomy scope beyond this prototype |
| Full Jewish holiday calendar | Not core to the current journey |
| Login, accounts, social, or community | Zero-friction access is a core requirement |
| Runtime AI, CMS, database, or server | Bundled deterministic content is sufficient |
| Prediction or fate claims | The product is reflective and invitational |
| Asset/license verification | Deferred; README labels assets prototype-only |
| Birth-profile storage redesign | Current browser-only behavior remains unchanged |
| Production certification | The prototype does not certify assets, content, accuracy, or legality |

## Traceability

| Requirements | Phase | Status |
|---|---|---|
| FLOW-01 through FLOW-05 | Phase 1, evolved by 03.1 | Complete |
| CAL-01, READ-01, READ-02, PROF-01, PROF-02, DATA-01, COPY-01, DATA-02 | Phase 2, evolved by 03.1 | Complete |
| VIS-01 through VIS-04 | Phase 3 / 03.1 | Complete |
| BROWSE-01 | Phase 03.1 | Complete |
| UP-01, UP-02, QA-01, QA-02 | Phase 4 | Complete for handoff |
| PUB-01, PUB-02, DISC-01, SEC-01 | Public handoff hygiene | Complete |
| MOT-01, MOT-02 | Phase 5 | Deferred to next developer |

**Coverage:** 24 product requirements, 22 complete for handoff, 2 deferred to
Phase 5, and 4 completed public-handoff hygiene requirements.
