# Cosmic Calendar public guardrail contract

The `public:preflight` command is intentionally read-only with respect to the
real `cosmic-calendar/` checkout.

- It may report and block, but it must never delete files, rewrite code,
  auto-fix findings, install Git hooks, or run merely because the repository
  was opened.
- App tests, builds, advisory checks, artifact inspection, and the pinned GSD
  continuity install run only inside disposable temporary workspaces.
- The real checkout is audited in place only for read-only checks such as
  tracked-file metadata, retained GSD-document preservation, staged/tree/history
  secret scans, source-pattern validation, and changed-path scope.
- Publication remains blocked unless unpublished commits and the complete PR
  diff contain only `cosmic-calendar/**`; this gate never changes shared
  workflows, repository settings, `main`, or the PR merge state.
- Deferred areas remain out of scope for this gate: asset-by-asset provenance,
  licensing, project-license posture, Hebcal disposition, SBOM generation, and
  birth-profile redesign.
