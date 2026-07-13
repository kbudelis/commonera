# TOKENS (contract — zero freedom)

Implemented as CSS custom properties in `src/styles/tokens.css` (owned by
Lane 04, consumed by all). Do not invent colors, faces, or timings outside
this file.

> Amended 2026-07-11 by Mike's ruling: design-system amendments A1–A4
> (`design/system/SYSTEM.md` §10) are approved and folded in below.

## Palette — "the manuscript inverts as night falls"

| Token | Value | Use |
|---|---|---|
| `--parchment` | `#F4ECDC` | Intake backgrounds (day register) |
| `--parchment-deep` | `#E6D9BF` | Intake cards / panels |
| `--ink` | `#2B2118` | Text on parchment |
| `--indigo` | `#141B2E` | Ceremony backgrounds (night register) |
| `--night` | `#0B0F1A` | Deepest ceremony bg, veil |
| `--gold` | `#E8B84B` | The word-panels, flame core, three stars |
| `--gold-ember` | `#C98A2B` | Gold shadows / gradients |
| `--lapis` | `#2B4C8C` | Accents, links, focus rings |
| `--vermilion` | `#C8502E` | Rare accent only (micrography border, small marks) |

**Ink washes (A1).** Printed tints derived from contract colors by recipe —
never new hues, never glowing gradients. Day register only, as letterpress
second color:

```css
--wash-lapis:      color-mix(in srgb, var(--lapis) 14%, var(--parchment));
--wash-vermilion:  color-mix(in srgb, var(--vermilion) 12%, var(--parchment));
--wash-gold:       color-mix(in srgb, var(--gold-ember) 16%, var(--parchment));
```

**Gold behaves like light, not color.** Any gold element gets a soft glow
(`text-shadow` / `filter: drop-shadow`, blur 12–24px, gold-ember at low
opacity). Never flat gold fills at full saturation on large areas.

**The descent:** intake step 1 = parchment. Each subsequent step interpolates
toward indigo. Intention prompt sits on indigo. Veil = night. Candle screen =
night with gold. Havdalah runs the gradient in reverse.

## Registers & texture (A2)

Three registers, not themes — every screen declares one:

| Register | Surface | Text | Grain | Where |
|---|---|---|---|---|
| **Day** | parchment / parchment-deep panels | ink | heaviest (multiply, ~10%) | landing, intake start, pledge card |
| **Dusk** | layered gradient, parchment → indigo | ink fading to parchment | medium | mid-intake, intention prompt |
| **Night** | indigo field on night room | parchment at 72–90% | faintest (screen, ~8%) | ceremony screens, closing card |

Havdalah is the reverse run with a gold bias in the gradient stops — the
return, not a fourth register.

- **Grain descends.** Texture opacity tracks the register: multiply blend on
  parchment, screen blend on night. Never texture the flame layer.
- **The crossing is layered, not mixed.** Dusk is stacked gradients of the
  two contract colors, never a flat color-mix (it muddies).

## Type (A4 — contract caught up to the shipped build)

**Stamp + book.** Both faces self-hosted in `public/fonts/`; no third-party
font requests ("nothing here measures you").

- **Every sentence:** Newsreader (variable weight, warm italic). EB Garamond
  is the fallback stack only; Inter is gone from the product.
- **Display + label only:** OTR No Cigar — unicase letterpress stamp for
  wordmark, buttons, steppers, timestamps, numerals, wayfinding. It never
  sets a sentence; Newsreader never sets a timestamp.
- **Italic is the voice's emphasis:** within a serif line, the load-bearing
  word takes Newsreader italic — never bold, never gold, never underline.
  One italic phrase per line, at most.
- Scale: 1.25 ratio. Ceremony body min 20px. Line-height 1.6 body, 1.2 display.
- License note: OTR No Cigar web-embedding verification is still an open
  pre-ship item (tracked in CHRONICLE).

## Space & layout

- Mobile-first. Max content width 34rem centered.
- Manuscript margins: ceremony screens keep text block ≤ 50% of viewport
  height; emptiness is the luxury signal.
- Spacing scale: 4 / 8 / 16 / 24 / 40 / 64 / 104 px.

## Motion

- Ceremony: nothing faster than 600ms; prefer 1200–2400ms; ease `cubic-bezier(0.4, 0, 0.2, 1)`.
- Intake: 200–300ms, same ease.
- Nothing pulses, bounces, or demands. Text on ceremony screens appears line
  by line with real pauses (≥ 1.5s between lines).
- `prefers-reduced-motion`: all sequences collapse to gentle opacity fades.

## Motifs

- **Three stars:** three small gold points (asymmetric cluster, not a row) on
  indigo. Havdalah header, completion mark, favicon.
- **Initial-word panel:** the first/key word of a ceremony passage set large
  in gold within a thin gold-ember rule frame.
- **Micrography border:** pledge card border is the user's own pledge text on
  an SVG path, ~6–7px, ink on parchment. Ornament made of their words.
- **Micrography spiral — the accretion object (A3):** the user's words drawn
  along a spiral (or stepped concentric rings) that gains a winding per kept
  week; innermost windings brightest. The weekly artifact is one winding; the
  annual ring is this object at year scale. Same law as the border: the
  ornament is always their words, never lorem or app copy.
- **Carpet page:** the veil is pure geometric pattern (subtle, low-contrast on
  night), held a beat longer than functionally necessary.

## The flame (Lane 01 implements; these are the constraints)

- Single fragment shader (raw WebGL, no three.js): SDF teardrop + low-frequency
  noise perturbation + heavy soft bloom. Reads as *made*, not simulated —
  illuminated-manuscript flame, not fire sim.
- **Reactive stillness:** DeviceMotion drives a turbulence uniform. Phone in
  hand → gentle flicker; phone set down → flame settles to a calm, even burn
  over ~8s. Stillness is rewarded. One permission tap on iOS; degrade
  gracefully to slow idle animation if denied/unavailable.
- The flame can never be extinguished. No interaction ends it.
- Fallback for no-WebGL: layered CSS radial gradients with slow keyframe
  breathing. Must still feel warm.
