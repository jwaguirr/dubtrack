"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type Location = {
  city: string;
  lat: number;
  lon: number;
  percentage: number;
};

// CSS-based red dot marker
const redDotIcon = L.divIcon({
  className: "custom-marker",
  html: '<div style="width: 10px; height: 10px; background-color: red; border-radius: 50%; box-shadow: 0 0 6px rgba(255, 0, 0, 0.5);"></div>',
  iconSize: [10, 10],
});

const RecenterMap = ({ lat, lon }: { lat: number; lon: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 3);
  }, [lat, lon, map]);
  return null;
};

const MapComponent = ({ locations }: { locations: Location[] }) => {
  if (!locations || locations.length === 0) {
    return <p className="text-gray-500">No location data available</p>;
  }

  return (
    <MapContainer
      key={locations[0].lat + locations[0].lon} // Unique key to prevent reuse
      center={[locations[0].lat, locations[0].lon]}
      zoom={3}
      className="h-96 w-full rounded-lg"
      style={{ width: "100%", height: "400px", borderRadius: "10px" }}
    >
      <RecenterMap lat={locations[0].lat} lon={locations[0].lon} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locations.map((location, index) => (
        <Marker key={index} position={[location.lat, location.lon]} icon={redDotIcon}>
          <Popup>
            <strong>{location.city || "Unknown Location"}</strong><br />
            {location.percentage.toFixed(1)}% of scans
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
