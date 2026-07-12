#!/usr/bin/env node

import { capture, fail, projectPrefixPath, repoRoot } from "./shared.mjs";

const checkIndex = process.argv.indexOf("--check");
const baseIndex = process.argv.indexOf("--base");
const check = checkIndex >= 0 ? process.argv[checkIndex + 1] : null;
const base = baseIndex >= 0 ? process.argv[baseIndex + 1] : null;
const allowedChecks = new Set([
  "working-tree",
  "commit-range",
  "pr-diff",
  "synthetic-regression",
]);
const projectPrefix = projectPrefixPath();
const expectedProjectPrefix = "cosmic-calendar";

function parseNullList(output) {
  return output
    .split("\0")
    .map((item) => item.trim())
    .filter(Boolean);
}

function unique(paths) {
  return [...new Set(paths)].sort();
}

function assertProjectOnly(paths, label) {
  const outside = unique(paths).filter(
    (path) => path !== projectPrefix && !path.startsWith(`${projectPrefix}/`),
  );

  if (outside.length > 0) {
    fail(`${label} contains paths outside ${projectPrefix}/:\n- ${outside.join("\n- ")}`);
  }

  console.log(
    `${label} OK: ${unique(paths).length} changed paths are limited to ${projectPrefix}/.`,
  );
}

function requireBase() {
  if (!base) {
    fail(`--base is required for --check ${check}`);
  }
  capture("git", ["rev-parse", "--verify", `${base}^{commit}`], { cwd: repoRoot });
}

function workingTreePaths() {
  return unique([
    ...parseNullList(
      capture("git", ["diff", "--name-only", "-z", "--no-renames"], {
        cwd: repoRoot,
      }),
    ),
    ...parseNullList(
      capture("git", ["diff", "--cached", "--name-only", "-z", "--no-renames"], {
        cwd: repoRoot,
      }),
    ),
    ...parseNullList(
      capture("git", ["ls-files", "--others", "--exclude-standard", "-z"], {
        cwd: repoRoot,
      }),
    ),
  ]);
}

function commitRangePaths() {
  requireBase();
  const commits = capture("git", ["rev-list", `${base}..HEAD`], { cwd: repoRoot })
    .trim()
    .split("\n")
    .filter(Boolean);
  const paths = [];

  for (const commit of commits) {
    paths.push(
      ...parseNullList(
        capture(
          "git",
          [
            "diff-tree",
            "--root",
            "--no-commit-id",
            "--name-only",
            "-r",
            "-z",
            "--no-renames",
            commit,
          ],
          { cwd: repoRoot },
        ),
      ),
    );
  }

  return unique(paths);
}

function prDiffPaths() {
  requireBase();
  return unique(
    parseNullList(
      capture(
        "git",
        ["diff", "--name-only", "-z", "--no-renames", `${base}...HEAD`],
        { cwd: repoRoot },
      ),
    ),
  );
}

function syntheticRegression() {
  assertProjectOnly(["cosmic-calendar/src/App.tsx"], "Synthetic allowed-path control");

  let blocked = false;
  try {
    assertProjectOnly([".github/workflows/shared.yml"], "Synthetic forbidden-path control");
  } catch {
    blocked = true;
  }

  if (!blocked) {
    fail("Synthetic scope regression failed to block a repository-root path");
  }

  console.log("Synthetic scope regression OK: a repository-root path is blocked.");
}

if (!allowedChecks.has(check)) {
  console.error(
    "Usage: node scripts/public/validate-project-scope.mjs --check working-tree|commit-range|pr-diff|synthetic-regression [--base REF]",
  );
  process.exit(2);
}

try {
  if (projectPrefix !== expectedProjectPrefix) {
    fail(
      `Project scope validator expected ${expectedProjectPrefix}/ but resolved ${projectPrefix || "repository root"}`,
    );
  }

  if (check === "working-tree") {
    assertProjectOnly(workingTreePaths(), "Working-tree scope");
  } else if (check === "commit-range") {
    assertProjectOnly(commitRangePaths(), "Unpublished commit-range scope");
  } else if (check === "pr-diff") {
    assertProjectOnly(prDiffPaths(), "PR diff scope");
  } else {
    syntheticRegression();
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
