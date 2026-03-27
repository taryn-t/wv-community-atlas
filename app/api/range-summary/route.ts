import { NextRequest, NextResponse } from "next/server";
import { buildRangeSummaryForIndicator } from "@/lib/rangeSummaries";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const indicatorKey = searchParams.get("indicatorKey");
    const startYear = Number(searchParams.get("startYear"));
    const endYear = Number(searchParams.get("endYear"));
    const fips = searchParams.get("fips") ?? undefined; 

    if (!indicatorKey) {
      return NextResponse.json(
        { error: "indicatorKey is required" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(startYear) || !Number.isInteger(endYear)) {
      return NextResponse.json(
        { error: "Invalid years" },
        { status: 400 }
      );
    }

    let data = await buildRangeSummaryForIndicator({
      indicatorKey,
      startYear,
      endYear,
      fips,
    });

    
    if (fips) {
      data = data.filter((d) => d.countyFips === fips);
    }

    return NextResponse.json({
      indicatorKey,
      startYear,
      endYear,
      data,
    });
  } catch (error) {
    console.error("GET /api/range-summary failed:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}