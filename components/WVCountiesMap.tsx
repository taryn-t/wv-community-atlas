"use client";
import type { GeoJsonProperties } from "geojson";
import { useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  const [selectedId, setSelectedId] = useState<string | null>(null);


  useEffect(() => {
    fetch("/geo/WestVirginia_Counties.geojson")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);


  const selectedFeature = useMemo(() => {
    if (!data || !selectedId) return null;
    return data.features.find((f) => {
      const props: any = f.properties ?? {};
      return String(props.GEOID ?? props.COUNTYFP ?? props.NAME ?? props.name) === selectedId;
    }) ?? null;
  }, [data, selectedId]);

  const filteredData = useMemo<FeatureCollection | null>(() => {
    if (!data) return null;
    if (!selectedId) return data;
    return {
      ...data,
      features: data.features.filter((f) => {
        const props: any = f.properties ?? {};
        return String(props.GEOID ?? props.COUNTYFP ?? props.NAME ?? props.name) === selectedId;
      }),
    };
  }, [data, selectedId]);

  const s = (feature?: Feature<Geometry, any>) => {
    if (!feature) return {};
    const props: any = feature.properties ?? {};
    const id = String(props.GEOID ?? props.COUNTYFP ?? props.NAME ?? props.name);

    const isSelected = selectedId ? id === selectedId : false;

    return {
      weight: isSelected ? 3 : 1,
      opacity: 1,
      fillOpacity: isSelected ? 0.35 : 0.15,
    };
  };

  const onEachFeature = (feature: Feature, layer: L.Layer) => {
    const props: any = feature.properties ?? {};
    const name = props.NAME ?? props.name ?? props.NAMELSAD ?? "County";
    const id = String(props.GEOID ?? props.COUNTYFP ?? props.NAME ?? props.name);

    layer.on({
      click: () => setSelectedId(id),
    });

    (layer as L.Path).bindTooltip(String(name), { sticky: true });
  };

  return (
    <div className="map-container" >
      {/* <div>
        <button onClick={() => setSelectedId(null)}>Show all</button>
        {selectedId && <span style={{ marginLeft: 8 }}>Selected: {selectedId}</span>}
      </div> */}

      <MapContainer center={[38.6, -80.6]} zoom={7} style={{ height: "100%", width:"100%" }}>
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
          maxZoom={19}
        />
        {filteredData && (
          <GeoJSON data={filteredData} style={s} onEachFeature={onEachFeature} />
        )}

        <FitToFeature feature={selectedFeature} />
      </MapContainer>
    </div>
  );
}