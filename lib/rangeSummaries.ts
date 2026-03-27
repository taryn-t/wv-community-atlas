import { getDb } from "@/lib/mongodb";

export type RangeSummary = {
  countyFips: string;
  indicatorKey: string;
  startYear: number;
  endYear: number;
  startValue: number | null;
  endValue: number | null;
  absChange: number | null;
  pctChange: number | null;
};

function roundNumber(value: number | null, digits = 4): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  return Number(value.toFixed(digits));
}

export async function buildRangeSummaryForIndicator({
  indicatorKey,
  startYear,
  endYear,
  fips,
}: {
  indicatorKey: string;
  startYear: number;
  endYear: number;
  fips?: string;
}): Promise<RangeSummary[]> {
  const db = await getDb();

const query: any = {
  indicatorKey,
  year: { $in: [startYear, endYear] },
};

if (fips) {
  query.countyFips = fips;
}

const rows = await db.collection("measurements").find(query).toArray();



  const countyMap = new Map<
    string,
    {
      startValue: number | null;
      endValue: number | null;
    }
  >();

  for (const row of rows) {
    const entry = countyMap.get(row.countyFips) ?? {
      startValue: null,
      endValue: null,
    };

    if (row.year === startYear) {
      entry.startValue = typeof row.value === "number" ? row.value : null;
    }

    if (row.year === endYear) {
      entry.endValue = typeof row.value === "number" ? row.value : null;
    }

    countyMap.set(row.countyFips, entry);
  }

  const results: RangeSummary[] = [];

  for (const [countyFips, values] of countyMap.entries()) {
    const { startValue, endValue } = values;

    const absChange =
      startValue !== null && endValue !== null
        ? endValue - startValue
        : null;

    const pctChange =
      startValue !== null &&
      endValue !== null &&
      startValue !== 0
        ? ((endValue - startValue) / startValue) * 100
        : null;

    results.push({
      countyFips,
      indicatorKey,
      startYear,
      endYear,
      startValue: roundNumber(startValue),
      endValue: roundNumber(endValue),
      absChange: roundNumber(absChange),
      pctChange: roundNumber(pctChange),
    });
  }

  return results.sort((a, b) => a.countyFips.localeCompare(b.countyFips));
}