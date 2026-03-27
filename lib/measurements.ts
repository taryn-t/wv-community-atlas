import type { IndicatorConfig } from "@/lib/indicators";

export function buildMeasurementDocument(
  row: Record<string, string>,
  indicator: IndicatorConfig,
  year: number
) {
  const countyFips = `${row.state}${row.county}`;
  const value = indicator.transform
    ? indicator.transform(row, year, indicator)
    : null;
    
  return {
    countyFips,
    indicatorKey: indicator.key,
    year,
    value,
    source: "ACS 5-Year",
    updatedAt: new Date(),
  };
}

export function buildMeasurementUpsertOp(
  row: Record<string, string>,
  indicator: IndicatorConfig,
  year: number
) {
  const doc = buildMeasurementDocument(row, indicator, year);

  return {
    updateOne: {
      filter: {
        countyFips: doc.countyFips,
        indicatorKey: doc.indicatorKey,
        year: doc.year,
      },
      update: {
        $set: doc,
      },
      upsert: true,
    },
  };
}