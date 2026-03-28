
"use client";

import useMapData from "@/lib/hooks/useMapData";
import { parseNumber } from "./Sidebar";
import { useEffect, useState } from "react";
import { ACS_YEARS_CLIENT } from "./MapNav";
import Slider from "@mui/material/Slider";
import CountyTimeSeries from "../CountyTimeSeries";

const marks = ACS_YEARS_CLIENT.map((year) => ({ value: year, label: year.toString() }));



function valuetext(value: number) {
  return `${value}`;
}


type RangeData = {
  countyFips: string;
  startValue: number | null;
  endValue: number | null;
  absChange: number | null;
  pctChange: number | null;
};

export default function DataPanel({ countyData, yearRange, handleChange, rangeData }: {
    countyData: any;
    yearRange: number[];
    handleChange: (event: Event, newValue: number | number[], activeThumb: number) => void;
    rangeData: RangeData | null;
    })
    {

    const { counties, selectedYear } = useMapData();
   
    
    useEffect(() => {
        console.log("Range data:");
        console.log(rangeData);
    }, [rangeData]);

    return(


        <div className="data-panel" style={{ minWidth: 350, width: `${counties && counties?.length > 1 ? "350px" : "auto"}`}}>

                {countyData ? (

                    <>
                    
                    <div className="selected-data" style={{ flexGrow: 1}}>
                        <h2 className="">
                            {countyData.county.name.split(" ")[0]} County
                        </h2>
                        <h3>
                           {selectedYear} {countyData.indicators.name} 
                        </h3>
                        <p>{parseNumber(countyData.measurement ? countyData.measurement.value : null)}</p>
                       <h3>County Ranking</h3>
                       <p>{countyData.summary.latestRank} / 55</p>
                    </div>
                    <div className="selected-data" >
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
                                        <h3>{yearRange[0]} Value</h3>
                                        <p>{parseNumber(rangeData.startValue)}</p>

                                        <h3>{yearRange[1]} Value</h3>
                                        <p>{parseNumber(rangeData.endValue)}</p>

                                        <h3>Absolute Change ({yearRange[0]} to {yearRange[1]})</h3>
                                        <p>{parseNumber(rangeData.absChange)}</p>

                                        <h3>Percent Change ({yearRange[0]} to {yearRange[1]})</h3>
                                        <p>{parseNumber(rangeData.pctChange)}%</p>
                                    </div>
                                    ) : (
                                    <p>No range data available for the selected county and indicator.</p>
                                    )}

                        </div>
                        
        
                   </div>
                    
                    
                    </>
                    
                    
                ) : (
                    <p>Select a county to see details</p>
                )}
            </div>
    )
}