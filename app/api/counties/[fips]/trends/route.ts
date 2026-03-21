import { NextRequest, NextResponse } from "next/server";
import { measurementsCollection } from "@/lib/collections";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fips: string }> }
) {
  try {
    const { fips } = await params;
    const { searchParams } = new URL(req.url);
    const indicatorKey = searchParams.get("indicatorKey");

    if (!indicatorKey) {
      return NextResponse.json({ error: "indicatorKey is required" }, { status: 400 });
    }

    const measurements = await measurementsCollection();

    const trend = await measurements
      .find(
        { countyFips: fips, indicatorKey },
        {
          projection: {
            _id: 0,
            year: 1,
            value: 1,
          },
        }
      )
      .sort({ year: 1 })
      .toArray();

    return NextResponse.json({
      countyFips: fips,
      indicatorKey,
      trend,
    });
  } catch (error) {
    console.error("GET /api/counties/[fips]/trends failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}