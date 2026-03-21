import { NextRequest, NextResponse } from "next/server";
import { countiesCollection } from "@/lib/collections";
import { getDb } from "@/lib/mongodb";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ fips: string }> }
) {
  try {
    const { fips } = await params;

    const counties = await countiesCollection();
    const county = await counties.findOne({ fips });

    if (!county) {
      return NextResponse.json({ error: "County not found" }, { status: 404 });
    }

    const db = await getDb();
    const summaries = await db
      .collection("summaries")
      .find(
        { countyFips: fips },
        {
          projection: {
            _id: 0,
            indicatorKey: 1,
            latestYear: 1,
            latestValue: 1,
            latestRank: 1,
            pctChangeSinceBaseline: 1,
          },
        }
      )
      .toArray();

    return NextResponse.json({
      county,
      summaries,
    });
  } catch (error) {
    console.error("GET /api/counties/[fips] failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}