"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression, LatLngTuple } from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { useEffect, useState } from "react";

interface MapProps {
  position?: LatLngExpression | LatLngTuple;
  z?: number;
}

const defaults = {
  zoom: 8,
  position: [39.3409249, -80.0189659] as LatLngExpression,
};

const Map = ({ z = defaults.zoom, position = defaults.position}: MapProps) => {
    const [zoom, setZoom] = useState(defaults.zoom)
    const [posix, setPosix] = useState(defaults.position)
   

  
    useEffect(() => {
        if (z) setZoom(z)
        if (position) setPosix(position)
            
    }, [z, position])

  return (
    <MapContainer
      attributionControl={false}
      center={posix}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={posix} draggable={false}>
        <Popup>Hey, I’m a popup!</Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;