import { NextRequest, NextResponse } from "next/server";
import { measurementsCollection, countiesCollection } from "@/lib/collections";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const indicatorKey = searchParams.get("indicatorKey");
    const year = Number(searchParams.get("year"));

    if (!indicatorKey) {
      return NextResponse.json({ error: "indicatorKey is required" }, { status: 400 });
    }

    if (!Number.isInteger(year)) {
      return NextResponse.json({ error: "Valid year is required" }, { status: 400 });
    }

    const measurements = await measurementsCollection();
    const counties = await countiesCollection();

    const values = await measurements
      .find(
        { indicatorKey, year },
        {
          projection: {
            _id: 0,
            countyFips: 1,
            value: 1,
          },
        }
      )
      .toArray();

    const countyDocs = await counties
      .find(
        {},
        {
          projection: {
            _id: 0,
            fips: 1,
            name: 1,
          },
        }
      )
      .toArray();

    const countyMap = new Map(countyDocs.map((c) => [c.fips, c.name]));

    const data = values.map((row) => ({
      countyFips: row.countyFips,
      countyName: countyMap.get(row.countyFips) ?? null,
      value: row.value,
    }));

    return NextResponse.json({
      indicatorKey,
      year,
      data,
    });
  } catch (error) {
    console.error("GET /api/map-layer failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}