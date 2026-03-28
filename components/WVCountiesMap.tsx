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
import Alert from "@mui/material/Alert";

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
  const [show, setShow] = useState<boolean>(false);
  
  const {measurements, counties} = useMapData();
  useEffect(() => {
    fetch("/geo/WestVirginia_Counties.geojson")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);


  useEffect(() => {

    if (!show){
      if(counties?.length === 3){
        setShow(true);

        setInterval(() => { 
          setShow(false);  
        }, 400);  
      }  
    }
    

  }, [counties]);

 

 
  return (
    <div className="map-container" >
      {/* <div>
        <button onClick={() => setselectedCounty(null)}>Show all</button>
        {selectedCounty && <span style={{ marginLeft: 8 }}>Selected: {selectedCounty}</span>}
      </div> */}

      {
        show ? (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 10,

          }}>
            <Alert severity="warning">Maximum of 3 counties can be selected</Alert>
          </div>

        ) : null
      }
      
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