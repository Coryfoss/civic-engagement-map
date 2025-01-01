import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';

// Custom Heatmap Component
const HeatmapLayer: React.FC<{ data: number[][] }> = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    if (data.length > 0) {
      const heatLayer = L.heatLayer(data, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
      });
      heatLayer.addTo(map);

      // Cleanup on unmount
      return () => {
        map.removeLayer(heatLayer);
      };
    }
  }, [data, map]);

  return null;
};

const App: React.FC = () => {
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);

  useEffect(() => {
    // Fetch data for the heatmap from your backend
    fetch('/api/test')
      .then((res) => res.json())
      .then((data) => {
        const formattedData = data.map((point: { latitude: number; longitude: number; intensity: number }) => [
          point.latitude,
          point.longitude,
          point.intensity,
        ]);
        setHeatmapData(formattedData);
      })
      .catch((err) => console.error('Error fetching heatmap data:', err));
  }, []);

  return (
    <MapContainer
      center={[44.9778, -93.265]} // Center on Minneapolis
      zoom={13}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <HeatmapLayer data={heatmapData} />
    </MapContainer>
  );
};

export default App;
