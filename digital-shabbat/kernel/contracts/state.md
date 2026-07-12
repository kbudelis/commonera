# STATE & INTERFACES (contract — zero freedom)

## Stack (pinned)

- Vite + React 18 + react-router-dom. Plain CSS with custom properties from
  `tokens.css`. **No Tailwind, no UI kits, no CSS-in-JS** — five agents, one
  visual language, lowest common denominator wins.
- Deps allowed: `suncalc`, `react-router-dom`. Anything else: flag in status,
  wait for ruling. (Pledge-card PNG export: render SVG → canvas → PNG by hand,
  no library.)
- Deploy target: Cloudflare Pages via Wrangler (already configured on Mike's machine), static build. No backend, no API keys, no env vars.

## Routes (owned by Lane 04's app shell)

| Route | Screen | Lane |
|---|---|---|
| `/` | Landing | 04 |
| `/design` | Intake flow (4 steps, single route, internal state) | 02 |
| `/pledge` | Pledge card view / share / edit / .ics download | 03 |
| `/candle` | Veil → candle lighting | 01 |
| `/havdalah` | Havdalah close → attestation → mosaic | 01 |

## The pledge object (single source of truth)

```ts
type Pledge = {
  v: 1;
  name?: string;                      // optional, for the card
  timing: {
    mode: 'traditional' | 'sunday' | 'custom';
    start: string;                    // ISO
    end: string;                      // ISO
    location?: { lat: number; lng: number; label?: string }; // for suncalc
  };
  pledge: {
    tier: 'items' | 'all_in' | 'full';
    items?: string[];                 // tier 'items'
    exceptions?: string[];            // tier 'all_in'
  };
  intention: string;                  // one sentence, user's words, verbatim
  substitute: string;                 // "when the urge comes, I will ___"
  phoneHome?: string;                 // "where will your phone go" answer
  createdAt: string;                  // ISO
};

type WeekRecord = {
  weekOf: string;                     // ISO date of the start
  kept: boolean;                      // user attestation at Havdalah — never inferred
  reflection?: string;
};
```

## localStorage keys (never invent new ones)

- `ds.pledge.v1` → `Pledge`
- `ds.history.v1` → `WeekRecord[]`   (drives the mosaic; append-only)

All reads/writes go through `src/shared/store.ts` (owned by Lane 02, interface
frozen after first commit): `getPledge()`, `savePledge(p)`, `getHistory()`,
`attestWeek(record)`.

## Directory ownership (write only inside yours)

| Lane | Owns |
|---|---|
| 01 Ceremony | `src/ceremony/` (veil, candle, havdalah, flame shader, mosaic) |
| 02 Intake | `src/intake/`, `src/shared/store.ts`, `src/shared/sun.ts` |
| 03 Artifact | `src/artifact/` (card renderer, micrography border, PNG + .ics export) |
| 04 Landing/Shell | `src/App.tsx`, `src/main.tsx`, `src/styles/`, `src/landing/`, routing, Cloudflare deploy config |
| 05 Chronicle/Herald | `/kernel/chronicle/`, `/kernel/sync/DIGEST.md` only — **no src writes, ever** |

Shared seams (`store.ts` interface, `Pledge` type, routes, tokens.css) freeze
after first commit. Changing a seam = status-file flag + Mike's ruling.

## Cross-lane data flow

Intake (02) writes Pledge → Card (03) and Ceremony (01) read it via store.
Havdalah (01) calls `attestWeek()` → mosaic (01) reads history. Landing (04)
links into `/design`. Nobody imports another lane's components except via the
routes. If you need something from another lane, you need a route or the
store — not their code.

---

## Addendum — coordinator rulings after the independent review (Mike: review)

1. **`attestWeek` is idempotent per week.** If a record with the same
   `weekOf` exists, it is replaced, not appended. The signature does not
   change. One week, one testimony — their latest one.
2. **`intention` is required at intake.** It supersedes "every field
   skippable" for that one field: the word-panel, the candle screen, and the
   card all collapse without the user's words (law #2). One trimmed sentence.
   `substitute` and `phoneHome` remain skippable; every surface that renders
   them must omit their lines gracefully — never fabricate, never render
   empty ceremony copy.
3. **Timing must never produce a window that has already closed.** If the
   computed start is in the past relative to now, advance to the next
   occurrence. "The candles are lit" may never refer to last week.
4. **Token literals.** Raw contract hex values are permitted only where CSS
   custom properties cannot reach (webmanifest, standalone SVG icons, SVG
   serialized for PNG export) and must match the contract values exactly.
   In-CSS raw colors/timings are still breaches; consolidation into derived
   tokens is deferred to the design-elevation pass, where the ornament CSS
   is being rewritten anyway.
5. **All internal navigation uses the router** (`Link`/`useNavigate`) — no
   `href`-based full reloads between our own routes. The deploy also carries
   an explicit `public/_redirects` SPA fallback rather than relying on
   Pages' implicit one.
6. **Mid-window entry is kept — Mike's ruling, final.** A pledge designed
   after candle-lighting but before Havdalah keeps the current window: the
   user gets *this* week, they are not pushed to next Friday. The candle
   copy ("From now until [end]") is accurate mid-window, and a calendar
   event that has already begun is honest. Only fully-closed windows
   advance. The reviewer's finding 2 is resolved as intended behavior.
