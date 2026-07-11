import { NextResponse } from "next/server";

import { deleteProject, getProject, saveProject } from "@/lib/storage";
import type { HaggadahDocument } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-static";

function idFromRequest(request: Request): string | null {
  const id = new URL(request.url).searchParams.get("id")?.trim();
  return id || null;
}

function projectFromBody(body: unknown, id: string): HaggadahDocument | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const candidate = "project" in body ? body.project : body;
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;
  return { ...candidate, id } as HaggadahDocument;
}

export async function GET(request: Request) {
  try {
    const id = idFromRequest(request);
    if (!id) return NextResponse.json({ error: "A project ID is required." }, { status: 400 });
    const project = getProject(id);
    return project
      ? NextResponse.json({ project })
      : NextResponse.json({ error: "Project not found." }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Project could not be loaded." }, { status: 500 });
  }
}

async function update(request: Request) {
  try {
    const id = idFromRequest(request);
    if (!id) return NextResponse.json({ error: "A project ID is required." }, { status: 400 });
    const project = projectFromBody(await request.json(), id);
    if (!project) return NextResponse.json({ error: "A project JSON object is required." }, { status: 400 });
    return NextResponse.json({ project: saveProject(project) });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    return NextResponse.json({ error: "Project could not be saved." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return update(request);
}

export async function PATCH(request: Request) {
  return update(request);
}

export async function DELETE(request: Request) {
  try {
    const id = idFromRequest(request);
    if (!id) return NextResponse.json({ error: "A project ID is required." }, { status: 400 });
    return deleteProject(id)
      ? new NextResponse(null, { status: 204 })
      : NextResponse.json({ error: "Project not found." }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Project could not be deleted." }, { status: 500 });
  }
}
