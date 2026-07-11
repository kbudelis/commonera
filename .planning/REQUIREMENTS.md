# Requirements: Cosmic Calendar

**Defined:** 2026-07-10
**Core Value:** A user with zero knowledge of the Hebrew calendar gets a meaningful,
beautiful, shareable season reading in under 60 seconds — and the Jewish layer lands
as a discovery, not a requirement.

## v1.0 Requirements

### Mobile Flow

- [x] **FLOW-01**: User sees universal welcome phrases one at a time over a full-screen Blue Zodiac and can advance or skip directly to the current-month reading.
- [x] **FLOW-02**: Advancing reveals a light-paper interface with a full-width zodiac and optional date-only `MM/DD/YYYY` input, including **Skip to this month**.
- [x] **FLOW-03**: Birthday submission leads through a personal reveal before the month reading; skipping bypasses the personal section entirely.
- [x] **FLOW-04**: The experience is one continuous mobile vertical page with soft proximity settling, no mandatory snap, and no partial-frame trap.
- [x] **FLOW-05**: Both paths provide value without login or account creation.

### Content and Static Data

- [ ] **CAL-01**: The app auto-detects the current Hebrew month and normalizes Adar I/II to shared Adar content while retaining the exact displayed month.
- [ ] **READ-01**: The current-month reading includes English and Hebrew month names, archetype, zodiac, symbolic current moon state, short reading, and concrete ritual.
- [ ] **READ-02**: User can reveal two or three sentences of Jewish/Kabbalistic grounding without that framing leading the welcome.
- [ ] **PROF-01**: Valid date-only birthday input converts to and displays a Hebrew birth date.
- [ ] **PROF-02**: The personal profile includes birth month, zodiac, tribe association in the adopted lineage, symbolic birth moon, Hebrew letter, reflective personal thread, and short reading.
- [ ] **DATA-01**: Any valid birthday maps across twelve normalized month profiles; the current month is rich while the other eleven may use a lighter template.
- [ ] **COPY-01**: Copy is poetic, specific, non-predictive, and wisdom-focused; rituals are small enough to do today.
- [ ] **DATA-02**: Results appear instantly and deterministically from bundled typed data, with no runtime AI, database, or server.

### Visual System and Motion

- [ ] **VIS-01**: The Blue Zodiac disk is separated from its source background; after welcome, the interface uses the matching light-paper color.
- [ ] **VIS-02**: Welcome uses white modern-serif text; later screens maintain readable English and Hebrew typography.
- [ ] **VIS-03**: The personal reveal shows the birth-month Hebrew letter, and the month reading shows the current-month constellation with accessible labeling.
- [ ] **VIS-04**: Personal and month compositions remain complete and legible in a mobile 9:16 screenshot without showing the raw birthday.
- [ ] **MOT-01**: One persistent zodiac renderer moves from full-screen, to full-width, to a top-edge arc using `easeInOutCubic` for visual/programmatic transitions.
- [ ] **MOT-02**: Reduced-motion mode preserves all content and navigation without zoom, rotation, parallax, or auto-scroll.

### Upcoming and Quality

- [ ] **UP-01**: The final section shows a Friday Pulse teaser/countdown or Friday state, quietly grounded in Shabbat as a weekly reset.
- [ ] **UP-02**: The final section presents the symbolic current moon and the next Hebrew-calendar new/full moon window with a brief note when relevant.
- [ ] **QA-01**: Essential controls work by touch and keyboard with visible focus and meaningful labels.
- [ ] **QA-02**: Both paths complete on portrait-mobile viewports without clipping, horizontal overflow, inaccessible sections, or scroll traps.

## Future Requirements

- **FUT-01**: Full Friday Pulse and standalone moon-card experiences.
- **FUT-02**: Browse all twelve months.
- **FUT-03**: Rich long-form month readings for all twelve months.
- **FUT-04**: Fully interactive rotary astrology system beyond the v1 image morph.
- **FUT-05**: Astronomically exact moon data plus birth time, sunset, location, and timezone handling.
- **FUT-06**: Custom share/download export.
- **FUT-07**: Production font/glyph licensing, asset optimization, and deployment hardening.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full planetary Mazal/Sefirot chart | Requires astronomy scope beyond the prototype |
| Full Jewish holiday calendar | Not core to the welcome, month, profile, and return-cadence test |
| Login, accounts, social, or community | Zero-friction access is a core requirement |
| Runtime AI, CMS, database, or server backend | Pre-authored deterministic content is sufficient for v1.0 |
| Prediction or fate claims | The product is reflective and invitational |
| Production distribution | Hebcal, fonts, glyphs, and derived assets need a separate licensing checkpoint |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FLOW-01 | Phase 1 | Complete |
| FLOW-02 | Phase 1 | Complete |
| FLOW-03 | Phase 1 | Complete |
| FLOW-04 | Phase 1 | Complete |
| FLOW-05 | Phase 1 | Complete |
| CAL-01 | Phase 2 | Pending |
| READ-01 | Phase 2 | Pending |
| READ-02 | Phase 2 | Pending |
| PROF-01 | Phase 2 | Pending |
| PROF-02 | Phase 2 | Pending |
| DATA-01 | Phase 2 | Pending |
| COPY-01 | Phase 2 | Pending |
| DATA-02 | Phase 2 | Pending |
| VIS-01 | Phase 3 | Pending |
| VIS-02 | Phase 3 | Pending |
| VIS-03 | Phase 3 | Pending |
| VIS-04 | Phase 3 | Pending |
| MOT-01 | Phase 3 | Pending |
| MOT-02 | Phase 3 | Pending |
| UP-01 | Phase 4 | Pending |
| UP-02 | Phase 4 | Pending |
| QA-01 | Phase 4 | Pending |
| QA-02 | Phase 4 | Pending |

**Coverage:**

- v1.0 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-10*
*Last updated: 2026-07-11 after Phase 1 completion*
