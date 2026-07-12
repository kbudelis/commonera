#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";

import {
  capture,
  fail,
  isTextCandidate,
  materializeTrackedProject,
  projectPrefixPath,
  projectRoot,
  readUtf8,
  repoRoot,
  run,
  scanContentForSecrets,
} from "./shared.mjs";

const modeIndex = process.argv.indexOf("--mode");
const mode = modeIndex >= 0 ? process.argv[modeIndex + 1] : null;
const allowedModes = new Set(["tree", "staged", "history", "synthetic-regression", "all"]);
const prefixPath = projectPrefixPath();
const gitleaksVersion = "8.30.1";
const gitleaksAssets = {
  "darwin-arm64": {
    file: `gitleaks_${gitleaksVersion}_darwin_arm64.tar.gz`,
    sha256: "b40ab0ae55c505963e365f271a8d3846efbc170aa17f2607f13df610a9aeb6a5",
  },
  "darwin-x64": {
    file: `gitleaks_${gitleaksVersion}_darwin_x64.tar.gz`,
    sha256: "dfe101a4db2255fc85120ac7f3d25e4342c3c20cf749f2c20a18081af1952709",
  },
  "linux-arm64": {
    file: `gitleaks_${gitleaksVersion}_linux_arm64.tar.gz`,
    sha256: "e4a487ee7ccd7d3a7f7ec08657610aa3606637dab924210b3aee62570fb4b080",
  },
  "linux-x64": {
    file: `gitleaks_${gitleaksVersion}_linux_x64.tar.gz`,
    sha256: "551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb",
  },
};
const gitleaksConfig = join(projectRoot, "gitleaks.toml");

function runGitleaks(binary, args, { expectFinding = false } = {}) {
  const result = spawnSync(binary, args, {
    cwd: projectRoot,
    encoding: "utf8",
    env: { ...process.env, CI: "1" },
  });

  if (result.error) {
    fail(`Pinned Gitleaks could not start: ${result.error.message}`);
  }

  if (expectFinding) {
    if (result.status !== 1) {
      fail(
        `Pinned Gitleaks synthetic regression expected exit 1 but received ${result.status}: ${[
          result.stdout,
          result.stderr,
        ]
          .filter(Boolean)
          .join("\n")}`,
      );
    }
    return;
  }

  if (result.status !== 0) {
    fail(
      `Pinned Gitleaks exited with ${result.status}: ${[result.stdout, result.stderr]
        .filter(Boolean)
        .join("\n")}`,
    );
  }
}

async function acquireGitleaks() {
  const override = process.env.GITLEAKS_BIN;
  if (override) {
    if (!existsSync(override)) {
      fail(`GITLEAKS_BIN does not exist: ${override}`);
    }
    return { binary: override, temporaryDirectory: null };
  }

  const key = `${process.platform}-${process.arch}`;
  const asset = gitleaksAssets[key];
  if (!asset) {
    fail(`Pinned Gitleaks ${gitleaksVersion} is not configured for ${key}`);
  }

  const temporaryDirectory = mkdtempSync(join(tmpdir(), "cosmic-calendar-gitleaks-bin-"));
  const archivePath = join(temporaryDirectory, asset.file);
  const url = `https://github.com/gitleaks/gitleaks/releases/download/v${gitleaksVersion}/${asset.file}`;
  const response = await fetch(url);
  if (!response.ok) {
    fail(`Pinned Gitleaks download failed with HTTP ${response.status}`);
  }

  const archive = Buffer.from(await response.arrayBuffer());
  const digest = createHash("sha256").update(archive).digest("hex");
  if (digest !== asset.sha256) {
    fail(`Pinned Gitleaks checksum mismatch: expected ${asset.sha256}, received ${digest}`);
  }

  writeFileSync(archivePath, archive);
  const extraction = spawnSync("tar", ["-xzf", archivePath, "-C", temporaryDirectory], {
    encoding: "utf8",
  });
  if (extraction.error || extraction.status !== 0) {
    fail(
      `Pinned Gitleaks extraction failed: ${extraction.error?.message ?? extraction.stderr}`,
    );
  }

  const binary = join(temporaryDirectory, "gitleaks");
  chmodSync(binary, 0o700);
  return { binary, temporaryDirectory };
}

function cleanupGitleaks(temporaryDirectory) {
  if (
    temporaryDirectory &&
    resolve(temporaryDirectory).startsWith(
      `${resolve(tmpdir())}${sep}cosmic-calendar-gitleaks-bin-`,
    )
  ) {
    rmSync(temporaryDirectory, { force: true, recursive: true });
  }
}

function ensureConfigLooksNarrow() {
  const config = readUtf8(join(projectRoot, "gitleaks.toml"));

  if (!/^title = "cosmic-calendar-public-guardrails"/m.test(config)) {
    fail("gitleaks.toml is missing the expected Cosmic Calendar title");
  }

  if (!/condition = "AND"/.test(config) || !/regexTarget = "line"/.test(config)) {
    fail("gitleaks.toml must require both the generated-manifest path and exact checksum line");
  }

  if (
    !/gsd-file-manifest/.test(config) ||
    !/gsd-core\/bin\/lib\/secrets/.test(config) ||
    !/\[a-f0-9\]\{64\}/.test(config)
  ) {
    fail("gitleaks.toml must allow only the generated secrets-helper checksum line");
  }
}

function collectFailures(scanEntries) {
  const failures = [];

  for (const entry of scanEntries) {
    const findings = scanContentForSecrets(entry.relativePath, entry.content);
    for (const finding of findings) {
      failures.push(
        `${entry.relativePath}:${finding.line} contains ${finding.label}: ${finding.snippet}`,
      );
    }
  }

  return failures;
}

function scanWorkingTree(gitleaksBinary) {
  const trackedFiles = capture("git", ["ls-files", "-z", "--", "."], { cwd: projectRoot })
    .split("\0")
    .filter(Boolean);

  const scanEntries = trackedFiles
    .filter((relativePath) => isTextCandidate(relativePath))
    .map((relativePath) => ({
      relativePath,
      content: readUtf8(join(projectRoot, relativePath)),
    }));

  const failures = collectFailures(scanEntries);
  if (failures.length > 0) {
    fail(`Tree secret scan failed:\n- ${failures.join("\n- ")}`);
  }

  const temporaryDirectory = mkdtempSync(join(tmpdir(), "cosmic-calendar-gitleaks-tree-"));
  try {
    materializeTrackedProject(temporaryDirectory);
    const scanTargets = [
      temporaryDirectory,
      ...new Set(
        trackedFiles
          .map((relativePath) => relativePath.split("/")[0])
          .filter((topLevel) => topLevel.startsWith("."))
          .map((topLevel) => join(temporaryDirectory, topLevel)),
      ),
    ];
    for (const target of scanTargets) {
      runGitleaks(gitleaksBinary, [
        "dir",
        "--config",
        gitleaksConfig,
        "--no-banner",
        "--no-color",
        "--redact",
        target,
      ]);
    }
  } finally {
    rmSync(temporaryDirectory, { force: true, recursive: true });
  }

  console.log(
    `Secret tree scan OK: custom patterns plus pinned Gitleaks ${gitleaksVersion} checked ${scanEntries.length} tracked text files.`,
  );
}

function scanStaged(gitleaksBinary) {
  const stagedFiles = capture(
    "git",
    ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z", "--", "."],
    { cwd: projectRoot },
  )
    .split("\0")
    .filter(Boolean)
    .filter((relativePath) => isTextCandidate(relativePath));

  const scanEntries = stagedFiles.map((relativePath) => ({
    relativePath,
    content: capture("git", ["show", `:${relativePath}`], { cwd: projectRoot }),
  }));

  const failures = collectFailures(scanEntries);
  if (failures.length > 0) {
    fail(`Staged secret scan failed:\n- ${failures.join("\n- ")}`);
  }

  if (scanEntries.length > 0) {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), "cosmic-calendar-gitleaks-staged-"));
    try {
      for (const entry of scanEntries) {
        const target = join(temporaryDirectory, entry.relativePath);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, entry.content, "utf8");
      }
      for (const entry of scanEntries) {
        runGitleaks(gitleaksBinary, [
          "dir",
          "--config",
          gitleaksConfig,
          "--no-banner",
          "--no-color",
          "--redact",
          join(temporaryDirectory, entry.relativePath),
        ]);
      }
    } finally {
      rmSync(temporaryDirectory, { force: true, recursive: true });
    }
  }

  console.log(
    `Secret staged scan OK: custom patterns plus pinned Gitleaks ${gitleaksVersion} checked ${scanEntries.length} staged text files.`,
  );
}

function scanHistory(gitleaksBinary) {
  const scopedHistoryPath = prefixPath || ".";
  const commits = capture("git", ["rev-list", "--all", "--", scopedHistoryPath], { cwd: repoRoot })
    .trim()
    .split("\n")
    .filter(Boolean);
  const patchText = capture(
    "git",
    ["log", "--format=commit:%H", "-p", "--no-ext-diff", "--no-textconv", "--", scopedHistoryPath],
    { cwd: repoRoot },
  );
  const failures = [];
  let currentCommit = "unknown";
  let currentFile = null;
  let currentLine = 0;
  let scannedLines = 0;

  for (const rawLine of patchText.split("\n")) {
    if (rawLine.startsWith("commit:")) {
      currentCommit = rawLine.slice("commit:".length);
      currentFile = null;
      currentLine = 0;
      continue;
    }

    if (rawLine.startsWith("+++ b/")) {
      currentFile = rawLine.slice("+++ b/".length);
      if (prefixPath && currentFile.startsWith(`${prefixPath}/`)) {
        currentFile = currentFile.slice(prefixPath.length + 1);
      }
      currentLine = 0;
      continue;
    }

    if (!currentFile || !isTextCandidate(currentFile)) continue;
    if (rawLine.startsWith("@@")) {
      continue;
    }
    if (!(rawLine.startsWith("+") || rawLine.startsWith("-"))) {
      continue;
    }
    if (rawLine.startsWith("+++") || rawLine.startsWith("---")) {
      continue;
    }

    const line = rawLine.slice(1);
    currentLine += 1;
    scannedLines += 1;
    const findings = scanContentForSecrets(currentFile, line);
    for (const finding of findings) {
      failures.push(
        `${currentCommit.slice(0, 12)}:${currentFile}:${currentLine} contains ${finding.label}: ${finding.snippet}`,
      );
    }
  }

  if (failures.length > 0) {
    fail(`History secret scan failed:\n- ${failures.join("\n- ")}`);
  }

  runGitleaks(gitleaksBinary, [
    "git",
    "--config",
    gitleaksConfig,
    "--no-banner",
    "--no-color",
    "--redact",
    "--log-opts",
    `--all -- ${scopedHistoryPath}`,
    repoRoot,
  ]);

  console.log(
    `Secret history scan OK: custom patterns plus pinned Gitleaks ${gitleaksVersion} checked ${scannedLines} changed text lines across ${commits.length} commits.`,
  );
}

function scanSyntheticRegression(gitleaksBinary) {
  ensureConfigLooksNarrow();

  const tempDirectory = mkdtempSync(join(tmpdir(), "cosmic-calendar-gitleaks-regression-"));
  const target = join(tempDirectory, ".codex", "gsd-file-manifest.json");
  const syntheticToken = ["AKIA", "ABCDEFGHIJKLMNOP"].join("");

  try {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(
      target,
      JSON.stringify(
        {
          files: {
            "gsd-core/bin/lib/secrets.cjs":
              "02b42408bba154f20bd0d64fa737071f54baa5f0cc89319f114d439e779a0806",
            aws_access_key_id: syntheticToken,
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    const findings = scanContentForSecrets(
      ".codex/gsd-file-manifest.json",
      readFileSync(target, "utf8"),
    );
    if (!findings.some((finding) => finding.snippet === syntheticToken)) {
      fail("Synthetic regression failed: generated-manifest allowlist hid a credential");
    }

    run("git", ["init", "-q"], { cwd: tempDirectory });
    run("git", ["add", ".codex/gsd-file-manifest.json"], { cwd: tempDirectory });
    run(
      "git",
      [
        "-c",
        "user.name=Guardrail Fixture",
        "-c",
        "user.email=fixture@invalid.example",
        "commit",
        "-q",
        "-m",
        "synthetic secret regression",
      ],
      { cwd: tempDirectory },
    );

    runGitleaks(
      gitleaksBinary,
      [
        "git",
        "--config",
        gitleaksConfig,
        "--no-banner",
        "--no-color",
        "--redact",
        tempDirectory,
      ],
      { expectFinding: true },
    );

    console.log(
      `Secret synthetic regression OK: custom patterns and pinned Gitleaks ${gitleaksVersion} both catch a credential beside an allowed generated-manifest checksum.`,
    );
  } finally {
    if (resolve(tempDirectory).startsWith(`${resolve(tmpdir())}${sep}cosmic-calendar-gitleaks-regression-`)) {
      rmSync(tempDirectory, { force: true, recursive: true });
    }
  }
}

if (!allowedModes.has(mode)) {
  console.error(
    "Usage: node scripts/public/verify-secret-scan.mjs --mode tree|staged|history|synthetic-regression|all",
  );
  process.exit(2);
}

async function main() {
  const { binary, temporaryDirectory } = await acquireGitleaks();
  try {
    if (mode === "tree" || mode === "all") scanWorkingTree(binary);
    if (mode === "staged" || mode === "all") scanStaged(binary);
    if (mode === "history" || mode === "all") scanHistory(binary);
    if (mode === "synthetic-regression" || mode === "all") {
      scanSyntheticRegression(binary);
    }
  } finally {
    cleanupGitleaks(temporaryDirectory);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
