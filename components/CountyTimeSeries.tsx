"use client";

import useMapData from "@/lib/hooks/useMapData";
import { useEffect, useMemo, useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";

type TimeSeriesPoint = {
  year: number;
  value: number | null;
};

type CountySeries = {
  countyFips: string;
  countyName: string;
  points: TimeSeriesPoint[];
};

type ChartMode = "raw" | "normalized";

function normalizePointsTo100(
  points: { year: number; value: number }[]
): { year: number; value: number }[] {
  if (points.length === 0) return [];

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (max === min) {
    return points.map((point) => ({
      year: point.year,
      value: 50,
    }));
  }

  return points.map((point) => ({
    year: point.year,
    value: ((point.value - min) / (max - min)) * 100,
  }));
}

export default function CountyTimeSeries({
  yearRange,
  width
}: {
  yearRange: number[];
  width: number | string;
}) {
  const { counties, selectedIndicator } = useMapData();
  const [seriesData, setSeriesData] = useState<CountySeries[]>([]);
  const [chartMode, setChartMode] = useState<ChartMode>("normalized");

  useEffect(() => {
    if (!counties || counties.length === 0 || !selectedIndicator) {
      setSeriesData([]);
      return;
    }

    async function loadSeries() {
      try {
        const results = await Promise.all(
          counties!.map(async (county) => {
            if (!county) return null;

            const res = await fetch(
              `/api/time-series?fips=${county.countyFips}&indicatorKey=${selectedIndicator}`,
              { cache: "no-store" }
            );
            const data = await res.json();

            return {
              countyFips: county.countyFips,
              countyName: county.countyName,
              points: data.data ?? [],
            } satisfies CountySeries;
          })
        );

        setSeriesData(results.filter((r): r is CountySeries => r !== null));
      } catch (err) {
        console.error("Error fetching time series:", err);
      }
    }

    loadSeries();
  }, [counties, selectedIndicator]);

  const filteredSeriesData = useMemo(() => {
    return seriesData.map((countySeries) => ({
      ...countySeries,
      points: countySeries.points.filter(
        (point): point is { year: number; value: number } =>
          point.year >= yearRange[0] &&
          point.year <= yearRange[1] &&
          typeof point.value === "number"
      ),
    }));
  }, [seriesData, yearRange]);

  const transformedSeriesData = useMemo(() => {
    return filteredSeriesData.map((countySeries) => {
      const transformedPoints =
        chartMode === "normalized"
          ? normalizePointsTo100(countySeries.points)
          : countySeries.points;

      return {
        ...countySeries,
        points: transformedPoints,
      };
    });
  }, [filteredSeriesData, chartMode]);

  const xData = useMemo(() => {
    const years = new Set<number>();

    transformedSeriesData.forEach((countySeries) => {
      countySeries.points.forEach((point) => {
        years.add(point.year);
      });
    });

    return Array.from(years).sort((a, b) => a - b);
  }, [transformedSeriesData]);

  const chartSeries = useMemo(() => {
    return transformedSeriesData.map((countySeries) => {
      const pointMap = new Map(
        countySeries.points.map((point) => [point.year, point.value])
      );

      return {
        data: xData.map((year) => pointMap.get(year) ?? null),
        label: countySeries.countyName,
      };
    });
  }, [transformedSeriesData, xData]);

  if (!counties || counties.length === 0 || !selectedIndicator) {
    return <p>Select a county and indicator to view trend data.</p>;
  }

  return (
    <div style={{ width: width, height: 340 }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        

        <button
          type="button"
          onClick={() => setChartMode("normalized")}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #666",
            background: chartMode === "normalized" ? "#00BCD4" : "transparent",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Normalized 0–100
        </button>
        <button
          type="button"
          onClick={() => setChartMode("raw")}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #666",
            background: chartMode === "raw" ? "#00BCD4" : "transparent",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Raw
        </button>
      </div>

      <LineChart
        xAxis={[
          {
            data: xData,
            scaleType: "point",
            valueFormatter: (year) => year.toString(),
            label: "Year",
          },
        ]}
        yAxis={[
          {
            label: chartMode === "normalized" ? "Normalized Value" : "Value",
            min: chartMode === "normalized" ? 0 : undefined,
            max: chartMode === "normalized" ? 100 : undefined,
          },
        ]}
        series={chartSeries}
        sx={{
          "& .MuiChartsAxis-root .MuiChartsAxis-line": {
            stroke: "#dda400",
          },
          "& .MuiChartsAxis-root .MuiChartsAxis-tick": {
            stroke: "#dda400",
          },
          "& .MuiChartsAxis-root .MuiChartsAxis-tickLabel": {
            fill: "#fff",
          },
          "& .MuiChartsAxis-root .MuiChartsAxis-label": {
            fill: "#fff",
          },
          "& .MuiChartsLegend-label": {
            fill: "#fff",
            fontSize: 12,
          },
          "& .MuiChartsLegend-root": {
            color: "#fff",
          },
        }}
        height={300}
      />
    </div>
  );
}