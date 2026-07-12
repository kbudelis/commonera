# Digital Shabbat — project state & design context

**Snapshot: 2026-07-10, ~20:15, end of sprint day 1.** Written as a
self-contained context document (for a NotebookLM design database and for any
collaborator arriving cold). It gathers the whole picture — product, intent,
design system, the ornament research corpus, and where the build stands — in
one file. Companion sources in this folder: `meetings/` (the opening-meeting
brief), `refs/` (six construction-rule sheets), `manuscripts.md` + `shabbat.md`
(seed research), `transcripts/` (raw recordings, gitignored). The binding
design law lives in `../contracts/tokens.md`; this doc explains and extends it.

---

## 1. What it is

A digital ritual tool that helps someone design, commit to, and close a weekly
Shabbat-inspired screen-free period. The user designs their Digital Shabbat
(what they set down, when, why), receives a shareable pledge card, and gets a
ceremonial candle-lighting opening and a Havdalah close.

**Live:** https://digital-shabbat.pages.dev · installable PWA · no account, no
backend, no tracking. Repo: `mikemarrotte/digital-shabbat` (private).

**Reframe (Mike's words):** "taking what is called screen time and making it a
ritualistic experience" — the app that "honestly seems to engineer itself out
of your life." Screen-time limits are the failed status quo; this replaces the
nag with a ritual.

**Who it's for:** a ~31-year-old culturally Jewish adult whose phone is a
source of *comfort*, who has ignored screen-time limits, is somewhat socially
isolated by default, open to Jewish structure without any Shabbat practice. We
are never their bouncer, coach, or disappointed parent. We are a kind adult
helping them set a table.

**Client frame (Common Era / Rachel Hyland):** designing for "the 70%" of
North American Jews unserved by institutions but proud of the identity. Start
with the human problem, not a Jewish one; translate wisdom, don't digitize
institutions; build for pull, not push. Win condition: *"I had no idea Judaism
had something to offer me here."* Four evaluation questions used as acceptance
criteria — would someone use it? come back? is there a moment of delight? is
there something uniquely Jewish underneath that makes it better?

---

## 2. The five laws (taste rulings — these override cleverness)

1. **Stopping is arriving.** Ceasing should feel like arriving somewhere, not
   leaving something. The candle screen is a destination, not a gate.
2. **The word is the ornament.** Hebrew manuscripts illuminate initial *words*,
   not letters. The user's own words (intention, pledge) get the ceremonial
   treatment. Never decorate empty labels.
3. **Trust, don't track.** We never measure, log, or surveil usage. Completion
   is attested by the user at Havdalah. Their testimony is the data.
   Covenantal, not technical — and it is a feature.
4. **Abstract over realistic.** The aniconic rule. The flame is a made thing —
   shader, not simulation. Geometry and pattern over illustration.
5. **The interface descends.** Screens get progressively quieter through the
   intake: less chrome, larger type, palette deepening from parchment toward
   indigo night. Ceremony screens are nearly empty. Waste space extravagantly.

**Tone (enforced):** no exclamation points anywhere, ever. No praise-bot
voice, no guilt, no lecturing Jewish law. The practice speaks, not the app:
"The candles are lit," not "You did it." All copy is canonical in
`../contracts/copy.md`; the build never rewrites user-facing language.

---

## 3. Why the UX is shaped this way (ritual logic)

- **Sanctuary in time (Heschel).** Judaism builds its cathedral out of hours,
  not stone. The boundary works because it is architectural — sundown to
  sundown, cosmic, non-negotiable — not willpower-based. So the timing
  selector is a load-bearing wall; sundown beats "6:00pm" because the *sky*
  chose it, not the user. Removing choice is the feature.
- **Candle lighting = a deliberately irreversible threshold.** The traditional
  eyes-covered choreography (light → veil perception → bless → reveal, receiving
  the light as if new) is a 3,000-year-old reveal animation. Implemented as the
  veil then the candle screen as a one-way door: no cancel, no confirm, no
  ending interaction. The flame can never be extinguished.
- **Havdalah = designed decompression.** "Separation": the spices console you
  as the *neshamah yeteirah* (the additional Shabbat soul) departs. Screen-time
  streaks fail partly because there is no exit — you just fail back into the
  phone. Havdalah is the exit ritual: inverse arc (dark → brightening),
  reflection as the spice box, congratulations-without-exclamation.
- **Distinction is the product.** *Kadosh* means "set apart." The user's real
  ailment is undifferentiated time — the phone dissolved every boundary that
  gave the week shape. We are not selling rest or less phone; we are selling
  the return of contrast. One day with a different texture gives the other six
  a shape.
- **Three stars.** Shabbat ends when three stars are visible — observational,
  astronomical, aniconic, universal. Our recurring motif.

---

## 4. The design system (binding)

**Palette — "the manuscript inverts as night falls":**

| Token | Hex | Use |
|---|---|---|
| `--parchment` | `#F4ECDC` | Intake backgrounds (day register) |
| `--parchment-deep` | `#E6D9BF` | Intake cards / panels |
| `--ink` | `#2B2118` | Text on parchment |
| `--indigo` | `#141B2E` | Ceremony backgrounds (night register) |
| `--night` | `#0B0F1A` | Deepest ceremony bg, the veil |
| `--gold` | `#E8B84B` | Word-panels, flame core, three stars |
| `--gold-ember` | `#C98A2B` | Gold shadows / gradients |
| `--lapis` | `#2B4C8C` | Accents, links, focus rings |
| `--vermilion` | `#C8502E` | Rare accent only (micrography, rubrics, small marks) |

**Gold behaves like light, not color** — any gold element gets a soft glow
(blur 12–24px, gold-ember at low opacity). Never flat gold at full saturation
over large areas. Burnished manuscript gold = emissive, screen-glow.

**The descent:** intake step 1 = parchment; each step interpolates toward
indigo; the intention prompt sits on indigo; veil = night; candle = night with
gold; Havdalah runs the gradient in reverse.

**Type:** EB Garamond for ceremony/display (large, unhurried; intention panels
600 weight, gold, generous letter-spacing); Inter for UI/intake (never heavier
than 600). 1.25 scale, ceremony body min 20px.

**Motion:** ceremony nothing faster than 600ms (prefer 1200–2400ms); intake
200–300ms; ease `cubic-bezier(0.4,0,0.2,1)`. Nothing pulses, bounces, or
demands. Ceremony text appears line by line, ≥1.5s apart.
`prefers-reduced-motion` collapses every sequence to gentle opacity fades.

**Layout:** mobile-first, 34rem max content width. Manuscript margins —
ceremony text block ≤50% viewport height; emptiness is the luxury signal.
Spacing scale 4/8/16/24/40/64/104px.

**The five motifs:** three stars (asymmetric gold cluster, never a row);
initial-word panel (key word large in gold in a thin gold-ember frame);
micrography border (the user's own pledge text as ~6–7px ornament on a path);
carpet page (the veil — pure geometry on night); the flame (SDF-teardrop
fragment shader + noise + heavy bloom; DeviceMotion drives turbulence so the
flame settles when the phone is set down — stillness rewarded).

---

## 5. The ornament research corpus (the design-elevation basis)

Six construction-rule sheets in `refs/`, each built from digitized
public-domain / IIIF manuscript sources (National Library of Israel Ktiv,
Bodleian, BnF Gallica, Getty, Wikimedia Commons). Each sheet is a provenance
ledger + **construction rules marked BINDING (attested across sources) or
SUGGESTIVE (tasteful option)** + an application section. Highest-leverage
findings distilled:

**`refs-micrography.md` — the pledge-card border (the signature move).**
Micrography *traces contours, never fills* — the border must be a path with
text as its stroke. Sharp 90° corners have **no historical precedent** (the
tradition uses arcs, loops, or an arched top; masoretic frames expand the band
at corners) — our current rectangular border is the one wrong construction.
Real borders run as parallel courses (two above, three–four below the text
block), not a hairline. Justify by stretching specific letters / ending on word
boundaries, never by letter-tracking. Ruling scaffolds the courses (they're
laid on plummet lines, not freehand). Beautiful demo beat available: ibn Gaon
wove his own name into his micrographic borders — precedent for weaving the
pledger's name in vermilion.

**`refs-ketubbah.md` — the card as a covenant document.** The ketubbah is the
genre precedent — a decorated personal covenant you display/send. The frame is
a **zone consuming 15–22% of sheet width per side** (our current hairline is
~40× too light — the single highest-leverage fix). The Rome 1798 ketubbah runs
the entire Book of Ruth in micrography around double frames — covenant words as
border, exactly our move. The "gate" composition (text under an arch, "this is
the gate" at the apex) imports *stopping is arriving* into the geometry. Gold
for words that carry honor (intention, names); red for grounds/frames, never
text. Our 1:1.33 portrait ratio already sits in the attested range. Do NOT
borrow figures (putti, zodiacs) — aniconic law.

**`refs-initial-word-panels.md` — the intention panel.** The Rothschild
Pentateuch (Getty, CC0) opens all **54 weekly Torah portions** with recurring
gold word-panels — a direct analog for a weekly ritual product. Gold letters
never sit naked — always on a prepared low-contrast ground (filigree, diaper
lattice, penwork). Panel geometry is consistent: full column width, ~3:1–6:1
aspect, letters at 60–75% of panel height, frame rules ~1/10 the letter
stroke. The panel *is* the first word of the passage — so the candle screen's
intention panel opens the reveal, first and alone.

**`refs-carpet-pages.md` — the veil.** Three corpora: masoretic Hebrew carpet
pages (Leningrad Codex — knotwork frame → inscribed circle → interlaced
hexagram, with micrography along the band edges), Mamluk Qur'an frontispieces
(gold-and-lapis geometry — the closest aniconic precedent for our exact
palette), and insular interlace (Kells/Lindisfarne) for grid discipline only.
Gold coverage is always sparse. Application: a single chosen grid system,
generated SVG/CSS at very low contrast on night, breathing/darkening over ~4s.

**`refs-mosaics.md` — the progress mosaic.** Ein Gedi's fully aniconic
synagogue carpet is the structural ancestor (and its earlier near-empty floor
means "barely begun" is period-true, not a degenerate state). Real floors lay
tesserae in **frame-following rows, not a grid** (rotation jitter ±3–8°, size
variance ±10–20%), with grout as the bed showing through (8–20% of tessera
size). The border is a system (fillet + guilloche band in 3–4 discrete tonal
steps + inner fillet), not a line. A finished carpet is ~800–1,200 tesserae,
few colors. 52-week fill order: fillet first, guilloche frame closes by ~week
10, field fills bottom-to-top, gold star heart lands only at week 52.

**`refs-page-architecture.md` — landing + intake typography.** The medieval
"secret canon" ports numerically: text block seated high, top:bottom whitespace
≥1:2, never vertically centered; under the ninths canon the block is only ~44%
of the page — planned emptiness on every screen. Rubrication gives `--vermilion`
its exact historical job: red marked *instructions to the reader* (headings,
staging lines) — never the prayer text or the user's words. Intake inputs
should be faint **ruled lines text hangs from**, not boxes — step 4's intention
field becomes one long ruled line, making writing the intention a scribal act.
The landing headline gets incipit staging (large, isolated, full column width)
but stays ink on parchment — gold is reserved for the user's own words.

---

## 6. The product surface (routes & flow)

- `/` **Landing** — warm parchment; headline "Give your week its shape back.";
  three beats; the "No account. No tracking." trust footnote.
- `/design` **Intake** — four steps, single route, the descent: (1) when is
  your Shabbat (traditional/Sunday/custom + optional location for sundown via
  suncalc); (2) what you're setting down (items / all-in / full); (3) optional
  backup tools (Opal, Screen Time, Digital Wellbeing, Freedom); (4) the
  intention (one required sentence), where your phone will go, and the
  substitute ("when your hand reaches for it, what will you try instead").
  Minimal path = 6 interactions, well under 5 minutes.
- `/pledge` **Pledge card** — SVG: intention as illuminated word-panel,
  micrography border of the user's own words, three-stars mark, optional name,
  timing + pledge summary. PNG export (hand-rolled SVG→canvas), native share,
  .ics download (candle-lighting + Havdalah events), edit affordance.
- `/candle` **Veil → candle** — carpet-page veil darkens over ~4s; the flame
  resolves; copy reveals line by line; no ending interaction — the screen is a
  destination you leave, not a page you complete.
- `/havdalah` **Havdalah** — inverse arc, three stars resolve first, reflection
  fields, attestation ("Did you keep your Shabbat?" — I kept it / Not this
  time), the spice-box consolation line, and the mosaic growing by one tile per
  kept week.

**Data:** one `Pledge` object + append-only `WeekRecord[]` in localStorage
(`ds.pledge.v1`, `ds.history.v1`), all through a frozen `store.ts`. Attestation
is idempotent per week — one week, one testimony. Sundown via suncalc,
client-side. Calendar (.ics) is the "notification" layer since push is out of
scope. No backend, no API keys.

---

## 7. Deferred / future directions (raised, intentionally not in MVP)

- **App blocking** — real blocking needs Apple approval; MVP suggests tools
  (incl. Brick) and could add a *visual mockup* of how blocking would fit.
- **Lock-screen intention image** — "what they see when they pick up the phone
  is their own intention." Strong future feature (Benjamin's idea, Mike loved
  it).
- **Rachel's "Jewishness dial"** — let the user tune how overtly Jewish the
  experience feels; optionality to go deeper. Natural fit for the design flow.
- **Nested-reason onboarding (Noom-style)** — "why… and the reason behind
  that…" then reflected back; motivation-design depth. MVP keeps one sentence
  to protect the <5-min goal.
- **A light social/community layer** — the traditional Shabbat is communal but
  our user is home alone; lean toward *educational* nudges to plan something
  social, not "invite your friends" mechanics.
- **Light intake personalization** ("reduce stress vs. increase connection") —
  gentle nudges, but guard against the "categorized by basic inputs" feeling
  Mike dislikes in the category.
- **Native migration (Expo)** — every deferred item is a native unlock: real
  sundown push (expo-notifications), reliable motion sensing for the flame
  (expo-sensors), haptics, and eventually Screen Time entitlements. The React
  code and this kernel port; components get rewritten, the shader moves to
  react-native-skia.

---

## 8. Where the build stands (2026-07-10 EOD)

**Done and deployed** (9 commits, live, Lighthouse 95 perf / 100 a11y /
100 PWA): full five-route product; frozen contracts; an independent code
review with all findings fixed or ruled on; a QA hardening wave (ceremony
degradation paths, 6-interaction intake, PNG/​.ics fidelity, PWA install);
the six-sheet research corpus; an append-only build chronicle.

**In flight — the design-elevation pass:** turning the contract-compliant but
plain first build into something *illuminated*, per the six ref sheets. Lane
assignments: ceremony (veil as real carpet page, mosaic with row-based
tesserae, intention panel on a prepared ground), intake (manuscript page
architecture + ruled-line inputs + vermilion rubrication), pledge card
(micrography border rebuilt with no sharp corners + frame-as-zone + arch
composition), landing (incipit staging). This is the current active work.

**Method note (for the process story):** built by a coordinator agent
directing five parallel build lanes against a frozen "kernel" of contracts,
plus six parallel design-research agents. When one model provider hit rate
limits mid-sprint, lanes were swapped to another provider and onboarded from
the same kernel files with no loss — the files-as-context design is what made
the whole thing portable. The full decision record is in
`../chronicle/CHRONICLE.md`.
