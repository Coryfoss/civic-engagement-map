import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, ScaleControl, useMap } from 'react-leaflet';
import { Feature, Polygon, MultiPolygon, FeatureCollection } from 'geojson';
import L, { StyleFunction } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import FilterControls from './components/filterControls';


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
}

const DISTRICT_DATA: FeatureCollection<Polygon | MultiPolygon, DistrictProperties> = {
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
      geometry: { type: "Polygon", coordinates: [] }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "2",
        POPULATION: "721,450",
        TURNOUT: "78",
        DEMOGRAPHICS: { WHITE: 75, BLACK: 8, HISPANIC: 8, ASIAN: 5, OTHER: 4 }
      },
      geometry: { type: "Polygon", coordinates: [] }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "3",
        POPULATION: "735,284",
        TURNOUT: "85",
        DEMOGRAPHICS: { WHITE: 70, BLACK: 12, HISPANIC: 8, ASIAN: 7, OTHER: 3 }
      },
      geometry: { type: "Polygon", coordinates: [] }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "4",
        POPULATION: "725,000",
        TURNOUT: "80",
        DEMOGRAPHICS: { WHITE: 65, BLACK: 15, HISPANIC: 10, ASIAN: 8, OTHER: 2 }
      },
      geometry: { type: "Polygon", coordinates: [] }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "5",
        POPULATION: "742,000",
        TURNOUT: "88",
        DEMOGRAPHICS: { WHITE: 60, BLACK: 18, HISPANIC: 12, ASIAN: 7, OTHER: 3 }
      },
      geometry: { type: "Polygon", coordinates: [] }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "6",
        POPULATION: "735,000",
        TURNOUT: "79",
        DEMOGRAPHICS: { WHITE: 82, BLACK: 6, HISPANIC: 5, ASIAN: 4, OTHER: 3 }
      },
      geometry: { type: "Polygon", coordinates: [] }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "7",
        POPULATION: "714,000",
        TURNOUT: "77",
        DEMOGRAPHICS: { WHITE: 85, BLACK: 4, HISPANIC: 6, ASIAN: 2, OTHER: 3 }
      },
      geometry: { type: "Polygon", coordinates: [] }
    },
    {
      type: "Feature",
      properties: {
        DISTRICT: "8",
        POPULATION: "729,000",
        TURNOUT: "81",
        DEMOGRAPHICS: { WHITE: 89, BLACK: 2, HISPANIC: 3, ASIAN: 1, OTHER: 5 }
      },
      geometry: { type: "Polygon", coordinates: [] }
    }
  ]
};

const mapStyles = `
  .leaflet-container {
    width: 100%;
    height: 100%;
  }
`;

const ZoomHandler = ({ onZoomChange }: { onZoomChange: (zoom: number) => void }) => {
  const map = useMap();
  useEffect(() => {
    map.on('zoomend', () => onZoomChange(map.getZoom()));
  }, [map, onZoomChange]);
  return null;
};

const getDistrictColor = (district: string): string => ({
  '1': '#2ecc71', '2': '#3498db', '3': '#9b59b6', '4': '#e74c3c',
  '5': '#f1c40f', '6': '#1abc9c', '7': '#e67e22', '8': '#34495e'
}[district] || '#95a5a6');

const MinnesotaMap = () => {
  const [minnesotaOutline, setMinnesotaOutline] = useState<FeatureCollection | null>(null);
  const [districtData, setDistrictData] = useState<FeatureCollection<Polygon | MultiPolygon, DistrictProperties> | null>(null);
  const [mapZoom, setMapZoom] = useState(7);
  const [visibleDistricts, setVisibleDistricts] = useState<Set<string>>(
    new Set(['1', '2', '3', '4', '5', '6', '7', '8'])
  );

  // Add Leaflet styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = mapStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Load Minnesota outline
  useEffect(() => {
    const fetchMinnesotaOutline = async () => {
      try {
        const response = await fetch('/geojson/minnesotaOutline.geojson');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setMinnesotaOutline(data);
      } catch (error) {
        console.error('Error loading Minnesota outline:', error);
      }
    };
    fetchMinnesotaOutline();
  }, []);

  // Load district geometries
  useEffect(() => {
    const loadDistrictGeometries = async () => {
      try {
        console.log('Starting to load district geometries...');
        const updatedFeatures = await Promise.all(
          DISTRICT_DATA.features.map(async (feature) => {
            const districtNumber = feature.properties.DISTRICT;
            try {
              const response = await fetch(`/geojson/mn-cd${districtNumber}-precincts.json`);
              if (!response.ok) {
                throw new Error(`Failed to load district ${districtNumber}: ${response.status}`);
              }
              const geometryData = await response.json();

              // The district data appears to be a FeatureCollection
              if (geometryData.type === 'FeatureCollection' && geometryData.features?.length > 0) {
                const allCoordinates: number[][][][] = geometryData.features.reduce((acc: number[][][][], feat: any) => {
                  if (feat.geometry?.coordinates) {
                    if (feat.geometry.type === 'Polygon') {
                      acc.push(feat.geometry.coordinates as number[][][]);
                    } else if (feat.geometry.type === 'MultiPolygon') {
                      acc.push(...(feat.geometry.coordinates as number[][][][]));
                    }
                  }
                  return acc;
                }, []);

                const updatedFeature: Feature<MultiPolygon, DistrictProperties> = {
                  type: "Feature",
                  properties: feature.properties,
                  geometry: {
                    type: "MultiPolygon",
                    coordinates: allCoordinates
                  }
                };

                return updatedFeature;
              }

              console.log(`Processed district ${districtNumber}`);
              return feature;
            } catch (error) {
              console.error(`Error processing district ${districtNumber}:`, error);
              return feature;
            }
          })
        );

        console.log('Setting district data with', updatedFeatures.length, 'features');
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

  const districtStyle: StyleFunction = (feature?: Feature) => {
    if (!feature?.properties?.DISTRICT) return {};

    return {
      fillColor: getDistrictColor(feature.properties.DISTRICT),
      fillOpacity: 0.3,
      className: 'district-boundary',
      weight: mapZoom >= 11 ? 0.25 : 0,
      opacity: mapZoom >= 11 ? 1 : 0,
      color: 'black'
    };
  };

  const handleToggleDistrict = (districtId: string) => {
    setVisibleDistricts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(districtId)) {
        newSet.delete(districtId);
      } else {
        newSet.add(districtId);
      }
      return newSet;
    });
  };

  const onEachDistrict = (feature: Feature<Polygon | MultiPolygon, DistrictProperties>, layer: L.Layer) => {
    layer.bindPopup(`
      <div class="p-4">
        <h3 class="text-lg font-bold">Congressional District ${feature.properties.DISTRICT}</h3>
        <div class="mt-2">
          <p>Population: ${feature.properties.POPULATION}</p>
          <p>Voter Turnout: ${feature.properties.TURNOUT}%</p>
          <div class="mt-2">
            <h4 class="font-semibold">Demographics</h4>
            <div class="flex flex-col space-y-1">
              ${Object.entries(feature.properties.DEMOGRAPHICS)
                .map(([key, value]) => `<div>${key}: ${value}%</div>`)
                .join('')}
            </div>
          </div>
        </div>
      </div>
    `);
  };

 
 return (
  <div style={{
    width: '100vw',
    height: '100vh',
    position: 'relative',
  }}>
    <MapContainer
      center={[46.2, -94.2]}
      zoom={7}
      zoomControl={false}
      minZoom={7}
      maxZoom={15}
      maxBounds={[[43.4, -97.5], [49.5, -89.0]]}
      maxBoundsViscosity={1.0}
      style={{ 
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }}
    >
      <ZoomHandler onZoomChange={setMapZoom} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {minnesotaOutline && (
        <GeoJSON
          data={minnesotaOutline}
          style={{ color: 'black', weight: 2, fillOpacity: 0 }}
        />
      )}

      {districtData?.features
        .filter(feature => visibleDistricts.has(feature.properties.DISTRICT))
        .map(feature => (
          <GeoJSON
            key={feature.properties.DISTRICT}
            data={{
              type: "FeatureCollection",
              features: [feature]
            } as FeatureCollection<Polygon | MultiPolygon, DistrictProperties>}
            style={districtStyle}
            onEachFeature={onEachDistrict}
          />
        ))}
      
      <ScaleControl position="bottomleft" />
      </MapContainer>

{/* Left Side Controls */}
<div className="inline-flex bg-white/90 backdrop-blur-sm border border-gray-200 rounded-md shadow-sm" style={{
  position: 'absolute',
  width: '100vw',
  zIndex: 1000
}}>
  <FilterControls 
    districts={DISTRICT_DATA.features.map(f => ({
      id: f.properties.DISTRICT,
      name: `District ${f.properties.DISTRICT}`,
      visible: visibleDistricts.has(f.properties.DISTRICT)
    }))}
    onToggleDistrict={handleToggleDistrict}
  />
</div>
  </div>
);
};

export default MinnesotaMap;