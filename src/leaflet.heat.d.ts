import * as L from 'leaflet';

declare module 'leaflet' {
  function heatLayer(latlngs: L.LatLngExpression[], options?: HeatMapOptions): L.Layer;

  interface HeatMapOptions {
    radius?: number;
    blur?: number;
    maxZoom?: number;
    max?: number;
    minOpacity?: number;
    gradient?: { [key: number]: string };
  }
}
