"use client";

import useMapData from "@/lib/hooks/useMapData";
import { set } from "mongoose";
import { useEffect, useRef, useState } from "react";


 const ACS_YEARS = [2019,2020,2021,2022, 2023, 2024] as const;

export default function MapNav(){
    const {indicators, handleSetIndicators, selectedIndicator, handleSetselectedIndicator, measurements, handleSetMeasurement, selectedYear, handleSetSelectedYear} = useMapData();
    const [open, setOpen] = useState(false);
    const [openYear, setOpenYear] = useState(false);
    const [mounted, setMounted] = useState(false);

    const yearRef = useRef<any>(null);
    const indicatorRef = useRef<any>(null);

    function handleClickOutside(event: any) {
        if (yearRef.current && !yearRef.current.contains(event.target)) {
            setOpenYear(false);
        }
        if (indicatorRef.current && !indicatorRef.current.contains(event.target)) {
            setOpen(false);
        }
        
    }

    useEffect(() => {
       document.addEventListener("mousedown", handleClickOutside);
        return () => {
       
            document.removeEventListener("mousedown", handleClickOutside);
        };
        
    }, [handleClickOutside]);



    useEffect(() => {
        
        if(!mounted && !indicators){
            const indicatorsPromise = fetch(`/api/indicators`).then((res) => res.json());
            indicatorsPromise.then((data) => {
                handleSetIndicators(data.indicators);
            }).catch((err) => {    
                console.error("Error fetching indicators:", err);
            });

            setMounted(true)
        }
    },[])

    useEffect(() => {
        if(selectedIndicator ){
            const measurementPromise = fetch(`/api/map-layer?indicatorKey=${selectedIndicator}&year=${selectedYear}`).then((res) => res.json());
            measurementPromise.then((data) => {
                console.log(data)
                handleSetMeasurement(data.data)
            }).catch((err) => {
                console.error("Error fetching measurements for indicator:", err);
            });
        }
    }, [selectedIndicator])

    useEffect(() => {
    if(selectedYear ){
            const measurementPromise = fetch(`/api/map-layer?indicatorKey=${selectedIndicator}&year=${selectedYear}`).then((res) => res.json());
            measurementPromise.then((data) => {
                console.log(data)
                handleSetMeasurement(data.data)
            }).catch((err) => {
                console.error("Error fetching measurements for year:", err);
            });
            }
        }, [selectedYear]);

    return(
        <>
            <div className="map-nav">
                 <button onClick={()=>setOpenYear(!openYear)}>
                    Year
                </button>
                {openYear && (
                    <ul className="year-filter" ref={yearRef}>
                    {ACS_YEARS?.map((year, i) => (
                        <li className={`year-btn ${selectedYear === year ? "selected" : ""}`} key={year} onClick={() => handleSetSelectedYear(year)} style={{ cursor: "pointer"}}>
                            {year}
                        </li>
                    ))}
                    </ul>
                )}

                <button onClick={()=>setOpen(!open)}>
                    Indicators
                </button>
                {open && (
                    <ul className="map-filter" ref={indicatorRef}>
                    {indicators?.map((indicator, i) => (
                        <li className={`indicator ${selectedIndicator === indicator.key ? "selected" : ""}`} key={indicator.key} onClick={() => handleSetselectedIndicator(indicator.key)} style={{ cursor: "pointer"}}>
                            {indicator.name}
                        </li>
                    ))}
                    </ul>
                )}
               
            </div>
        </>
    )
}