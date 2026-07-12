#!/usr/bin/env node

import { join } from "node:path";

import {
  fail,
  isSourceCandidate,
  lineNumberFor,
  listProjectFilesRecursive,
  projectRoot,
  readUtf8,
} from "./shared.mjs";

const forbiddenSourcePatterns = [
  { label: "runtime network fetch", regex: /\bfetch\s*\(/g },
  { label: "XMLHttpRequest", regex: /\bXMLHttpRequest\b/g },
  { label: "WebSocket", regex: /\bWebSocket\b/g },
  { label: "EventSource", regex: /\bEventSource\b/g },
  { label: "sendBeacon", regex: /\bnavigator\.sendBeacon\b/g },
  { label: "dangerouslySetInnerHTML", regex: /\bdangerouslySetInnerHTML\b/g },
  { label: "innerHTML assignment", regex: /\binnerHTML\s*=/g },
  { label: "eval", regex: /\beval\s*\(/g },
  { label: "new Function", regex: /\bnew Function\s*\(/g },
  { label: "remote URL literal", regex: /https?:\/\//g },
];

function main() {
  const candidateFiles = listProjectFilesRecursive(projectRoot, { includeHidden: false }).filter(
    (relativePath) =>
      (relativePath.startsWith("src/") || relativePath === "index.html") &&
      isSourceCandidate(relativePath),
  );
  const failures = [];

  for (const relativePath of candidateFiles) {
    const content = readUtf8(join(projectRoot, relativePath));

    for (const { label, regex } of forbiddenSourcePatterns) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(content)) !== null) {
        failures.push(
          `${relativePath}:${lineNumberFor(content, match.index)} contains forbidden ${label}: ${match[0]}`,
        );
      }
    }
  }

  if (failures.length > 0) {
    fail(`Static analysis failed:\n- ${failures.join("\n- ")}`);
  }

  console.log(
    `Static analysis OK: checked ${candidateFiles.length} source files for network, injection, and unsafe-eval regressions.`,
  );
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
