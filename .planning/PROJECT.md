# Cosmic Calendar

## What This Is

A lunar-wisdom / seasonal-reading web app that tells you what this season holds —
through reflection cards, seasonal archetypes, and tiny rituals. The lead
experience is universal ("what does this season hold?"); the system underneath is
the Hebrew calendar (12 months, each with a zodiac sign, tribe, Hebrew letter,
sense, and energy, rooted in Kabbalistic tradition / Sefer Yetzirah). Built for
culturally Jewish millennials and Gen Z who are into astrology, wellness, or lunar
practices but have never met the Jewish calendar as a living wisdom tradition.

## Core Value

A user with zero knowledge of the Hebrew calendar gets a meaningful, beautiful,
shareable season reading in under 60 seconds — and the Jewish layer lands as a
delightful discovery, never a requirement.

## Business Context

<!-- Sprint prototype for Common Era (CE). Not monetized in this sprint. -->

- **Customer**: Culturally Jewish millennials / Gen Z (astrology/wellness/lunar
  audience); secondary: spiritually curious non-Jews. Persona: "Noa, 22."
- **Revenue model**: N/A this sprint — prototype to validate the concept for CE.
- **Success metric**: Season Card is shared unprompted (≥1 in 5 test users would
  send it to a friend); Jewish layer described as "interesting/surprising," not
  off-putting.
- **Strategy notes**: See `Cosmic Calendar PRD __ COMMON ERA × VIBE CODING.md`.

## Requirements

### Validated

(None yet — ship to validate)

### Active

<!-- Hypotheses until shipped. Sourced from PRD §4 "Must Have" + §6 core flow. -->

- [ ] Season Reading for the auto-detected current Hebrew month — energy/archetype,
      zodiac sign + current moon phase, one tiny ritual, Hebrew month name
      (English primary, Hebrew secondary). Beautiful, readable, screenshot-shareable.
- [ ] Works for someone who has never heard of the Hebrew calendar (no Hebrew in
      the primary hook).
- [ ] Discoverable Kabbalistic grounding — a tappable/info layer explaining what
      the system is and where it comes from (2-3 sentences, surprising not academic).
- [ ] Birthday reading / birth profile — enter birthday → Hebrew birth date, sign,
      tribe, moon phase at birth, Hebrew letter, tikkun framing, personalized reading.
- [ ] "What's coming up" panel — Friday Pulse teaser/countdown (rooted in Shabbat,
      named universally) + next full/new moon date when within ~7 days.
- [ ] No login required to get value.

### Out of Scope

<!-- From PRD §4 "Not This Sprint." Reasons prevent re-adding. -->

- Full planetary Mazal chart mapped to Sefirot — requires an astronomy API; strong v2.
- Full Jewish holiday calendar — beyond the season/birth-profile core.
- Time zones — too complex for the sprint.
- Torah / religious / observance content — stay wisdom, not synagogue tone.
- Social / community features — not core to the return mechanic this sprint.
- Prediction / fate-telling — tone is invitation ("this season invites…"), not fortune.
- Login / user accounts — zero-friction is a core value.

## Context

- **Source of truth**: the PRD (`Cosmic Calendar PRD __ COMMON ERA × VIBE CODING.md`)
  including the 12 Hebrew months content map (§5), core flow (§6), AI/content
  direction (§7), and visual vibe (§8). The month content table is a starting
  point, not a locked spec — CE to review attributions; AI may expand readings.
- **Date engine**: `hebcal` npm handles Gregorian→Hebrew conversion for the
  birthday flow and current-month detection.
- **Content model**: PRE-AUTHORED static content (no runtime LLM, no backend). We
  author all readings at build time (AI-assisted, best-judgment research); poetic,
  grounded tone — not academic, not horoscope-generic; rituals specific enough to do
  today. No CE / subject-matter review at this stage — content is flagged revisable.
- **Visual**: dark/warm/mystical (deep indigo base, gold/amber accent), moon/stars
  motif, Hebrew letters as large typographic elements. No explicit Jewish symbols
  (no Star of David/menorah) in the primary UI — the Jewish layer is textual and
  discoverable. Reference points: Chani, The Pattern, Co-Star, Headspace.
- **Status**: builder decisions now captured (see `.planning/DECISIONS.md`). User is
  not a Judaism subject-matter expert and has delegated Kabbalistic sourcing to
  best-judgment research (cite sources, flag variance). Still pre-roadmap: moodboard
  (name, palette, Hebrew typeface) and content authoring in progress.

## Constraints

- **Tech stack**: No backend needed (content is pre-authored static) → target a
  mobile-first static SPA; exact framework/host still via Codex research. `hebcal`
  (`@hebcal/core`) for Hebrew conversion. Deploy guard in `CLAUDE.md` /
  `.assetsignore` revisited once host is picked.
- **Content ownership**: We author all content via best-judgment research of
  Kabbalistic / Sefer Yetzirah sources — no subject-matter expert on hand. Cite
  sources, flag where traditions vary; revisable for future CE review.
- **Platform**: Mobile-first (portrait); season card designed share-ready (9:16).
- **Dependency**: `hebcal` npm for Hebrew date conversion — Why: PRD-specified, avoids
  reimplementing the calendar.
- **Timeline**: 1-day build sprint (when build begins) — Why: CE vibe-coding sprint format.
- **Auth**: No login / no accounts this sprint — Why: zero-friction is a core value.
  Architect so accounts can be added later; persist the birth profile in `localStorage`.
- **Tone**: Wisdom, not observance; discovery, not declaration — Why: reaches the
  non-observant target audience without feeling religious.
- **UI**: No explicit Jewish symbols in the primary UI — Why: the reveal is textual
  and earned, per PRD visual guidelines.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hebrew calendar is the hidden engine; surfaced as discovery | Serves astrology/wellness audience first; Jewish layer is a delight, not a gate | — Pending |
| Content is PRE-AUTHORED static (no runtime LLM, no backend) | 1-day sprint, no login, content must be consistent and reviewable | — Pending |
| We author all content via best-judgment Kabbalistic research; no CE review yet | No subject-matter expert on hand; cite sources, flag variance, revisable later | — Pending |
| Current month authored richly; other 11 on a shared lighter template | Birthday flow needs all 12; build reusable schema from the rich one | — Pending |
| Must-haves first; architect with full spec (Friday Pulse/moon/browse) in mind | Sprint focus, but don't foreclose the return-mechanic features | — Pending |
| Sharing: design card share-ready (mobile 9:16) first, build share-export after | Design quality is the gate on the distribution mechanic | — Pending |
| Mobile-first; no accounts now (architect for later); `localStorage` for birth profile | "One tap" / IG-story usage; rapid prototype | — Pending |
| Moon phase derived from Hebrew day-of-month (no astronomy lib) | Lunar calendar already encodes it; avoids the v2 astronomy dependency | — Pending |
| Leap-year Adar I/II → single Adar (Pisces); date-only input, no time/timezone | §4 excludes timezones; keep birthday input frictionless | — Pending |
| Use `hebcal` (`@hebcal/core`) for date conversion | PRD-specified; handles leap years / molad | — Pending |
| Opus plans / Codex executes (per CLAUDE.md); stack research → Codex | Dual-runtime GSD orchestration | — Pending |
| Decisions captured; REQUIREMENTS/ROADMAP still pending moodboard (name, palette, type) | Avoid premature scope lock while visuals unresolved | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-09 after builder-decisions capture*
