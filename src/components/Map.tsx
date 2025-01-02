import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Define type for heatmap data points
type HeatmapPoint = [number, number, number]; // [lat, lng, intensity]

interface HeatmapLayerProps {
  points: HeatmapPoint[];
  options?: {
    radius?: number;
    blur?: number;
    maxZoom?: number;
    max?: number;
    gradient?: {[key: string]: string};
  };
}

const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ points, options = {} }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!points.length) return;

    const defaultOptions = {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: { 0.4: '#3388ff', 0.6: '#78ff33', 0.8: '#ff3333' }
    };

    const heatLayer = L.heatLayer(points, {
      ...defaultOptions,
      ...options
    });

    heatLayer.addTo(map);
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, options]);

  return null;
};

const HeatMap: React.FC<{
  center: [number, number];
  zoom: number;
  data: HeatmapPoint[];
  className?: string;
}> = ({ center, zoom, data, className = 'h-screen w-screen' }) => {
  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <HeatmapLayer points={data} />
      </MapContainer>
    </div>
  );
};

export default HeatMap;