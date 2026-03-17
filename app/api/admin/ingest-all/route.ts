import { NextRequest, NextResponse } from "next/server";
import { runIndicatorIngestion } from "@/lib/ingest";
import { authorizeIngestRequest } from "@/lib/validation";
import { indicators } from "@/lib/indicators";

export async function POST(req: NextRequest) {
  try {
    authorizeIngestRequest(req);

    const body = await req.json();
    
    for (const indicator of indicators) {
         await runIndicatorIngestion({ year: body.year, indicatorKey: indicator.key });
    }   
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}