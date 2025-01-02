import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet.heat';
import './App.css';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import axios from 'axios';

// Custom Heatmap Component
const HeatmapLayer: React.FC<{ data: Array<[number, number, number]> }> = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    if (map && data.length > 0) {
      const heatLayer = L.heatLayer(data as LatLngExpression[], {
        radius: 25,
        blur: 15,
        maxZoom: 17,
      });
      heatLayer.addTo(map);

      return () => {
        map.removeLayer(heatLayer);
      };
    }
  }, [data, map]);

  return null;
};

const App = () => {
  const [heatmapData, setHeatmapData] = useState<Array<[number, number, number]>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/engagement-data');
        console.log('Raw Response Data:', response.data); // Log the raw response data

        if (Array.isArray(response.data)) {
          const data = response.data.map((item: any): [number, number, number] => [
            parseFloat(item.latitude),
            parseFloat(item.longitude),
            parseFloat(item.intensity),
          ]);
          console.log('Parsed Heatmap Data:', JSON.stringify(data)); // Log the parsed data as a string
          setHeatmapData(data);
        } else {
          console.error('response.data is not an array:', response.data);
        }
      } catch (error) {
        console.error('Error fetching engagement data:', error);
      }
    };

    fetchData();
  }, []);

  return (
<MapContainer
  center={[44.98, -93.26]}
  zoom={13}
  className="map-container" // Apply the CSS class
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