# REFS — ANCIENT SYNAGOGUE MOSAIC FLOORS

Research basis for "the mosaic" — the procedural SVG in `src/ceremony/Mosaic.tsx`
where each kept week lays tesserae into a slowly-completing carpet.

Scope note: the famous zodiac panels (Beit Alfa, Hamat Tiberias, Sepphoris) exist
and are the reason these floors are known — but our kernel is aniconic (Law 4),
so we borrow **nothing** from them. Everything below is drawn from the geometric
carpets of the aisles, borders, and the fully aniconic floors (Ein Gedi, and the
pattern grammar all these floors share with Roman-Byzantine workshop practice).
Even Ein Gedi's birds — accepted in ancient aniconic practice — stay out; our
rule is stricter: geometry only.

---

## 1. Reference ledger

| # | Site / subject | Date | Location today | URL | License | Relevance |
|---|---|---|---|---|---|---|
| 1 | Beit Alfa synagogue floor (nave border + western aisle) | 518–527 CE | in situ, Beit Alfa NP, Israel | https://commons.wikimedia.org/wiki/File:Beit_Alfa_Synagogue_Mosaic.jpg | PD (faithful repro of PD work) | Broad ornamental border framing the nave; western aisle paved in **squares of pure geometric pattern** — the aniconic register of the most famous figurative floor. |
| 2 | Beit Alfa — Commons category (28+ files) | 6th c. CE | in situ | https://commons.wikimedia.org/wiki/Category:Mosaic_of_ancient_synagogue_in_Beth_Alpha | mixed PD / CC-BY-SA per file | Detail photos of border courses and tessera coursing; the naïve local-workshop coarseness is visible (tesserae read individually). |
| 3 | Ein Gedi synagogue, later floor (Stratum III) | 5th c. CE | in situ, Ein Gedi | https://commons.wikimedia.org/wiki/Category:Ein_Gedi_synagogue | CC0 / CC-BY-SA 4.0 per file | The model aniconic carpet: field of **intersecting circles forming four-petalled flowers**, central **8-pointed star** (two overlapped squares). Our closest structural ancestor. |
| 4 | Ein Gedi, earlier floor (Stratum II) | 3rd–4th c. CE | in situ | https://commons.wikimedia.org/wiki/Category:Ein_Gedi_synagogue (first-phase swastika-motif file) | CC-BY-SA per file | Plain white field + one small black geometric motif: proof that **near-emptiness with a single dark mark** was an accepted synagogue floor. Radical minimum. |
| 5 | Hamat Tiberias (Severus synagogue) aisle carpets | late 4th c. CE | in situ, Hamat Tiberias NP | https://commons.wikimedia.org/wiki/File:Mosaic_Floor_in_Synagogue_at_Hammat_Tiberias_02.JPG | CC-BY-SA 3.0 (photo: Praisethelorne) | Side aisles + intercolumnar strips carry **continuous geometric carpets** while the nave holds figures — geometry is the connective tissue of these buildings. |
| 6 | Hammath Tiberias — Smarthistory essay | late 4th c. CE | — | https://smarthistory.org/mosaic-decoration-at-the-hammath-tiberias-synagogue/ | text CC BY-NC-SA | Scholarly overview: panel structure, donor squares, aisle geometry; good on how borders partition the pavement into framed fields. |
| 7 | Tzippori (Sepphoris) synagogue | 1st half 5th c. CE | in situ, Zippori NP | https://en.wikipedia.org/wiki/Tzippori_Synagogue | text CC BY-SA | **Guilloche** bands attested among its decorative elements; a long carpet divided into framed registers — border system scales to a strip. |
| 8 | Maon (Nirim) synagogue floor | 6th c. CE | in situ, near Kibbutz Nirim | https://en.wikipedia.org/wiki/Maon_Synagogue + https://www.encyclopedia.com/religion/encyclopedias-almanacs-transcripts-and-maps/maon | text CC BY-SA / ref | **55 medallions in an 11-row trellis, mirror-symmetric about the central column**, filling from the entrance end toward the shrine end. The all-over repeating-cell carpet with a directional fill — our completion narrative. (Its vines/animals stay; the *lattice* is what we take.) |
| 9 | Roman mosaic pattern glossary (The Ancient Home) | conventions, 1st–6th c. | — | https://theancienthome.com/blogs/blog-and-news/roman-mosaic-patterns | commercial page, cite-only | Names + construction of the border repertoire: 2/3/4/6-strand guilloche, wave band, Greek-key & swastika meander, and all-over fields (intersecting circles, imbrication/scales, star-of-lozenges). |
| 10 | Opus tessellatum (technique) | conventions | — | https://en.wikipedia.org/wiki/Opus_tessellatum + https://www.britannica.com/art/opus-tessellatum | CC BY-SA / cite-only | Defines the laying system: quasi-uniform tesserae ≥ ~4 mm laid in **rows (courses)** that follow the frame or contour — never a point grid. |
| 11 | Gerasa NW-quarter mosaic mortars study (npj Heritage Science, 2024) | Roman–Byzantine | — | https://www.nature.com/articles/s40494-024-01277-3 | CC BY (open access) | Hard numbers: decorative zones 0.5–0.9 cm tesserae at **120–130 /dm²**; plain/border zones 1.0–1.2 cm at **65–70 /dm²**. Coarseness is graded by importance. |
| 12 | Sederot, Kh. Umm Tabun excavation report (IAA, HA-ESI) | Byzantine | — | https://publications.iaa.org.il/ha-esi/vol138/iss1/46/ | IAA publication, cite-only | Ordinary provincial floor at **100–169 tesserae /dm²** — corroborates the density band; ordinary Byzantine pavements average ~80 /dm² (cf. https://www.academia.edu/3738229/ on the Nativity floors at up to 500 /dm²). |

---

## 2. Construction rules

Each rule is marked **BINDING** (violating it makes the artifact read as a tile
grid or a video-game progress bar, not a floor) or **SUGGESTIVE** (period-true,
adaptable).

### R1. Tessera scale — many, small, but individually legible — BINDING
Real floors: ~1 cm cubes in fields of 3–5 m → 1 tessera ≈ 1/300–1/500 of carpet
width, 65–170 per dm². That density is unreachable and unwanted at UI scale; the
**transferable rule is count, not millimeters**: the finished composition must
contain **hundreds of tesserae (≈ 800–1,200), never dozens**, and each tessera
must still read as a discrete placed stone (≥ ~2.5 px at rendered size). The
current 49-tile grid fails this rule.

### R2. Coarseness is graded by importance — SUGGESTIVE
Gerasa: borders/plain zones use tesserae ~40% larger than decorative zones.
Adaptation: border courses may use tesserae 1.2–1.4× the field nominal; the
central medallion may use tesserae 0.8× nominal (finer where the eye lands).

### R3. Rows, not grid (opus tessellatum coursing) — BINDING
Tesserae are laid in **courses that follow the nearest frame edge**, and around
any motif the background first traces **1–2 contour rows haloing the shape**,
then rows revert to frame-parallel. Consequences for generation:
- position each tessera along a **row path**, never at grid intersections;
- row paths undulate: vertical drift up to ±15–20% of tessera size along a run;
- tesserae within a row vary in width ±10–20% (they were cut by hand);
- rotation jitter **±3–8°** from the row tangent (not from screen axes);
- corners of the carpet resolve by **mitering courses diagonally** or letting
  one side's courses run through — visible seams are authentic.

### R4. Grout is a drawn element — BINDING
Mortar joints are visible and light-catching: gaps of **8–20% of tessera
dimension**, irregular (jitter the gap, not just the stone). The bed color shows
through *everywhere*, including inside "finished" areas. Never butt tesserae
edge-to-edge; never use a uniform stroke to fake grout.

### R5. Borders run in concentric courses — BINDING
The period frame system, outside → in:
1. **plain margin** — 2+ courses of ground-color tesserae (the "white surround");
2. **fillet** — 1–2 courses of the dark color, a simple hard line;
3. **one patterned band** — guilloche (each strand 3–4 tesserae wide, band 6–9
   tesserae total, strands shaded in 3–4 tonal steps against a dark ground),
   or wave-crest (running spiral, 4–6 tesserae tall), or meander;
4. **inner fillet** — 1 course dark;
5. then the field.
Minimum honest frame = margin + fillet + one patterned band. One decorated band
is typical; stacking many is the exception (Beit Alfa's nave is the deluxe case).

### R6. Few hues, stepped tones — BINDING
The palette is local stone: white/cream ground, black/dark basalt, terracotta
red, yellow ochre — **4–5 hue families carry the whole floor**. Beit Alfa's
famous "21 colors" are tonal *steps* within those families, not 21 hues.
Shading (e.g. the round guilloche strands) is done in **3–4 discrete tonal
steps per hue — never smooth gradients**. Bright/precious color is scarce and
placed at points of meaning.

### R7. Fields are all-over repeats with a center or axis — BINDING
Aniconic carpets are **unbounded repeating cells** (intersecting circles →
four-petalled flowers at Ein Gedi; star-of-lozenges; imbrication/scales;
chequer of pattern-squares in Beit Alfa's west aisle) framed by the border, with
**one privileged element**: a central medallion (Ein Gedi's 8-pointed star) or
a directional axis (Maon's trellis running entrance → shrine, mirror-symmetric
about the center column). The repeat implies infinity; the frame cuts a piece
of it — the sanctuary-in-time argument, in stone.

### R8. Fill order: frame first, then field toward the meaningful end — SUGGESTIVE
Workshop practice laid guide-lines and borders first, then filled fields in
courses. Maon's iconography *reads* from the amphora (entrance) upward to the
menorah (shrine end): the carpet has a direction of completion. Adaptation:
early accrual builds the frame; the field then fills course by course toward a
final center/summit that completes **last**.

### R9. Emptiness is a valid state — SUGGESTIVE
Ein Gedi's first floor: white field, one small black motif. A mosaic with 1–3
weeks laid should look like a *begun floor* (a fillet corner, a first course),
not a sparse scatter — and that is period-true, not a degenerate state.

---

## 3. Application — the 52-week procedural carpet

A concrete construction for `Mosaic.tsx`, replacing the 7×7 grid. All colors
are tokens; the unlaid bed is the ceremony background itself.

### Composition
- Square carpet, viewBox ~`0 0 160 160`. Nominal field tessera **4.2 units**
  (≈ 1/38 of width → ~950 tesserae complete, satisfying R1 at this scale);
  border tesserae 5.2 units (R2); grout gap 0.5–0.8 units, jittered (R4).
- **Bed:** untouched area is `--indigo`/`--night` (the ceremony screen itself —
  unlaid floor is night; the carpet is what practice has made visible in it).
- **Ground tesserae:** `--parchment`, with per-tessera tone noise toward
  `--parchment-deep` (±8% lightness — the limestone family, R6).
- **Dark line color:** `--ink` (the basalt family).
- **Gold** (`--gold`, glow per token contract): guilloche highlight step and
  the star's heart only. **Vermilion:** ≤ 8 tesserae in the whole carpet —
  flower-center dots on the two axes. Total families: parchment, ink, gold,
  vermilion + indigo bed = within R6's budget.

### The frame (border system, R5)
Outside → in:
1. plain margin — 2 courses `--parchment`;
2. fillet — 1 course `--ink`;
3. **two-strand guilloche** (attested at Sepphoris; the signature band of the
   whole tradition) — band 7 tesserae wide on an `--ink` ground, each strand
   shaded in 3 steps: `--parchment` → `--parchment-deep` → `--gold-ember`,
   with `--gold` as the single highlight step at each strand's crown.
   If the guilloche proves too busy at small size, fall back to **wave-crest**
   (running spiral, 5 tesserae tall, parchment on ink) — also fully attested;
4. inner fillet — 1 course `--ink`.

### The field
**Ein Gedi's aniconic carpet:** intersecting circles forming four-petalled
flowers — `--ink` outline tesserae on `--parchment` ground, repeat cell ≈ 18
units, laid in frame-following courses with contour halos around each flower
(R3). At the exact center, an **8-pointed star** (two overlapped squares,
Ein Gedi's medallion), roughly 3×3 repeat-cells wide, with a `--gold` heart.

### The 52-week fill order (R8, R9)
Each attested week lays **one course** (a seeded run of ~15–25 tesserae).
Placement jitter per R3/R4, seeded by week index + a stable per-user seed so
the mosaic is deterministic on the device it lives on.

- **Weeks 1–2 — the fillet.** The outer `--ink` line, drawn from the bottom-left
  corner clockwise. Week 1 already reads as a begun floor (R9).
- **Weeks 3–10 — the guilloche.** Eight segments, one per week, continuing
  clockwise; the plain margin courses accrue silently alongside each segment.
  ~2 months in, the frame closes: the first felt milestone.
- **Weeks 11–48 — the field.** 38 courses, laid **bottom edge → top** (the
  Maon direction: entrance toward shrine), skipping the reserved center.
  Flowers emerge only as their 3rd–4th course lands — the pattern is
  *recognized*, not announced.
- **Weeks 49–52 — the star.** The central medallion, one quadrant per week,
  its `--gold` heart tesserae landing **only in week 52**. The center is the
  last thing the year makes.
- **Week 53+ / year 2:** the carpet is complete; subsequent kept weeks deepen
  it — re-seat one course with slightly brighter tone variance (floors were
  repaired and re-laid for centuries; nothing resets).

### Guardrails
- No figuration ever — not even Ein Gedi's birds (kernel is stricter than the
  ancients). Geometry only.
- No smooth gradients, no drop-shadow depth-faking on tesserae; tone stepping
  only (R6). Gold glow per tokens contract is the one exception.
- Missed weeks lay nothing and mark nothing: no gaps memorialized, no gray
  tiles. The floor simply is as far along as it is (Trust, don't track).
- Reduced motion / static contexts: the mosaic never animates its accrual
  retroactively; new course fades in at ceremony pace (≥1200 ms) once, then
  the carpet is still.
