"use client";
import type { GeoJsonProperties } from "geojson";
import { useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapNav from "./Navigation/MapNav";
import useMapData from "@/lib/hooks/useMapData";
import CountyLayer from "./CountyLayer";

function FitToFeature({ feature }: { feature: Feature<Geometry> | null }) {
  const map = useMap();

  useEffect(() => {
    if (!feature) return;
    const layer = L.geoJSON(feature);
    map.fitBounds(layer.getBounds(), { padding: [20, 20] });
  }, [feature, map]);

  return null;
}

export default function WVCountiesMap() {
  const [data, setData] = useState<FeatureCollection | null>(null);
  const [countyFP, setCountyFP] = useState<string | null>(null);
  const {measurements} = useMapData();
  useEffect(() => {
    fetch("/geo/WestVirginia_Counties.geojson")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);


  


 
  return (
    <div className="map-container" >
      {/* <div>
        <button onClick={() => setselectedCounty(null)}>Show all</button>
        {selectedCounty && <span style={{ marginLeft: 8 }}>Selected: {selectedCounty}</span>}
      </div> */}
      <MapNav />
      <MapContainer center={[38.6, -80.6]} zoom={7} style={{ height: "100%", width:"100%", zIndex: "1" }}>
        
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
          maxZoom={19}
        />
        { measurements && data &&  (
          <CountyLayer geoJson={data} measurements={measurements} />
        )}

        
      </MapContainer>
    </div>
  );
}