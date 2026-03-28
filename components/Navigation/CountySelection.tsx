"use client";

import useMapData from "@/lib/hooks/useMapData";
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';

import { use, useEffect } from "react";
export default function CountySelection() {
    const { counties, selectedCounty, handleSetCounties, addingCounty, handleSetAddingCounty  } = useMapData();
    


    const setAdding = (val: boolean) => {
        if(counties && counties.length <= 3){
            handleSetAddingCounty(val);
        }
        
        
    }
    
//     useEffect(() => {
    
//     if (addingCounty) {
//   } 
//     }, [addingCounty]);

//     useEffect(() => {
//         if(counties){
//             console.log("counties updated:", counties);
//         }
//     }, [counties])



    return (
        <>
            <div className="county-selection" style={{height: 50}}>
                {selectedCounty && counties && counties.length > 0 ? (
                    <>
                        <div className="county-pills">
                            { counties.length  > 0 &&
                            counties?.map((county) => (
                                county ? (
                                    <div key={county.countyFips} className="">
                                        <p className="">
                                            <>
                                            {county.countyName.split(" ")[0]}
                                            </>
                                            
                                        </p>
                                        <ClearIcon className="text-xs" onClick={() => {}} />
                                    </div>
                                ) : null
                            ))
                        }
                        </div>
                        
                    <div className="add-county-container" style={{marginTop: 0}}>
                        <button onClick={() => setAdding(true)}  className="add-county-btn">
                            <AddIcon />
                        </button>
                    </div>    
                    
                    </>
                ) : null}                     
            </div>
        
        </>
    );

}

function handleSetRemoveCounty(val: boolean) {
    throw new Error("Function not implemented.");
}

