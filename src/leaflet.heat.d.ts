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
  // At the top of your file, after the other imports
import 'leaflet.heat';
declare module 'leaflet' {
  namespace L {
    function heatLayer(
      latlngs: LatLngExpression[],
      options?: any
    ): any;
  }
}
}
