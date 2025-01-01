import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';

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
      center={[44.9778, -93.2650]} // Center on Minneapolis
      zoom={13}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {heatmapData.length > 0 &&
        L.heatLayer(heatmapData, { radius: 25, blur: 15, maxZoom: 17 }).addTo(window.mapInstance!)}
    </MapContainer>
  );
};

export default App;
