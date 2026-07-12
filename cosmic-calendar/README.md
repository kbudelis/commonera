# Cosmic Calendar

Cosmic Calendar is a mobile-first reflection experience rooted in the Jewish
mystical astrology tradition of *Sefer Yetzirah*. It turns the current Hebrew
month and an optional birthday into a poetic season reading, a personal
birth-month portrait, a small ritual, and lightweight Friday/moon return cues.

**Prototype:** <https://kbudelis.github.io/commonera/cosmic-calendar/>

> Developer handoff, 2026-07-11: the public GitHub Pages URL is an earlier
> `main` build. The most recent two-screen welcome, twelve-month gallery,
> authored birth portraits, and computed Friday/moon panel are present in the
> `codex/cosmic-calendar` handoff commit and are not deployed until that branch
> is merged to `main`.

## Handoff status

- Current branch: `codex/cosmic-calendar`
- Source handoff: the application implementation and GSD closeout records are
  captured together in the commit containing this README.
- Publication state: the feature branch is pushed for draft-PR review; the
  public site still follows monorepo `main`.
- Automated status: `npm run test:flow` passes 24/24 tests and
  `npm run build` succeeds.
- Screenshots and final visual acceptance were deliberately paused. Do not
  treat the current feature branch as deployed or visually signed off merely
  because its automated checks pass.

The next developer should start with [Where to pick up](#where-to-pick-up),
then read `.planning/STATE.md`, `.planning/ROADMAP.md`, and
`.planning/REQUIREMENTS.md` before changing scope.

## What currently works

- Two-screen cinematic welcome and automatic zodiac transition
- Name and date-only birthday entry, with a skip to the current month
- Deterministic Gregorian-to-Hebrew date conversion
- Versioned `localStorage` birth-profile persistence and edit/re-entry path
- Twelve authored Hebrew-month readings and twelve authored birth portraits
- Personal portrait with Western sign, Hebrew month, letter artwork, Light,
  Shadow Wisdom, and a return question
- Swipe, click, and keyboard-accessible twelve-month constellation gallery
- Current-month ritual and discoverable source/lineage grounding
- Friday/Shabbat state plus symbolic current and upcoming moon-window logic
- Locked portrait composition, visible focus, and reduced-motion handling

## Product boundaries

- No login, account, backend, database, CMS, or runtime LLM
- Readings are authored static data; browser results are deterministic
- Moon phase is a symbolic Hebrew-calendar approximation, not astronomical
- Birth conversion is date-only and is not sunset/location/timezone accurate
- The separate zodiac rotor prototype is not integrated into the app
- Custom share/download export is not implemented
- This remains an internal sprint prototype until calendar-library, font,
  glyph, constellation, and content-review questions are cleared

## Quick start

Run commands from this directory:

```bash
npm install
npm run dev
npm run test:flow
npm run build
npm run preview
```

`npm run build` type-checks the application and emits the static site to
`dist/`. `npm run test:flow` compiles the TypeScript test surface to
`build/flow-test/`, then runs `flow-state.test.mjs` with Node's built-in test
runner.

## Codebase map

| Path | Responsibility |
|---|---|
| `src/main.tsx` | React bootstrap; mounts `App` and imports global styles |
| `src/flow.ts` | Pure flow reducer, birthday validation, and visible-section contract |
| `src/content.ts` | Month types/data, birth portraits, Hebrew date conversion, symbolic moon logic, upcoming-panel logic, and localStorage schema |
| `src/App.tsx` | Top-level state, transitions, onboarding, birthday form, personal reading, month gallery, and upcoming UI |
| `src/styles.css` | Entire visual system, locked-mobile layout, responsive rules, gallery geometry, focus, and motion |
| `src/assets/` | Local fonts, Hebrew glyph art, constellations, zodiac glyphs, and moon art |
| `flow-state.test.mjs` | Reducer, rendered-flow, content, asset, CSS-contract, and calendar-boundary regression tests |
| `vite.config.ts` | Vite/React setup and deployment `BASE_PATH` support |
| `.planning/` | GSD product contract, requirements, roadmap, state, research, phase records, and resume handoff |

The code is intentionally prototype-sized and concentrated: `App.tsx`,
`content.ts`, and `styles.css` are the main implementation surfaces. Split
them only after the current working tree has been safely committed and the
visual behavior has been rechecked.

## Runtime architecture

### Flow

`FlowState` is deliberately small: the current step, optional birthday, and
validation error. The primary route is:

```text
welcome -> zodiac transition -> birthday -> personal -> month -> upcoming
```

The birthday step owns the skip. A valid name/date submission renders a
three-screen vertical stack (`personal`, `month`, `upcoming`); skipping renders
`month` and `upcoming` without an empty personal frame.

### Content and date derivation

`MONTH_ENTRIES` is the canonical twelve-month season-reading dataset.
`BIRTH_PORTRAITS` is the canonical twelve-month personal-reading dataset.
`@hebcal/core` converts a civil date created at local noon to avoid UTC date
shifts. Adar I and Adar II retain their exact display label but normalize to
the shared `adar` content key.

Moon state and upcoming new/full windows are inferred from Hebrew day-of-month
ranges. Do not describe them as astronomical calculations.

### Persistence

The only persisted data is the local birth profile:

```text
key: cosmic-calendar.birth-profile.v1
schemaVersion: 1
input: civilDateISO + optional displayName
derived: Hebrew date facts + symbolic moon facts
contentVersion: 2026.07-prototype
```

Loading is defensive: saved input is re-parsed and derived fields are
recomputed rather than blindly trusted. Auth or cross-device persistence would
be a new architecture decision.

## GSD architecture

This project carries a local open-gsd 1.6.1 installation for both Claude Code
and Codex:

- `.claude/` contains Claude commands, agents, hooks, and the GSD runtime.
- `.codex/` contains Codex skills, agents, hooks, and the same GSD runtime.
- `AGENTS.md` and `CLAUDE.md` define the project-specific role split.
- `.planning/` is the cross-runtime contract and outranks chat history.

The intended ownership split is:

- Planning and verification: Opus/Claude writes and reviews `.planning/*`.
- Execution and all research: Codex implements code and performs domain,
  content, and stack research without redefining scope.

The normal phase loop is:

```text
$gsd-discuss-phase -> $gsd-plan-phase -> $gsd-execute-phase -> $gsd-verify-work
```

For a fresh session, use this reading order:

1. `.planning/STATE.md` — exact current position, blockers, and next action
2. `.planning/ROADMAP.md` — phase boundaries and completion state
3. `.planning/REQUIREMENTS.md` — current accepted product contract
4. `.planning/HANDOFF.json` and `.planning/.continue-here.md` — machine and
   human resume context
5. `.planning/PROJECT.md` — product boundary, audience, constraints, decisions
6. `.planning/DECISIONS.md` — retained architecture/content/licensing ledger
7. Relevant phase `PLAN`, `SUMMARY`, and `VERIFICATION` files
8. `.planning/research/` only when a source, date, licensing, or implementation
   decision needs deeper evidence

Do not use the old PRD, an old chat, or a historical phase plan to silently
override the latest `STATE`, `ROADMAP`, and `REQUIREMENTS` contract.

### Phase closeout snapshot

| Phase | Handoff status | Notes |
|---|---|---|
| 1. Mobile Flow Skeleton | Complete and verified | Historical flow was intentionally refined later by client-feedback work |
| 2. Content & Static Data | Complete and retroactively documented | Implementation landed at `e9d9677`; closeout artifacts were backfilled from code and tests |
| 3. Visual Assets & Typography | Complete and verified | Rotor remained isolated by design |
| 3.1 Client Feedback | Implementation complete | Current working tree contains the shorter welcome, authored portraits, month gallery, and celestial composition |
| 4. Upcoming & QA | Implementation complete | Friday/moon logic and automated QA are present; final visual/device acceptance remains a handoff check |
| 5. Zodiac Rotor Integration | Pending plan / next developer | Prototype remains isolated on `codex/rotor-prototype`; resume at `05-01-PLAN.md` |

Phase 5 is not silently complete. It is the explicit remaining feature boundary
after the current working tree is preserved and reviewed.

## Git, worktree, and deployment model

The parent repository is a shared sprint monorepo. Do not alter sibling project
folders when working on Cosmic Calendar.

The isolated rotor prototype is preserved at:

```text
branch: codex/rotor-prototype
worktree: cosmic-calendar/.worktrees/cosmiccal-rotor-prototype
tip at handoff: 84a8963
```

Inspect and cherry-pick or port only the component behavior needed by the main
app. Do not merge the entire worktree blindly.

Deployment is repo-wide GitHub Pages, not the older Cloudflare Pages research
recommendation:

- pushes to `main` trigger `.github/workflows/deploy-pages.yml`
- `.site/build-all.sh` builds each project into the shared `_site/` tree
- Cosmic Calendar receives `BASE_PATH=/commonera/cosmic-calendar/`
- `vite.config.ts` already consumes `BASE_PATH`

Therefore, pushing `codex/cosmic-calendar` alone does not update the public
prototype. Merge the intended final commit to `main`, wait for the Pages action,
then verify the public URL without authentication.

## Where to pick up

1. **Confirm the published source of truth.** Check out
   `codex/cosmic-calendar`, confirm `git status --short` is clean, then run
   `npm run test:flow` and `npm run build` before touching the rotor worktree.
2. **Run the paused visual/device review.** Exercise both the birthday and skip
   paths at portrait-mobile sizes, with keyboard navigation and reduced motion.
   Confirm the personal, month, and upcoming frames do not clip or trap scroll.
3. **Decide Phase 5 deliberately.** Either port the isolated rotor into the
   existing `ZodiacVisual` boundary and rerun all flow checks, or retain the
   current constellation gallery and formally move the rotor to a later
   milestone. Do not support two competing navigation systems accidentally.
4. **Resolve product/legal gates before production.** Review
   `@hebcal/core` licensing, Hebrew-art provenance, font terms, constellation
   sources, date-after-sunset wording, and the authored Kabbalistic content with
   appropriate experts.
5. **Deploy only after reconciliation.** Update any affected planning records,
   merge the reviewed PR to `main`, and verify the GitHub Pages build.

## Known production risks

- `@hebcal/core` was accepted for the prototype but its GPL-2.0 posture requires
  an explicit production decision.
- Lalou/Moshik Hebrew artwork provenance is unresolved; some bundled font notes
  impose additional commercial-use conditions.
- Correspondences follow the documented Gra / Arizal-Gra lineage and should not
  be represented as universal across Jewish mystical traditions.
- Authored spiritual content has not received final subject-matter review.
- Date-only Hebrew conversion can be one Hebrew day off for after-sunset births.
- Moon timing is symbolic; exact astronomy requires time, location, timezone,
  and a different calculation layer.
- The public prototype may lag the local branch until the monorepo `main`
  deployment completes.

## Definition of a safe handoff

- Current application and closeout docs are committed together intentionally
- `npm run test:flow` and `npm run build` pass from a clean checkout
- Both mobile paths have been visually checked without producing a scroll trap
- Phase 5 is either integrated and verified or explicitly deferred
- GitHub Pages is verified after merge to `main`
- Production/legal risks remain visible rather than being converted into vague
  cleanup tasks
