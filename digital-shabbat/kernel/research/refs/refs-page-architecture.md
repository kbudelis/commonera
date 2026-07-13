# REFS — MANUSCRIPT PAGE ARCHITECTURE

Research lane · text-block proportion, margins, ruling, rubrication, incipit
staging — as the typographic construction basis for `src/landing/` and
`src/intake/`. Companion to `kernel/contracts/tokens.md` (34rem column,
spacing scale, vermilion-as-rare-accent) and law #5 (the interface descends)
and law #2 (the word is the ornament).

---

## 1 · Reference ledger

### Canonical constructions

1. **Canons of page construction — Wikipedia**
   https://en.wikipedia.org/wiki/Canons_of_page_construction · CC BY-SA 4.0
   The whole numeric toolkit in one place: Van de Graaf "secret canon,"
   Tschichold's medieval canon (2:3 page, 1:1:2:3 margins), Rosarivo's ninths.

2. **Van de Graaf canon (construction detail)**
   https://www.liquisearch.com/canons_of_page_construction/van_de_graaf_canon · CC BY-SA (Wikipedia mirror)
   Diagonal construction: text block same proportion as page; on a 2:3 page,
   margins fall out at 1/9 and 2/9 of page dimensions with zero measurement.

3. **Jan Tschichold, *The Form of the Book* (via canon literature)**
   https://hiltondesignblog.wordpress.com/2016/04/27/the-canons-of-page-construction/ · commentary; primary text in print
   Tschichold's survey of medieval manuscripts: "Page proportion 2:3. Margin
   proportions 1:1:2:3. Type area in accord with the Golden Section."

### Ruling practice

4. **Hebrew Codicology — National Library of Israel**
   https://www.nli.org.il/en/discover/manuscripts/hebrew-codicology · NLI educational page
   Ruling as a discipline: pricking holes to space lines, then hard point,
   plummet, or pale ink — guides made to be nearly unseeable.

5. **Malachi Beit-Arié, *Hebrew Codicology* — Internet Archive**
   https://archive.org/details/hebrewcodicology0000beit · digitized book (lending)
   The quantitative typology of ruling techniques across ~3,000 dated Hebrew
   codices; blind (hardpoint) ruling dominant in early Ashkenaz.

6. **Understanding Hebrew Manuscripts — Braginsky Collection primer**
   https://braginskycollection.com/NLI/BOOKS-CASES/Understanding-Hebrew-MSS.html · collection educational page
   Concrete specimens: Veneto Siddur "blind and occasional plummet ruling";
   Moskowitz Mahzor "horizontal pale ink and vertical hard point ruling."
   Also: opening words framed ornamentally, not initial letters.

### Rubrication

7. **Rubrication — Wikipedia**
   https://en.wikipedia.org/wiki/Rubrication · CC BY-SA 4.0
   Red ink as the mark of *operational* text: section headings, transitions,
   and — in liturgical books — instructions to the celebrant, kept separate
   from the prayers themselves (black). Rubricators were a second pass, a
   distinct hand from the scribe.

8. **Rubric (liturgy) — Wikipedia**
   https://en.wikipedia.org/wiki/Rubric · CC BY-SA 4.0
   The word "rubric" *is* this practice: stage directions in red, sacred text
   in black. The exact division of labor our `--vermilion` token inherits.

### Manuscript exemplars (scans)

9. **Kennicott Bible, Bodleian MS. Kennicott 1 (La Coruña, 1476)**
   https://digital.bodleian.ox.ac.uk/objects/8c264b23-f6cc-4f18-98cf-9d75f7175b54/ · Digital Bodleian, CC BY-NC 4.0
   Sephardi masterwork: carpet pages, initial-word panels, and vast planned
   margins around a compact text block — emptiness as luxury, on parchment.

10. **Golden Haggadah, BL Add MS 27210 (Catalonia, c. 1320)**
    https://www.bl.uk/collection-items/golden-haggadah · BL; images PD in most countries outside the UK (mirrors: https://picryl.com/topics/golden+haggadah+c+1320+bl+add+ms+27210)
    Haggadah page architecture: large-script opening words, instructions
    distinguished from the recited text, gold behaving as light on the page.

11. **Leipzig Mahzor, UB Leipzig (Worms rite, 14th c.)**
    https://www.ub.uni-leipzig.de/en/about-us/exhibitions/permanent-exhibition/leipzig-mahzor · library page (see also https://en.wikipedia.org/wiki/Leipzig_Mahzor)
    Hard incipit census: 30 ornamental/figurative initial-word illuminations
    plus 7 whole pages given to arcade-framed initial words — a full page
    spent staging one word.

12. **Worms Mahzor, NLI MS Heb. 4°781 (1272)**
    https://www.nli.org.il/en/discover/judaism/jewish-people-treasures/worms · NLI treasure page (digitized via Shapell project)
    Oldest dated Ashkenazi mahzor; monumental initial-word openings where the
    word, not any letter, carries the ornament. Direct ancestor of law #2.

    Supplementary scan pool: e-codices Braginsky sub-project,
    https://www.e-codices.ch/en/list/subproject/braginsky · CC BY-NC 4.0.

---

## 2 · Construction rules (measurable)

### R1 — Margins are asymmetric, and the bottom is heaviest. **BINDING**
Medieval canon margins run **1:1:2:3** (inner : top : outer : bottom) on a
2:3 page (Tschichold); the ninths system gives inner **1/9** / outer **2/9**
of page width, top **1/9** / bottom **2/9** of page height (Rosarivo, Van de
Graaf). Two invariants for us:
- **top : bottom ≥ 1 : 2** — below-block whitespace always exceeds
  above-block whitespace. A vertically centered block is a modern tic; a
  manuscript block sits high and leaves its weight of emptiness underneath.
- Margins are **planned structure, not leftover space**. They are drawn
  before the text is written.

### R2 — The text block covers well under half the page. **BINDING (principle) / SUGGESTIVE (number)**
Under the ninths, the text block is 6/9 × 6/9 of the page ≈ **44% of page
area**, and the block keeps the page's own proportions. Tokens.md already
pins ceremony screens at "text block ≤ 50% of viewport height"; this rule
extends the spirit to landing and intake: the written area of any screen
should read as a block *set into* emptiness, never as content filling a
container. Aim below ~45% of the viewport for the primary text mass.

### R3 — Ruling is present but nearly invisible, and never in text ink. **SUGGESTIVE**
Hebrew scribes ruled every line before writing — hardpoint (blind, pure
emboss), plummet (silvery-gray trace), or pale ink — with pricking holes to
space them (NLI, Beit-Arié, Braginsky primer). Properties to copy:
- Ruling is **fainter than any content** — a different substance from the
  ink, discovered on inspection rather than seen.
- It is **rhythmic**: even spacing derived from the line grid, not ad hoc.
- Text **hangs from** the line; the line is a shelf, not a box. (Boxed
  fields are print-era bureaucracy; ruled lines are manuscript.)

### R4 — Rubrication: red marks the operational, never the primary. **BINDING**
Across Latin and Hebrew practice, red ink is reserved for headings, section
transitions, and **instructions to the reader/celebrant** — the stage
directions. The prayer itself, the text one actually says, stays in ink
black. Red is a *second hand*, added after the main text, and it is scarce
on any given page. Therefore, in our system:
- `--vermilion` may mark: helper lines, staging notes, field hints,
  reassurance asides, step transitions — the copy-deck `//`-adjacent voice.
- `--vermilion` may **never** mark: the step questions themselves, ceremony
  text, any `[user data]`, the intention, the pledge, or anything gold. The
  user's words are the sacred text; they are never rubricated.
- Rubrics are small and few — if a screen has more red than a manuscript
  page (a line or two), it has too much.

### R5 — The incipit: one word staged large, isolated, framed. **BINDING (word-not-letter) / SUGGESTIVE (ratios)**
Hebrew codices ornament the opening **word** — no majuscules exist — set in
a panel spanning the full column width (Worms Mahzor, Leipzig Mahzor,
Kennicott). Observed proportions across the exemplars:
- Panel letter-height ≈ **3–6× body text height**; take **~3× body** as the
  restrained end suitable for a screen.
- The panel spans the **full measure** (column width), not the width of the
  word — the surrounding field is part of the ornament.
- Isolation: clear space above/below the incipit of at least **one to two
  body line-heights**, more above than between incipit and following text
  (the incipit belongs to what follows, not what precedes).
- Framing, when present, is a **thin rule**, not a heavy box (tokens.md
  "initial-word panel": thin gold-ember rule frame — already correct).
- The Leipzig Mahzor spends **entire pages** on single arcade-framed words:
  scale of staging is proportional to the importance of the threshold.

---

## 3 · Application

### 3a · Landing — the headline as incipit

The landing page is the codex opened to its incipit page. "Give your week
its shape back." is the opening word-group; everything else is body.

- **Stage, don't decorate.** The gold word-panel frame is reserved by law #2
  for the *user's* words (intention, pledge). The landing headline gets
  incipit **staging** — size, isolation, full-measure presence — but stays
  ink-on-parchment. No gold, no frame. (R5 + law #2.)
- **Size:** ~3× body from the 1.25 scale → `3.052rem` (1.25^6), EB Garamond
  600, `line-height: 1.2`. On small screens step down one scale notch
  (`2.441rem`), never below.
- **Block placement (R1):** the hero block sits high with its weight of
  emptiness below. Within the existing 34rem column, replace symmetric
  vertical centering with a 1:2 (minimum) top:bottom split from the spacing
  scale — e.g. hero `padding-top: 64px; padding-bottom: 104px` at minimum,
  and let the bottom grow with viewport (`padding-bottom: max(104px, 20vh)`).
- **Isolation (R5):** nothing within `40px` above the headline except the
  page edge/margin; `24px` to the sub; `40px` to the CTA. The sub and CTA
  are the "following text" the incipit belongs to.
- **Beat titles as rubrics (R4):** the three lower beats — "Choose your
  day." / "Say what you're setting down." / "Light the candles." — are
  literally instructions to the reader. This is the historically exact job
  of red: set `.landing__beat-title` in `--vermilion`, same weight as now
  (≤600), same size as body or one notch down. The beat *bodies* stay
  `--ink`. This will likely be the only vermilion on the page; that scarcity
  is correct.
- **Footnote:** "No account. No tracking…" is a colophon, not a rubric —
  keep it ink at reduced opacity, seated in the deep bottom margin.
- **Optional ruling (R3):** a single hairline between hero and beats —
  `1px`, `color-mix(in srgb, var(--ink) 10%, transparent)` — a plummet line,
  not a divider. Skip if in doubt.

### 3b · Intake — margins that deepen with the descent

The four steps are four openings, each quieter (law #5). Two coupled
progressions, both from the existing spacing scale:

- **Vertical margins grow as chrome shrinks (R1 + R2).** Keep top:bottom
  ≥ 1:2 throughout, and enlarge both as the palette deepens:
  - step 1 · `padding-block: 40px 64px` (near current)
  - step 2 · `padding-block: 40px 104px`
  - step 3 · `padding-block: 64px 104px`
  - step 4 · `padding-block: 64px max(104px, 24vh)` — the intention screen
    approaches ceremony-grade emptiness; text mass well under 45vh (R2).
  Implement as per-step custom properties beside the existing
  `--design-bg-*` (the descent machinery in `Design.css` already switches
  per-step variables; margins join the same mechanism).
- **Block sits high, not centered (R1).** Replace `justify-content: center`
  on `.design__step` with `justify-content: flex-start` plus the padding
  above; the growing bottom margin *is* the descent's quietness. If a
  softer landing is wanted, an optical seat at ~38% from the top
  (golden-section placement) via `padding-top` rather than centering.
- **Helper lines as rubrics (R4).** These copy-deck lines are stage
  directions and take `--vermilion`, Inter, one scale notch down
  (`0.8rem`–`1rem`), normal weight:
  - "Sundown moves. Tell us roughly where you are…"
  - the exceptions hint "e.g. maps, calls from Mom, the camera"
  - "Boundaries with doors you built yourself are stronger than walls…"
  - "Optional. The pledge is the real mechanism."
  The step questions ("When is your Shabbat?" etc.) are the primary text:
  ink (or parchment on dark steps), never red. Field *values* and anything
  the user types: never red.
  **Contrast note:** `--vermilion` on `--parchment` holds for small text;
  on step 3–4's indigo mixes it will not. On dark steps, keep the rubric
  *mark* red but not the words: a short vermilion dash/hairline
  (`2px × 16px`) before a parchment-toned helper line —
  `color: color-mix(in srgb, var(--parchment) 80%, transparent)` — reads as
  a rubricated line without failing contrast.
- **Ruling lines as structure (R3, optional).** Two sanctioned uses:
  1. **Fields as ruled lines, not boxes.** Text inputs lose their border
     box; keep only `border-bottom: 1px solid` in plummet gray —
     `color-mix(in srgb, currentColor 22%, transparent)` — text sits on the
     line like script on ruling. Strongest on step 4: the intention field
     becomes a single long ruled line, EB Garamond, large, on indigo —
     writing the intention *is* the scribal act.
  2. **Faint horizontal rules** between a step's sections at line-grid
     spacing (multiples of 24px), `1px`,
     `color-mix(in srgb, currentColor 8%, transparent)`. Fainter than any
     text (R3); never vertical, never boxing anything.
- **Progress dots:** the pricking holes that space the ruling — small,
  marginal, structural. Current treatment is close; resist making them
  bigger. They belong to the margin, not the text block.

### 3c · CSS-level summary (existing tokens only)

```css
/* rubric — the vermilion stage direction (parchment steps) */
.rubric {
  color: var(--vermilion);
  font-family: Inter, system-ui, sans-serif;
  font-size: 0.8rem;           /* one 1.25-notch below body */
  font-weight: 400;
  line-height: 1.6;
}
/* rubric on dark steps: red mark, parchment words (contrast) */
.rubric--dark {
  color: color-mix(in srgb, var(--parchment) 80%, transparent);
}
.rubric--dark::before {
  background: var(--vermilion);
  content: "";
  display: inline-block;
  height: 2px;
  margin-right: 8px;
  vertical-align: middle;
  width: 16px;
}

/* ruled field — text hangs from a plummet line, no box */
.ruled-field {
  background: transparent;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, currentColor 22%, transparent);
  border-radius: 0;
  padding: 8px 0;
}

/* faint structural ruling */
.ruling { border: 0; border-top: 1px solid color-mix(in srgb, currentColor 8%, transparent); margin-block: 24px; }

/* incipit staging (landing headline) — size + isolation, no gold, no frame */
.incipit {
  font-family: "EB Garamond", Georgia, serif;
  font-size: clamp(2.441rem, 8vw, 3.052rem);  /* 1.25^5 – 1.25^6 */
  font-weight: 600;
  line-height: 1.2;
  margin-block: 0 24px;
}

/* manuscript block placement — high seat, heavy bottom margin */
.folio { padding-block: 64px max(104px, 20vh); }  /* top:bottom >= 1:2 */
```

Hard don'ts, restated: vermilion never on questions, ceremony text, gold
elements, or anything the user wrote (R4). The gold word-panel frame never
on app copy — only the user's words (law #2, R5). No vertical centering of
primary text blocks (R1). No boxed inputs where a ruled line will do (R3).
