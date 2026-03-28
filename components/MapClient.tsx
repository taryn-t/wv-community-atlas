"use client";

import Alert from "@mui/material/Alert";
import dynamic from "next/dynamic";

const WVCountiesMap = dynamic(() => import("./WVCountiesMap"), {
  ssr: false,
});

export default function MapClient() {
  return <>
      <WVCountiesMap />
      
      
  
  </> ;
}