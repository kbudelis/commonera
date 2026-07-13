# Security policy

Cosmic Calendar is a public prototype project. Its project-local guardrails are
best-effort prototype checks for common mistakes; they are not a guarantee of
complete security. They do not mutate the real checkout or change shared
repository infrastructure.

## Reporting a vulnerability

- Do not open a public issue for an unpatched credential leak or a directly
  exploitable finding.
- Use GitHub's private vulnerability reporting flow if it is enabled for the
  repository.
- If private reporting is not available, contact an authorized maintainer
  through an existing private channel before public disclosure.

## What the automatic guardrails do

- Run `npm run public:preflight` locally before publication.
- Scan the current tree, staged content, and project history for secrets.
- Check retained GSD documents, public metadata, read-only clean-checkout
  continuity, static-analysis heuristics, npm advisories, and emitted build
  artifacts.
- Block on failures. They report; they do not auto-fix.

## What the automatic guardrails never do

- Delete or rewrite files in the real checkout
- Auto-fix source code or documentation
- Install Git hooks
- Perform asset-by-asset provenance or licensing review
- Rewrite already-public Git history

## Before publishing changes

Before a feature branch is proposed, verify:

- the local Git identity uses the contributor's verified GitHub `noreply`
  address
- the complete PR diff changes only `cosmic-calendar/**`
- `npm run public:preflight` passes

These local checks do not modify repository-root workflows, branch settings,
`main`, or sibling projects.
