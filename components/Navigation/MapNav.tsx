"use client";

import useMapData from "@/lib/hooks/useMapData";
import { use, useEffect, useState } from "react";

export default function MapNav(){
    const {indicators, handleSetIndicators, selectedIndicator, handleSetselectedIndicator, measurements, handleSetMeasurement} = useMapData();
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

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
        if(selectedIndicator){
            const measurementPromise = fetch(`/api/map-layer?indicatorKey=${selectedIndicator}&year=2022`).then((res) => res.json());
            measurementPromise.then((data) => {
                console.log(data)
                handleSetMeasurement(data.data)
            }).catch((err) => {
                console.error("Error fetching measurements for indicator:", err);
            });
        }
    }, [selectedIndicator])

    return(
        <>
            <div className="map-nav">
                <button onClick={()=>setOpen(!open)}>
                    Indicators
                </button>
                {open && (
                    <ul className="map-filter">
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