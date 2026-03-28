"use client";

import { GeoJSON, Popup  } from "react-leaflet";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { normalize, lerpColor } from "@/lib/mapColors";
import useMapData from "@/lib/hooks/useMapData";

const lowColor = { r: 239, g: 243, b: 255 };
const highColor = { r: 8, g: 81, b: 156 };

type MeasurementRow = {
  countyFips: string;
  value: number | null;
};

type Props = {
  geoJson: GeoJSON.GeoJsonObject;
  measurements: MeasurementRow[];
};

export default function CountyLayer({ geoJson, measurements }: Props) {
  const {
    selectedCounty,
    selectedIndicator,
    handleSelectedCounty,
    counties,
    handleSetCounties,
    addingCounty,
    handleSetAddingCounty
  } = useMapData();
  const [popupPosition, setPopupPosition] = useState<L.LatLng | null>(null);
  const addingCountyRef = useRef(addingCounty);

  useEffect(() => {
  handleSelectedCounty(null);
}, [selectedIndicator, handleSelectedCounty]);


  useLayoutEffect(() => {
    if (addingCountyRef) {

      addingCountyRef.current = addingCounty;
    } 
 
  }, [addingCounty]);

  const measurementMap = useMemo(() => {
    return new Map(measurements.map((m) => [m.countyFips, m.value]));
  }, [measurements]);

  const selectedCountyValue = useMemo(() => {
    if (!selectedCounty) return null;
    return measurementMap.get(selectedCounty.countyFips) ?? null;
  }, [selectedCounty, measurementMap]);

  const { minValue, maxValue } = useMemo(() => {
    const numericValues = measurements
      .map((m) => m.value)
      .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));

    if (numericValues.length === 0) {
      return { minValue: 0, maxValue: 1 };
    }

    return {
      minValue: Math.min(...numericValues),
      maxValue: Math.max(...numericValues),
    };
  }, [measurements]);

  const style = useMemo(() => {
    return (feature: any) => {
      const countyFips = feature?.properties?.GEOID;
      const value = measurementMap.get(countyFips);
      const isSelected = selectedCounty?.countyFips === countyFips;

      if (value == null || Number.isNaN(value)) {
        return {
          fillColor: "#cccccc",
          fillOpacity: 0.7,
          color: isSelected ? "#000000" : "#ffffff",
          weight: isSelected ? 3 : 1,
        };
      }

      const t = normalize(value, minValue, maxValue);
      const fillColor = lerpColor(lowColor, highColor, t);

      return {
        fillColor,
        fillOpacity: 0.85,
        color: isSelected ? "#000000" : "#ffffff",
        weight: isSelected ? 3 : 1,
      };
    };
  }, [measurementMap, minValue, maxValue, selectedCounty]);

    const onEachFeature = (feature: any, layer: any) => {
    const countyFips = feature?.properties?.GEOID;
    const countyName = `${feature?.properties?.NAME} County`;

    layer.on({
      click: () => {
        if (!addingCountyRef.current && !counties?.includes({countyFips, countyName})) {
          let temp_counties = counties ? [...counties] : [];
          const center = layer.getBounds().getCenter();

          handleSelectedCounty({
            countyFips,
            countyName,
          });

          temp_counties.push({ countyFips, countyName });
          handleSetCounties(temp_counties);
          setPopupPosition(center);
          
        }
        else if(addingCountyRef.current && !counties?.some(c => c && c.countyFips === countyFips)) {
          handleAddCounty({
            countyFips,
            countyName,
          });
        }
        
      },
    });
  };


   const handleAddCounty = (c: { countyFips: any; countyName: string; }) => {
        let temp_counties = counties ? [...counties] : [];

        temp_counties.push({ 
          countyFips: c.countyFips, 
          countyName: c.countyName 
        });

        handleSetCounties(temp_counties);
        handleSetAddingCounty(false);
        
    }

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        {selectedCounty ? (
          <div>
            <h2>{selectedCounty.countyName}</h2>
            <p>FIPS: {selectedCounty.countyFips}</p>
            <p>
              Value:{" "}
              {selectedCountyValue !== null
                ? selectedCountyValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })
                : "No data"}
            </p>
          </div>
        ) : (
          <p>Click a county to view details.</p>
        )}
      </div>

      <GeoJSON
        key={`${selectedIndicator}-${addingCounty}`}
        data={geoJson}
        style={style}
        onEachFeature={onEachFeature}
      />
      {selectedCounty && popupPosition && (
        <Popup
            position={popupPosition}
            closeButton={true}
            autoClose={false}
            closeOnClick={false}
        >
            <div>
            <strong>{selectedCounty.countyName}</strong>
            <br />
            {selectedCountyValue !== null
                ? selectedCountyValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                })
                : "No data"}
            </div>
        </Popup>
        )}
    </div>
  );
}