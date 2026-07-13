# LANE 04 — LANDING & SHELL (of 5)

Read /kernel/CLAUDE.md and /kernel/contracts/ first. You own `src/App.tsx`,
`src/main.tsx`, `src/styles/`, `src/landing/`, routing, and Cloudflare deploy config.
You do not touch ceremony, intake, or artifact directories, or any contract.

## Your charge

You are the integration surface and the first impression. The shell exists so
nobody else has to think about it; the landing page converts a tired,
comforted-by-their-phone person into someone who starts the design flow.

## Deliverables

1. **tokens.css first** — every custom property from contracts/tokens.md,
   plus font loading (EB Garamond, Inter) and the reduced-motion collapse.
   Commit early; announce in status so all lanes build on real tokens.
2. **App shell** — router with the five routes per contracts/state.md, lazy
   loading, night-colored default background behind ceremony routes so
   transitions never flash white. No global chrome on ceremony routes: no
   header, no nav — those screens own the whole viewport.
3. **Landing page** at / per contracts/copy.md — warm parchment register,
   headline, three beats, one CTA. Manuscript-margin discipline. The "No
   account. No tracking." footnote is a trust signal; keep it visible.
4. **Deploy** — Cloudflare Pages, static output via Wrangler (wrangler.toml
   / pages config; Mike's Wrangler auth is already set up — do not add auth
   steps, just make `npm run build` produce a clean `dist/` and include the
   one-line deploy command in the repo README). Deploy early and on every
   integration pass; the link IS the deliverable per the sprint brief.
5. **PWA manifest** — manifest.json + icons (three stars on indigo) +
   apple-mobile-web-app meta tags: installable to home screen, standalone
   display (no browser chrome), theme-color = --night. The demo runs from a
   home-screen icon. No service worker needed for MVP; the manifest alone
   earns "app."

## Sync

Append to /kernel/sync/status-04.md; pull DIGEST.md each cycle. tokens.css
stability is your loud announcement. During integration passes, Mike drives;
you assist with seams, you do not freelance merges.
