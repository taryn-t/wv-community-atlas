import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const fips = searchParams.get("fips");
    const indicatorKey = searchParams.get("indicatorKey");
    const startYear = searchParams.get("startYear");
    const endYear = searchParams.get("endYear");

    if (!fips || !indicatorKey) {
      return NextResponse.json(
        { error: "fips and indicatorKey are required" },
        { status: 400 }
      );
    }

    const query: any = {
      countyFips: fips,
      indicatorKey,
      value: { $ne: null },
    };

    // 👇 Add range filtering if provided
    if (startYear && endYear) {
      const start = Number(startYear);
      const end = Number(endYear);

      if (!Number.isInteger(start) || !Number.isInteger(end)) {
        return NextResponse.json(
          { error: "Invalid year range" },
          { status: 400 }
        );
      }

      query.year = {
        $gte: start,
        $lte: end,
      };
    }

    const db = await getDb();

    const data = await db
      .collection("measurements")
      .find(query, {
        projection: {
          _id: 0,
          year: 1,
          value: 1,
        },
      })
      .sort({ year: 1 })
      .toArray();

    return NextResponse.json({
      countyFips: fips,
      indicatorKey,
      data,
    });
  } catch (error) {
    console.error("GET /api/time-series failed:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}