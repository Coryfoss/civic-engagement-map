// src/components/Map.tsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

// Define interfaces
interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

interface MapProps {
  center: [number, number];
  zoom: number;
}

// HeatmapLayer component
const HeatmapLayer: React.FC<{ points: HeatmapPoint[] }> = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const heatData = points.map(point => [
      point.lat,
      point.lng,
      point.intensity
    ]);

    const heatLayer = (L as any).heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      max: 1.0,
      gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};

// Main Map component
const Map: React.FC<MapProps> = ({ center, zoom }) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);

  useEffect(() => {
    // Example data - replace with actual API call
    const sampleData: HeatmapPoint[] = [
      { lat: center[0] + 0.1, lng: center[1] + 0.1, intensity: 0.8 },
      { lat: center[0] - 0.1, lng: center[1] - 0.1, intensity: 0.6 },
      { lat: center[0], lng: center[1], intensity: 1.0 },
    ];

    setHeatmapData(sampleData);
  }, [center]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <HeatmapLayer points={heatmapData} />
    </MapContainer>
  );
};

export default Map;