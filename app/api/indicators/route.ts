import { NextResponse } from "next/server";
import { indicatorsCollection } from "@/lib/collections";

export async function GET() {
  try {
    const indicators = await indicatorsCollection();

    const data = await indicators
      .find({})
      .sort({ category: 1, name: 1 })
      .toArray();

    return NextResponse.json({ indicators: data });
  } catch (error) {
    console.error("GET /api/indicators failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}