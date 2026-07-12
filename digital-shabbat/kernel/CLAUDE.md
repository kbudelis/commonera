# DIGITAL SHABBAT — BUILD CONSTITUTION

Common Era × Vibe Coding Sprint · July 10–11, 2026 · Built by Mike Marrotte / Signalform

## What we are building

A digital ritual tool that helps someone design, commit to, and close a weekly
Shabbat-inspired screen-free period. The user designs their Digital Shabbat
(what they're giving up, when, why), receives a shareable pledge card, and gets
a ceremonial "candle lighting" opening and "Havdalah" close.

**Who it's for:** a 31-year-old culturally Jewish adult whose phone is a source
of *comfort*, who has tried and ignored screen-time limits, who is somewhat
socially isolated by default, and who is open to Jewish structure without any
Shabbat practice. We are never their bouncer, coach, or disappointed parent.
We are a kind adult helping them set a table.

## The five laws (taste rulings — these override cleverness)

1. **Stopping is arriving.** The app makes ceasing feel like arriving somewhere,
   not leaving something. The candle screen is a destination, not a gate.
2. **The word is the ornament.** Hebrew manuscripts illuminate initial *words*,
   not letters. The user's own words (their intention, their pledge) receive
   the ceremonial treatment. Never decorate around empty labels.
3. **Trust, don't track.** We never measure, log, or surveil usage. Completion
   is attested by the user at Havdalah. Their testimony is the data. This is
   covenantal, not technical, and it is a feature.
4. **Abstract over realistic.** The aniconic rule. The flame is a made thing —
   shader, not simulation. Geometry and pattern over illustration. When in
   doubt, abstract.
5. **The interface descends.** Screens get progressively quieter through the
   intake: less chrome, larger type, palette deepening from parchment toward
   indigo night. The ceremony screens are nearly empty. Waste space
   extravagantly there.

## Tone (enforced)

- No exclamation points anywhere in the product. None.
- Never praise-bot voice ("You've got this! 💪"). Never guilt. Never lecture
  Jewish law or imply a "right way" to do Shabbat.
- The practice speaks, not the app: "The candles are lit," not "You did it!"
- All product copy lives in `/contracts/copy.md` and is canonical. Build agents
  do not write or rewrite user-facing copy. If a screen needs copy that doesn't
  exist, leave `[COPY NEEDED: description]` and log it in your status file.

## How this team works

Five Claude Code instances, one repo, one constitution. You are one lane of
five. On first run:

1. Read this file, then everything in `/kernel/contracts/`.
2. Read your lane file: `/kernel/lanes/0N-*.md`. It names what you own and
   what you must not touch.
3. Begin. High freedom inside your lane. Zero freedom on contracts.

**Contracts are law.** Tokens, state shape, routes, and copy are pinned in
`/kernel/contracts/`. If a contract is wrong, do not work around it — flag it
in your status file and stop touching that seam until Mike rules.

## Silo + sync protocol (merge-conflict mitigation)

- **You own directories, not just concerns.** Write only inside the `src/`
  directories your lane file assigns, plus your own status file. Never edit
  another lane's directory, shared config, or contracts.
- **Status:** append a short entry to `/kernel/sync/status-0N.md` (your own
  file, nobody else writes to it) whenever you complete something, decide
  something, or get blocked. Format: timestamp, what changed, what it means
  for other lanes (or "nothing").
- **Pull the digest:** at the start of each work cycle, read
  `/kernel/sync/DIGEST.md`. It is maintained by Lane 05 (Chronicle/Herald) and
  summarizes cross-lane changes that might affect you. Reading it is how you
  "receive pings."
- **Integration is Mike's.** Do not merge across lanes or "helpfully" wire
  another lane's component into yours unless the digest says its interface is
  stable and your lane file assigns you the seam.

## Definition of done (from the PRD, in priority order)

1. Design + commit to a Digital Shabbat in under 5 minutes.
2. The candle screen feels ceremonial — meaningfully different from a
   notification. (This is the bar the whole product hangs on.)
3. The pledge card is something a person would actually share.
4. The Jewish framing is accessible to someone with zero practice.
5. Handoff-ready: Common Era can run, understand, and extend this without us
   in the room.

## Resolved contradictions (do not relitigate)

- PRD flow needs notifications; notifications are Not-In-MVP → we generate a
  **downloadable calendar invite (.ics)** for candle-lighting and Havdalah
  times. The user's calendar is the ritual layer.
- Streaks need state; accounts are Not-In-MVP → **localStorage**, framed
  honestly in-product: "your mosaic lives on this device."
- Sundown times → **suncalc**, client-side, from user-shared or user-typed
  location. No API keys, no backend.
- Progress reward → a **mosaic** (tesserae accrue per attested Shabbat), not a
  cathedral. Heschel: the sanctuary is in time; the mosaic is how time leaves
  a visible residue. Unit is the week, never the hour.
