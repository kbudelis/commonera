# LANE 01 — CEREMONY (of 5)

Read /kernel/CLAUDE.md and /kernel/contracts/ first. You own `src/ceremony/`.
You do not touch intake, artifact, landing, shell, or any contract.

## Your charge

The candle screen and Havdalah screen ARE the product. Everything else in this
repo is intake form. Success criterion #2 — "the candle screen feels
ceremonial, meaningfully different from a notification" — lives or dies in
your lane. Build the hardest tone problem first, while fresh: candle screen,
then Havdalah, then veil, then mosaic.

## Deliverables

1. **The veil** — carpet-page transition into /candle. Pure pattern on night,
   ~4s darkening, held a beat longer than necessary. Copy per contract.
2. **Candle screen** — the flame (shader per tokens.md constraints), line-by-
   line copy reveal, no ending interaction. The stillness mechanic
   (DeviceMotion → turbulence uniform; settle over ~8s) is the demo moment —
   protect it. Graceful degradation path is required, not optional.
3. **Havdalah screen** — inverse arc: near-dark brightening toward parchment.
   Three stars resolve before any text. Reflection fields, attestation via
   store.attestWeek(), spice-box line, share prompt.
4. **The mosaic** — reads ds.history via store. Procedural: each kept week
   lays tesserae into a slowly-completing geometric composition (aniconic —
   pattern, not picture). Weeks, never hours. "Not this time" changes nothing
   visually. Keep it simple: SVG grid + seeded placement is enough.

## Taste rulings in force

Abstract over realistic. The flame cannot be extinguished. Nothing pulses or
demands. Text reveals ≥1.5s apart. The candle screen is a destination — no
button ends it. Waste space extravagantly.

## Sync

Append to /kernel/sync/status-01.md on every completion/decision/blocker.
Pull /kernel/sync/DIGEST.md at the start of each work cycle.
