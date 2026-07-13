# CLAUDE.md — GSD Operating Instructions

> Validated against open-gsd @opengsd/gsd-core@1.6.1, local scope,
> Claude Code (`.claude/`) + Codex (`.codex/`) runtimes. Commands use the
> `/gsd-` prefix in Claude Code (`$gsd-` in Codex). Run `/gsd-help` for the
> authoritative, version-correct command list.

Project: **Cosmic Calendar** — a lunar-wisdom / seasonal-reading app rooted in
the Hebrew calendar. The tracked source of truth is `README.md` plus the
current `.planning/` contract; the raw product brief remains local-only.

## Roles (do not collapse)
- **Planning / verification → Opus** (this Claude Code session). Produces and edits
  `.planning/*`, including research *briefs*. Does NOT write implementation code and
  does NOT perform research.
- **Execution + ALL research → Codex.** Per user directive (2026-07-09): every kind
  of research — domain, stack, and content / Kabbalistic sourcing — goes to Codex,
  along with implementation. Atomic commit per task. Does not redefine scope.
  (This overrides the generic GSD "research → Opus" default.)

## Before any GSD work
This is an established project with a populated `.planning/` contract. Do not
run `/gsd-new-project` or recreate planning from the local-only product brief.
Resume from the existing state files using the reading order below.

## Workflow loop (per phase)
discuss → plan → execute → verify
(`/gsd-discuss-phase` → `/gsd-plan-phase` → `/gsd-execute-phase` → `/gsd-verify-work`)

Lightweight lanes: `/gsd-quick` (GSD guarantees, fewer agents) · `/gsd-fast`
(trivial task, inline, no subagents).

## Hard rules
- One atomic git commit per task. Surgical changes only.
- Never touch deployed / source-of-truth files unless the task targets them.
- Major schema/architecture change → STOP, raise a checkpoint:decision.
- Keep the planning session lean (well under 50% context); heavy work in subagents.
- Prefer heredoc (`cat > file << 'EOF'`) over fragile in-place edits for rewrites.

## State files (source of truth — under `.planning/`)
PROJECT.md · REQUIREMENTS.md · ROADMAP.md · STATE.md · PLAN.md · SUMMARY.md
The `.planning/` artifacts ARE the contract between runtimes — never re-derive
from chat. If chat and `.planning/` disagree, trust `.planning/` and `/gsd-help`.

## On resume (fresh session)
Read `README.md` → `.planning/STATE.md` → `.planning/HANDOFF.json` →
`.planning/ROADMAP.md` → the current phase plan. Don't re-derive from chat.

## Local runtime continuity
- `.claude/` and `.codex/` are generated local runtime directories and may be
  ignored by Git while remaining available in an existing checkout.
- If they are missing, reinstall the pinned local runtime from the project root
  with `npx -y @opengsd/gsd-core@1.6.1 --claude --codex --local`.
- `.agents/` is optional generated mirror output and is not required for GSD
  planning or execution in this repo.

## Deploy guard
The active host is the parent `commonera` repository's GitHub Pages workflow.
It builds this app to `dist/` with `BASE_PATH=/commonera/cosmic-calendar/` through
`.site/build-all.sh`; it does not serve this project root. Deployment runs only
from parent-repo `main`. Keep `.assetsignore` as defense in depth, and never add
`.planning/`, `.claude/`, `.codex/`, the PRD, or handoff files to a public build.
