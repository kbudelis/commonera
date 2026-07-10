# Decisions & Open Questions — Cosmic Calendar

Pre-roadmap decision ledger. Resolves the gaps in the PRD that a planner/executor
needs before building. Source: PRD + user decisions (2026-07-09).

> **Content authorship note:** The user is not a Judaism subject-matter expert and
> there is no CE / expert review at this stage. All Kabbalistic content is produced
> by best-judgment research with sources cited and variance flagged. Everything is
> revisable if/when CE engages.

## Resolved

| # | Decision | Choice | Notes |
|---|----------|--------|-------|
| A1 | Content generation model | **Pre-authored static** | No runtime LLM, no backend. Author 12 months of copy (AI-assisted) → stored as data → rendered. Deterministic, reviewable, instant. |
| A2 | Backend | **None** | Follows from A1. Pure client app. |
| A3 | Moon phase source | **Hebrew day-of-month** | Lunar month already encodes phase: day 1 ≈ new moon, ~day 15 ≈ full moon. Next full/new = next 15th/1st of the Hebrew month. No astronomy lib (§4 defers that to v2). |
| B4 | Missing attributions (tribe, Hebrew letter, sense) | **We research + author** | Not in PRD. Source from Sefer Yetzirah (Ch. 5) via best judgment; cite + flag variance. See `research/MONTH-ATTRIBUTIONS.md`. |
| B5 | Reading copy (archetype, grounding, tikkun, personal) | **We author** | Seeds in PRD §5/§7. No CE review now. Current month written richly first. |
| C6 | Months built for sprint | **Current rich + 11 lighter** | Build a reusable content schema from the rich current-month build; apply lighter template to the other 11 (birthday flow needs all 12). |
| C7 | Leap-year Adar | **Collapse Adar I/II → single Adar (Pisces)** | 12-month model; hebcal detects leap years. |
| C7 | Sunset rollover / time | **Date-only input, no time/timezone** | §4 excludes timezones. Convert civil date; accept ±1-day edge near sunset as a known limitation. |
| C8 | Friday Pulse / moon / browse depth | **Must-haves first; architect for full spec** | Panel can ship mostly-static. Structure must not foreclose full Friday Pulse card, moon cards, browse-all-12. |
| C9 | Sharing mechanism | **Share-export desired, design-gated** | Make the season card genuinely share-worthy (mobile 9:16) first; build Share button / image export after the design is locked. |
| D | Primary device | **Mobile-first (portrait)** | Desktop responsive is secondary. |
| D | Persistence / accounts | **No accounts now; `localStorage` for birth profile** | Rapid prototype. Architect so real accounts can be added later. |
| — | Content tone/safety | **Wisdom, not observance; discovery, not declaration** | Per PRD §7/§8. No fate claims. No explicit Jewish symbols in primary UI. |

## Still open (mostly moodboard-dependent — user in progress)

| # | Question | Status |
|---|----------|--------|
| D | Final product name (working title "Cosmic Calendar") | Open — moodboard |
| D | Color palette + **deploy-licensable Hebrew display typeface** | Open — moodboard |
| A2 | Exact framework + host (now scoped to a static mobile-first SPA) | Open — Codex stack research |
| C8 | Does "browse all 12 months" ship day 1? | Open — currently after must-haves |

## Immediate next artifacts (this planning pass)

1. `research/MONTH-ATTRIBUTIONS.md` — authoritative 12-month table (name, span,
   zodiac/mazal, tribe, Hebrew letter, sense/faculty) with sources + confidence.
2. Content **schema** (the reusable per-month data shape) + the **current month**
   authored as the exemplar reading.
3. Then: REQUIREMENTS.md + ROADMAP.md once moodboard basics land.
