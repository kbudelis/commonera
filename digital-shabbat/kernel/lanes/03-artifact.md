# LANE 03 — ARTIFACT (of 5)

Read /kernel/CLAUDE.md and /kernel/contracts/ first. You own `src/artifact/`.
You do not touch ceremony, intake, landing, shell, or any contract.

## Your charge

The pledge card is the social feature in disguise — a dignified way for a
possibly-isolated person to tell people "reach me differently this weekend"
without saying that. It must be something a person would actually send
(success criterion — at least one demo viewer wants to share theirs).

## Deliverables

1. **Card renderer** at /pledge — SVG composition per contracts/copy.md:
   parchment field, the intention as an illuminated initial-word panel
   (largest element, gold with glow), timing + pledge summary, three-stars
   mark, optional name.
2. **The micrography border** — the card's ornamental border is the user's
   own pledge text (intention + items + exceptions, concatenated) repeated
   in ~6–7px type along an SVG path framing the card. Their words ARE the
   ornament. This is the lane's signature move; get it right before anything
   else.
3. **PNG export** — SVG → canvas → PNG download, no libraries. Also native
   share via navigator.share where available.
4. **.ics generation** — two VEVENTs (candle lighting at start, havdalah at
   end) built as a plain string, downloadable. Labels per copy deck.
5. **Edit affordance** — "adjust your pledge" linking back to /design with
   existing values (store handles it). Fast, not a word processor.

## Sync

Append to /kernel/sync/status-03.md; pull DIGEST.md each cycle. You depend on
store.ts — until Lane 02 flags it stable, build against the Pledge type from
contracts/state.md with a local mock, swap after.
