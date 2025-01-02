import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import './App.css';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import 'leaflet.heat';

type HeatmapData = Array<[number, number, number]>;

interface Category {
  id: string;
  label: string;
  enabled: boolean;
  color?: string;
}

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
  const [radius, setRadius] = useState(80);
  const [blur, setBlur] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [categories, setCategories] = useState<Category[]>([
    { id: 'unregistered', label: 'Unregistered Voters', enabled: true },
    { id: 'immigration', label: 'Immigration Status', enabled: false },
    { id: 'registered', label: 'Registered Voters', enabled: true },
    { id: 'incarcerated', label: 'Previously Incarcerated', enabled: false },
    { id: 'engagement', label: 'Political Engagement', enabled: true }
  ]);

  const toggleCategory = (categoryId: string) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, enabled: !cat.enabled } : cat
    ));
  };

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
      {/* Top Search Bar and Categories */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255, 255, 255, 0.73)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        zIndex: 1000,
        width: '80%',
        maxWidth: '800px'
      }}>
        <div style={{ marginBottom: '15px' }}>
        <input
      type="text"
      placeholder="Ask about demographic patterns or engagement trends..."
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      style={{
        width: '90%',
        padding: '12px',
        borderRadius: '4px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        fontSize: '16px',
        color: '#333',  // Dark text color
        backgroundColor: 'white',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
      }}
    />
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center'
        }}>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                background: category.enabled ? '#4a90e2' : '#e0e0e0',
                color: category.enabled ? 'white' : '#666',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '14px'
              }}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

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
      
      {/* Left Side Controls */}
      <div style={{
        position: 'absolute',
        top: '100px',
        left: '20px',
        background: 'rgba(255, 255, 255, 0.73)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        zIndex: 1000
      }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Heat Density: {radius}px
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            style={{ width: '200px' }}
            title="Adjust the density of the heat map"
          />
          <span style={{ display: 'block', fontSize: '12px', color: '#666' }}>
            Low ⟷ High
          </span>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Heat Spread: {blur}px
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={blur}
            onChange={(e) => setBlur(Number(e.target.value))}
            style={{ width: '200px' }}
            title="Adjust the spread of the heat effect"
          />
          <span style={{ display: 'block', fontSize: '12px', color: '#666' }}>
            Focused ⟷ Diffuse
          </span>
        </div>
      </div>
    </div>
  );
};

export default App;