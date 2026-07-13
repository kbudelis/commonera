# CHRONICLE — Digital Shabbat build record

Append-only. Decisions, reversals, surprises, and PRD deviations, with
reasoning. Audience: Common Era, later, without us in the room.

## Pre-build decisions (design conversation, July 10, before doors)

**The product is two screens and a piece of paper.** The candle screen,
the Havdalah screen, and the pledge card carry everything; the rest is
intake. Engineering effort was deliberately weighted toward tone, pacing,
and the ceremony screens rather than flow logic.

**PRD contradiction #1 — notifications.** Core flow (steps 6–7) depends on
sundown/close notifications; push notifications are explicitly Not-In-MVP.
Resolved: downloadable .ics calendar invites for candle-lighting and
havdalah. The user's own calendar becomes the ritual layer. No infra.

**PRD contradiction #2 — streaks without state.** Streak tracking is
nice-to-have; accounts and saved history are Not-In-MVP. Resolved:
localStorage, disclosed honestly in-product ("your mosaic lives on this
device"). Migration to accounts is a clean later step: same shapes.

**Trust, don't track.** The PRD already forbids usage measurement; we made
it a principle. Completion is user-attested at havdalah. Rationale: the
phone is in a drawer (nothing to measure anyway); Shabbat observance was
never surveilled — it is covenantal; and an honor system is the correct
relationship posture for a product whose user has been nagged by every
other tool they've tried. Self-report is a feature with provenance.

**Cathedral → mosaic.** An early concept rewarded kept Shabbats with a
procedurally-completing cathedral (via Heschel's "cathedrals out of
hours"). Rejected: Heschel's point is that Judaism declined to build its
sanctuary in space. Replaced with a mosaic — tesserae accrue per kept
week — which is procedurally native, visually Jewish (ancient synagogue
floors: Beit Alfa, Tzippori, Hamat Tiberias), and metaphorically exact.
Unit is the week, never the hour.

**Abstract flame, not fire sim.** Realism is the corny direction (the
"iBeer problem"). Single fragment shader: SDF teardrop, low-frequency
noise, heavy bloom. Aniconic rule generalized: when in doubt, abstract.

**The stillness mechanic.** DeviceMotion drives flame turbulence; the
flame settles when the phone is set down. The product's thesis in one
uniform variable. Discovered while resisting a gimmick.

**The descent.** Intake screens progressively quiet — parchment
interpolating to indigo, chrome falling away — so the interface itself
performs the crossing from ordinary time into set-apart time. Candle
lighting's eyes-covered choreography (light, veil perception, bless,
reveal) is implemented as the veil transition.

**Copy is canonical and centralized.** Tone is the highest-risk surface;
success criterion #2 is a writing problem. All user-facing language lives
in contracts/copy.md; build agents may not rewrite it.

**Team structure.** Five parallel Claude Code lanes with directory
ownership, frozen contracts (tokens, state shape, routes, copy), lane-owned
status files, and a read-only chronicler/herald maintaining this record
plus a pull-based digest. Merge risk mitigated by ownership boundaries
rather than coordination overhead. Dynamic orchestration was considered
and rejected: the PRD decomposes cleanly, so plan-plus-parallel-lanes
ships better than an orchestrator demos.

**Platform: web now, Expo later.** "They want an app" vs. a sprint brief
requiring a persistent browser link. Resolved: web build (satisfies the
deliverable; nothing in MVP requires native) plus a PWA manifest so it
installs to the home screen and runs standalone — an app in every way a
demo can perceive. Native migration path is named deliberately: Expo
(React Native), because every deferred PRD item is a native unlock —
real sundown push notifications (expo-notifications), reliable motion
sensing for the stillness flame (expo-sensors; iOS Safari DeviceMotion
is the web build's flakiest seam), haptics at the candle moment, and
eventually Screen Time / app-blocking entitlements, which are
native-only. The React code and this kernel (contracts, copy, taste
laws) port; components get rewritten, the shader moves to
react-native-skia.

---
(build entries follow)

## 2026-07-10T18:16:55-0700 — Cycle 0 / sprint-start infrastructure

The build kernel itself hit an infrastructure snag at sprint start: the
kernel files arrived as dataless iCloud placeholders and the iCloud daemon
(`bird`) was wedged, blocking git and all reads. The coordinator recovered
the tree by restarting the daemon (`killall bird`) and force-hydrating files
with `brctl download`. Cost: roughly ten minutes of sprint time. Reason this
matters for handoff: the kernel was intact, but local file hydration was a
real dependency before any agent could safely treat contracts as law.

The integration coordinator is a Traycer agent standing in for Mike and is
running five agent lanes per the kernel design. Lanes were instructed not to
perform git writes; integration commits remain coordinator-only. This keeps
the kernel's "integration is Mike's" rule intact in agent form.

## 2026-07-10T18:16:55-0700 — Cycle 1

Scaffold is committed on `main` as `35faf24` (`Scaffold: Vite + React 18 +
pinned deps, kernel as law`). All five lanes have been briefed and started.

Lane 02 announced `src/shared/store.ts` stable for all lanes with the
contracted `Pledge`, `WeekRecord`, `getPledge`, `savePledge`, `getHistory`,
and `attestWeek` exports and the contracted localStorage keys. The store and
`src/shared/sun.ts` are present as untracked files at this read; integration
has not committed them yet.

Lane 03 began from Cycle 0 assumptions and is using a local contracted
`Pledge` mock in `src/artifact/` until shared seams settle; it exposed
`src/artifact/Pledge.tsx` as the route component target for Lane 04. This is
now a short-lived seam to watch because Lane 02 has since announced the store
stable.

Lane 04 had not announced `src/styles/tokens.css` stable on the first read.
During verification, status-04 landed with `TOKENS.CSS IS STABLE FOR ALL
LANES`, covering the contracted palette tokens, type/spacing/motion custom
properties, font loading, gold glow helpers, and reduced-motion collapse. The
two critical shared seams (`store.ts`, `tokens.css`) were announced stable in
this cycle and then committed by integration.

## 2026-07-10T18:19:10-0700 — Cycle 2

Integration commit `043f59b` froze the two critical seams: Lane 02's
`src/shared/store.ts` matches `contracts/state.md` for exported `Pledge`,
`WeekRecord`, `getPledge`, `savePledge`, `getHistory`, `attestWeek`, and the
two localStorage keys; Lane 04's `src/styles/tokens.css` implements the
contracted palette, type, spacing, motion, font loading, gold glow helpers,
and reduced-motion collapse. This removes the temporary justification for
local pledge mocks and token assumptions in downstream lanes.

Lane 02 also added `src/shared/sun.ts` with `getTimingWindow()` for
traditional, Sunday, and custom timing. It is usable by other lanes, but it is
not part of the critical frozen seam called out in the integration headline.

Lane 03 surfaced a copy contract gap while building the pledge route: PNG
download, native share, and edit-link labels are not present in
`kernel/contracts/copy.md`, so visible `[COPY NEEDED: ...]` placeholders are
being used. This is the intended failure mode for missing canonical copy and
should be resolved in the copy deck rather than improvised inside the lane.

Lane 03 then re-read the stable seam announcement and replaced its local
pledge mock with `getPledge` and `Pledge` from `src/shared/store.ts`. Lane 01
also removed its local ceremony store/type mocks and switched ceremony screens
to `../shared/store`, keeping only a local fallback pledge for direct-route
null `getPledge()` cases. The shared store seam has now absorbed both early
local mocks.

Lane 02 completed the intake route at `src/intake/Design.tsx`, prefilled by
`getPledge()`, saving via `savePledge()`, and navigating to `/pledge`. Lane 04
completed shell, landing, manifest, deploy config, and lazy routing for the
announced intake and pledge routes, while keeping local placeholders for
ceremony routes at the time of its status because the ceremony component paths
were not yet both announced. These landed in integration commit `ead5f3d`
(`Integration 2: intake flow, pledge card, shell, landing, PWA`).

The copy deck gap is broader than the pledge card: Lane 01 logged missing
canonical copy for DeviceMotion permission, direct-route fallbacks, missing
phone location fallback, invalid havdalah time/day fallback, and mosaic
accessible label; Lane 02 logged missing labels/actions around intake controls;
Lane 04 logged missing 404 copy. The centralized-copy rule is working, but the
contract needs a later copy pass for interface affordances and fallback states.

## 2026-07-10T18:27:49-0700 — Cycle 3

Integration commit `6987c4d` made the full product live: all five routes serve
through the app shell, ceremony screens are real rather than placeholders, the
PWA manifest is present, and the Cloudflare Pages deployment is reachable at
`https://digital-shabbat.pages.dev`.

Coordinator ruling: the copy deck was missing strings for small UI surfaces,
and 27 `[COPY NEEDED]` markers accumulated across the four build lanes. The
coordinator appended `contracts/copy.md` with an "Addendum — coordinator
rulings" section, explicitly marked for Mike's later review, rather than
allowing lanes to invent voice locally. Reasoning: this preserves the sprint's
centralized-copy law while unblocking integration; the addendum is provisional
copy authority, not a stealth rewrite of the voice.

Two structural rulings matter for future maintainers. First, direct visits to
`/candle` or `/havdalah` with no saved pledge do not fabricate a placeholder
pledge; they show a quiet no-pledge screen and link to `/design`. Second, when
`phoneHome` is unset, the candle screen omits the phone-location line rather
than manufacturing a fallback. Both rulings keep user testimony and user words
as the source of ceremonial content.

All lanes consumed the addendum. Grep at this cycle found no `COPY NEEDED`
markers in `src/`; forbidden word/phrase grep also returned no matches for
the named forbidden terms. Exclamation-mark grep still finds TypeScript/CSS
syntax only, not product copy. All four build lanes report their lane-file
deliverables complete and clean TypeScript/build verification.

## 2026-07-10T18:55:57-0700 — Cycle 4

An independent fresh-agent review of commits `35faf24` through `ff02890`
produced eight findings and the verdict "Not yet sound enough for a
design-elevation pass." The three high-severity findings were substantive:
weekly timing could generate candle-lighting windows in the past,
Havdalah attestation was not idempotent and could lay multiple mosaic tiles
for one week, and blank intention text could be saved, collapsing the word as
ornament. The remaining findings covered Cloudflare deep-link hardening,
WebGL context loss, token literal discipline, PNG export font/error handling,
and `.ics` UTF-8 line folding.

Coordinator triage kept the review under rule of law rather than ad hoc lane
patching. The "deep links 404" claim was refuted by production smoke testing,
but hardened anyway with an explicit Cloudflare Pages `_redirects` fallback.
Token-literal consolidation was deferred into the upcoming design-elevation
pass because the ornament CSS is about to be rewritten; the interim rule is
that raw contract hex values are permitted only where CSS variables cannot
reach and must match the contract exactly. All other findings were confirmed
and routed to lanes.

Five coordinator rulings were appended to `contracts/state.md` after the
review: `attestWeek(record)` is idempotent by `weekOf`; `intention` is
required at intake while `substitute` and `phoneHome` remain skippable with
graceful omission; timing must never yield a fully closed window; token
literals are constrained as above; and internal navigation must use the router
with `_redirects` carrying deploy fallback. This is a seam amendment, but it
was made visibly in the contract rather than hidden inside implementation.

All four build lanes applied fixes and reported clean `npx tsc -b --noEmit`
and `npm run build`. Integration commit `7586b3a` landed and deployed. Cycle 4
smoke checks returned HTTP 200 for `/`, `/design`, `/pledge`, `/candle`,
`/havdalah`, and an arbitrary missing path, confirming both the route set and
the fallback behavior in production. The reviewer is running a verification
pass on `7586b3a`; the next planned work after that verdict is Mike-directed
design research followed by lane design-elevation work.

## 2026-07-10T19:16:52-0700 — Verification ruling after Integration 4

The reviewer's verification pass on `7586b3a` returned six of eight findings
fully fixed. The remaining high finding — a pledge designed mid-window
(Friday night after sundown) keeps a start time in the past — was ruled
intended behavior by Mike and recorded as Ruling 6 in `contracts/state.md`.
Reasoning: the user gets this week, not next Friday; "From now until [end]" is
accurate mid-window; an already-begun calendar event is honest. Only
fully-closed windows advance.

The remaining low issue, silent PNG export failure, is queued for the
design-elevation pass alongside a copy-addendum line. The repo is also being
published privately to GitHub as `mikemarrotte/digital-shabbat` for handoff.

## 2026-07-10T19:29:39-0700 — Opening meeting brief lands

Commit `7c62fcc` added `kernel/research/meetings/2026-07-10-opening-meeting-brief.md`,
distilled from Mike's recording of the sprint opening meeting. The brief is a
new primary project reference; the raw transcript sits beside it but is
gitignored because it contains candid personal remarks, so handoff and future
agents should quote the brief, not the transcript.

Rachel Hyland's Common Era frame sharpened the acceptance criteria: design for
"the 70%" who are culturally affiliated but institutionally unserved; start
with the human problem, not a Jewish problem; build for pull, not push; and
aim for the user to think, "I had no idea Judaism had something to offer me
here." Her four evaluation questions now sit alongside the constitution's
definition of done: would someone actually use this, would they come back, is
there a moment of delight, and is there something uniquely Jewish underneath
that makes it better.

The build kernel anticipated this frame more than it contradicted it. The
copy-as-contract law maps directly to Rachel's statement that framing, tone,
invitation, and permission are the highest-stakes surfaces. The universal
entry point — tiredness, rest, and a better life rather than "more Judaism" —
is validated by the client frame. The three-stars motif and abstract
manuscript geometry are now explicitly ruled compliant with the no-heavy-
symbolism tenet: stars and pattern are universal at the surface, with Jewish
depth underneath.

New sprint obligations from the brief: prepare for the midday July 11 Zoom
check-in with Rachel; produce a video walkthrough; distill process notes into
README-level handoff material; and later move files into the shared sprint
repo when Kris provides the structure.

## 2026-07-11T11:10:00-0700 — Day 2: the design dial, and the establishing screen

Kris's client feedback reset the visual direction: the Jewish aesthetic goes
to 1 of 10. The persona finds a meditation-app register more inviting than
traditional Jewish imagery; the product should feel familiar first, with the
Jewish depth underneath rather than on the surface. Mike's synthesis became a
three-part dial that now governs all design work alongside the five laws:
**1/10 Jewish · 3/10 meditation app · 5/10 texture and custom type.** Nothing
is played at full volume; the identity comes from the combination.

What the ruling kills: the ketubbah-border pledge card, carpet-page patterning
as visible ornament, and the manuscript-refs corpus as a source of literal
imagery. What survives — and this is the important continuity — is
**micrography**, the single permitted Jewish nod. It survives because it was
never decoration: `contracts/copy.md` already specified the pledge card border
as "micrography border made of their own pledge text." The user's own words as
the ornament is Law 2, and it reads as elegant typographic detail to anyone
without the tradition, Jewish depth to anyone with it. Kris's dial and the
kernel converge here rather than conflict.

A GPT-generated ten-screen reference grid (`design/refs/`, July 11) was
evaluated and split deliberately: **skin adopted, skeleton rejected.** Adopted:
the hand-held rounded card-frame as the screen's basic object; the cream/ink/
dusty-gold/indigo palette and its light-to-dark rhythm (which is the descent,
already visualized); dotted ring-and-path motifs (which become micrography —
dots become tiny words); the arch/portal composition for ceremony thresholds;
the large-numeral time object. Rejected: the reference's information
architecture — a five-tab content app with checklists, quote feeds, a Learn
library, and daily-engagement surfaces. That is the product we are explicitly
not building: chrome that persists contradicts Law 5 (the interface descends),
and a reason to open the app midweek contradicts the covenant. Also cut: the
photorealistic misty-landscape imagery, which is both the most Calm-branded
element (over the 3/10 budget) and realism (Law 4). Landscapes, where wanted,
become textured flat-shape abstractions.

Typography finding that reframed the system: **OTR No Cigar has no lowercase.**
It is a unicase, wide-tracked, letterpress-stamp sans — right for the printed-
object direction, wrong for sentences. Ruling: No Cigar is display and label
only (wordmark, buttons, timestamps, wayfinding); a book serif carries every
canonical line, because the copy contract is the product's voice. Candidate:
Newsreader (screen-optimized, optical sizing, warm italic); EB Garamond
remains the fallback already in the build. The pairing is stamp-plus-book — a
print-shop convention that reinforces the texture story.

Texture strategy ("Texture Overlays VOL. 4—Printed," 604MB source pack at
`design/textures/printed-vol4/`, gitignored): ship small tiled derivatives,
never the print-res sources; texture the room (static fields, frames, cards),
never the animated flame layer; on dark screens use screen-blend grain at low
opacity, not multiply. Proposed refinement of Law 5: grain itself descends —
heaviest on parchment surfaces, nearly gone by night, so the surface quiets
with the palette.

The system was then proven in code as an **establishing screen**:
`design/prototypes/closing-card/` — the post-ceremony resting state. One
hand-held indigo frame on a textured night field; two counter-rotating
micrography rings carrying the user's sample pledge and the canonical "one
day, set apart" around a breathing gold ember; three stars; the canonical
flame-will-be-here line in serif; havdalah day and time in No Cigar numerals;
the canonical .ics label as the single pill action. All product language is
from `contracts/copy.md` verbatim; the prototype invents none. The rings are
SVG textPath with `textLength` pinned to circumference (seamless loop), slow
CSS rotation, disabled under reduced motion — the same predesigned-path
technique intended for intake transitions, where a user's typed words flow
onto the next screen along a drawn path.

Production notes for the coming design-elevation pass: self-host both fonts
(Newsreader is loaded from Google Fonts in the prototype only); verify the
OTR No Cigar license covers web embedding before ship; compress texture tiles
to WebP; port the prototype's frame/ring/type system into `tokens.css` and
the lane components. The prototype, not the reference grid, is the canonical
statement of the visual system.

## 2026-07-11T12:05:00-0700 — Design-elevation pass ships across every route

The establishing screen's system was ported to the whole product in a single
coordinated pass touching all four build lanes plus the shared foundation.
Verified end to end: TypeScript and Vite builds clean; every route walked at
desktop and mobile widths in a real browser before this entry was written.

**Foundation.** Every screen is now a hand-held frame — a rounded, grained,
hairline-inset card floating in a permanently night room. This gives the
product one spatial metaphor (you are holding a made object), makes the
palette descent legible (the card deepens; the room stays night), and
structurally kills the black-overscroll seam bug, since the field behind
every route is now designed. Fonts are self-hosted in `public/fonts/` —
Newsreader (variable, latin subsets) and OTR No Cigar — replacing the Google
Fonts request. That is a privacy decision as much as a design one: "nothing
here measures you" now extends to third-party font CDNs. Texture tiles
(512px, from pack textures #2 and #7) ship in `public/textures/`.

**Typography ruling applied product-wide.** Newsreader carries every
sentence (it replaced EB Garamond and Inter everywhere); OTR No Cigar speaks
only in short tracked labels — wordmark, buttons, steppers, field labels,
timestamps. Inter is gone from the product.

**Intake.** Native browser controls are gone: custom radio cards with a
drawn dot (the single biggest "web page" tell in the old build), styled
inputs with italic serif placeholders, No Cigar label/button system. The
descent was re-tuned to route through rich color instead of gray murk:
parchment → deep parchment → lapis dusk (foreground flips to parchment) →
indigo night. Latitude/longitude fields remain (their labels are contract
copy) but are visually subordinate to the location field and "Use my
location."

**Pledge card.** Rebuilt as a printed object: the intention is now ink on
parchment in Newsreader (the old gold-on-parchment failed contrast and read
as blur), the micrography border — the user's own words on a rounded-rect
path — is now the card's only ornament frame at legible-if-you-lean-in size,
print grain is generated with an SVG feTurbulence filter so it survives PNG
export, and both fonts are embedded as data URIs at export time (an SVG
rasterized through an image element cannot reach document fonts; the old
export silently fell back to system serifs). Meta line and maker's mark are
No Cigar.

**Ceremony.** Three defects fixed. The flame shader's teardrop SDF had a
triangle term that dominated the union and rendered the flame as a hard cone;
the triangle is removed and the taper retuned — the flame is now a flame.
The candle copy block was an internal scroll container whose default white
scrollbar glowed down the middle of the product's most sacred screen; the
container now flows naturally. And the initial-word panel no longer splits
off the literal first word of the intention ("long dinners with people I
love" used to illuminate the word "long"). Ruling, recorded here for the
copy deck's "initial-word panel treatment" staging note: the user's whole
intention is the illuminated word. A mechanical first-token split produces
arbitrary poetry half the time; Law 2's unit is the user's words, not the
tokenizer's. Ceremony screens are framed like everything else; Havdalah
keeps its dawn-brightening gradient inside its frame.

**Known refinements queued:** OTR No Cigar license verification is still
open; texture tiles should be recompressed to WebP; the intake's
predesigned-path word animation (answers flowing onto the next screen along
drawn paths, per the closing-card prototype's ring technique) is designed
but not yet implemented.

## 2026-07-11T13:00:00-0700 — Rachel's midday feedback, worked in same-day

Full distillation in `kernel/research/meetings/2026-07-11-rachel-feedback-brief.md`.
Rachel validated the elevation pass's direction ("elegant... beauty is in its
simplicity"); four changes landed within the hour of the call ending.

**Two candles.** Rachel's sharpest note: two candles reads as Shabbat candles
to a Jewish user without a word of text, and reads as simply beautiful to
everyone else — the "universal surface, legible depth" formula in a single
design decision. The canonical copy always said "The candles are lit"
(plural); the single flame was quietly contradicting the contract. The
shader now renders two teardrops with independent time phase (they breathe
separately, which matters — synchronized flames read as a graphic; unsynced
flames read as fire), and the CSS fallback renders two via pseudo-elements.

**The name is now a variable.** Rachel signaled the universal register
("Rest Ritual") over "Digital Shabbat." No rename mid-sprint, but all
React-rendered name strings now flow through `src/shared/brand.ts`;
`index.html`, the manifest, and name-bearing contract copy lines are the
enumerated static surfaces for a future rename pass. Naming goes on the
wrap-up agenda.

**The "go deeper" door, built as a door and not a wing.** New `/deeper`
route: one quiet parchment page reached only from the Havdalah return
section — i.e., only after a completed rest, per Rachel's "after the
experience has wooed somebody." Copy added through the contract addendum
(flagged for Mike's review) under her constraints: no religions named,
wisdom-tradition framing, Shabbat namable behind the door as the practice's
source. The reference grid's Learn tabs and content library remain rejected;
this door is deliberately the smallest possible version of her ask.

**Standing constraints recorded.** No religions listed on universal surfaces
(Rachel's soft veto of the comparative-religions screen). Communal flames —
"my flame among many" — is the native-app north star but requires real
accounts; ruled for handoff: real presence or nothing, because simulated
presence would violate Trust, Don't Track more deeply than the feature's
absence. And the reference grid's "25 hours of real rest" framing is
rejected even as visual skin: the unit is the week, never the hour, a ruling
Rachel independently re-derived on the call.

## 2026-07-11 — The design system is written down (design/system/)

A second GPT reference grid ("Rest Ritual," ten mobile screens in a
meditation-app register) prompted the consolidation: the visual system now
lives as a proper design system at `design/system/` — `SYSTEM.md` (the
reasoning) plus `index.html` (a living specimen page set in the system
itself). These supersede scattered prototype notes and record the system the
design-elevation pass shipped; the closing-card prototype remains the
founding artifact.

The new grid was split like the first: **skin adopted, skeleton rejected**,
with a full ledger in SYSTEM.md §9. The one genuinely new adoption is the
ref's best idea, which was already our law executed generatively: the
**word-spiral ritual object** — the user's words drawn along a spiral that
accretes a winding per kept week (the "accretion object," SYSTEM.md §7.8).
The annual micrography ring from the morning's sharing rulings is this
object at year scale. Also adopted: italic as the voice's only in-sentence
emphasis; quiet progress beads; a halftone "field" for the mid-Shabbat
holding state (re-made from the ref's particle sim under Law 4); a
chrome-minimal action tray. Adapted: the emotion wheel becomes a radial
word field (form kept, mood-tracking semantics rejected — we offer words,
we never ask for feelings); watercolor blobs become ink washes, printed
tints derived from contract colors by `color-mix` recipe. The stat surface
follows the unit law Rachel re-derived on the midday call: weeks lead,
hours are the serif subline. Rejected on standing law: tab bar, journal,
mood history, photoreal landscapes and objects, countdown timer, lock
iconography.

The system formalizes three **registers** (day / dusk / night, with
havdalah as the gold-biased reverse) under the grain-descends rule, and
names the component inventory: frame, beads, pill, intention field, radial
word field, micrography ring, accretion spiral, time object, stat object,
stars, ember, mosaic, field, share card, tray, veil. Four contract
amendments are proposed in SYSTEM.md §10 and await Mike's ruling — notably
A4, which records that `contracts/tokens.md` still names EB Garamond +
Inter while the shipped product is Newsreader + OTR No Cigar; the contract
should catch up to the build. The specimen page hardcodes the Digital
Shabbat wordmark; if the naming question resolves toward the universal
register, the page follows `brand.ts` in the same pass as the other static
surfaces.

## 2026-07-11T14:20:00-0700 — Density pass: three hero surfaces, no new scope

Ruling applied from Mike's directive after external review: the project does
not get bigger, it gets denser. Same routes, same arc, higher finish, aimed
at three hero surfaces.

**Intake.** Latitude/longitude are retired from the interface permanently
(recorded in the copy addendum): coordinates are plumbing; geolocation fills
them silently and a quiet italic line confirms ("Found you — sundown is
handled"). The missing name field — the data model supported `name` but no
UI collected it, so the card's "[Name] is keeping…" line was unreachable in
normal use — now exists as an optional signature at the end of step 4
("Sign it, if you like"), which is the covenant-document framing doing UX
work. Choice controls left their radio-card costume: options are now an
editorial list of set serif lines between hairline rules, the chosen line
illuminated with a gold point — the step-4 register extended upward through
the flow. The backup-tools step is deliberately demoted to a quiet aside:
underlined stamp-type links between rules, the reassurance line carrying
the weight.

**Landing.** First-viewport product signal: a micrography sigil — "one day,
set apart" ringing three ember stars, in slow rotation — sits above the
headline as the product's mark before a word of pitch. The page now shows
an object, not just an argument.

**Pledge card.** Rebuilt from tasteful-rectangle toward covenant document:
a full arch/gate of double gold hairline courses with a second run of the
user's own words flowing up and over it (the ketubbah/carpet-page
architecture from the research, executed at the 1/10 dial — an arch is
universal; the depth is in the words), the intention inside the gate, the
signature line beneath, No Cigar meta constrained inside the border
courses, and the card rendered near-full-width on mobile. Action tray under
the card gained native-feeling hierarchy: filled gold "Light the candles,"
paired save/send with drawn glyphs, calendar wide beneath, adjust as an
italic afterword.

Alignment note: this pass was executed concurrently with Mike's SYSTEM.md
work and converges with it — registers (day/dusk/night), the frame, beads,
time object, and micrography ring are all live in the build; the intake's
radial word field and the accretion spiral remain SYSTEM.md-specified but
unbuilt. Both fonts verified through typecheck/build; full flow re-walked
in the browser at mobile width, including a signed pledge rendering the
name line for the first time.
