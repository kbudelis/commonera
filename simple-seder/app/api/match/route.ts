import { NextResponse } from "next/server";

import { runtimePassageBriefsForProfile } from "@/content/runtime-pack-adapter";
import type { GenerationProfile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-static";

interface MatchRequest {
  profile?: unknown;
  candidateSectionIds?: unknown;
  quoteIds?: unknown;
  coverIds?: unknown;
  passageIds?: unknown;
  featuredSourceId?: unknown;
  proceduralBackboneSourceId?: unknown;
}

interface RawEnhancement {
  quoteIds?: unknown;
  coverId?: unknown;
  bridges?: unknown;
  passageIds?: unknown;
}

interface Enhancement {
  quoteIds?: string[];
  coverId?: string;
  bridges?: Record<string, string>;
  passageIds?: string[];
}

function parseProfile(value: unknown): GenerationProfile | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const profile = value as Partial<GenerationProfile>;
  return Array.isArray(profile.themes) ? (profile as GenerationProfile) : null;
}

function parseIds(value: unknown, maximum: number): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const id = item.trim().slice(0, 100);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
    if (ids.length === maximum) break;
  }
  return ids;
}

function compactProfile(profile: GenerationProfile) {
  return {
    length: profile.length,
    audience: profile.audience,
    interaction: profile.interaction,
    tone: profile.tone,
    typography: profile.typography,
    language: profile.language,
    themes: profile.themes,
    sederPlateAdditions: profile.sederPlateAdditions,
    customTheme: profile.customTheme?.slice(0, 120) ?? "",
  };
}

function responseText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) return null;
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const text = (part as { text?: unknown }).text;
      if (typeof text === "string") return text;
    }
  }
  return null;
}

function truncateWords(text: string, maximum: number): string {
  return text.trim().split(/\s+/).slice(0, maximum).join(" ");
}

function safeEnhancement(
  payload: unknown,
  sectionIds: string[],
  quoteIds: string[],
  coverIds: string[],
  passageIds: string[],
): Enhancement | null {
  const text = responseText(payload);
  if (!text) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const raw = (parsed as { enhancement?: RawEnhancement }).enhancement;
  if (!raw || typeof raw !== "object") return null;

  const allowedSections = new Set(sectionIds);
  const allowedQuotes = new Set(quoteIds);
  const allowedCovers = new Set(coverIds);
  const allowedPassages = new Set(passageIds);
  const enhancement: Enhancement = {};

  if (Array.isArray(raw.quoteIds)) {
    const selected = parseIds(raw.quoteIds, 4);
    if (selected.some((id) => !allowedQuotes.has(id))) return null;
    if (selected.length) enhancement.quoteIds = selected;
  }
  if (Array.isArray(raw.passageIds)) {
    const selected = parseIds(raw.passageIds, 4);
    if (selected.some((id) => !allowedPassages.has(id))) return null;
    if (selected.length) enhancement.passageIds = selected;
  }
  if (typeof raw.coverId === "string") {
    if (!allowedCovers.has(raw.coverId)) return null;
    enhancement.coverId = raw.coverId;
  }
  if (Array.isArray(raw.bridges)) {
    const bridges: Record<string, string> = {};
    for (const item of raw.bridges) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const bridge = item as { sectionId?: unknown; text?: unknown };
      if (
        typeof bridge.sectionId !== "string" ||
        !allowedSections.has(bridge.sectionId) ||
        typeof bridge.text !== "string"
      ) {
        return null;
      }
      const value = truncateWords(bridge.text, 45);
      if (value) bridges[bridge.sectionId] = value;
    }
    if (Object.keys(bridges).length) enhancement.bridges = bridges;
  }

  return enhancement;
}

async function requestEnhancement(
  apiKey: string,
  profile: GenerationProfile,
  sectionIds: string[],
  quoteIds: string[],
  coverIds: string[],
  passageIds: string[],
  passageCandidates: unknown[],
  featuredSourceId: string,
): Promise<{ enhancement: Enhancement; model: string } | null> {
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-5-mini";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content:
              "Enhance a Haggadah assembled by deterministic code. Select only IDs supplied by the user. Keep the named featured source central: for the concise tier choose 1–2 of its approved passages; for longer tiers choose 2–3, plus at most one passage from one compatible supporting source. Choose distinct approved Seder sections. Never rewrite exactText or move it outside its approved sectionIds. Write optional transitions for only the supplied section IDs, no more than 45 words each. Be welcoming, concrete, concise, and avoid canned contrasts or unsupported factual claims.",
          },
          {
            role: "user",
            content: JSON.stringify({
              profile: compactProfile(profile),
              candidateSectionIds: sectionIds,
              quoteIds,
              coverIds,
              passageCandidates,
              featuredSourceId,
            }),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "haggadah_enhancement",
            strict: true,
            schema: {
              type: "object",
              properties: {
                enhancement: {
                  type: "object",
                  properties: {
                    quoteIds: {
                      type: "array",
                      maxItems: 4,
                      items: { type: "string" },
                    },
                    passageIds: {
                      type: "array",
                      maxItems: 4,
                      items: { type: "string" },
                    },
                    coverId: { type: "string" },
                    bridges: {
                      type: "array",
                      maxItems: Math.min(20, sectionIds.length),
                      items: {
                        type: "object",
                        properties: {
                          sectionId: { type: "string" },
                          text: { type: "string" },
                        },
                        required: ["sectionId", "text"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["quoteIds", "passageIds", "coverId", "bridges"],
                  additionalProperties: false,
                },
              },
              required: ["enhancement"],
              additionalProperties: false,
            },
          },
        },
        max_output_tokens: 1_200,
      }),
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    const enhancement = safeEnhancement(payload, sectionIds, quoteIds, coverIds, passageIds);
    return enhancement ? { enhancement, model } : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  let body: MatchRequest;
  try {
    body = (await request.json()) as MatchRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const profile = parseProfile(body.profile);
  if (!profile) {
    return NextResponse.json({ error: "A generation profile is required." }, { status: 400 });
  }

  const sectionIds = parseIds(body.candidateSectionIds, 40);
  const quoteIds = parseIds(body.quoteIds, 100);
  const coverIds = parseIds(body.coverIds, 100);
  const requestedPassageIds = parseIds(body.passageIds, 16);
  const featuredSourceId = typeof body.featuredSourceId === "string"
    ? body.featuredSourceId.trim().slice(0, 100)
    : "";
  const proceduralBackboneSourceId = body.proceduralBackboneSourceId === "velveteen-rabbi"
    ? "velveteen-rabbi"
    : "shir-geulah";
  const passageCandidates = await runtimePassageBriefsForProfile(
    profile,
    proceduralBackboneSourceId,
    featuredSourceId,
    requestedPassageIds,
  );
  const passageIds = passageCandidates.map((passage) => passage.id);
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json({ source: "deterministic", enhancement: {} });
  }

  const result = await requestEnhancement(
    apiKey,
    profile,
    sectionIds,
    quoteIds,
    coverIds,
    passageIds,
    passageCandidates,
    featuredSourceId,
  );
  if (!result) {
    return NextResponse.json({
      source: "deterministic",
      enhancement: {},
      fallbackReason: "OpenAI matching was unavailable or returned an invalid response.",
    });
  }

  return NextResponse.json({
    source: "openai",
    enhancement: result.enhancement,
    model: result.model,
  });
}
