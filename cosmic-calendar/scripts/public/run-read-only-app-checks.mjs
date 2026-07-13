#!/usr/bin/env node

import { existsSync, symlinkSync } from "node:fs";
import { join } from "node:path";

import {
  assertProjectStatusUnchanged,
  cleanupTempWorkspace,
  createTempWorkspace,
  fail,
  materializeTrackedProject,
  projectRoot,
  projectStatus,
  requireLocalNodeModules,
  run,
} from "./shared.mjs";

function main() {
  requireLocalNodeModules();

  const beforeStatus = projectStatus();
  const tempProject = createTempWorkspace();

  try {
    materializeTrackedProject(tempProject);
    symlinkSync(join(projectRoot, "node_modules"), join(tempProject, "node_modules"));

    if (!existsSync(join(tempProject, "node_modules"))) {
      fail("Temporary workspace is missing node_modules after materialization");
    }

    const npmCache = join(tempProject, ".npm-cache");
    const sharedEnv = {
      npm_config_cache: npmCache,
      npm_config_userconfig: join(tempProject, ".npmrc"),
    };

    run("npm", ["run", "test:flow"], { cwd: tempProject, env: sharedEnv });
    run("npm", ["run", "build"], { cwd: tempProject, env: sharedEnv });
    run("npm", ["audit", "--audit-level=low"], {
      cwd: tempProject,
      env: sharedEnv,
    });
    run("node", ["scripts/public/validate-build-artifacts.mjs", "--dir", "dist"], {
      cwd: tempProject,
      env: sharedEnv,
    });
  } finally {
    cleanupTempWorkspace(tempProject);
    assertProjectStatusUnchanged(beforeStatus);
  }

  console.log("Read-only app checks OK: tests, build, advisories, and artifact validation passed in a disposable workspace.");
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
