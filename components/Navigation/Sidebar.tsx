"use client";

import useMapData from "@/lib/hooks/useMapData";
import Slider from '@mui/material/Slider';
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import CountyTimeSeries from "../CountyTimeSeries";
import { ACS_YEARS_CLIENT } from "./MapNav";
import CountySelection from "./CountySelection";
import DataPanel from "./DataPanel";


export function parseNumber(value: number | null | undefined) {
    if (value === null || value === undefined) return "N/A";
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

const minDistance = 1;

export default function Sidebar() {
    const { counties, selectedCounty, selectedIndicator, selectedYear } = useMapData();
    const [countyData, setCountyData] = useState<any[]>([]);
    
    const [barWidth, setBarWidth] = useState<number>(350);
     const[yearRange, setYearRange] = useState<number[]>([ACS_YEARS_CLIENT[0], ACS_YEARS_CLIENT[ACS_YEARS_CLIENT.length - 1]]);
    const [rangeData, setRangeData] = useState<any>(null);
    
    useLayoutEffect(() => {
    if (!counties || counties.length === 0 || !selectedIndicator) {
        setRangeData([]);
        return;
    }

    async function loadRangeData() {
        try {
            const results = await Promise.all(
                counties!.map(async (county) => {
                    if (!county) return null;

                    const res = await fetch(
                        `/api/range-summary?fips=${county.countyFips}&indicatorKey=${selectedIndicator}&startYear=${yearRange[0]}&endYear=${yearRange[1]}`,
                        { cache: "no-store" }
                    );

                    const data = await res.json();

                    return data.data?.[0] ?? null;
                })
            );

            setRangeData(results.filter((r) => r !== null));
        } catch (err) {
            console.error("Error fetching range data:", err);
        }
    }

    loadRangeData();
}, [counties, selectedIndicator, yearRange]);  
    
    const handleChange = (event: Event, newValue: number[], activeThumb: number) => {
            if (activeThumb === 0) {
            setYearRange([Math.min(newValue[0], yearRange[1] - minDistance), yearRange[1]]);
            } else {
            setYearRange([yearRange[0], Math.max(newValue[1], yearRange[0] + minDistance)]);
            }
        };
    

    useEffect(() => {
    if (!selectedCounty || !selectedIndicator || !selectedYear || !counties) {
        setCountyData([]);
        return;
    }

    async function loadCountyData() {
        try {
        if (counties?.length === 1) {
            const res = await fetch(
            `/api/counties/${selectedCounty?.countyFips}/${selectedIndicator}/${selectedYear}`,
            { cache: "no-store" }
            );
            const data = await res.json();
            setCountyData([data]);
            return;
        }

        const results = await Promise.all(
            (counties ?? []).map(async (county) => {
            const res = await fetch(
                `/api/counties/${county?.countyFips}/${selectedIndicator}/${selectedYear}`,
                { cache: "no-store" }
            );
            return res.json();
            })
        );

        setCountyData(results);
        } catch (err) {
        console.error("Error fetching county data:", err);
        }
    }

    loadCountyData();
    }, [counties, selectedCounty, selectedIndicator, selectedYear]);

    // useEffect(() => {
    //     console.log(countyData);
    // }, [countyData]);
    const sidebarRef = useRef<HTMLDivElement>(null);

      const countiesRef = useRef(counties);

  useLayoutEffect(() => {
    if (countiesRef) {

      countiesRef.current = counties;
    } 
 
  }, [counties]);          
     
     const handleResize = (ev: React.MouseEvent<HTMLDivElement>) => {
        const startSize = barWidth;
        const startX = ev.pageX

        const onMouseMove = (ev: MouseEvent) => {
            const delta = startX - ev.pageX;
            console.log(delta)
            setBarWidth(Math.max(300, startSize + delta));
        }

        const onMouseUp = (ev: MouseEvent) => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        }

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
     }
         useEffect(() => {
            if(selectedYear as number > yearRange[0]){
                setYearRange([yearRange[0], selectedYear as number])
            }
            else if (selectedYear as number < yearRange[1]){
                setYearRange([selectedYear as number, yearRange[1]])
            }
    
        }, [selectedYear])

        useLayoutEffect(()=>{
            setBarWidth(350 * (((countiesRef && countiesRef.current ? countiesRef.current.length : 0) )) + (((countiesRef && countiesRef.current ? 50 : 0) )))
        },[counties, barWidth])
     
    return (
        <div className="side-bar" style={{ width: barWidth, maxWidth: barWidth, transition: "width 0.5s ease" }} ref={sidebarRef}>
            {/* <div className="side-bar-drag" style={{ width: 10, flexShrink: 0 }} onMouseDown={handleResize}/> */}
            
            <div className="data-grid" style={{padding: 16, gridRow: "2 span 1", gridColumn: `span ${countyData.length}`}}>
                <CountySelection colSpan={`span ${countyData.length}`} />
                <div className="data-panels" style={{gap: 16,gridColumn: `span ${countyData.length}`}}>
                   {countyData && countyData.length > 0
                    ? countyData.map((data, index) => {
                        const matchingRangeData =
                            rangeData.find((r) => r?.countyFips === data.county?.fips) ?? null;

                        return (
                            <DataPanel
                            key={`${data.county?.fips ?? index}_data-panel`}
                            countyData={data}
                            yearRange={yearRange}
                            handleChange={handleChange}
                            rangeData={matchingRangeData}
                            />
                        );
                        })
                    : null}
                </div>
                <div className="selected-data" style={{margin: "0 ", gridColumn: `span ${countyData.length}`, minWidth: 350}} >
                        <h2>{`${countyData[0]?.indicators?.name ?? selectedIndicator} Trend \n (${yearRange[0]} to ${yearRange[1]})`}</h2>
                    <CountyTimeSeries yearRange={yearRange} width={` ${300 * countyData.length} + 20}px`}/>
                </div>
            </div>
            
            
        </div>
    );
}