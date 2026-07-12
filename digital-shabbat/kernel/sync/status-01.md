# STATUS — Lane 01 (append-only, owned by lane 01)

2026-07-10 18:16 PDT — Created local ceremony contract types and localStorage-backed mock store in `src/ceremony/ceremonyStore.ts`, using `ds.pledge.v1` and `ds.history.v1`; this is a temporary seam until Lane 02 freezes `src/shared/store.ts`.

2026-07-10 18:16 PDT — Added candle route export at `src/ceremony/Candle.tsx` with veil, contractual line-by-line copy, initial-word treatment for the user's intention, raw WebGL flame, CSS fallback, and DeviceMotion stillness path. Lane 04 import path: `import Candle from './ceremony/Candle';`.

2026-07-10 18:16 PDT — Copy blockers logged: contract does not provide copy for the iOS DeviceMotion permission tap, direct-route pledge fallback, missing phone location fallback, invalid havdalah time/day fallback, or mosaic accessible label. Visible placeholders use `[COPY NEEDED: ...]` where those cases surface.

2026-07-10 18:19 PDT — Digest announced `src/shared/store.ts` and `src/styles/tokens.css` stable. Removed Lane 01's local store/type mocks and switched ceremony screens to `../shared/store`; CSS now consumes shared token/font variables instead of loading fonts locally. Direct-route fallback pledge remains local only for null `getPledge()` cases.

2026-07-10 18:21 PDT — Added Havdalah route export at `src/ceremony/Havdalah.tsx` with three stars resolving before text, reflection fields, shared-store `attestWeek()` calls, kept/not-kept copy paths, spice-box line, share prompt, and procedural kept-week mosaic. Lane 04 import path: `import Havdalah from './ceremony/Havdalah';`.

2026-07-10 18:21 PDT — Verification complete: `npx tsc -b --noEmit` passes and `npm run build` passes. Lane 01 deliverables are in place for route wiring.

2026-07-10 18:26 PDT — Applied copy addendum rulings for ceremony: DeviceMotion copy now reads "The flame settles when the phone is set down. Motion stays on this screen and is never stored." with tap label "Let the flame feel for stillness"; invalid end time/day now render "when three stars are out" / "at week's end"; mosaic accessible label is "Your mosaic. One tile for each kept week.".

2026-07-10 18:26 PDT — Applied structural rulings: removed `src/ceremony/fallbackPledge.ts`; direct visits to `/candle` or `/havdalah` without a saved pledge now show "The candles aren't lit yet." with a `/design` link labeled "Design my Digital Shabbat"; missing `phoneHome` now omits the phone-location line entirely.

2026-07-10 18:26 PDT — Verification complete after copy/structure rulings: no `[COPY NEEDED]` markers remain in `src/ceremony/`; `npx tsc -b --noEmit` passes and `npm run build` passes.

2026-07-10 18:53 PDT — Applied independent-review Lane 01 fixes: Havdalah attestation is now single-shot in UI with inert buttons after either answer; `NoPledge` and Havdalah share navigation now use `react-router-dom` `Link`; candle screen now omits the substitute line when `substitute` is empty/missing; flame now handles `webglcontextlost` by showing the CSS flame immediately, reinitializes on `webglcontextrestored`, and releases GL resources on cleanup.

2026-07-10 18:53 PDT — Verification complete after independent-review fixes: `npx tsc -b --noEmit` passes and `npm run build` passes.

2026-07-10 19:36 PDT — Read the opening meeting brief and current digest; Rachel's four questions are now treated as acceptance criteria for ceremony demo readiness. Audited degradation paths in `src/ceremony/`: no-WebGL, reduced motion, DeviceMotion denied/unavailable, and small-screen/safe-area behavior.

2026-07-10 19:36 PDT — Hardening fixes applied: `Flame` now supports `?forceCssFlame` for no-WebGL QA without adding storage keys; no-WebGL/context-loss fallback CSS flame occupies the same grid cell as the hidden canvas; DeviceMotion permission rejection is caught and dismissed quietly; ceremony screens use safe-area-aware padding; ceremony text blocks are capped at `50svh` with contained scrolling; reduced-motion disables veil/Havdalah non-opacity animation and removes transform motion from line/star reveals.

2026-07-10 19:36 PDT — QA note: attempted browser smoke testing against local Vite at `http://127.0.0.1:5176/`, but the browser connector reported no browser available in this session. Completed code-level checks plus `npx tsc -b --noEmit` and `npm run build`, both passing.
