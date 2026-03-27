import { NextRequest, NextResponse } from "next/server";
import { authorizeIngestRequest } from "@/lib/validation";
import { buildSummaries } from "@/lib/summaries";

export async function POST(req: NextRequest) {
  try {
    authorizeIngestRequest(req);

    const result = await buildSummaries();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("POST /api/admin/build-summaries failed:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error";

    const status = message === "Unauthorized" ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}