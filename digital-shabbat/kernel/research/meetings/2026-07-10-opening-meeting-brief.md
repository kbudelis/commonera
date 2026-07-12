# Opening meeting brief — Common Era sprint, July 10 2026

**Primary reference for the overall project.** Distilled from the two-part
recording of the opening meeting at the loft. Raw transcripts live in
`kernel/research/transcripts/` (parts 1 and 2), deliberately kept out of git
history — they contain candid personal remarks. Part 1 = client framing +
sprint process; Part 2 = per-product concept discussion, including Digital
Shabbat in Mike's own words (§ "Digital Shabbat, from the source" below).

Present: Benjamin Canyon (Conspire for Good, engagement lead), Kris Budelis
(product lead, wrote most of the PRDs), Spence Miller, Ari, Ty Rex, Mike
Marrotte (this project), and Rachel Hyland (Common Era, by phone).

## The client frame (Rachel Hyland, Common Era)

Common Era is the R&D engine of the Jim Joseph Foundation. Their research:
only ~30% of North American Jews are served by communal institutions, yet
94% report deep pride in Jewish identity. Common Era designs for **the 70%**
— culturally affiliated, institutionally unserved, not looking for "more
Judaism," looking for meaning, identity, relationships, purpose, connection,
belonging, growth.

Rachel's design tenets, verbatim in spirit:

1. **Start with the human problem, not a Jewish problem.**
2. **Translate Jewish wisdom; don't digitize institutions.** No obligation
   to honor institutional rigidity.
3. **Build for pull, not push.** People should want it because it improves
   their lives.
4. **The win condition:** someone walks away saying *"I had no idea Judaism
   had something to offer me here."*
5. Look to **universal analogs** — Duolingo, Spotify Wrapped, Airbnb, tarot
   apps — not existing Jewish products.
6. The user does not wake up wanting more Judaism; they wake up **wanting a
   better life.**
7. **Framing, tone, invitation, permission are the highest-stakes surfaces**
   — nail those regardless of feature outcome. (Directly validates this
   kernel's copy-as-contract law.)
8. Avoid leading with heavy Jewish symbolism (no magen david front and
   center); universal entry, with **optionality to go deeper** — Rachel's
   "dial" metaphor: imagine dialing Jewishness up/down per audience.
9. Big swings encouraged; a miss that teaches is a success. This weekend is
   about learning, not perfect product.

Rachel's four evaluation questions — treat as acceptance criteria:
- Would someone actually use this?
- Would they come back?
- Is there a moment of delight?
- Is there something uniquely Jewish underneath that makes it better?

## Sprint logistics and deliverables (Benjamin/Kris)

- Five products, one lead each; collaboration encouraged; judged on
  collective output.
- PRDs are foundations, not contracts — deviate when something is clearly
  better; talk to Benjamin/Kris before big pivots. Explicit permission to go
  your own way on design ("the references are for functionality").
- **No accounts/login** across all projects — single-session, logged-out
  experience first. (Matches this kernel's localStorage ruling.)
- **Midday check-in tomorrow (July 11): 10–15 min Zoom with Rachel**, screen
  share, product-level (non-technical) — users, assumptions, pivots, and how
  each product fits the Common Era mission.
- End of day July 11: presentations on the big screen, then wrap-up.
- **Final deliverables per project:** a working link Common Era can open; a
  **video walkthrough** living in the shared repo folder; README-level
  **process notes** ("how I did it, tools used, challenges"); a "what I'd do
  with more time" note. Kris will walk through the shared GitHub repo
  structure at wrap-up. Common Era explicitly does not want raw code dumps —
  they want the product plus an understanding of how it was made, minus
  deep technical detail.
- Client posture on process: somewhere between "show us the sausage-making"
  and "just show results" — keep good notes (this kernel's chronicle is the
  answer to exactly that request).

## What this means for Digital Shabbat specifically

- The kernel's constitution already embodies Rachel's tenets (universal
  entry: "a three-thousand-year-old answer to a very new kind of tired";
  trust-don't-track; the practice speaks). Keep it that way.
- Ruling: the **three-stars motif and abstract manuscript geometry comply**
  with the no-heavy-symbolism tenet — stars and pattern are universal; we
  lead with rest, not religion. The Jewish depth is underneath, which is
  Rachel's stated ideal.
- Rachel's "dial" idea is a natural future direction for the pledge design
  flow (how Jewish do you want this to feel?) — noted for "with more time,"
  not MVP.
- New obligations to schedule: demo readiness for the midday Rachel
  check-in; the video walkthrough; process-notes README distilled from the
  chronicle; files into the shared sprint repo when Kris provides it.

---

## Digital Shabbat, from the source (Part 2 — Mike's own framing)

Part 2 of the meeting went product by product. When Digital Shabbat came up,
Mike described the vision aloud; much of the kernel's design DNA is here in
his own words. This section is the origin record — when a design decision
needs to trace to intent, it traces here.

**The core reframe:** "taking what is called screen time and making it a
ritualistic experience." Screen-time limits are the failed status quo — Mike
cites watching his partner hit "you ran out of time" and do the reflexive
default-motion with her phone every day. Digital Shabbat replaces the nag with
a ritual that "honestly seems to engineer itself out of your life."

**The bookend structure** (candle → quiet day → Havdalah) came from Mike:
"it's this bookended experience... an actual thing is nothing." The interest
was explicitly in the *back side* — the Havdalah reflection — not just the
setup: "I'm considering how this can be more than just something that's
restricting me, and more like I'm arriving at this practice and then I am
rewarded for that." (This is "stopping is arriving," law #1, before it was
written as law.)

**The mosaic reward — Mike's invention, verbatim in spirit:** referencing
Forest-style "a tree is growing" apps, he wanted something better: "maybe
there's some sort of building mosaic. You get a piece that materializes, and
it's pulling in your intent and pledges aesthetically, so you get this kind of
surprise at the end — like, wow, that's a reward. It's not anything huge. Just
a little piece." Unit-is-the-week and the aniconic mosaic both descend from
this.

**The micrography border — also Mike's, verbatim in spirit:** "pulling a lot
of their words and playing with this idea of illustrated text in the design
itself. You see your words literally comprising a border going around the
screen." Law #2 ("the word is the ornament") is the formalization of this
sentence. He named the whole ambition: "I'd be really pumped to see this
procedurally generating ritual space on my phone, and then I just put it down
and walk away, and be rewarded in some meaningful way."

**The substitute prompt came from Benjamin:** "What are you going to do when
you're sitting by yourself on a weekend and you're feeling horribly empty
inside?" → a toolkit of "here's what you can do instead," grounded in a little
addiction-recovery research. This is the copy deck's "when your hand reaches
for it... what will you try instead." Kris reinforced the mechanism from her
own no-social-media month: intentions are "almost reflexive... it can be
unconscious that you reopen Instagram" — the pledge is psychological, not
technical (validates the trust-don't-track covenant, law #3).

**Explicitly raised, deferred to "with more time" (not MVP):**
- **App blocking** (Kris): real blocking needs Apple approval, out of scope;
  suggest tools instead (Opal, Screen Time, Digital Wellbeing, Freedom — and
  Kris added *Brick*). A *visual mockup* of how blocking would fit is a
  nice-to-have. → present in intake step 3 as links only.
- **Lock-screen intention image** (Benjamin): "some easy way of getting a lock
  screen image that is their intention — that's what they see when they pick
  it up." Mike: "the very first thing. I love it." A strong future feature;
  not built for MVP.
- **Nested-reason onboarding, à la Noom** (Kris): "why do you want to... and
  what's the reason behind that... and behind that" across separate screens,
  then reflected back. A motivation-design pattern worth studying for the
  intake; MVP keeps a single intention sentence to protect the under-5-min
  goal, but the depth idea is logged.
- **A light social/community layer** (Mike): the traditional Shabbat is
  communal, but our lonely-by-default user is home alone; how much social to
  add is an open question — leaning toward *educational* nudges to plan
  something social, not "invite your friends" mechanics ("feels a little
  gimmicky").
- **Light intake personalization** (Benjamin): "are you wanting to reduce
  stress or increase connection?" → gentle directional nudges. Mike's caution:
  avoid the "being categorized by basic inputs" feeling that he dislikes in
  the category. A taste guardrail for any future personalization.

**Design-process note:** Mike said he'd be "on Mobbin looking at a bunch of
onboarding flows" and pulling reference as "the human part" of the work — the
design research pass is the formal version of that instinct.
