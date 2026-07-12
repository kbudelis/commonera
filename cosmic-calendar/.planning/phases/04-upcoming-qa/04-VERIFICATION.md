---
phase: 04-upcoming-qa
verified: 2026-07-11T23:39:02.458Z
status: passed
score: 4/4 requirements verified for handoff
behavior_unverified: 0
behavior_unverified_items: []
---

# Phase 4: Upcoming & QA Verification Report

**Phase Goal:** End both prototype paths on a credible, computed Friday/moon
return-cadence frame without introducing account or astronomy scope.

## Goal achievement

| # | Observable truth | Status | Evidence |
|---|---|---|---|
| 1 | Friday card reflects Friday, Shabbat, or a countdown with civil/Hebrew labels | Verified | `getUpcomingPanel()` and fixed-date tests |
| 2 | Moon card shows symbolic current state and a relevant new/full window | Verified | `findMoonMoment()`, moon assets, new/full boundary tests |
| 3 | Birthday and skip routes both reach upcoming | Verified | Render tests and 390 × 844 browser smoke |
| 4 | Essential semantics, focus, keyboard, overflow, and reduced-motion contracts remain intact | Verified | Markup/CSS tests plus browser gallery/viewport smoke |

## Requirements coverage

| Requirement | Status | Evidence |
|---|---|---|
| UP-01 | Satisfied | Derived Friday/Shabbat/countdown title, date labels, and body render in `.friday-card` |
| UP-02 | Satisfied | Symbolic moon art/state and event-month-honest seven-day window render in `.moon-card` |
| QA-01 | Satisfied | Touch-sized controls, focus-visible styles, meaningful labels, semantic gallery, and keyboard selection |
| QA-02 | Satisfied for prototype handoff | Both routes fit a 390 × 844 locked shell, every section is one viewport high, and neither route overflows horizontally |

## Automated and browser checks

- `npm run test:flow` — pass, 24/24
- `npm run build` — pass
- No-screenshot Chrome smoke at 390 × 844 — pass, all assertions

## Known limits

- This is not astronomical moon calculation.
- It is not a full standalone Friday Pulse or moon-card product.
- Mobile-keyboard behavior on physical iOS/Android hardware and final visual
  screenshot review remain prudent release checks after the handoff commit.
