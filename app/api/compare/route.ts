import { NextRequest, NextResponse } from "next/server";
import { measurementsCollection, countiesCollection } from "@/lib/collections";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const year = Number(body.year);
    const countyFipsList = Array.isArray(body.countyFipsList)
      ? body.countyFipsList.map(String)
      : [];
    const indicatorKeys = Array.isArray(body.indicatorKeys)
      ? body.indicatorKeys.map(String)
      : [];

    if (!Number.isInteger(year)) {
      return NextResponse.json({ error: "Valid year is required" }, { status: 400 });
    }

    if (countyFipsList.length === 0 || indicatorKeys.length === 0) {
      return NextResponse.json(
        { error: "countyFipsList and indicatorKeys are required" },
        { status: 400 }
      );
    }

    const measurements = await measurementsCollection();
    const counties = await countiesCollection();

    const rows = await measurements
      .find(
        {
          year,
          countyFips: { $in: countyFipsList },
          indicatorKey: { $in: indicatorKeys },
        },
        {
          projection: {
            _id: 0,
            countyFips: 1,
            indicatorKey: 1,
            value: 1,
          },
        }
      )
      .toArray();

    const countyDocs = await counties
      .find(
        { fips: { $in: countyFipsList } },
        {
          projection: {
            _id: 0,
            fips: 1,
            name: 1,
          },
        }
      )
      .toArray();

    return NextResponse.json({
      year,
      counties: countyDocs,
      values: rows,
    });
  } catch (error) {
    console.error("POST /api/compare failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}