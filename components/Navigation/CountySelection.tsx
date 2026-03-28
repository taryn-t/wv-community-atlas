"use client";

import useMapData from "@/lib/hooks/useMapData";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import Alert from "@mui/material/Alert";
import { style } from "motion/react-client";
import { useEffect, useState } from "react";

interface CountySelectionProps {
  colSpan: string;
}

export default function CountySelection({ colSpan }: CountySelectionProps) {
  const {
    counties,
    selectedCounty,
    handleSetCounties,
    handleSelectedCounty,
    addingCounty,
    handleSetAddingCounty,
  } = useMapData();

  useEffect(() => {
    handleSelectedCounty(
      counties && counties.length > 0 ? counties[counties.length - 1] : null
    );
  }, [counties, handleSelectedCounty]);
  const [show, setShow] = useState<boolean>(false);

    useEffect(() => {

    if (!show){
      if(addingCounty){
        setShow(true);
        
        setInterval(() => { 
          setShow(false);  
        }, 2000);  
      }  
    }
    

  }, [counties]);
  const setAdding = (val: boolean) => {
    if (!counties || counties.length <= 3) {
      handleSetAddingCounty(val);
    }
  };

  const removeCounty = (fips: string) => {
    if (!counties) return;

    const updatedCounties = counties.filter((c) => c?.countyFips !== fips);
    handleSetCounties(updatedCounties);
  };

  return (

    <>
        <div
        className="county-selection"
        style={{ height: 50, gridColumn: colSpan }}
        >
        {counties && counties.length > 0 ?  (
            <>
                
            <div className="county-pills">


                {counties.map((county) =>
                county ? (
                    <div key={county.countyFips}>
                    <p>{county.countyName.split(" ")[0]}</p>
                    <ClearIcon
                        className="text-xs"
                        onClick={() => removeCounty(county.countyFips)}
                        style={{ cursor: "pointer" }}
                    />
                    </div>
                ) : null
                )}
            </div>

            <div className="add-county-container" style={{ marginTop: 0 }}>
                {counties.length < 3 ? (
                    <button
                onClick={() => setAdding(true)}
                className={`add-county-btn` }
                style={{
                        backgroundColor: addingCounty ? "var(--accent-100)" : "var(--bg-200)",
                        transition: "background-color 0.5s ease",
                    }}
                >
                
                <AddIcon /> 
                
                </button>


                ) : (
                    <p style={{color: "var(--text-200)" }} className="text-sm text-center">
                        Maximum of 3 counties can be selected
                    </p>
                )}
                
            </div>
            </>
        ) : null}

        </div>
    {
            addingCounty ? (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                zIndex: 100,
    
              }}>
                <Alert severity="info">Click county to compare</Alert>
              </div>
    
            ) : null
          }
    </>
    
  );
}