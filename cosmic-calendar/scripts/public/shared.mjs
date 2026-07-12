#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const repoRoot = resolve(projectRoot, "..");
export const tempPrefix = "cosmic-calendar-public-";
export const textExtensions = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".svg",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);
export const sourceExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs", ".html"]);
export const secretPatterns = [
  {
    label: "GitHub token",
    regex: /\bgh[pousr]_[A-Za-z0-9]{36,255}\b/g,
  },
  {
    label: "npm auth token",
    regex: /\bnpm_[A-Za-z0-9]{36,255}\b/g,
  },
  {
    label: "Slack token",
    regex: /\bxox[baprs]-[A-Za-z0-9-]{10,255}\b/g,
  },
  {
    label: "AWS access key",
    regex: /\bA(?:KIA|SIA)[A-Z0-9]{16}\b/g,
  },
  {
    label: "OpenAI-style API key",
    regex: /\bsk-[A-Za-z0-9]{20,255}\b/g,
  },
  {
    label: "private key",
    regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
  },
  {
    label: "generic credential assignment",
    regex:
      /\b(?:api(?:_|-)?key|auth(?:_|-)?token|secret|password|access(?:_|-)?token)\b[^\n]{0,24}[:=][^\n]{0,8}["']?[A-Za-z0-9+/_=-]{16,255}["']?/gi,
  },
];

function failureDetails(result) {
  return [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
}

export function fail(message) {
  throw new Error(message);
}

export function run(command, args, { cwd = projectRoot, capture = false, env = {} } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      CI: "1",
      npm_config_audit: "false",
      npm_config_fund: "false",
      npm_config_update_notifier: "false",
      ...env,
    },
    maxBuffer: 32 * 1024 * 1024,
    stdio: capture ? "pipe" : "inherit",
  });

  if (result.error) {
    fail(`${command} could not start: ${result.error.message}`);
  }

  if (result.status !== 0) {
    const details = failureDetails(result);
    fail(`${command} ${args.join(" ")} exited with ${result.status}${details ? `:\n${details}` : ""}`);
  }

  return result.stdout ?? "";
}

export function capture(command, args, options = {}) {
  return run(command, args, { ...options, capture: true });
}

export function projectStatus() {
  return capture("git", ["status", "--porcelain=v1", "-z", "--", "."], { cwd: projectRoot });
}

export function assertProjectStatusUnchanged(beforeStatus) {
  const afterStatus = projectStatus();
  if (afterStatus !== beforeStatus) {
    fail("Read-only guardrail mutated the real project worktree");
  }
}

export function projectPrefixPath() {
  const prefix = capture("git", ["rev-parse", "--show-prefix"], { cwd: projectRoot }).trim();
  return prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
}

export function gitTrackedProjectFiles() {
  return capture("git", ["ls-files", "-z", "--", "."], { cwd: projectRoot })
    .split("\0")
    .filter(Boolean);
}

export function ensureSafeRelativePath(relativePath) {
  if (
    relativePath.length === 0 ||
    relativePath === "." ||
    relativePath.startsWith(`..${sep}`) ||
    relativePath === ".." ||
    relativePath.startsWith(sep)
  ) {
    fail(`Refusing unsafe relative path: ${relativePath}`);
  }
}

export function listProjectFilesRecursive(rootDirectory, { includeHidden = false } = {}) {
  const results = [];

  function walk(currentDirectory) {
    for (const entry of readdirSync(currentDirectory, { withFileTypes: true })) {
      if (!includeHidden && entry.name.startsWith(".")) continue;
      const absolutePath = join(currentDirectory, entry.name);
      const relativePath = relative(rootDirectory, absolutePath);

      if (entry.isDirectory()) {
        walk(absolutePath);
      } else if (entry.isFile()) {
        results.push(relativePath);
      }
    }
  }

  walk(rootDirectory);
  return results.sort();
}

export function isTextCandidate(relativePath) {
  return textExtensions.has(extname(relativePath).toLowerCase());
}

export function isSourceCandidate(relativePath) {
  return sourceExtensions.has(extname(relativePath).toLowerCase());
}

export function lineNumberFor(content, matchIndex) {
  return content.slice(0, matchIndex).split("\n").length;
}

export function shouldIgnoreGeneratedManifestChecksum(relativePath, line) {
  return (
    /(?:^|\/)\.(?:claude|codex)\/gsd-file-manifest\.json$/.test(relativePath) &&
    /"gsd-core\/bin\/lib\/secrets\.cjs"\s*:\s*"[a-f0-9]{64}"/.test(line)
  );
}

export function scanContentForSecrets(relativePath, content) {
  const findings = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    if (shouldIgnoreGeneratedManifestChecksum(relativePath, line)) {
      return;
    }

    for (const { label, regex } of secretPatterns) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(line)) !== null) {
        findings.push({
          label,
          line: index + 1,
          snippet: match[0],
        });
      }
    }
  });

  return findings;
}

export function createTempWorkspace() {
  return mkdtempSync(join(tmpdir(), tempPrefix));
}

export function cleanupTempWorkspace(target) {
  const expectedPrefix = `${resolve(tmpdir())}${sep}${tempPrefix}`;
  if (target && resolve(target).startsWith(expectedPrefix)) {
    rmSync(target, { force: true, recursive: true });
  }
}

export function materializeWorkingTree(destination) {
  const excludedTopLevel = new Set([".git", "build", "dist", "node_modules"]);

  for (const entry of readdirSync(projectRoot, { withFileTypes: true })) {
    if (excludedTopLevel.has(entry.name)) continue;
    const source = join(projectRoot, entry.name);
    const target = join(destination, entry.name);

    if (entry.isDirectory()) {
      cpSync(source, target, { recursive: true, preserveTimestamps: true });
      continue;
    }

    mkdirSync(dirname(target), { recursive: true });
    if (entry.isSymbolicLink()) {
      symlinkSync(readlinkSync(source), target);
    } else {
      cpSync(source, target, { preserveTimestamps: true });
    }
  }

  const sourceNodeModules = join(projectRoot, "node_modules");
  if (existsSync(sourceNodeModules)) {
    symlinkSync(sourceNodeModules, join(destination, "node_modules"));
  }
}

export function materializeTrackedProject(destination) {
  const files = gitTrackedProjectFiles();

  if (files.length === 0) {
    fail("No tracked project files were found");
  }

  for (const relativePath of files) {
    ensureSafeRelativePath(relativePath);
    const source = join(projectRoot, relativePath);
    const target = join(destination, relativePath);
    const stat = lstatSync(source);

    mkdirSync(dirname(target), { recursive: true });
    if (stat.isSymbolicLink()) {
      symlinkSync(readlinkSync(source), target);
    } else if (stat.isFile()) {
      cpSync(source, target, { preserveTimestamps: true });
    } else {
      fail(`Tracked path is not a file or symbolic link: ${relativePath}`);
    }
  }

  return files.length;
}

export function requireLocalNodeModules() {
  if (!existsSync(join(projectRoot, "node_modules"))) {
    fail("node_modules is missing locally; run npm install once before public:preflight");
  }
}

export function ensureReadOnlyRuntimeCopies(destination, runtimeDirectories) {
  for (const directory of runtimeDirectories) {
    const source = join(projectRoot, directory);
    if (existsSync(source)) {
      symlinkSync(source, join(destination, directory));
    }
  }
}

export function readUtf8(absolutePath) {
  return readFileSync(absolutePath, "utf8");
}
