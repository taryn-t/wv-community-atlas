import { NextRequest, NextResponse } from "next/server";
import { runIndicatorIngestion } from "@/lib/ingest";
import { authorizeIngestRequest } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    authorizeIngestRequest(req);

    const body = await req.json();
    const result = await runIndicatorIngestion({
      year: Number(body.year),
      indicatorKey: String(body.indicatorKey),
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("POST /api/admin/ingest failed:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}