# LANE 02 — INTAKE (of 5)

Read /kernel/CLAUDE.md and /kernel/contracts/ first. You own `src/intake/`,
`src/shared/store.ts`, `src/shared/sun.ts`. You do not touch ceremony,
artifact, landing, shell, or any contract.

## Your charge

Design + commit in under 5 minutes (success criterion #1), and the descent:
the interface gets progressively quieter across your four steps — parchment
interpolating toward indigo, chrome falling away, type growing. Step 4 (the
intention) should already feel like the ceremony's front porch.

## Deliverables

1. **store.ts first** — the frozen seam everyone depends on: getPledge,
   savePledge, getHistory, attestWeek, per contracts/state.md. Commit it
   early, flag it stable in your status file so the herald can announce it.
2. **sun.ts** — suncalc wrapper: given location + mode, produce start/end
   ISO times. Traditional = Friday sundown → Saturday ~three stars (sunset
   + 50min is a fine approximation; note it in code comments for handoff).
3. **The four-step flow** at /design per contracts/copy.md, single route,
   internal state, writing a valid Pledge on completion, then routing to
   /pledge. Include phoneHome and substitute prompts (they render on the
   candle screen). Every field skippable except timing and one pledge tier —
   under-5-minutes beats completeness.
4. **The descent implementation** — background interpolation across steps
   using tokens only.

## Sync

Append to /kernel/sync/status-02.md; pull DIGEST.md each cycle. store.ts
stability is the single most important announcement in the whole sprint —
make it loudly.
