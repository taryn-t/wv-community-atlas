import { NextRequest, NextResponse } from "next/server";
import { authorizeIngestRequest, validateYear } from "@/lib/validation";
import { indicators, supportsYear } from "@/lib/indicators";
import { runIndicatorIngestion } from "@/lib/ingest";

export async function POST(req: NextRequest) {
  try {
    authorizeIngestRequest(req);

    const body = await req.json();
    const year = Number(body.year);

    validateYear(year);

    const eligibleIndicators = indicators.filter((indicator) =>
      supportsYear(indicator, year)
    );

    const results: Array<{
      indicatorKey: string;
      success: boolean;
      countiesProcessed?: number;
      error?: string;
    }> = [];

    for (const indicator of eligibleIndicators) {
      try {
        console.log(`Starting ingestion for ${indicator.key} (${year})`);

        const result = await runIndicatorIngestion({
          year,
          indicatorKey: indicator.key,
        });

        results.push({
          indicatorKey: indicator.key,
          success: true,
          countiesProcessed: result.countiesProcessed,
        });

        console.log(`Finished ingestion for ${indicator.key} (${year})`);
      } catch (error) {
        console.error(`Failed ingestion for ${indicator.key} (${year})`, error);

        results.push({
          indicatorKey: indicator.key,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: failed === 0,
      year,
      totalIndicators: eligibleIndicators.length,
      succeeded,
      failed,
      results,
    });
  } catch (error) {
    console.error("POST /api/admin/ingest-all failed:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error";

    const status = message === "Unauthorized" ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}