import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const forbiddenTrackedPrefixes = ['.claude/', '.codex/', '.agents/'];
const forbiddenTrackedFiles = [
  'Cosmic Calendar PRD __ COMMON ERA × VIBE CODING.md',
  'NoteBookLM Report.md',
];
const requiredTrackedFiles = [
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  '.planning/HANDOFF.json',
  '.planning/.continue-here.md',
];
const patternScanIgnore = new Set(['scripts/public/check-public-metadata.mjs']);
const textExtensions = new Set([
  '.md',
  '.txt',
  '.json',
  '.toml',
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.tsx',
  '.css',
  '.html',
  '.yml',
  '.yaml',
]);
const forbiddenPatterns = [
  { label: 'absolute path', regex: /\/Users\//g },
  { label: 'attachment identifier', regex: /attachments\/[0-9a-f-]{8,}/gi },
  { label: 'local attachment filename', regex: /pasted-text\.txt/g },
  { label: 'stale handoff branch name', regex: /codex\/cosmic-calendar/g },
  { label: 'stale remote branch name', regex: /origin\/codex\/cosmic-calendar/g },
];

function gitTrackedFiles() {
  const output = execFileSync('git', ['ls-files', '-z'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  return output.split('\0').filter(Boolean);
}

function isTextCandidate(relativePath) {
  return textExtensions.has(path.extname(relativePath).toLowerCase());
}

function lineNumberFor(content, matchIndex) {
  return content.slice(0, matchIndex).split('\n').length;
}

async function main() {
  const trackedFiles = gitTrackedFiles();
  const trackedSet = new Set(trackedFiles);
  const failures = [];

  for (const relativePath of trackedFiles) {
    if (
      forbiddenTrackedPrefixes.some((prefix) => relativePath.startsWith(prefix)) ||
      forbiddenTrackedFiles.includes(relativePath)
    ) {
      failures.push(`Tracked file should be local-only or ignored: ${relativePath}`);
    }
  }

  for (const requiredPath of requiredTrackedFiles) {
    if (!trackedSet.has(requiredPath)) {
      failures.push(`Required tracked GSD document missing from Git index: ${requiredPath}`);
    }
  }

  for (const relativePath of trackedFiles) {
    if (!isTextCandidate(relativePath)) continue;
    if (patternScanIgnore.has(relativePath)) continue;

    const content = await readFile(path.join(repoRoot, relativePath), 'utf8');
    for (const { label, regex } of forbiddenPatterns) {
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
    console.error('Public metadata check failed.');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(
    `Public metadata OK: checked ${trackedFiles.length} tracked files with no forbidden names, paths, or raw-source regressions.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
