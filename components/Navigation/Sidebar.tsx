"use client";

import useMapData from "@/lib/hooks/useMapData";
import { useEffect, useState } from "react";



export function parseNumber(value: number | null | undefined) {
    if (value === null || value === undefined) return "N/A";
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function Sidebar() {
    const { selectedCounty, selectedIndicator, selectedYear } = useMapData();
    const [countyData, setCountyData] = useState<any>(null);

    useEffect(() => {
        if (!selectedCounty || !selectedIndicator || !selectedYear) {
            setCountyData(null);
            return;
        }
        console.log("selected indicator: "+ selectedIndicator)
        fetch(
            `/api/counties/${selectedCounty.countyFips}/${selectedIndicator}/${selectedYear}`,
            { cache: "no-store" }
        )
            .then((res) => res.json())
            .then((data) => {
                setCountyData(data);
                console.log(data);
            })
            .catch((err) => {
                console.error("Error fetching county data:", err);
            });
    }, [selectedCounty, selectedIndicator, selectedYear]);

    useEffect(() => {
        console.log(countyData);
    }, [countyData]);




    return (
        <div className="side-bar">
            <div className="data-panel">
                {countyData ? (

                    <>
                    <div className="selected-data">
                        <h2 className="">
                            {countyData.county.name}
                        </h2>
                        <h3>
                           {selectedYear} {countyData.indicators.name} 
                        </h3>
                        <p>{parseNumber(countyData.measurement ? countyData.measurement.value : null)}</p>
                       <h3>County Ranking</h3>
                       <p>{countyData.summary.latestRank} / 55</p>
                    </div>
                    <div className="selected-data">
                        <h2 className="">
                            {countyData.indicators.name} ({countyData.summary.baselineYear} vs {countyData.summary.latestYear})
                        </h2>
                        <h3>
                            {countyData.summary.baselineYear}
                        </h3>
                        <p>{parseNumber(countyData.summary.baselineValue)}</p>
                        <h3>
                            {countyData.summary.latestYear}
                        </h3>
                        <p>{parseNumber(countyData.summary.latestValue)}</p>
                        <h3>
                            Maximum Value
                        </h3>
                        <p>{parseNumber(countyData.summary.maxValue)}</p>
                        <h3>
                            Minimum Value
                        </h3>
                        <p>{parseNumber(countyData.summary.minValue)}</p>
                        <h3>
                            Absolute Change ({countyData.summary.baselineYear} to {countyData.summary.latestYear})
                        </h3>
                        <p>{parseNumber(countyData.summary.absChangeSinceBaseline)}</p>
                        <h3>
                            Percent Change ({countyData.summary.baselineYear} to {countyData.summary.latestYear})
                        </h3>
                        <p>{parseNumber(countyData.summary.pctChangeSinceBaseline)}%</p>
                    </div>
                    
                    </>
                    
                    
                ) : (
                    <p>Select a county to see details</p>
                )}
            </div>
            
        </div>
    );
}