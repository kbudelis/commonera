---
gsd_state_version: '1.0'
status: planning
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-09)

**Core value:** A user with zero knowledge of the Hebrew calendar gets a meaningful, beautiful, shareable season reading in under 60 seconds — and the Jewish layer lands as a discovery, not a requirement.
**Current focus:** Pre-roadmap — Codex research done + verified. Awaiting moodboard + a licensing decision before build.

## Current Position

Phase: — (no roadmap yet)
Plan: —
Status: Research complete + verified (Opus). Blockers: moodboard basics + `@hebcal/core` licensing decision.
Last activity: 2026-07-09 — Verified Codex research (attributions / stack / pitfalls); flagged `@hebcal/core` GPL-2.0; updated decisions.

Progress: [░░░░░░░░░░] 0%

## Accumulated Context

### Decisions

Full ledger in `.planning/DECISIONS.md`; key decisions in PROJECT.md. Highlights:

- **All research → Codex** (per user). Opus writes briefs + plans + verifies, does not research.
- **Stack resolved:** Vite + React + TS static SPA → Cloudflare Pages (`dist/`, no backend).
- **Attribution lineage:** Gra / GalEinai (Ginsburgh); matches PRD zodiac; letters + tribes verifiable; sense column is the lower-confidence variant.
- Content = pre-authored static; current month rich + reusable schema → 11 lighter.
- Moon phase from Hebrew day-of-month; leap-year Adar I/II → single Adar; date-only input.
- Mobile-first; no accounts now (localStorage); share-export design-gated.

### Pending Todos

None yet.

### Blockers/Concerns

- **⚠ Licensing checkpoint:** `@hebcal/core` is GPL-2.0 in a client bundle — decide before dependency install (accept for prototype / permissive alternative / roll-own).
- Moodboard open: final name, palette, Hebrew display typeface (OFL leads captured in research).
- Minor: Vite 8 wants Node ≥ 22.12; local Node is 22.11.0 — bump at build time.
- Codex left `AGENTS.md` (garbled header from Claude→Codex substitution) + `.agents/` untracked — pending decision on cleanup / gitignore.

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Scope | REQUIREMENTS.md + ROADMAP.md | Deferred — pending moodboard basics | 2026-07-09 |
| Scope | "Browse all 12 months" day-1 inclusion | Open — after must-haves | 2026-07-09 |

## Session Continuity

Last session: 2026-07-09
Stopped at: Verified Codex research (MONTH-ATTRIBUTIONS / STACK / PITFALLS). Recorded stack + lineage decisions; logged `@hebcal/core` GPL-2.0 licensing checkpoint.
Resume file: None

**Next artifacts (in order):**
1. **User:** moodboard basics — name, palette, Hebrew typeface. Decide the `@hebcal/core` licensing path (or hand a permissive-alternative research task to Codex).
2. **Opus:** content **schema** + current-month exemplar reading → then REQUIREMENTS.md + ROADMAP.md → `/gsd-plan-phase 1`.
