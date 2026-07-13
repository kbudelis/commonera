#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const checkIndex = process.argv.indexOf("--check");
const check = checkIndex >= 0 ? process.argv[checkIndex + 1] : null;
const allowedChecks = new Set(["guidance", "tracked-temp-app-continuity"]);
const runtimeDirectories = [".claude", ".codex", ".agents"];
const installCommand =
  "npx -y @opengsd/gsd-core@1.6.1 --claude --codex --local";

function fail(message) {
  throw new Error(message);
}

function run(command, args, { cwd = projectRoot, capture = false } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      npm_config_audit: "false",
      npm_config_fund: "false",
      npm_config_update_notifier: "false",
    },
    stdio: capture ? "pipe" : "inherit",
  });

  if (result.error) {
    fail(`${command} could not start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    fail(
      `${command} ${args.join(" ")} exited with ${result.status}${
        details ? `:\n${details}` : ""
      }`,
    );
  }

  return result.stdout ?? "";
}

function assertGuidance() {
  const readme = readFileSync(join(projectRoot, "README.md"), "utf8");
  const requiredPhrases = [
    "prototype evaluation only",
    "not been fully verified",
    "production",
    "commercial use",
    "does not claim",
    installCommand,
    "query init.plan-phase 05 --raw",
  ];

  for (const phrase of requiredPhrases) {
    if (!readme.includes(phrase)) {
      fail(`README.md is missing required clean-checkout guidance: ${phrase}`);
    }
  }

  const trackedRuntime = run(
    "git",
    ["ls-files", "-z", "--", ...runtimeDirectories],
    { capture: true },
  );
  if (trackedRuntime.length > 0) {
    fail("Generated runtime directories must not be tracked by Git");
  }

  console.log(
    "Clean-checkout guidance OK: disclosure, pinned setup, phase query, and untracked runtime boundary are documented.",
  );
}

function trackedFiles() {
  return run("git", ["ls-files", "-z"], { capture: true })
    .split("\0")
    .filter(Boolean);
}

function assertSafeTrackedPath(path) {
  if (
    path.length === 0 ||
    path.startsWith(`..${sep}`) ||
    path === ".." ||
    path.startsWith(sep)
  ) {
    fail(`Refusing unsafe tracked path: ${path}`);
  }
}

function materializeTrackedProject(destination) {
  const files = trackedFiles();
  if (files.length === 0) {
    fail("No tracked project files were found");
  }

  for (const relativePath of files) {
    assertSafeTrackedPath(relativePath);
    const source = join(projectRoot, relativePath);
    const target = join(destination, relativePath);
    const stat = lstatSync(source);

    mkdirSync(dirname(target), { recursive: true });
    if (stat.isSymbolicLink()) {
      symlinkSync(readlinkSync(source), target);
    } else if (stat.isFile()) {
      copyFileSync(source, target);
    } else {
      fail(`Tracked path is not a file or symbolic link: ${relativePath}`);
    }
  }

  return files.length;
}

function projectStatus() {
  return run("git", ["status", "--porcelain=v1", "-z", "--", "."], {
    capture: true,
  });
}

function parseInitResult(stdout) {
  const jsonStart = stdout.indexOf("{");
  if (jsonStart < 0) {
    fail("GSD phase query did not return JSON");
  }

  let result;
  try {
    result = JSON.parse(stdout.slice(jsonStart));
  } catch (error) {
    fail(`GSD phase query returned invalid JSON: ${error.message}`);
  }

  for (const key of ["phase_found", "has_plans"]) {
    if (result[key] !== true) {
      fail(`GSD phase query did not affirm ${key}`);
    }
  }
}

function assertTrackedTempContinuity() {
  const beforeStatus = projectStatus();
  let temporaryProject;
  let failure;
  let copiedFiles = 0;

  try {
    temporaryProject = mkdtempSync(join(tmpdir(), "cosmic-calendar-clean-"));
    copiedFiles = materializeTrackedProject(temporaryProject);

    for (const directory of runtimeDirectories) {
      if (existsSync(join(temporaryProject, directory))) {
        fail(`Tracked-only checkout unexpectedly contains ${directory}`);
      }
    }

    run("npm", ["ci"], { cwd: temporaryProject });
    run("npm", ["run", "test:flow"], { cwd: temporaryProject });
    run("npm", ["run", "build"], { cwd: temporaryProject });
    run(
      "npx",
      [
        "-y",
        "@opengsd/gsd-core@1.6.1",
        "--claude",
        "--codex",
        "--local",
      ],
      { cwd: temporaryProject },
    );

    for (const directory of [".claude", ".codex"]) {
      if (!existsSync(join(temporaryProject, directory))) {
        fail(`Pinned GSD setup did not create ${directory}`);
      }
    }

    const initResult = run(
      "node",
      [
        ".codex/gsd-core/bin/gsd-tools.cjs",
        "query",
        "init.plan-phase",
        "05",
        "--raw",
      ],
      { cwd: temporaryProject, capture: true },
    );
    parseInitResult(initResult);
  } catch (error) {
    failure = error;
  } finally {
    if (
      temporaryProject &&
      temporaryProject.startsWith(`${resolve(tmpdir())}${sep}cosmic-calendar-clean-`)
    ) {
      rmSync(temporaryProject, { force: true, recursive: true });
    }
  }

  const afterStatus = projectStatus();
  if (afterStatus !== beforeStatus) {
    fail("Clean-checkout validation modified the real project worktree");
  }
  if (failure) {
    throw failure;
  }

  console.log(
    `Tracked-only continuity OK: copied ${copiedFiles} files, installed dependencies, passed tests/build, installed GSD 1.6.1, and resolved the Phase 5 handoff.`,
  );
}

if (!allowedChecks.has(check)) {
  console.error(
    "Usage: node scripts/public/validate-clean-checkout.mjs --check guidance|tracked-temp-app-continuity",
  );
  process.exit(2);
}

try {
  assertGuidance();
  if (check === "tracked-temp-app-continuity") {
    assertTrackedTempContinuity();
  }
} catch (error) {
  console.error(`Clean-checkout validation failed: ${error.message}`);
  process.exit(1);
}
