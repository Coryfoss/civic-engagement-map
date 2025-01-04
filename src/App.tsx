import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, ScaleControl } from 'react-leaflet';
import { Feature, Polygon, FeatureCollection, Geometry } from 'geojson';
import L, { StyleFunction } from 'leaflet';
import 'leaflet/dist/leaflet.css';



interface DistrictProperties {
  DISTRICT: string;
  POPULATION: string;
  TURNOUT: string;
  [key: string]: string | number | Record<string, number>; // Index signature
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
    '1': '#2ecc71', // Emerald Green
    '2': '#3498db', // Blue
    '3': '#9b59b6', // Purple
    '4': '#e74c3c', // Red
    '5': '#f1c40f', // Yellow
    '6': '#1abc9c', // Turquoise
    '7': '#e67e22', // Orange
    '8': '#34495e'  // Dark Blue
  };
  return colors[district] || '#95a5a6'; // Default gray if district not found
};
// Sample GeoJSON data for Minnesota's congressional districts
const sampleDistrictData: FeatureCollection<Polygon, DistrictProperties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        DISTRICT: "1",
        POPULATION: "718,021",
        TURNOUT: "82",
        DEMOGRAPHICS: {
          WHITE: 80,
          BLACK: 5,
          HISPANIC: 7,
          ASIAN: 3,
          OTHER: 5
        }
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-96.45, 43.5],
          [-96.3, 44.0], // Adjusted to angle slightly north-east
          [-94.0, 44.2],
          [-92.3, 44.0], // Angled slightly south-east
          [-91.7, 43.6], // Angled down
          [-96.45, 43.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "2",
        POPULATION: "721,450",
        TURNOUT: "78",
        DEMOGRAPHICS: {
          WHITE: 75,
          BLACK: 8,
          HISPANIC: 8,
          ASIAN: 5,
          OTHER: 4
        }
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-94.0, 44.2],
          [-94.2, 44.8], // Adjusted angle
          [-92.6, 44.9],
          [-92.8, 44.3], // Lowered south-east edge
          [-94.0, 44.2]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "3",
        POPULATION: "735,284",
        TURNOUT: "85",
        DEMOGRAPHICS: {
          WHITE: 70,
          BLACK: 12,
          HISPANIC: 8,
          ASIAN: 7,
          OTHER: 3
        }
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-93.9, 44.7], // Adjusted slightly south-west
          [-93.9, 45.3],
          [-93.4, 45.2], // Shifted north-east
          [-93.3, 44.9],
          [-93.9, 44.7]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "4",
        POPULATION: "725,000",
        TURNOUT: "80",
        DEMOGRAPHICS: {
          WHITE: 65,
          BLACK: 15,
          HISPANIC: 10,
          ASIAN: 8,
          OTHER: 2
        }
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-93.4, 44.8],
          [-93.3, 45.2],
          [-92.7, 45.1], // Aligned closer to boundary
          [-92.8, 44.7],
          [-93.4, 44.8]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "5",
        POPULATION: "742,000",
        TURNOUT: "88",
        DEMOGRAPHICS: {
          WHITE: 60,
          BLACK: 18,
          HISPANIC: 12,
          ASIAN: 7,
          OTHER: 3
        }
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-93.5, 44.9], // Angled slightly west
          [-93.5, 45.1],
          [-93.3, 45.0],
          [-93.2, 44.9],
          [-93.5, 44.9]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "6",
        POPULATION: "735,000",
        TURNOUT: "79",
        DEMOGRAPHICS: {
          WHITE: 82,
          BLACK: 6,
          HISPANIC: 5,
          ASIAN: 4,
          OTHER: 3
        }
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-94.6, 45.1], // Shifted north-west
          [-94.6, 45.9],
          [-93.4, 45.8], // Reduced overlap with others
          [-93.3, 45.2],
          [-94.6, 45.1]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "7",
        POPULATION: "714,000",
        TURNOUT: "77",
        DEMOGRAPHICS: {
          WHITE: 85,
          BLACK: 4,
          HISPANIC: 6,
          ASIAN: 2,
          OTHER: 3
        }
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-97.2, 44.8], // Shifted south from 45.1
          [-97.0, 48.7], // Pulled southern end lower
          [-95.3, 48.6], // Adjusted eastern boundary southward
          [-95.2, 44.8], // Matched southern shift
          [-97.2, 44.8]  // Closed loop
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "8",
        POPULATION: "729,000",
        TURNOUT: "81",
        DEMOGRAPHICS: {
          WHITE: 89,
          BLACK: 2,
          HISPANIC: 3,
          ASIAN: 1,
          OTHER: 5
        }
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-95.1, 46.3], // Angled north-east slightly
          [-95.0, 48.9],
          [-89.8, 48.8], // Adjusted edges
          [-89.8, 46.4],
          [-95.1, 46.3]
        ]]
      }
    }
  ]
};


const MinnesotaMap = () => {
  const [districtData, setDistrictData] = useState<FeatureCollection<Polygon, DistrictProperties> | null>(null);
  const [selectedLayer, setSelectedLayer] = useState('turnout');
  const [timeframe, setTimeframe] = useState('2024');

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
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
    <div className="absolute top-4 left-4 z-50 bg-white p-4 rounded shadow-lg">
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
          onClick={() => {
            console.log('Downloading report...');
          }}
          className="w-full mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Download Report
        </button>
      </div>

      <MapContainer
        center={[44.95, -93.25]}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Congressional Districts">
            {districtData && (
              <GeoJSON
                data={districtData}
                style={districtStyle}
                onEachFeature={onEachDistrict}
              />
            )}
          </LayersControl.Overlay>
        </LayersControl>

        <ScaleControl position="bottomleft" />
      </MapContainer>
    </div>
  );
};

export default MinnesotaMap;