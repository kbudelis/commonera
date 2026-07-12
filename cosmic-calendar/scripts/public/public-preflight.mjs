#!/usr/bin/env node

import { join } from "node:path";

import { assertProjectStatusUnchanged, projectRoot, projectStatus, readUtf8, run } from "./shared.mjs";

const commands = [
  ["node", ["scripts/public/check-public-metadata.mjs"]],
  ["node", ["scripts/public/validate-gsd-doc-preservation.mjs"]],
  ["node", ["scripts/public/validate-clean-checkout.mjs", "--check", "guidance"]],
  ["node", ["scripts/public/validate-clean-checkout.mjs", "--check", "tracked-temp-app-continuity"]],
  ["node", ["scripts/public/validate-project-scope.mjs", "--check", "working-tree"]],
  ["node", ["scripts/public/validate-project-scope.mjs", "--check", "synthetic-regression"]],
  ["node", ["scripts/public/validate-static-analysis.mjs"]],
  ["node", ["scripts/public/verify-secret-scan.mjs", "--mode", "all"]],
  ["node", ["scripts/public/run-read-only-app-checks.mjs"]],
];

function main() {
  const beforeStatus = projectStatus();
  const contract = readUtf8(join(projectRoot, "scripts/public/read-only-gate-contract.md")).trim();

  console.log(contract);
  console.log("");

  try {
    for (const [command, args] of commands) {
      run(command, args, { cwd: projectRoot });
    }
  } finally {
    assertProjectStatusUnchanged(beforeStatus);
  }

  console.log("Public preflight OK: all read-only Cosmic Calendar guardrails passed.");
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
