#!/usr/bin/env node

import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

import {
  fail,
  isTextCandidate,
  listProjectFilesRecursive,
  projectRoot,
  readUtf8,
  scanContentForSecrets,
} from "./shared.mjs";

const checkIndex = process.argv.indexOf("--dir");
const buildDirectory = resolve(projectRoot, checkIndex >= 0 ? process.argv[checkIndex + 1] : "dist");
const forbiddenArtifactPaths = [
  ".planning/",
  ".claude/",
  ".codex/",
  ".agents/",
  "Cosmic Calendar PRD __ COMMON ERA × VIBE CODING.md",
  "NoteBookLM Report.md",
];
const forbiddenTextPatterns = [
  { label: "source map pragma", regex: /sourceMappingURL=/g },
  { label: "absolute local path", regex: /\/Users\//g },
  { label: "websocket URL", regex: /wss?:\/\//g },
];
const allowedStaticUrls = [
  "http://www.w3.org/1998/Math/MathML",
  "http://www.w3.org/1999/xlink",
  "http://www.w3.org/2000/svg",
  "http://www.w3.org/XML/1998/namespace",
  "https://react.dev/errors/",
  "https://www.gnu.org/licenses/gpl-2.0.txt",
];
const remoteUrlPattern = /https?:\/\/[^\s"'`<>\\)]+/g;

function main() {
  if (!existsSync(buildDirectory)) {
    fail(`Build artifact directory does not exist: ${buildDirectory}`);
  }

  const relativeFiles = listProjectFilesRecursive(buildDirectory, { includeHidden: true });
  const failures = [];

  for (const relativePath of relativeFiles) {
    if (relativePath.endsWith(".map")) {
      failures.push(`Unexpected source map emitted: ${relativePath}`);
    }

    if (forbiddenArtifactPaths.some((prefix) => relativePath.includes(prefix))) {
      failures.push(`Unexpected internal file leaked into build artifact: ${relativePath}`);
    }

    if (!isTextCandidate(relativePath)) continue;
    const content = readUtf8(join(buildDirectory, relativePath));

    for (const { label, regex } of forbiddenTextPatterns) {
      regex.lastIndex = 0;
      if (regex.test(content)) {
        failures.push(`${relativePath} contains forbidden ${label}`);
      }
    }

    remoteUrlPattern.lastIndex = 0;
    for (const match of content.matchAll(remoteUrlPattern)) {
      const url = match[0];
      if (!allowedStaticUrls.some((allowed) => url.startsWith(allowed))) {
        failures.push(`${relativePath} contains unexpected remote URL: ${url}`);
      }
    }

    const secretFindings = scanContentForSecrets(relativePath, content);
    for (const finding of secretFindings) {
      failures.push(`${relativePath}:${finding.line} contains ${finding.label}: ${finding.snippet}`);
    }
  }

  if (failures.length > 0) {
    fail(`Build artifact validation failed:\n- ${failures.join("\n- ")}`);
  }

  console.log(
    `Build artifact validation OK: checked ${relativeFiles.length} emitted files for source maps, secrets, private files, and outbound endpoints.`,
  );
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
