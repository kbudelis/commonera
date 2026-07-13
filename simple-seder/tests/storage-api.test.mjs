import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test, { after } from "node:test";
import ts from "typescript";

const compiledRoot = await mkdtemp(path.join(tmpdir(), "pesach-storage-"));
const outputPath = path.join(compiledRoot, "lib/storage.js");

const source = await readFile(new URL("../lib/storage.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: "lib/storage.ts",
}).outputText;

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, compiled);

process.env.DATABASE_URL = ":memory:";
const storage = await import(new URL(`file://${outputPath}`).href);

after(async () => {
  globalThis.__passoverProjectsDatabase?.close();
  delete globalThis.__passoverProjectsDatabase;
  delete globalThis.__passoverProjectsDatabaseUrl;
  delete process.env.DATABASE_URL;
  await rm(compiledRoot, { recursive: true, force: true });
});

test("Vercel defaults to writable temporary storage", async () => {
  globalThis.__passoverProjectsDatabase?.close();
  delete globalThis.__passoverProjectsDatabase;
  delete globalThis.__passoverProjectsDatabaseUrl;
  delete process.env.DATABASE_URL;
  process.env.VERCEL = "1";

  assert.deepEqual(storage.listProjects(), []);
  assert.equal(
    globalThis.__passoverProjectsDatabaseUrl,
    "/tmp/passover-for-beginners.sqlite",
  );

  globalThis.__passoverProjectsDatabase?.close();
  delete globalThis.__passoverProjectsDatabase;
  delete globalThis.__passoverProjectsDatabaseUrl;
  delete process.env.VERCEL;
  await rm("/tmp/passover-for-beginners.sqlite", { force: true });
  await rm("/tmp/passover-for-beginners.sqlite-shm", { force: true });
  await rm("/tmp/passover-for-beginners.sqlite-wal", { force: true });
  process.env.DATABASE_URL = ":memory:";
});

test("project storage saves, lists, updates, reads, and deletes documents", () => {
  const original = {
    id: "haggadah-storage-test",
    title: "A test Haggadah",
    sections: [],
  };

  assert.deepEqual(storage.listProjects(), []);
  assert.deepEqual(storage.saveProject(original), original);
  assert.deepEqual(storage.getProject(original.id), original);
  assert.deepEqual(storage.listProjects(), [original]);

  const updated = { ...original, title: "An updated test Haggadah" };
  storage.saveProject(updated);
  assert.deepEqual(storage.getProject(original.id), updated);
  assert.deepEqual(storage.listProjects(), [updated]);

  assert.equal(storage.deleteProject(original.id), true);
  assert.equal(storage.deleteProject(original.id), false);
  assert.equal(storage.getProject(original.id), null);
  assert.deepEqual(storage.listProjects(), []);
});
