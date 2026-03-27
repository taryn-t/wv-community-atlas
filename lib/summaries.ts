import { Summary } from "@/types/db";
import { getDb } from "./mongodb";

type MeasurementPoint = {
  year: number;
  value: number;
};

type GroupedMeasurement = {
  _id: {
    countyFips: string;
    indicatorKey: string;
  };
  values: MeasurementPoint[];
  minValue: number;
  maxValue: number;
};

function roundNumber(value: number | null, digits = 4): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  return Number(value.toFixed(digits));
}

function buildSummaryDoc(group: GroupedMeasurement): Summary {
  const { countyFips, indicatorKey } = group._id;

  const sorted = [...group.values].sort((a, b) => a.year - b.year);

  const baseline = sorted[0] ?? null;
  const latest = sorted[sorted.length - 1] ?? null;

  const baselineYear = baseline?.year ?? null;
  const baselineValue = baseline?.value ?? null;

  const latestYear = latest?.year ?? null;
  const latestValue = latest?.value ?? null;

  const absChangeSinceBaseline =
    baselineValue !== null && latestValue !== null
      ? latestValue - baselineValue
      : null;

  const pctChangeSinceBaseline =
    baselineValue !== null &&
    latestValue !== null &&
    baselineValue !== 0
      ? ((latestValue - baselineValue) / baselineValue) * 100
      : null;

  return {
    countyFips,
    indicatorKey,

    baselineYear,
    baselineValue: roundNumber(baselineValue),

    latestYear,
    latestValue: roundNumber(latestValue),

    maxValue: roundNumber(group.maxValue),
    minValue: roundNumber(group.minValue),

    pctChangeSinceBaseline: roundNumber(pctChangeSinceBaseline),
    absChangeSinceBaseline: roundNumber(absChangeSinceBaseline),

    latestRank: null,
    totalCounties: null,
  };
}

export async function buildSummaries() {
  const db = await getDb();

  const grouped = await db.collection("measurements").aggregate<GroupedMeasurement>([
    {
      $match: {
        value: { $ne: null },
      },
    },
    {
      $group: {
        _id: {
          countyFips: "$countyFips",
          indicatorKey: "$indicatorKey",
        },
        values: {
          $push: {
            year: "$year",
            value: "$value",
          },
        },
        minValue: { $min: "$value" },
        maxValue: { $max: "$value" },
      },
    },
  ]).toArray();

  const summaryDocs = grouped.map(buildSummaryDoc);

  const rankGroups = new Map<string, Summary[]>();

  for (const doc of summaryDocs) {
    if (doc.latestValue === null) continue;

    const key = doc.indicatorKey;
    const existing = rankGroups.get(key) ?? [];
    existing.push(doc);
    rankGroups.set(key, existing);
  }

  for (const [indicatorKey, docs] of rankGroups.entries()) {
    docs.sort((a, b) => {
      const aValue = a.latestValue ?? Number.NEGATIVE_INFINITY;
      const bValue = b.latestValue ?? Number.NEGATIVE_INFINITY;
      return bValue - aValue;
    });

    const totalCounties = docs.length;

    docs.forEach((doc, index) => {
      doc.latestRank = index + 1;
      doc.totalCounties = totalCounties;
    });
  }

  const bulkOps = summaryDocs.map((doc) => ({
    updateOne: {
      filter: {
        countyFips: doc.countyFips,
        indicatorKey: doc.indicatorKey,
      },
      update: {
        $set: {
          ...doc,
          updatedAt: new Date(),
        },
      },
      upsert: true,
    },
  }));

  if (bulkOps.length > 0) {
    await db.collection("summaries").bulkWrite(bulkOps, {
      ordered: false,
    });
  }

  return {
    summariesBuilt: summaryDocs.length,
  };
}