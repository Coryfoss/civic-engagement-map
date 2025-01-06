import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, ScaleControl, useMap } from 'react-leaflet';
import { Feature, Polygon, MultiPolygon, FeatureCollection, Geometry } from 'geojson';
import L, { StyleFunction } from 'leaflet';
import 'leaflet/dist/leaflet.css';



// Update the interface definitions
interface DistrictFeature extends Feature<Polygon | MultiPolygon, DistrictProperties> {}

interface DistrictProperties {
  DISTRICT: string;
  POPULATION: string;
  TURNOUT: string;
  DEMOGRAPHICS: {
    WHITE: number;
    BLACK: number;
    HISPANIC: number;
    ASIAN: number;
    OTHER: number;
  };
  [key: string]: string | number | Record<string, number>;
}

const ZoomHandler = ({ onZoomChange }: { onZoomChange: (zoom: number) => void }) => {
  const map = useMap();
  
  useEffect(() => {
    map.on('zoomend', () => {
      onZoomChange(map.getZoom());
    });
  }, [map, onZoomChange]);
  
  return null;
};

const getDistrictColor = (district: string): string => {
  const colors: { [key: string]: string } = {
    '1': '#2ecc71',
    '2': '#3498db',
    '3': '#9b59b6',
    '4': '#e74c3c',
    '5': '#f1c40f',
    '6': '#1abc9c',
    '7': '#e67e22',
    '8': '#34495e'
  };
  return colors[district] || '#95a5a6';
};

const toggleFullscreen = () => {
  const mapElement = document.documentElement;
  if (!document.fullscreenElement && mapElement.requestFullscreen) {
    mapElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
};


const sampleDistrictData: FeatureCollection<Polygon | MultiPolygon, DistrictProperties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        DISTRICT: "1",
        POPULATION: "718,021",
        TURNOUT: "82",
        DEMOGRAPHICS: { WHITE: 80, BLACK: 5, HISPANIC: 7, ASIAN: 3, OTHER: 5 }
      },
      geometry: { type: "Polygon", coordinates: [] }, // Placeholder
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "2",
        POPULATION: "721,450",
        TURNOUT: "78",
        DEMOGRAPHICS: { WHITE: 75, BLACK: 8, HISPANIC: 8, ASIAN: 5, OTHER: 4 }
      },
      geometry: { type: "Polygon", coordinates: [] }, // Placeholder
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "3",
        POPULATION: "735,284",
        TURNOUT: "85",
        DEMOGRAPHICS: { WHITE: 70, BLACK: 12, HISPANIC: 8, ASIAN: 7, OTHER: 3 }
      },
      geometry: { type: "Polygon", coordinates: [] }, // Placeholder
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "4",
        POPULATION: "725,000",
        TURNOUT: "80",
        DEMOGRAPHICS: { WHITE: 65, BLACK: 15, HISPANIC: 10, ASIAN: 8, OTHER: 2 }
      },
      geometry: { type: "Polygon", coordinates: [] }, // Placeholder
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "5",
        POPULATION: "742,000",
        TURNOUT: "88",
        DEMOGRAPHICS: { WHITE: 60, BLACK: 18, HISPANIC: 12, ASIAN: 7, OTHER: 3 }
      },
      geometry: { type: "Polygon", coordinates: [] }, // Placeholder
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "6",
        POPULATION: "735,000",
        TURNOUT: "79",
        DEMOGRAPHICS: { WHITE: 82, BLACK: 6, HISPANIC: 5, ASIAN: 4, OTHER: 3 }
      },
      geometry: { type: "Polygon", coordinates: [] }, // Placeholder
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "7",
        POPULATION: "714,000",
        TURNOUT: "77",
        DEMOGRAPHICS: { WHITE: 85, BLACK: 4, HISPANIC: 6, ASIAN: 2, OTHER: 3 }
      },
      geometry: { type: "Polygon", coordinates: [] }, // Placeholder
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "8",
        POPULATION: "729,000",
        TURNOUT: "81",
        DEMOGRAPHICS: { WHITE: 89, BLACK: 2, HISPANIC: 3, ASIAN: 1, OTHER: 5 }
      },
      geometry: { type: "Polygon", coordinates: [] }, // Placeholder
    }
  ]
};



const MinnesotaMap = () => {
  const [minnesotaOutline, setMinnesotaOutline] = useState(null);
  const [districtData, setDistrictData] = useState<FeatureCollection<Polygon | MultiPolygon, DistrictProperties> | null>(null);
  const [selectedLayer, setSelectedLayer] = useState('turnout');
  const [timeframe, setTimeframe] = useState('2024');
  const [navVisible, setNavVisible] = useState(true);
  const [mapZoom, setMapZoom] = useState(7);

  
  useEffect(() => {
    const fetchMinnesotaOutline = async () => {
      try {
        const response = await fetch('/geojson/minnesotaOutline.geojson'); // Path to your GeoJSON file
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMinnesotaOutline(data);
      } catch (error) {
        console.error('Error loading Minnesota outline:', error);
      }
    };
    fetchMinnesotaOutline();
  }, []);

  const outlineStyle = {
    color: 'black',
    weight: 2,
    //fillOpacity: 0.1,
    //fillColor: 'lightblue'
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(`<h3>${feature.properties.name}</h3>`);
    }
  };

  useEffect(() => {
    // Update the loadDistrictGeometries function with proper types
const loadDistrictGeometries = async () => {
  try {
    const updatedFeatures = await Promise.all(
      sampleDistrictData.features.map(async (feature) => {
        const districtNumber = feature.properties.DISTRICT;
        try {
          const response = await fetch(`/geojson/mn-cd${districtNumber}-precincts.json`);
          if (!response.ok) {
            throw new Error(`Failed to load district ${districtNumber}: ${response.status}`);
          }
          const geometryData = await response.json();
          
          interface GeometryFeature {
            geometry: {
              type: string;
              coordinates: number[][][] | number[][][][];
              geometries?: Array<{
                type: string;
                coordinates: number[][][] | number[][][][];
              }>;
            };
          }

          const allPolygons = geometryData.features.reduce((acc: number[][][][], feat: GeometryFeature) => {
            const geometry = feat.geometry;
            if (geometry.type === 'Polygon') {
              acc.push(geometry.coordinates as number[][][]);
            } else if (geometry.type === 'MultiPolygon') {
              acc.push(...(geometry.coordinates as number[][][][]));
            } else if (geometry.type === 'GeometryCollection' && geometry.geometries) {
              geometry.geometries.forEach(g => {
                if (g.type === 'Polygon') {
                  acc.push(g.coordinates as number[][][]);
                } else if (g.type === 'MultiPolygon') {
                  acc.push(...(g.coordinates as number[][][][]));
                }
              });
            }
            return acc;
          }, []);

          return {
            ...feature,
            geometry: {
              type: 'MultiPolygon' as const,
              coordinates: allPolygons
            }
          };
        } catch (error) {
          console.error(`Error processing district ${districtNumber}:`, error);
          return feature;
        }
      })
    );

    setDistrictData({
      type: "FeatureCollection",
      features: updatedFeatures
    });
  } catch (error) {
    console.error("Error loading district geometries:", error);
  }
};

    loadDistrictGeometries();
  }, []);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const navControls = document.querySelector('.nav-controls');
      const toggleButton = document.querySelector('.toggle-nav-button');
      
      if (!navControls?.contains(event.target as Node) && 
          !toggleButton?.contains(event.target as Node)) {
        setNavVisible(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchDistrictData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setDistrictData(sampleDistrictData);
      } catch (error) {
        console.error('Error loading district data:', error);
      }
    };

    fetchDistrictData();
    const mapElement = document.documentElement;
    if (mapElement.requestFullscreen) {
      mapElement.requestFullscreen();
    }
  }, []);

  const districtStyle: StyleFunction = (feature?: Feature<Geometry, any>): L.PathOptions => {
    if (!feature?.properties) return {};
    
    const isDistrictFeature = (feat: any): feat is DistrictFeature => {
      return feat?.properties?.DISTRICT !== undefined;
    };
  
    if (!isDistrictFeature(feature)) return {};

    // Base style
    const style = {
      fillColor: getDistrictColor(feature.properties.DISTRICT),
      fillOpacity: 0.3,
      className: 'district-boundary',
    };
  
    // Add borders at higher zoom levels
    if (mapZoom >= 11) {
      return {
        ...style,
        weight: 0.25,
        opacity: 1,
        color: 'black',
      };
    }
  
    // No borders at lower zoom levels
    return {
      ...style,
      weight: 0,
      opacity: 0,
    };
  };


  const onEachDistrict = (feature: DistrictFeature, layer: L.Layer) => {
    layer.bindPopup(`
      <div class="p-4">
        <h3 class="text-lg font-bold">Congressional District ${feature.properties.DISTRICT}</h3>
        <div class="mt-2">
          <p>Population: ${feature.properties.POPULATION}</p>
          <p>Voter Turnout: ${feature.properties.TURNOUT}%</p>
          <div class="mt-2">
            <h4 class="font-semibold">Demographics</h4>
            <div class="flex flex-col space-y-1">
              <div>White: ${feature.properties.DEMOGRAPHICS.WHITE}%</div>
              <div>Black: ${feature.properties.DEMOGRAPHICS.BLACK}%</div>
              <div>Hispanic: ${feature.properties.DEMOGRAPHICS.HISPANIC}%</div>
              <div>Asian: ${feature.properties.DEMOGRAPHICS.ASIAN}%</div>
              <div>Other: ${feature.properties.DEMOGRAPHICS.OTHER}%</div>
            </div>
          </div>
        </div>
      </div>
    `);
  };
  

  return (
    <div className="map-container" style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
    {/* Navigation controls */}
    {navVisible && (
      <div className="nav-controls absolute top-4 left-4 z-50 bg-white p-4 rounded shadow-lg">
          <select
            value={selectedLayer}
            onChange={(e) => setSelectedLayer(e.target.value)}
            className="w-48 p-2 border rounded"
          >
            <option value="turnout">Voter Turnout</option>
            <option value="population">Population Density</option>
            <option value="engagement">Political Engagement</option>
          </select>
          
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-48 p-2 mt-2 border rounded"
          >
            <option value="2024">2024</option>
            <option value="2022">2022</option>
            <option value="2020">2020</option>
          </select>
          
          <button
            onClick={() => console.log('Downloading report...')}
            className="w-full mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Download Report
          </button>
          <button 
            onClick={toggleFullscreen}
            className="w-full mt-2 p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Toggle Fullscreen
          </button>
        </div>
      )}

<MapContainer 
      center={[46.2, -94.2]}
      zoom={7} 
      zoomControl={false}
      minZoom={6}
      maxZoom={15}
      maxBounds={[
        [43.4, -97.5],
        [49.5, -89.0]
      ]}
      maxBoundsViscosity={1.0}
      style={{ height: '100%', width: '100%' }}
    ><ZoomHandler onZoomChange={setMapZoom} />
      <LayersControl position="topleft">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution=""
          />
        </LayersControl.BaseLayer>
        
        {/* Minnesota outline always visible */}
        {minnesotaOutline && (
          <GeoJSON
            data={minnesotaOutline}
            style={outlineStyle}
            onEachFeature={onEachFeature}
          />
        )}
        
        {/* Districts as toggleable overlays */}
        {districtData && districtData.features.map(feature => (
          <LayersControl.Overlay 
            key={feature.properties.DISTRICT}
            checked
            name={`District ${feature.properties.DISTRICT}`}
          >
            <GeoJSON
              data={{
                type: "FeatureCollection",
                features: [feature]
              } as FeatureCollection<Polygon | MultiPolygon, DistrictProperties>}
              style={districtStyle}
              onEachFeature={onEachDistrict}
            />
          </LayersControl.Overlay>
        ))}
      </LayersControl>
      
      <ScaleControl position="bottomleft" />
    </MapContainer>
  </div>
);
};

export default MinnesotaMap;