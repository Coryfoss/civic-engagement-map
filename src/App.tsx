import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import './App.css';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import 'leaflet.heat';



// Custom Heatmap Component
type HeatmapData = Array<[number, number, number]>;

const HeatmapLayer: React.FC<{ data: HeatmapData }> = ({ data }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map && data.length > 0) {
      const heatLayer = (L as any).heatLayer(data, {
        radius: 35,            // Increased radius for better visibility
        blur: 1,             // Increased blur
        maxZoom: 17,
        minOpacity: 0.4,      // Added minimum opacity
        gradient: {           // Added custom gradient
          0.4: 'blue',
          0.6: 'lime',
          0.8: 'red'
        }
      });
      heatLayer.addTo(map);

      // Log to confirm layer is being added
      console.log("Heatmap layer added with data:", data);

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
        //console.log('Raw Response Data:', response.data);

        if (Array.isArray(response.data)) {
          const data = response.data.map((item: any): [number, number, number] => [
            parseFloat(item.latitude),
            parseFloat(item.longitude),
            1.0  // Changed from item.intensity to 1.0 for better visibility
          ]);
        //  console.log('Parsed Heatmap Data:', JSON.stringify(data));
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
      className="map-container"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {heatmapData.length > 0 && <HeatmapLayer data={heatmapData} />}
    </MapContainer>
  );
};

export default App;