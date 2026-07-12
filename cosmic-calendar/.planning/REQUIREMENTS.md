# Requirements: Cosmic Calendar

**Defined:** 2026-07-10
**Reconciled to handoff working tree:** 2026-07-11
**Core Value:** A user with zero knowledge of the Hebrew calendar gets a
meaningful, beautiful season reading in under 60 seconds, while the Jewish
mystical layer lands as a discovery rather than a prerequisite.

## v1.0 Prototype Requirements

### Mobile Flow

- [x] **FLOW-01**: User sees the approved two-page universal welcome over the
  full-screen Blue Zodiac and can advance into the birthday frame.
- [x] **FLOW-02**: Birthday presents name plus date-only `MM/DD/YYYY` input for a
  personal portrait and an explicit **Skip to this month** path requiring no
  personal data.
- [x] **FLOW-03**: Valid personal input reveals personal, month, and upcoming in
  order; skipping renders month and upcoming with no empty personal frame.
- [x] **FLOW-04**: Post-birth content remains one native vertical document with
  full-screen settling, no horizontal overflow, and no scroll interception.
- [x] **FLOW-05**: Both paths provide value without login, account, backend, or
  network request.

### Content and Static Data

- [x] **CAL-01**: The app auto-detects the current Hebrew month and normalizes
  Adar I/II to shared Adar content while retaining the exact derived month label
  in the data model.
- [x] **READ-01**: Every selectable month has a zodiac label, Hebrew letter art,
  archetype, specific short reading, and concrete ritual; live moon state
  belongs to the dedicated upcoming frame.
- [x] **READ-02**: User can reveal concise Jewish mystical grounding without
  that framing leading the welcome.
- [x] **PROF-01**: Valid name/date input converts to stable Hebrew date/month
  facts; the personal UI deliberately presents the resulting month and Western
  sign rather than a dense raw-date table.
- [x] **PROF-02**: The personal portrait includes name, Western zodiac sign,
  Hebrew birth month, Hebrew letter art, a month-specific narrative, Light,
  Shadow Wisdom, and one return question.
- [x] **DATA-01**: The app bundles twelve authored season readings and twelve
  authored birth portraits keyed by normalized Hebrew month.
- [x] **COPY-01**: Copy is poetic, specific, non-predictive, and wisdom-focused;
  rituals are small enough to do today.
- [x] **DATA-02**: Results appear instantly and deterministically from bundled
  typed data, with no runtime AI, database, CMS, API, or server.

### Visual System, Browse, and Motion

- [x] **VIS-01**: The Blue Zodiac image remains visually distinct; post-welcome
  surfaces use the approved blue/paper visual system.
- [x] **VIS-02**: Welcome and reading titles use local display typography, while
  English copy and Hebrew letter artwork remain legible.
- [x] **VIS-03**: Personal renders the correct birth-month letter art; month
  browsing renders all twelve corresponding constellation assets with meaningful
  option labels.
- [x] **VIS-04**: Personal, month, and upcoming compositions remain complete and
  legible in a portrait 9:16 shell without displaying the raw birthday.
- [x] **BROWSE-01**: User can explore all twelve authored month readings through
  swipe, click/tap, Arrow keys, Home/End, and return-to-current behavior.
- [ ] **MOT-01**: The isolated zodiac rotor is deliberately integrated into one
  persistent renderer without replacing or competing with the month gallery.
- [ ] **MOT-02**: After rotor integration, reduced-motion mode preserves every
  route while removing large zodiac movement, rotation, parallax, and automatic
  spatial motion.

### Upcoming and Quality

- [x] **UP-01**: The final frame shows a derived Friday Pulse countdown, live
  Friday state, or Shabbat state with civil and Hebrew date labels.
- [x] **UP-02**: The final frame presents the symbolic current moon and the next
  Hebrew-calendar new/full moon window within seven days when relevant, using
  the event's actual Hebrew month.
- [x] **QA-01**: Essential controls have meaningful labels, visible focus,
  touch-sized targets, keyboard behavior, and reduced-motion parity.
- [x] **QA-02**: Birthday and skip paths complete in a 390 × 844 portrait shell
  without horizontal overflow, missing sections, or an inaccessible upcoming
  frame.

## Accepted Scope Changes

These are deliberate client-feedback decisions, not accidental regressions:

- The birthday frame, not the welcome frame, owns **Skip to this month**.
- Post-birth readings settle one full screen at a time instead of using the
  Phase 1 proximity-only placeholder behavior.
- The personal screen favors a specific literary portrait over displaying every
  derived correspondence as a data table; stable date/moon facts remain in the
  model.
- Twelve authored portraits replace the original shared Personal Thread copy
  template.
- Browse-all-twelve was promoted from future scope into `BROWSE-01` through the
  constellation gallery.
- The Friday/moon teaser is implemented, while full standalone return
  experiences remain future work.

## Future Requirements

- **FUT-01**: Full standalone Friday Pulse and moon-card experiences, reminders,
  and return-state persistence.
- **FUT-02**: Deep browse mode with explicit month names, correspondence
  metadata, and direct links beyond the visual gallery.
- **FUT-03**: Rich long-form month readings and editorial review for all twelve
  months.
- **FUT-04**: Production rotor hardening beyond the isolated Phase 5 prototype.
- **FUT-05**: Astronomically exact moon data plus birth time, sunset, location,
  and timezone handling.
- **FUT-06**: Custom 9:16 share/download export.
- **FUT-07**: Production font/glyph/library licensing, asset optimization,
  content review, and deployment hardening.

## Out of Scope

| Feature | Reason |
|---|---|
| Full planetary Mazal/Sefirot chart | Requires astronomy scope beyond this prototype |
| Full Jewish holiday calendar | Not core to the welcome, portrait, season reading, and return-cadence test |
| Login, accounts, social, or community | Zero-friction access is a core requirement |
| Runtime AI, CMS, database, or server backend | Pre-authored deterministic content is sufficient for v1.0 |
| Prediction or fate claims | The product is reflective and invitational |
| Production distribution | Hebcal, fonts, glyphs, derived assets, and spiritual copy require explicit review |

## Traceability

| Requirement | Phase | Status |
|---|---|---|
| FLOW-01 | Phase 1, evolved by 03.1 | Complete |
| FLOW-02 | Phase 1, evolved by 03.1 | Complete |
| FLOW-03 | Phase 1 | Complete |
| FLOW-04 | Phase 1, evolved by 03.1 | Complete |
| FLOW-05 | Phase 1 | Complete |
| CAL-01 | Phase 2 | Complete |
| READ-01 | Phase 2, evolved by 03.1 | Complete |
| READ-02 | Phase 2 | Complete |
| PROF-01 | Phase 2, evolved by 03.1 | Complete |
| PROF-02 | Phase 2, evolved by 03.1 | Complete |
| DATA-01 | Phase 2, evolved by 03.1 | Complete |
| COPY-01 | Phase 2 / 03.1 | Complete |
| DATA-02 | Phase 2 | Complete |
| VIS-01 | Phase 3 | Complete |
| VIS-02 | Phase 3 | Complete |
| VIS-03 | Phase 3 / 03.1 | Complete |
| VIS-04 | Phase 3 / 03.1 | Complete |
| BROWSE-01 | Phase 03.1 | Complete |
| MOT-01 | Phase 5 | Deferred to next developer |
| MOT-02 | Phase 5 | Deferred to next developer |
| UP-01 | Phase 4 | Complete |
| UP-02 | Phase 4 | Complete |
| QA-01 | Phase 4 | Complete |
| QA-02 | Phase 4 | Complete for prototype handoff |

**Coverage:**

- v1.0 prototype requirements: 24 total
- Complete for handoff: 22
- Deferred to Phase 5: 2
- Unmapped: 0

---
*Last updated: 2026-07-11 during GSD developer-handoff reconciliation*
