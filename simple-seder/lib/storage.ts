import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

import type { HaggadahDocument } from "@/lib/types";

const LOCAL_DATABASE_URL = "data/demo.sqlite";
const SERVERLESS_DATABASE_URL = "/tmp/passover-for-beginners.sqlite";

type DatabaseHolder = typeof globalThis & {
  __passoverProjectsDatabase?: DatabaseSync;
  __passoverProjectsDatabaseUrl?: string;
};

function databasePath(databaseUrl: string): string {
  if (databaseUrl === ":memory:") return databaseUrl;

  if (databaseUrl.startsWith("file://")) {
    return fileURLToPath(databaseUrl);
  }

  const unwrapped = databaseUrl.startsWith("file:")
    ? databaseUrl.slice("file:".length)
    : databaseUrl;
  return isAbsolute(unwrapped)
    ? unwrapped
    : resolve(/* turbopackIgnore: true */ process.cwd(), unwrapped);
}

function openDatabase(): DatabaseSync {
  const databaseUrl =
    process.env.DATABASE_URL?.trim() ||
    (process.env.VERCEL ? SERVERLESS_DATABASE_URL : LOCAL_DATABASE_URL);
  const holder = globalThis as DatabaseHolder;

  if (
    holder.__passoverProjectsDatabase &&
    holder.__passoverProjectsDatabaseUrl === databaseUrl
  ) {
    return holder.__passoverProjectsDatabase;
  }

  const path = databasePath(databaseUrl);
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });

  const database = new DatabaseSync(path);
  database.exec("PRAGMA journal_mode = WAL");
  database.exec("PRAGMA foreign_keys = ON");
  database.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      document TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  holder.__passoverProjectsDatabase = database;
  holder.__passoverProjectsDatabaseUrl = databaseUrl;
  return database;
}

function decodeDocument(value: unknown): HaggadahDocument {
  if (typeof value !== "string") throw new Error("Project document is missing");
  const document: unknown = JSON.parse(value);
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    throw new Error("Project document is invalid");
  }
  return document as HaggadahDocument;
}

export function listProjects(): HaggadahDocument[] {
  const rows = openDatabase()
    .prepare("SELECT document FROM projects ORDER BY updated_at DESC")
    .all() as Array<{ document: string }>;
  return rows.map((row) => decodeDocument(row.document));
}

export function getProject(id: string): HaggadahDocument | null {
  const row = openDatabase()
    .prepare("SELECT document FROM projects WHERE id = ?")
    .get(id) as { document: string } | undefined;
  return row ? decodeDocument(row.document) : null;
}

export function saveProject(document: HaggadahDocument): HaggadahDocument {
  const now = new Date().toISOString();
  openDatabase()
    .prepare(`
      INSERT INTO projects (id, document, created_at, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        document = excluded.document,
        updated_at = excluded.updated_at
    `)
    .run(document.id, JSON.stringify(document), now, now);
  return document;
}

export function deleteProject(id: string): boolean {
  const result = openDatabase()
    .prepare("DELETE FROM projects WHERE id = ?")
    .run(id);
  return result.changes > 0;
}
