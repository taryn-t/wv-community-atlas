"use client";

import useMapData from "@/lib/hooks/useMapData";
import Slider from '@mui/material/Slider';
import { useEffect, useState } from "react";
import CountyTimeSeries from "../CountyTimeSeries";
import { ACS_YEARS_CLIENT } from "./MapNav";
import CountySelection from "./CountySelection";

const marks = ACS_YEARS_CLIENT.map((year) => ({ value: year, label: year.toString() }));

export function parseNumber(value: number | null | undefined) {
    if (value === null || value === undefined) return "N/A";
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

const minDistance = 1;

function valuetext(value: number) {
  return `${value}`;
}

export default function Sidebar() {
    const { selectedCounty, selectedIndicator, selectedYear } = useMapData();
    const [countyData, setCountyData] = useState<any>(null);
    const [rangeData, setRangeData] = useState<any>(null);
    const [barWidth, setBarWidth] = useState<number>(500);
    
    const[yearRange, setYearRange] = useState<number[]>([ACS_YEARS_CLIENT[0], ACS_YEARS_CLIENT[ACS_YEARS_CLIENT.length - 1]]);

    const handleChange = (event: Event, newValue: number[], activeThumb: number) => {
        if (activeThumb === 0) {
        setYearRange([Math.min(newValue[0], yearRange[1] - minDistance), yearRange[1]]);
        } else {
        setYearRange([yearRange[0], Math.max(newValue[1], yearRange[0] + minDistance)]);
        }
    };

    useEffect(() => {
        if(selectedYear as number > yearRange[0]){
            setYearRange([yearRange[0], selectedYear as number])
        }
        else if (selectedYear as number < yearRange[1]){
            setYearRange([selectedYear as number, yearRange[1]])
        }

    }, [selectedYear])

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
            })
            .catch((err) => {
                console.error("Error fetching county data:", err);
            });
    }, [selectedCounty, selectedIndicator, selectedYear]);

    useEffect(() => {
        console.log(countyData);
    }, [countyData]);


    useEffect(() => { 
        fetch(
            `/api/range-summary?fips=${selectedCounty?.countyFips}&indicatorKey=${selectedIndicator}&startYear=${yearRange[0]}&endYear=${yearRange[1]}`,
            { cache: "no-store" }
        )
        .then((res) => res.json())
        .then((data) => {
            setRangeData(data.data[0]);
            console.log(data);
        })
        .catch((err) => {
            console.error("Error fetching range data:", err);
        });
            
     }, [selectedCounty, selectedIndicator,yearRange])                                 


     
    return (
        <div className="side-bar" style={{width: barWidth}}>
            <div className="side-bar-drag" style={{right: barWidth }}/>
            <div className="data-panel">
                {countyData ? (

                    <>
                    <CountySelection />
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
                        <h2>Range Summary</h2>
                        <div >
                            <div className="w-full p-4">
                                 <Slider
                                getAriaLabel={() => "Year Range"}
                                value={yearRange}
                                onChange={handleChange}
                                valueLabelDisplay="off"
                                getAriaValueText={valuetext}
                                aria-labelledby="track-false-slider"
                                disableSwap
                                min={ACS_YEARS_CLIENT[0]}
                                max={ACS_YEARS_CLIENT[ACS_YEARS_CLIENT.length - 1]}
                                marks={marks}
                                track={false}
                                 sx={{
                                    color: "#00BCD4", // main track + thumb color

                                    "& .MuiSlider-mark": {
                                    backgroundColor: "#9c9c9c", 
                                    },

                                    "& .MuiSlider-markActive": {
                                    backgroundColor: "#00BCD4", 
                                    },

                                    "& .MuiSlider-markLabel": {
                                    color: "#9c9c9c", 
                                    },

                                    "& .MuiSlider-markLabelActive": {
                                    color: "#00BCD4", 
                                    },
                                }}
                                />
                            </div>
                           

                                {rangeData ? (
                                    <div className="range-summary">
                                        <h3>
                                            {yearRange[0]} Value
                                        </h3>
                                        <p>{parseNumber(rangeData.startValue)}</p>
                                        <h3>
                                            {yearRange[1]} Value
                                        </h3>
                                        <p>{parseNumber(rangeData.endValue)}</p>
                                        <h3>
                                            Absolute Change ({yearRange[0]} to {yearRange[1]})
                                        </h3>
                                        <p>{parseNumber(rangeData.absChange)}</p>
                                        <h3>
                                            Percent Change ({yearRange[0]} to {yearRange[1]})
                                        </h3>
                                        <p>{parseNumber(rangeData.pctChange)}%</p> 
                                    </div>
                                    
                                ) : (
                                    <p>No range summary data available for this indicator.</p>
                                )}

                        </div>
                        
                        {/* <h2 className="">
                            {countyData.indicators.name} 5 Year Summary({countyData.summary.baselineYear} vs {countyData.summary.latestYear})
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
                        <p>{parseNumber(countyData.summary.pctChangeSinceBaseline)}%</p> */}
                    </div>
                    <div className="selected-data" style={{height: 400}}>
                        <h2>{`${countyData.indicators.name} Trend \n (${yearRange[0]} to ${yearRange[1]})`}</h2>
                        <CountyTimeSeries yearRange={yearRange} />
                    </div>
                    
                    </>
                    
                    
                ) : (
                    <p>Select a county to see details</p>
                )}
            </div>
            
        </div>
    );
}