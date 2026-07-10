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
**Current focus:** Pre-roadmap — research and prototype licensing settled. Resolve the visual direction first, with one shared backend-ready contract, before roadmap planning.

## Current Position

Phase: — (no roadmap yet)
Plan: —
Status: Research complete + verified. Prototype workflow locked: Codex foundation, v0 visual exploration, Codex worktree finalists; visual prototyping first and backend architecture second.
Last activity: 2026-07-10 — Locked prototype workflow and priority order; Lovable removed as a dependency. `@hebcal/core` remains accepted for prototype with a pre-ship licensing checkpoint.

Progress: [░░░░░░░░░░] 0%

## Accumulated Context

### Decisions

Full ledger in `.planning/DECISIONS.md`; key decisions in PROJECT.md. Highlights:

- **All research → Codex** (per user). Opus writes briefs + plans + verifies, does not research.
- **Stack resolved:** Vite + React + TS static SPA → Cloudflare Pages (`dist/`, no backend).
- **Prototype workflow:** Codex owns the curated base, shared contracts, interactive
  finalists, visual QA, and backend architecture; v0 supplies 3–4 visual directions;
  Cloudflare branch previews compare finalists. Lovable is not required.
- **Priority order:** visual prototyping first; backend architecture second. One
  mock-backed service contract is frozen before branching; real services follow the
  selected visual direction unless scope changes.
- **Attribution lineage:** Gra / GalEinai (Ginsburgh); matches PRD zodiac; letters + tribes verifiable; sense column is the lower-confidence variant.
- Content = pre-authored static; current month rich + reusable schema → 11 lighter.
- Moon phase from Hebrew day-of-month; leap-year Adar I/II → single Adar; date-only input.
- Mobile-first; no accounts now (localStorage); share-export design-gated.

### Pending Todos

None yet.

### Blockers/Concerns

- Moodboard open: final name, palette, Hebrew display typeface (OFL leads captured in research).
- Minor: Vite 8 wants Node ≥ 22.12; local Node is 22.11.0 — bump at build time.
- Licensing: `@hebcal/core` GPL-2.0 accepted for the internal prototype; checkpoint (permissive alt / clearance) before shipping — not blocking build.

**Resolved this session:** Codex-generated `AGENTS.md` + `.agents/` are now git-ignored (regenerable Codex-runtime artifacts; `CLAUDE.md` is the tracked source of truth). Local `AGENTS.md` refreshed to clean text.

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
1. **User + visual exploration:** resolve name, palette, Hebrew typeface, and the primary visual/interaction direction through shared-baseline concepts.
2. **Opus:** define the content schema and shared frontend/service contract, then produce REQUIREMENTS.md + ROADMAP.md → `/gsd-plan-phase 1`.
3. **Codex execution:** build the curated Vite foundation, generate v0 directions, implement finalists in isolated worktrees, and compare Cloudflare branch previews before wiring real services.
