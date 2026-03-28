"use client";

import useMapData from "@/lib/hooks/useMapData";
import { useEffect, useMemo, useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";

type TimeSeriesPoint = {
  year: number;
  value: number | null;
};

export default function CountyTimeSeries({
  yearRange,
}: {
  yearRange: number[];
}) {
  const { selectedCounty, selectedIndicator, indicators } = useMapData();
  const [seriesData, setSeriesData] = useState<TimeSeriesPoint[]>([]);

  useEffect(() => {
    if (!selectedCounty?.countyFips || !selectedIndicator) {
      setSeriesData([]);
      return;
    }

    fetch(
      `/api/time-series?fips=${selectedCounty.countyFips}&indicatorKey=${selectedIndicator}`,
      { cache: "no-store" }
    )
      .then((res) => res.json())
      .then((data) => {
        setSeriesData(data.data ?? []);
      })
      .catch((err) => {
        console.error("Error fetching time series:", err);
      });
  }, [selectedCounty, selectedIndicator]);

  const filteredSeries = useMemo(() => {
    return seriesData.filter(
      (point): point is { year: number; value: number } =>
        point.year >= yearRange[0] &&
        point.year <= yearRange[1] &&
        typeof point.value === "number" 
    );
  }, [seriesData, yearRange]);

  const xData = filteredSeries.map((point) => point.year);
  const yData = filteredSeries.map((point) => point.value);

  const indicatorName =
    indicators?.find((i) => i.key === selectedIndicator)?.name ??
    selectedIndicator ??
    "Indicator";

  if (!selectedCounty || !selectedIndicator) {
    return <p>Select a county and indicator to view trend data.</p>;
  }

  return (
    <div style={{ width: "100%", height: 300 }}>
      <LineChart
        xAxis={[
          {
            data: xData,
            scaleType: "point",
            valueFormatter: (year) => year.toString(),
          },
        ]}
        series={[
          {
            data: yData,
            label: indicatorName,
          },
        ]}
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
              fill:  "#fff",
              fontSize: 12,
            },
             "& .MuiChartsLegend-root": {
                color: "#fff",
              },
              "& .MuiChartsLabelMark-root":{
                  fill: "#00BCD4",
                  color: "#00BCD4",
                  stroke: "#00BCD4",
              },
              "& .MuiChartsLabelMark-line":{
                  fill: "#00BCD4",
                  color: "#00BCD4",
                  stroke: "#00BCD4",
              },
              "& .MuiChartsLegend-mark ":{
                  fill: "#00BCD4",
                  color: "#00BCD4",
                  stroke: "#00BCD4",
              },
              "& .MuiLineElement-root ":{
                  stroke: "#00BCD4",
          
                  color: "#00BCD4",
              },
              "& .MuiChartsLabelMark-fill":{
                  fill: "#00BCD4",
                  color: "#00BCD4",
                  stroke: "#00BCD4",  
              },
              "& .MuiLinePlot-root":{
                  stroke: "#00BCD4",
          
                  color: "#00BCD4",
              },
              "& .MuiMarkPlot-root": {
                  stroke: "#00BCD4",
                  color: "#00BCD4",   
                  fill: "#00BCD4",
              },

              "& .MuiMarkElement-root":{
                  stroke: "#00BCD4",
                  color: "#00BCD4",
                  fill: "#00BCD4",

              },
              "& .MuiMarkElement-animate":{
                  stroke: "#00BCD4",
                  color: "#00BCD4",
                  fill: "#00BCD4",

              }
        }}
        height={300}
      />
    </div>
  );
}