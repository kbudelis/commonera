import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const manifestPath = path.join(
  repoRoot,
  '.planning/GSD-DOC-BASELINE.json',
);

async function main() {
  const raw = await readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(raw);

  if (!Array.isArray(manifest.paths) || manifest.paths.length === 0) {
    throw new Error(`Baseline manifest has no retained document paths: ${manifestPath}`);
  }

  const missing = [];
  const unreadable = [];

  for (const relativePath of manifest.paths) {
    const absolutePath = path.join(repoRoot, relativePath);

    try {
      await access(absolutePath);
      await readFile(absolutePath);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        missing.push(relativePath);
      } else {
        unreadable.push(relativePath);
      }
    }
  }

  if (missing.length > 0 || unreadable.length > 0) {
    console.error('GSD document preservation check failed.');

    if (missing.length > 0) {
      console.error(`Missing paths (${missing.length}):`);
      for (const item of missing) {
        console.error(`- ${item}`);
      }
    }

    if (unreadable.length > 0) {
      console.error(`Unreadable paths (${unreadable.length}):`);
      for (const item of unreadable) {
        console.error(`- ${item}`);
      }
    }

    process.exit(1);
  }

  console.log(
    `GSD document preservation OK: ${manifest.paths.length} retained paths from frozen baseline remain readable.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
