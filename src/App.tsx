import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';


// Custom Heatmap Component
const HeatmapLayer: React.FC<{ data: Array<[number, number, number]> }> = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    if (data.length > 0) {
      const heatLayer = L.heatLayer(data as LatLngExpression[], {
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


const App = () => {
  const [heatmapData, setHeatmapData] = useState<Array<[number, number, number]>>([
    [44.98, -93.26, 0.8],
    [44.97, -93.25, 0.5],
    [44.96, -93.24, 0.9],
  ]);

  return (
    <MapContainer
      center={[44.98, -93.26]}
      zoom={13}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {heatmapData && <HeatmapLayer data={heatmapData} />}
    </MapContainer>
  );
};

export default App;
