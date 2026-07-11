import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { listProjects, saveProject } from "@/lib/storage";
import type { HaggadahDocument } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-static";

function projectFromBody(body: unknown): HaggadahDocument | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const candidate = "project" in body ? body.project : body;
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return null;
  }

  const project = { ...candidate } as Partial<HaggadahDocument>;
  project.id =
    typeof project.id === "string" && project.id.trim()
      ? project.id.trim()
      : randomUUID();
  return project as HaggadahDocument;
}

export async function GET() {
  try {
    return NextResponse.json({ projects: listProjects() });
  } catch {
    return NextResponse.json(
      { error: "Projects could not be loaded." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const project = projectFromBody(await request.json());
    if (!project) {
      return NextResponse.json(
        { error: "A project JSON object is required." },
        { status: 400 },
      );
    }

    return NextResponse.json({ project: saveProject(project) }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Project could not be saved." },
      { status: 500 },
    );
  }
}
