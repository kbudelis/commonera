# COPY DECK (contract — canonical, do not rewrite)

Voice: a kind adult with a warm voice helping you set a table. Tenderness, not
discipline. The practice speaks, not the app. No exclamation points. Words in
`[brackets]` are user data rendered verbatim. `//` lines are staging notes.

---

## Landing (`/`)

**Headline:** Give your week its shape back.

**Sub:** One day, set apart. A three-thousand-year-old answer to a very new
kind of tired.

**CTA:** Design my day

**Lower section (three short beats, in order):**
1. **Choose your day.** Friday sundown to Saturday night, the traditional
   window — or the window that fits your life.
2. **Say what you're setting down.** Some apps, all apps, or everything with
   your own exceptions. You define it.
3. **Light the candles.** A real beginning, a real end, and a quiet day in
   between that belongs to you.

**Footnote line:** No account. No tracking. Nothing here measures you.

---

## Intake (`/design`) — step headers & microcopy

**Step 1 — When is your Shabbat?**
- Traditional · Friday sundown → Saturday night, when three stars are out
- Sunday · sunrise → sunset
- Custom · pick your window
- Location ask (for sundown times): "Sundown moves. Tell us roughly where you
  are and we'll keep track of it for you." // typed city or geolocation; never required

**Step 2 — What are you setting down?**
// tier names, in this order
- Pick your items
- Going all in — everything except what you name
- Full Shabbat — all screens, phone off or in a drawer
- Exceptions field hint: "e.g. maps, calls from Mom, the camera"
- Reassurance line beneath: "Boundaries with doors you built yourself are
  stronger than walls. Name your exceptions without apology."

**Step 3 — Want backup?**
"If it helps to make it harder, these can lock things while you rest." //
links: Opal, Screen Time (iOS), Digital Wellbeing (Android), Freedom
"Optional. The pledge is the real mechanism."

**Step 4 — What are you making room for?**
One sentence. Yours. // single text field, large type, on deepening background
Placeholder: "reading on the porch · my kids · nothing at all, gloriously"

**Then:** Where will your phone go?
"Somewhere it can rest too — a drawer, a shelf, the far side of the house."

**And:** When your hand reaches for it — and it will — what will you try
instead?
Placeholder: "step outside · pick up the book · just notice it, and let it pass"

---

## The veil (transition into `/candle`)

// screen darkens to night over ~4s, carpet-page pattern barely visible

> Close your eyes for a moment.
> When you open them, it will have already begun.

---

## Candle screen

// flame resolves out of the dark; lines appear one at a time, ≥1.5s apart

> The candles are lit.
>
> From now until [end, human-readable], you've made room for
> **[intention]**. // initial-word panel treatment
>
> Your phone is going [phoneHome].
>
> When your hand reaches for it — and it will — [substitute].
>
> There's nothing left to do here.
> That's the point.

// long beat, then smaller:

> This screen doesn't end. You just leave it.
> The flame will be here at havdalah — [end day], when three stars are out.

---

## Havdalah screen (`/havdalah`)

// begins near-dark; brightens gently toward parchment over the sequence.
// three gold stars resolve first, before any text.

> Three stars are out.
> Welcome back.
>
> Before you pick everything back up —
> what did you notice?
// reflection field, unhurried, optional

> What will you carry into the week?
// second field, optional

**Attestation** // one quiet question, two plain buttons — never a scoreboard
> Did you keep your Shabbat, in the way you meant to?
- I kept it
- Not this time
// "Not this time" response: "Then it was a rehearsal. The candles will be
// there next week." — nothing else. No streak broken. No red.

**On "I kept it":** // a tessera is added; the mosaic grows by one tile
> The day was kept.
> A tile is laid.

**Spice-box line** // small, final, before returning to the ordinary interface:
> The old tradition says a second soul visits you for the day of rest, and
> that the spices at havdalah are to comfort you as it leaves.
> Take one breath before you go.

**Share prompt (quiet, last):** Want anyone to know? // generates card share

---

## Pledge card (`/pledge`)

// parchment field, micrography border made of their own pledge text,
// initial-word panel on the intention, three stars mark, optional name.

> **[Intention]** // the illuminated word-panel, largest element
> [Name] is keeping a day, set apart.
> [timing, human-readable] · setting down [pledge summary]
> // small, at the foot:
> One day, set apart.

**.ics download label:** Add the candle-lighting to your calendar
// two events: start ("Candle lighting — [intention]") and end ("Havdalah")

---

## Forbidden

Exclamation points · emoji · "journey" · "You've got this" · "streak" (the
word; the mosaic is never called a streak) · "detox" · "digital wellness" ·
guilt in any costume · explaining Jewish law · any sentence that could appear
in a fitness app.

---

## Addendum — coordinator rulings, mid-sprint (Mike: review and overrule freely)

// The deck above didn't specify small UI strings. Lanes correctly left
// [COPY NEEDED] markers; these rulings fill them so copy stays centralized.
// Same voice, same laws. Logged in the chronicle.

**Intake (`/design`) — controls & labels**
- Previous step action: Back
- Next step action: Continue
- Save pledge action (step 4): Make my pledge
- Step progress label (assistive): Step [n] of 4
- Timing mode field label (assistive): When is your Shabbat?
- Pledge tier field label (assistive): What are you setting down?
- Location field label: Roughly where are you?
- Use-current-location action: Use my location
- Location-found line (after geolocation succeeds): Found you — sundown is handled.
- Latitude / longitude: never user-facing (2026-07-11 ruling — coordinates are
  plumbing; geolocation fills them silently, labels retired)
- Name field label (step 4, optional): Sign it, if you like
- Name placeholder: your first name
- Custom window labels: Begins · Ends
- Items field label: Name them

**Pledge card (`/pledge`)**
- Begin-ceremony action (primary): Light the candles
- PNG download action: Save the card
- Native share action: Send the card
- Edit affordance: Adjust your pledge
- No saved pledge yet (line, then link): Nothing is pledged yet. · Design my day
- Export failure (quiet line, either action; user-cancelled share shows nothing):
  That didn't work. Try once more.

**Ceremony**
- DeviceMotion permission (line, then the one tap):
  The flame settles when the phone is set down. Motion stays on this screen
  and is never stored. · Let the flame feel for stillness
- Invalid/unparseable end time: render "when three stars are out" in place of the time
- Invalid/unparseable end day: render "at week's end" in place of the day
- Mosaic accessible label: Your mosaic. One tile for each kept week.

**Shell**
- Not-found heading (404): There's no page here.

**"Go deeper" door (`/deeper`) — added after the 2026-07-11 client call (Mike: review freely)**
// Rachel: an optional pathway into why rest matters, offered only after the
// experience "has wooed somebody." Never in the intake, never on the landing.
// No religions listed; wisdom-tradition framing. Naming Shabbat as the source
// is permitted behind the door — the product borrows its shape from it.
- Door link (Havdalah return section only, quiet, last): Where this comes from
- Page copy:
  > People have always known how to do this.
  >
  > Long before screen-time reports, wisdom traditions around the world set
  > aside protected time and guarded it carefully. The shape this practice
  > borrows is Shabbat: one day in seven, set apart — not a pause so you can
  > work better after, but a sanctuary built in time, arrived at weekly,
  > kept with people you love.
  >
  > There's nothing more you need to know to keep your day.
  > But if the day starts to feel like it belongs to something older — it does.
- Return link: Back to your pledge

**Structural rulings (no copy — behavior)**
- Missing `phoneHome`: omit the "Your phone is going …" line entirely. Never
  fabricate a fallback.
- `phoneHome` grammar seam (Mike's ruling, 2026-07-11): the candle line reads
  "Your phone is going [phoneHome]" but the intake placeholder invites bare
  noun phrases ("a drawer, a shelf"). Render prepends "to " unless the user's
  words already open with a preposition. The user's words are never otherwise
  altered.
- Direct visit to `/candle` or `/havdalah` with no saved pledge: do not
  fabricate a placeholder pledge. Show, quietly, on night:
  The candles aren't lit yet. · Design my day (links to /design)
