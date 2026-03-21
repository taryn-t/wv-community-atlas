"use client";

import { useContext } from "react";
import { MapContext } from "../context/MapContext";

export default function useMapData() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapData must be used within a MapContextProvider");
  }
  return context;
}