# 2026-07-11 — Rachel feedback call (midday check-in)

Distilled from Mike's transcript of the one-on-one check-in with Rachel
Hyland (Common Era), with Kris Budelis. Quote the brief, not the raw
transcript. Context shown: the "Rest Ritual" ten-screen GPT reference grid
(`design/refs/…11_27_39 AM.png`) plus a verbal walkthrough of the built flow.

## Verdict on direction

Validated. "A really elegant kind of user journey — to be in the light and to
transition into the rest state and darkness. Beauty is in its simplicity."
The light → dark → light arc, minimal per-screen information, and the
ritual-object framing all confirmed. No requested reversals.

## The five actionable notes

1. **Two candles, not one.** Rachel: two candles is an immediate visual cue
   of Shabbat candles to a Jewish user "in ways that wouldn't repel them,"
   while remaining universal to everyone else — depth without a single word
   of text. (Kris independently agreed candles feel universal.) This is the
   "universal surface, legible depth" formula in one design decision.
   → Applied same day: the flame shader and CSS fallback now render two
   flames with independent phase.

2. **Naming: don't hit the nail on the head.** "Saying Sabbath is probably
   not the right approach." Rachel endorsed the "Rest Ritual" register — a
   universal-human-need entry point. Naming is now an open workstream (Kris
   offered a naming sprint). → Product-name strings centralized in
   `src/shared/brand.ts` so a rename is a one-line change; "Digital Shabbat"
   is a working title.

3. **A "go deeper" door, after the experience has wooed them.** An optional
   pathway into why rest matters and what wisdom traditions teach about it —
   presented "as a door that some might choose to walk through and some
   wouldn't," and only after the first completed rest. Never in the intake.
   → Applied minimally: one quiet link in the Havdalah return section to a
   single `/deeper` page (copy in the contract addendum).

4. **No religions named up front.** Kris floated a comparative-religions
   explainer screen; Rachel counseled against: "as soon as you start dropping
   the major religions into the conversation... you had me until you started
   talking about Christian and Jewish rest." Framing that survives:
   "humanity has always known how important rest was," wisdom traditions,
   religion unnamed on universal surfaces. (Naming Shabbat *behind* the
   opt-in door is consistent with her framing.) → Recorded as a standing
   copy constraint.

5. **Communal rest is the north star, not the MVP.** Mike's "my flame among
   many flames" resonated; Rachel: the beauty of Shabbat is "we're doing this
   jointly." Requires accounts/backend (Not-In-MVP). Standing constraint for
   any future build: real presence or nothing — simulated communal presence
   would violate Trust, Don't Track more deeply than the feature's absence.

## Smaller signals

- Rachel independently said the progress unit should perhaps be days, not
  hours — converging on the kernel's oldest ruling (the unit is the week,
  never the hour). The "25 hours of real rest" framing in the reference grid
  is therefore rejected even as skin.
- Mike's hook-first storytelling frame (engage immediately, explain later,
  payoff at the end) was well received and matches the built flow: the
  landing invites, the ritual demonstrates, the door explains — in that order.
- The reference grid's tab bar and feeling-wheel inputs remain out of scope
  (skin adopted, skeleton rejected — see 2026-07-11 chronicle entries).
