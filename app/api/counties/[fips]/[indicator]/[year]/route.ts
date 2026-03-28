import { NextRequest, NextResponse } from "next/server";
import { countiesCollection } from "@/lib/collections";
import { getDb } from "@/lib/mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fips: string; indicator: string; year: string }> }
) {
  try {

    const { fips, indicator, year } = await params;
    const parsedYear = Number(year);
    console.log(indicator)

    if (!Number.isInteger(parsedYear)) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }

    const counties = await countiesCollection();
    const county = await counties.findOne({ fips });

    if (!county) {
      return NextResponse.json({ error: "County not found" }, { status: 404 });
    }

    const db = await getDb();
    const measurement = await db.collection("measurements").findOne({
        countyFips: fips,
        indicatorKey: indicator,
        year: parsedYear,
    });

    const indicators = await db.collection("indicators").findOne({
        key: indicator,
    });

    const summary = await db.collection("summaries").findOne({
        countyFips: fips,
        indicatorKey: indicator,
    });

    if (!measurement || !indicators || !summary) {
      return NextResponse.json({ error: "Measurement, indicator, or summary not found" }, { status: 404 });
    }

    return NextResponse.json({
      county,
      measurement,
      indicators,
      summary,

    });
  } catch (error) {
    console.error("GET /api/counties/[fips] failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}