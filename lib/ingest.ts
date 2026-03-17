import { getDb } from "@/lib/mongodb";
import { indicators } from "@/lib/indicators";
import { fetchAcsRows } from "@/lib/acs";
import { validateYear } from "@/lib/validation";
import { buildCountyUpsertOp } from "@/lib/counties";
import { buildMeasurementUpsertOp } from "@/lib/measurements";

export async function runIndicatorIngestion({
  year,
  indicatorKey,
}: {
  year: number;
  indicatorKey: string;
}) {
  console.log("runIndicatorIngestion start", { year, indicatorKey });

  validateYear(year);
  console.log("year validated");

  const indicator = indicators.find((i) => i.key === indicatorKey);
  console.log("indicator lookup result", indicator);

  if (!indicator) {
    throw new Error(`Unknown indicatorKey: ${indicatorKey}`);
  }

  const db = await getDb();
  console.log("db connected");

  await db.collection("indicators").updateOne(
    { key: indicator.key },
    {
      $set: {
        key: indicator.key,
        name: indicator.name,
        category: indicator.category,
        dataset: indicator.dataset,
        variables: indicator.variables,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
  console.log("indicator upserted");

  const rows = await fetchAcsRows(year, indicator.variables);
  console.log("ACS rows fetched", rows.length);

  const countyOps = rows.map(buildCountyUpsertOp);
  console.log("county ops built", countyOps.length);

  const measurementOps = rows.map((row) =>
    buildMeasurementUpsertOp(row, indicator, year)
  );
  console.log("measurement ops built", measurementOps.length);

  if (countyOps.length > 0) {
    await db.collection("counties").bulkWrite(countyOps, { ordered: false });
    console.log("county bulkWrite complete");
  }

  if (measurementOps.length > 0) {
    await db.collection("measurements").bulkWrite(measurementOps, { ordered: false });
    console.log("measurement bulkWrite complete");
  }

  return {
    indicatorKey,
    year,
    countiesProcessed: rows.length,
  };
}