# Digital Shabbat — Sprint Submission

**Coder:** Mike Marrotte (Signalform)
**Product working title:** *Keep* (concept: "Digital Shabbat")

---

## Tagline

*One sentence — what it does and who it's for:*

**Keep helps a culturally Jewish adult who can't put their phone down design, commit to, and ceremonially open and close one screen-free day a week — a real beginning, a real end, and a quiet day in between that belongs to them.**

*(Shorter alt for a slide: "Give your week its shape back — a guided weekly digital Shabbat, for people who've ignored every screen-time limit they've tried.")*

---

## Changes you made to the original PRD — and why

The core arc from the PRD — design your Shabbat, get a pledge card, a candle-lighting opening and a Havdalah close — shipped intact. The changes came from a few places where the original plan had tensions to resolve, or where building it taught us something:

- **Progress lives on your device, honestly.** We wanted a sense of a streak building over time, but accounts and login were out of scope. So progress is saved right on your device, and the app tells you that plainly rather than pretending otherwise — "your mosaic lives on this device."
- **We chose not to track anything, on purpose.** The app never measures or logs how you use it. Whether you kept your Shabbat is something *you* say at the end — your word is the record. That's a deliberate stance, not a limitation: this is a product for someone who's been nagged by every other tool, so trust is the whole relationship.
- **A calmer, more universal look, after the midday review.** The client review steered us away from overt religious styling toward a quieter, more universal feel — closer to a well-made meditation app — with the Jewish meaning living underneath the surface rather than sitting on top of it. Dialing the traditional aesthetic down actually made the product feel more genuinely rooted, and more inviting to someone without any practice.

---

## Link to working prototype

**https://common-era-keep.pages.dev**

Hosted on Cloudflare Pages. No login, works in incognito. *(Confirm it's still live before submitting — see checklist notes at the bottom.)*

---

## Tech stack

- **Claude Code** — built by five parallel Claude Code agent lanes working one repo against a frozen "constitution" (pinned contracts for tokens, state shape, routes, and copy), plus a read-only chronicler lane.
- **React 18 + Vite + TypeScript** — SPA; `react-router-dom` for routes.
- **suncalc** — client-side sundown/Havdalah times from user location. No API keys, no backend.
- **Custom GLSL fragment shader** — the abstract two-candle flame (SDF teardrops + noise + bloom), with a CSS fallback. DeviceMotion drives flame turbulence, so it settles when you set the phone down.
- **PWA** — web manifest + self-hosted fonts (Newsreader + OTR No Cigar), installable, standalone.
- **Cloudflare Pages** — hosting/deploy.
- **NotebookLM + ChatGPT** — knowledge base and design-reference generation (screen-grid explorations, research corpus).

---

## In brief: what was your process?

I started by brainstorming the PRD in a Claude thread, distilled that into a written "kernel" of taste and tone rules and constraints, then dropped that kernel into the build and ran multiple AI coding agents in parallel against it — so the feel stayed consistent while the build moved fast. The biggest learning was about the aesthetic experience: figuring out how much traditional Jewish styling the product should carry, and discovering that less is more — dialing the overt Jewish aesthetic way down made the product feel more genuinely Jewish, with the depth underneath the surface instead of on it.

---

## What would you add, change, or fix with more time (top priorities, another month, unlimited resources)

1. **Ship the Expo native app.** Every deferred item is a native unlock: real sundown push notifications, reliable motion sensing for the stillness-flame, haptics at the candle moment, and eventually Screen Time / app-blocking entitlements (iOS-only). The React code and the whole design/copy kernel port; the shader moves to react-native-skia.
2. **Accounts, so the mosaic and "communal flame" become real.** "My flame among many" — seeing that others are resting at the same time — is the north star, but it requires real presence. Rule held during the sprint: real presence or nothing, because *simulated* presence would violate "Trust, Don't Track" worse than the feature's absence.
3. **Resolve the name and finish the universal-register pass.** Name is currently a variable (`brand.ts`) pending a decision between "Digital Shabbat" and a more universal register ("Keep" / "Rest Ritual").
4. **Finish the designed-but-unbuilt system pieces:** the intake's predesigned-path word animation (your typed words flowing onto the next screen along a drawn path), the word-spiral "accretion object" that gains a winding per kept week, and WebP texture compression.
5. **Verify the OTR No Cigar font license for web/native embedding before any public launch.**

---

## Video walkthrough link (2–3 min)

*[Mike to record — Loom/QuickTime, then upload to Drive labeled "Digital Shabbat".]*

Suggested run of show (≈2.5 min):
1. **The problem (15s):** a phone that's a comfort, every screen-time limit ignored. Not a bouncer — a kind adult helping you set a table.
2. **Design your Shabbat (40s):** walk the intake — when, what you're setting down, backup tools, and the one sentence "what are you making room for." Note the interface *descending* (parchment → indigo night) as you go.
3. **The pledge card (25s):** the shareable covenant object — the user's own words as the micrography border. Show save/share.
4. **Light the candles (40s):** the ceremonial destination — two abstract flames, the stillness mechanic (flame settles as you set the phone down), the `.ics` invite.
5. **Havdalah + mosaic (20s):** the close, user-attested completion, a tessera laid for the week, the quiet "go deeper" door.
6. **What's rough / what's next (20s):** name TBD, native app + notifications + communal flame are the next month.

---

## Screenshots

*[Embed 2–3. Strongest set: the candle/ceremony screen, the pledge card, and the intake "what are you making room for" step. I can capture these from the running dev server on request.]*

---

## Checklist status

- [ ] **Prototype link** — https://common-era-keep.pages.dev — *verify still live + incognito before submit.*
- [ ] **Video walkthrough (2–3 min)** — Mike to record.
- [ ] **Uploaded to Drive** — Mike, label "Digital Shabbat."
- [x] **Code on GitHub** — `github.com/mikemarrotte/digital-shabbat` *(private; move into your own folder in the shared sprint repo per the checklist).*
- [x] **Fill out everything above** — drafted here.
</content>
</invoke>
