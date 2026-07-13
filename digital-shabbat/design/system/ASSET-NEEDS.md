# VISUAL ASSET NEEDS — full-bleed reference pass (2026-07-11)

The whole flow now renders on a shared, full-bleed "app screen" system
(`src/shared/Atmosphere.tsx` + `.screen` in `src/styles/global.css`). Every
graphic below is currently a **code-drawn placeholder** that works today; each
can be swapped for a produced asset without touching layout. Hand finished
assets back as noted and I'll wire them in.

Global constraints (apply to every asset):
- **Self-hosted, no third-party requests** ("nothing here measures you").
- **Palette:** warm cream `#F4F0E7`/`#F1EADC`, ink `#2B2118`, indigo
  `#161C2E`, gold used as *light* only. Match `src/styles/tokens.css`.
- **Aniconic:** abstract over realistic. Geometry, mist, pattern — not
  literal illustration or photography of people/objects.
- **Format:** WebP (or PNG w/ alpha) for raster; inline SVG for vector.
  Portrait phone plate target ~**1170×2532** @2x, must also crop-survive to a
  desktop device frame (≈420×840 visible).

---

## 1 · Arrival (`/welcome`, `/`)
- **Mist plate (day).** PLACEHOLDER: 5 SVG ridge paths + haze in `Atmosphere`
  (`variant="day"`). NEED: a warm, foggy, receding-mountain plate — soft, low
  contrast, ranges dissolving upward into cream so type and the ring read over
  it. Mood: dawn calm, not dramatic. Delivery: one full-bleed WebP.
- **The word-ring "portal".** SVG micrography (`WordRing`). Works; optional
  designer refinement of letterform density/spacing. If refined, keep it as
  text-on-path (it must stay the user's/practice's *words*, per "the word is
  the ornament").
- **Brand mark.** PLACEHOLDER: dotted circle sigil (top-left). NEED: the real
  **Keep** logomark + the three-stars motif as a set.

## 2 · Intake (`/design`, 4 steps)
- No new imagery required — intentionally quiet cream→indigo descent. The
  night step (4) could optionally take the **night mist plate** (see §5).

## 3 · Pledge card (`/pledge`)
- **The card** is a self-contained SVG keepsake (micrography border of the
  user's own words, illuminated intention, arch, three stars). Works and
  exports to PNG. NEED (optional, high value): a designer pass on the card
  composition, and a **pearlescent orb / ritual-object** motif to sit inside
  the arch as the shareable object (the reference's "ritual object" / summary
  screens). Delivery: SVG or transparent PNG orb, ~800×800.

## 4 · Candle / ceremony (`/candle`)
- **The flame.** PLACEHOLDER: CSS two-teardrop fallback (`ceremony.css`).
  NEED: the real **WebGL shader flame** per the tokens contract — SDF teardrop
  + low-freq noise + soft bloom, two flames with independent phase, reacts to
  DeviceMotion (settles when the phone is set down). This is a code/shader
  deliverable, not a static asset. Fallback stays for no-WebGL.
- **Night field.** PLACEHOLDER: indigo gradient + fixed star scatter
  (`Atmosphere variant="night"`). NEED (optional): a deep-indigo mist/starfield
  plate for extra depth behind the flame.

## 5 · Return / Havdalah (`/havdalah`)
- Uses the **day mist plate** (§1) as the "welcome-back morning." Same asset.
- **Three-stars motif** (gold) — part of the brand-mark set (§1).
- **Mosaic** tiles are SVG-generated (`Mosaic.tsx`) — no asset needed.

## 6 · Deeper (`/deeper`), No-pledge, 404
- Reuse the day mist plate (§1) / night plate (§5). No unique assets.

---

## Placeholders in code right now (so nothing looks broken while assets are made)
| Placeholder | File | Swap with |
|---|---|---|
| SVG mist ridges (day/dawn/night) | `src/shared/Atmosphere.tsx` | mist plates §1/§5 |
| Word-ring micrography | `src/shared/Atmosphere.tsx` | optional refined ring |
| Dotted sigil mark | `src/landing/Landing.tsx` | Keep logomark |
| CSS teardrop flames | `src/ceremony/ceremony.css` | WebGL shader flame |

## Open naming/copy seams (need Mike's ruling — not design)
- Card text still reads "…is keeping a **Digital Shabbat**" and the `.ics`
  internals say `digital-shabbat`. The product wordmark is now **Keep**.
  Decide the practice-vs-product wording before these ship.
