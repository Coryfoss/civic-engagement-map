import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import './App.css';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import 'leaflet.heat';

type HeatmapData = Array<[number, number, number]>;

const HeatmapLayer: React.FC<{ data: HeatmapData, radius: number, blur: number }> = ({ data, radius, blur }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !data.length) return;

    try {
      const heatLayer = (L as any).heatLayer(data, {
        radius: radius,
        blur: blur,
        maxZoom: 17,
        minOpacity: 0.4,
        gradient: {
          0.4: 'blue',
          0.6: 'lime',
          0.8: 'red'
        }
      });

      heatLayer.addTo(map);
      return () => {
        if (map && heatLayer) {
          map.removeLayer(heatLayer);
        }
      };
    } catch (error) {
      console.error('Error creating heatmap layer:', error);
    }
  }, [data, map, radius, blur]);

  return null;
};

const App = () => {
  const [heatmapData, setHeatmapData] = useState<Array<[number, number, number]>>([]);
  const [radius] = useState(80);
  const [blur] = useState(1);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/engagement-data');
        if (Array.isArray(response.data)) {
          const data = response.data.map((item: any): [number, number, number] => [
            parseFloat(item.latitude),
            parseFloat(item.longitude),
            parseFloat(item.intensity)
          ]);
          setHeatmapData(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <MapContainer
        center={[44.98, -93.26]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {heatmapData.length > 0 && 
          <HeatmapLayer 
            data={heatmapData} 
            radius={radius}
            blur={blur}
          />
        }
      </MapContainer>
    </div>
  );
};

export default App;