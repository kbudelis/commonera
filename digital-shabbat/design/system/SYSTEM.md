# DIGITAL SHABBAT — DESIGN SYSTEM

July 11, 2026 · Signalform. The canonical statement of the visual system,
superseding scattered prototype notes. The living specimen page is
`design/system/index.html`; this file is the reasoning. Both sit downstream
of the constitution and `kernel/contracts/tokens.md` — where this document
proposes a contract change it says so explicitly in **Amendments**.

Source material: the closing-card prototype (`design/prototypes/closing-card/`),
the July 11 design-dial ruling, and the second GPT reference grid ("Rest
Ritual," ten screens, July 11). Like the first grid, the ref was split
deliberately: **skin adopted, skeleton rejected** — the ledger at the bottom
records every call.

---

## 1 · Governing ideas

**The dial:** 1/10 Jewish · 3/10 meditation app · 5/10 texture & custom type.
Nothing plays at full volume; identity comes from the combination.

**The five laws bind harder than the dial.** Where the ref and a law conflict,
the law wins (see ledger).

**One sentence for the whole system:** a printed object that gets darker as
you approach the ceremony, whose only ornament is the user's own words.

## 2 · Registers (the descent, formalized)

The product has three registers, not themes. Every screen declares one.

| Register | Surface | Text | Grain | Where |
|---|---|---|---|---|
| **Day** | `--parchment` / `--parchment-deep` panels | `--ink` | heaviest (multiply, ~10%) | landing, intake start, pledge card |
| **Dusk** | layered gradient, parchment → indigo | `--ink` fading to `--parchment` | medium | mid-intake, intention prompt |
| **Night** | `--indigo` field on `--night` room | `--parchment` at 72–90% | faintest (screen-blend, ~8%) | ceremony screens, closing card |

Havdalah runs the gradient in reverse (night → a gold-warmed parchment).
This is the **return**, not a fourth register — same tokens, reversed order,
gold bias in the gradient stops.

**Rule — grain descends.** Texture opacity tracks the register: the printed
page is most physical in daylight and nearly dissolves by night. On parchment
use multiply blend; on night use screen blend. Never texture the flame layer.

**Rule — the crossing is layered, not mixed.** Never flat color-mix parchment
into indigo (it muddies). The dusk register is achieved with stacked radial /
linear gradients of the two contract colors, plus grain.

## 3 · Color

Contract palette unchanged (`tokens.md` is law): parchment, parchment-deep,
ink, indigo, night, gold, gold-ember, lapis, vermilion.

**Gold behaves like light, not color** (existing rule, kept): every gold
element carries a 12–24px ember glow; no flat saturated gold fills on large
areas.

**New — ink washes** (adapted from the ref's watercolor gradient wheel).
Low-chroma tints derived from contract colors via `color-mix`, for intake
accents on parchment only:

```css
--wash-lapis:      color-mix(in srgb, var(--lapis) 14%, var(--parchment));
--wash-vermilion:  color-mix(in srgb, var(--vermilion) 12%, var(--parchment));
--wash-gold:       color-mix(in srgb, var(--gold-ember) 16%, var(--parchment));
```

They are printed tints — think letterpress second color — never glowing
screen gradients. Not for night registers. (Amendment A1.)

## 4 · Type

**Stamp + book.** OTR No Cigar (unicase letterpress stamp) is display and
label only; Newsreader (book serif, warm italic) carries every sentence.
No Cigar never sets a sentence; Newsreader never sets a timestamp.

| Role | Face | Size | Tracking | Notes |
|---|---|---|---|---|
| Label-quiet | No Cigar | 10–11px | 0.32em | wordmark, wayfinding, footers |
| Label | No Cigar | 12–13px | 0.18em | buttons, section eyebrows |
| Numeral / time object | No Cigar | 28–34px | 0.14em | havdalah time, stats |
| Stat-display | No Cigar | 40–80px | 0.14em | share-surface numbers |
| Body | Newsreader | 17–20px (ceremony min 20px) | — | line-height 1.6 |
| Canonical line | Newsreader | 19–22px | — | the product's voice; max ~20em measure |
| Question-display | Newsreader | 28–40px | — | intake prompts; line-height 1.25 |
| Micrography | Newsreader | 9–11px | 0.2–0.3em | words on paths, 30–40% opacity |

**New — italic is the voice's emphasis** (adopted from ref). Within a serif
question or canonical line, the load-bearing word sets in Newsreader italic:
"How are you *arriving*?" Never bold, never gold, never underline for
in-sentence emphasis. One italic phrase per line, at most.

Type scale ratio stays 1.25. On parchment, text is `--ink`; on night,
`--parchment` at 72% (body) to 100% (emphasis).

## 5 · Space, radius, frame

- Spacing scale unchanged: 4 / 8 / 16 / 24 / 40 / 64 / 104.
- Content measure ≤ 34rem; ceremony text block ≤ 50% of viewport height —
  emptiness is the luxury signal.
- Radius scale: 12 (chips), 20 (cards/panels), 30–44 (the frame,
  viewport-responsive), 999 (pills).
- **The frame** is the screen's basic object: one hand-held rounded card,
  gold hairline inset at 10px (`--frame-hairline`), deep soft shadow,
  register-appropriate grain inside. Everything lives inside a frame;
  the room behind it is the darker textured field.

## 6 · Motion

Existing contract tokens kept (intake 240ms; ceremony 600–2400ms; shared
ease; line-by-line reveals with ≥1.5s pauses; reduced-motion collapses to
fades). System additions, named:

- **breathe** — 7s ease-in-out alternate scale/opacity, for the ember only.
- **turn** — 110–160s linear rotation, for micrography rings. Counter-rotate
  adjacent rings.
- Nothing pulses, bounces, or demands. No progress spinners: waiting states
  use the field (§7.6) instead.

## 7 · Components

Each entry: what it is, register, and the law it answers to.

**7.1 The frame.** Day and night variants. See §5.

**7.2 Progress beads.** Intake wayfinding: a thin row of 4–6 dots at the top
edge, gold at 25% / current at 100% with glow. Replaces bars. No step counts
on ceremony screens — the descent is the wayfinding (Law 5). (Adopted from
ref's dash-progress, quieted.)

**7.3 Pill button.** No Cigar label, 999 radius, 1px gold hairline at 50%,
transparent fill; hover adds 8% gold fill and ember glow. One primary action
per screen, at most. The quiet variant drops the border to 25% for secondary
actions. Never a filled solid button in the night register.

**7.4 Intention field.** The single text input that matters. Serif, large
(22px+), on a parchment panel with a thin ink rule; placeholder in italic at
45% ink. The field is wide and calm — closer to a notebook line than a form
control. Required; blank intentions save nothing (Ruling 5).

**7.5 Radial word field.** *Adapted* from the ref's emotion wheel: words set
on a circular path around a soft ink-wash center, tappable to adopt into the
intention field. The form is micrography-adjacent (words on a predesigned
path); the semantics are suggestion, not mood-tracking. Day register only.
We do not ask "how are you feeling" — we offer words someone might mean.

**7.6 The field.** *Adopted* from the ref's particle-wave holding screen,
re-made under Law 4: a halftone dot-matrix drift (print texture, not
particle sim) on night, holding the resting state. This is the screen a
user sees if they open the app mid-Shabbat: no timer, no guilt, the field
and one canonical line.

**7.7 Micrography ring.** The closing card's ornament: user's pledge text on
counter-rotating circular textPaths around the ember, `textLength` pinned to
circumference for a seamless loop. Newsreader, 30–40% opacity.

**7.8 Micrography spiral (the accretion object).** *Adopted from ref screens
4 and 9 — the best idea in the grid.* The user's words spiral inward to form
the ritual object itself, and the object grows as weeks accrue: each kept
week's intention adds a winding. The annual ring is this object at year
scale. Weekly artifact = one winding; yearly artifact = the full spiral.
Implementation: SVG spiral path (or stepped concentric rings), text set
along it, innermost windings brightest.

**7.9 The time object.** No Cigar numerals with a label-quiet caption above
("Havdalah / Saturday / 7:50 PM"). The only place the interface states time.
Gold on night with glow; ink on parchment without.

**7.10 The stat object.** Share surfaces only. Weeks lead in stat-display
size; hours are the serif italic subline ("about 350 hours, set apart").
Unit law: weeks, never hours, as the headline. Numbers derive from
attestation only.

**7.11 Three stars.** Asymmetric cluster of three 4px gold points, canonical
positions (see specimen). Havdalah header, completion mark, favicon.

**7.12 The ember.** 10px gold core, three-layer ember glow, breathe
animation. The residue of the flame on post-ceremony surfaces.

**7.13 Mosaic.** Tesserae accrue per attested week on indigo: small rotated
squares in gold / lapis / vermilion at print-tint opacity, laid on a subtle
grid with human jitter. A lapsed week is an empty slot, not a mark.

**7.14 Share card.** Print ephemera, not app screenshot: the frame, the
micrography object, the stat object, wordmark. Exports as PNG at 4:5 and
9:16. No UI chrome inside the export, ever.

**7.15 Action tray.** *Adopted* from ref screen 10, chrome-minimal: a
bottom sheet in the current register carrying share targets and the .ics
action. Appears on explicit tap only.

**7.16 The veil.** Carpet-page geometric pattern on night, held one beat
longer than functionally necessary (unchanged from contract).

## 8 · Voice (pointer)

All copy in `kernel/contracts/copy.md`, canonical. System-level reminders
that affect layout: no exclamation points; the practice speaks; questions
are serif display with italic emphasis; labels are No Cigar and never
sentence-cased prose.

## 9 · Ref ledger — "Rest Ritual" grid, July 11

**Adopted**
- Word-spiral ritual object (screens 4, 9) → §7.8 accretion object. Their
  best idea; it was already our law (word as ornament) executed generatively.
- Two-register day/night rhythm with warm return (screen 7) → §2, confirmed.
- Italic emphasis inside serif questions → §4.
- Editorial composition: eyebrow → large serif question → helper line → §4.
- Quiet top progress dashes → §7.2 beads.
- Holding-state particle field (screen 6) → §7.6, re-made as halftone.
- Bottom share tray (screen 10) → §7.15.

**Adapted**
- Emotion wheel (screens 2, 8) → §7.5 radial word field. Form kept, mood-
  tracking semantics rejected (over the 3/10 meditation budget; we are not
  a feelings app).
- Watercolor gradient blobs → §3 ink washes: printed tints from contract
  colors, day register only.
- "25 hours of real rest" stat (screens 9, 10) → §7.10 stat object with the
  weeks-first unit law.
- Countdown "Rest begins in 01:00" (screen 5) → rejected as countdown;
  the time object (§7.9) states the threshold, it does not tick.

**Rejected**
- Tab bar Home/Ritual/Journal/You (screens 7, 9) — persistent chrome
  contradicts Law 5 and the no-midweek-surface covenant. Standing rejection.
- Photoreal misty landscapes (screens 1, 7) — realism (Law 4) and over the
  meditation budget. Landscapes remain flat textured abstraction if wanted.
- Photoreal pearl/stone objects (screens 4, 10) — Law 4. Our objects are
  made things: shader flame, ember, halftone field, words on paths.
- Journal feature and mood history (screen 8 as data collection) — Law 3;
  we keep testimony, not logs.
- Lock icon on "Start Rest" (screen 5) — we are not a blocker; the phone
  goes in a drawer, the app does not police it.
- "Your field will hold space for you" register — copy is canonical and
  this voice is over the meditation budget.

## 10 · Amendments proposed (require Mike's contract ruling)

- **A1.** Add ink-wash derived tints (§3) to `tokens.md` as sanctioned
  `color-mix` recipes (no new hues).
- **A2.** Record the register table (§2) and grain-descends rule in
  `tokens.md` under a "Texture" heading.
- **A3.** Amend the micrography motif entry to include the spiral/accretion
  object (§7.8) alongside the border.
- **A4.** Type contract still names EB Garamond + Inter; production has
  moved to Newsreader + OTR No Cigar (self-hosted). Update the contract to
  match the build (this is documentation catching up, not a change).
