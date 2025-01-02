import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

type HeatmapData = Array<[number, number, number]>;

interface MapControls {
  radius: number;
  blur: number;
  minOpacity: number;
  colorScheme: 'default' | 'intensity' | 'binary';
}

const COLOR_SCHEMES = {
  default: {
    0.4: 'blue',
    0.6: 'lime',
    0.8: 'red'
  },
  intensity: {
    0.2: '#313695',
    0.4: '#4575b4',
    0.6: '#74add1',
    0.8: '#f46d43',
    1.0: '#a50026'
  },
  binary: {
    0.5: 'blue',
    0.51: 'red'
  }
};

const HeatmapLayer: React.FC<{ data: HeatmapData; controls: MapControls }> = ({ data, controls }) => {
    const map = useMap();
    
    useEffect(() => {
      if (!map || !data.length) return;
  
      const heatLayer = (L as any).heatLayer(data, {
        radius: controls.radius,
        blur: controls.blur,
        maxZoom: 17,
        minOpacity: controls.minOpacity,
        gradient: COLOR_SCHEMES[controls.colorScheme]
      });
      
      heatLayer.addTo(map);
  
      // Cleanup function must return void
      return () => {
        if (map && heatLayer) {
          map.removeLayer(heatLayer);
        }
      };
    }, [data, map, controls]);
  
    return null;
  };

const EngagementMap: React.FC = () => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData>([]);
  const [prompt, setPrompt] = useState('');
  const [controls, setControls] = useState<MapControls>({
    radius: 35,
    blur: 25,
    minOpacity: 0.4,
    colorScheme: 'default'
  });

  const handlePromptSubmit = async () => {
    try {
      const response = await axios.post('/api/analyze-prompt', { prompt });
      if (response.data.heatmapData) {
        setHeatmapData(response.data.heatmapData);
      }
    } catch (error) {
      console.error('Error processing prompt:', error);
    }
  };

  return (
    <div className="h-screen w-screen flex">
      {/* Main Map */}
      <div className="w-3/4 h-full relative">
        <MapContainer
          center={[44.98, -93.26]}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {heatmapData.length > 0 && <HeatmapLayer data={heatmapData} controls={controls} />}
        </MapContainer>
      </div>

      {/* Control Panel */}
      <div className="w-1/4 h-full bg-white p-4 overflow-y-auto shadow-lg">
        <div className="bg-white rounded-lg p-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Engagement Analysis</h2>
            
            {/* NLP Prompt Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Analysis Prompt</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., Show unregistered voters in North Minneapolis"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <button 
                  onClick={handlePromptSubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Analyze
                </button>
              </div>
            </div>

            {/* Visualization Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Visualization Controls</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Heat Radius: {controls.radius}</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={controls.radius}
                  onChange={(e) => setControls(prev => ({ ...prev, radius: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Blur Amount: {controls.blur}</label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={controls.blur}
                  onChange={(e) => setControls(prev => ({ ...prev, blur: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Minimum Opacity: {(controls.minOpacity * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={controls.minOpacity * 100}
                  onChange={(e) => setControls(prev => ({ 
                    ...prev, 
                    minOpacity: Number(e.target.value) / 100 
                  }))}
                  className="w-full"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Color Scheme</label>
                <div className="flex gap-2">
                  {Object.keys(COLOR_SCHEMES).map((scheme) => (
                    <button
                      key={scheme}
                      className={`px-3 py-1 rounded-md ${
                        controls.colorScheme === scheme 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      onClick={() => setControls(prev => ({ 
                        ...prev, 
                        colorScheme: scheme as any 
                      }))}
                    >
                      {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementMap;