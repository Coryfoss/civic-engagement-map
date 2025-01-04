import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, ScaleControl } from 'react-leaflet';
import { Feature, Polygon, FeatureCollection, Geometry } from 'geojson';
import L, { StyleFunction } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DistrictProperties {
  DISTRICT: string;
  POPULATION: string;
  TURNOUT: string;
  [key: string]: string | number | Record<string, number>;
  DEMOGRAPHICS: {
    WHITE: number;
    BLACK: number;
    HISPANIC: number;
    ASIAN: number;
    OTHER: number;
  };
}

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

const sampleDistrictData: FeatureCollection<Polygon, DistrictProperties> = {
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
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-96.45, 43.5], [-96.3, 44.0], [-94.0, 44.2],
          [-92.3, 44.0], [-91.7, 43.6], [-96.45, 43.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "2",
        POPULATION: "721,450",
        TURNOUT: "78",
        DEMOGRAPHICS: { WHITE: 75, BLACK: 8, HISPANIC: 8, ASIAN: 5, OTHER: 4 }
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-94.0, 44.2], [-94.2, 44.8], [-92.6, 44.9],
          [-92.8, 44.3], [-94.0, 44.2]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "3",
        POPULATION: "735,284",
        TURNOUT: "85",
        DEMOGRAPHICS: { WHITE: 70, BLACK: 12, HISPANIC: 8, ASIAN: 7, OTHER: 3 }
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-93.9, 44.7], [-93.9, 45.3], [-93.4, 45.2],
          [-93.3, 44.9], [-93.9, 44.7]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "4",
        POPULATION: "725,000",
        TURNOUT: "80",
        DEMOGRAPHICS: { WHITE: 65, BLACK: 15, HISPANIC: 10, ASIAN: 8, OTHER: 2 }
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-93.4, 44.8], [-93.3, 45.2], [-92.7, 45.1],
          [-92.8, 44.7], [-93.4, 44.8]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "5",
        POPULATION: "742,000",
        TURNOUT: "88",
        DEMOGRAPHICS: { WHITE: 60, BLACK: 18, HISPANIC: 12, ASIAN: 7, OTHER: 3 }
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-93.5, 44.9], [-93.5, 45.1], [-93.3, 45.0],
          [-93.2, 44.9], [-93.5, 44.9]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "6",
        POPULATION: "735,000",
        TURNOUT: "79",
        DEMOGRAPHICS: { WHITE: 82, BLACK: 6, HISPANIC: 5, ASIAN: 4, OTHER: 3 }
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-94.6, 45.1], [-94.6, 45.9], [-93.4, 45.8],
          [-93.3, 45.2], [-94.6, 45.1]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "7",
        POPULATION: "714,000",
        TURNOUT: "77",
        DEMOGRAPHICS: { WHITE: 85, BLACK: 4, HISPANIC: 6, ASIAN: 2, OTHER: 3 }
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-97.2, 44.8], [-97.0, 48.7], [-95.3, 48.6],
          [-95.2, 44.8], [-97.2, 44.8]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "8",
        POPULATION: "729,000",
        TURNOUT: "81",
        DEMOGRAPHICS: { WHITE: 89, BLACK: 2, HISPANIC: 3, ASIAN: 1, OTHER: 5 }
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-95.1, 46.3], [-95.0, 48.9], [-89.8, 48.8],
          [-89.8, 46.4], [-95.1, 46.3]
        ]]
      }
    }
  ]
};

const MinnesotaMap = () => {
  const [districtData, setDistrictData] = useState<FeatureCollection<Polygon, DistrictProperties> | null>(null);
  const [selectedLayer, setSelectedLayer] = useState('turnout');
  const [timeframe, setTimeframe] = useState('2024');
  const [navVisible, setNavVisible] = useState(true);

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

  const districtStyle: StyleFunction = (feature?: Feature<any>) => {
    if (!feature?.properties) return {};
    return {
      fillColor: getDistrictColor(feature.properties.DISTRICT),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  const onEachDistrict = (feature: Feature<Geometry, DistrictProperties>, layer: L.Layer) => {
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
      center={[44.95, -93.25]} 
      zoom={8} 
      zoomControl={false}
      style={{ height: '100%', width: '100%' }}>
        
       <LayersControl position="topleft">
  <LayersControl.BaseLayer checked name="OpenStreetMap">
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution=""
    />
  </LayersControl.BaseLayer>
  
  {districtData && districtData.features.map(feature => (
    <LayersControl.Overlay 
      key={feature.properties.DISTRICT}
      checked
      name={`District ${feature.properties.DISTRICT}`}
    >
      <GeoJSON
        data={{
          type: "FeatureCollection" as const,
          features: [feature]
        } as FeatureCollection<Polygon, DistrictProperties>}
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