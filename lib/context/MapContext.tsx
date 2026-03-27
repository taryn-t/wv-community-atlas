"use client";
import { Indicator, Measurement } from "@/types/db";
import { createContext, useCallback, useMemo, useState } from "react";

interface MapContextProps {
    selectedCounty: SelectedCounty |  null;
    handleSelectedCounty: (data: SelectedCounty | null) => void;

    measurements: Measurement[] | null;
    handleSetMeasurement: (measurements: Measurement[] | null) => void;

    indicators: Indicator[] | null;
    handleSetIndicators: (indicators: Indicator[] | null) => void;

    compareCounty: string | null;
    handleSetCompareCounty: (county: string | null) => void;

    selectedIndicator: string ;
    handleSetselectedIndicator: (indicatorKey: string ) => void;

    selectedYear: string | number;
    handleSetSelectedYear: (year: string | number ) => void;

  }


type SelectedCounty = {
    countyFips: string;
    countyName: string;
} | null;

const MapContext = createContext<MapContextProps | null>(null);

const MapContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
    const [selectedCounty, setSelectedCounty] = useState<SelectedCounty | null>({ countyFips: "54039", countyName: "Kanawha County" });
    const [measurements, setMeasurements] = useState<Measurement[] | null>(null);
    const [indicators, setIndicators] = useState<Indicator[] | null>(null);
    const [compareCounty, setCompareCounty] = useState<string | null>(null);
    const [selectedIndicator, setselectedIndicator] = useState<string >("total_pop");
    const [selectedYear, setSelectedYear] = useState<string | number>(2024);

    const handleSelectedCounty = useCallback((county: SelectedCounty | null) => setSelectedCounty(county), []);
  const handleSetMeasurement = useCallback((measurements: Measurement[] | null) => setMeasurements(measurements), []);
  const handleSetIndicators = useCallback((indicators: Indicator[] | null) => setIndicators(indicators), []);
  const handleSetCompareCounty = useCallback((county: string | null) => setCompareCounty(county), []);
  const handleSetselectedIndicator = useCallback((indicatorKey: string ) => setselectedIndicator(indicatorKey), []);
  const handleSetSelectedYear = useCallback((year: string  | number) => setSelectedYear(year), []);

  const contextValue = useMemo<MapContextProps>(
    () => ({
      selectedCounty,
      handleSelectedCounty,
      measurements,
      handleSetMeasurement,
      indicators,
      handleSetIndicators,
      compareCounty,
      handleSetCompareCounty,
      selectedIndicator,
      handleSetselectedIndicator,
      selectedYear,
      handleSetSelectedYear
    }),
    [selectedCounty, handleSelectedCounty, measurements, handleSetMeasurement, indicators, handleSetIndicators, compareCounty, handleSetCompareCounty, selectedIndicator, handleSetselectedIndicator, selectedYear,handleSetSelectedYear]
  );

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
};

export { MapContextProvider, MapContext };