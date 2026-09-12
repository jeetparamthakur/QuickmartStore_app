import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec';

/** Free OpenStreetMap raster tiles — no API key required. */
export const OSM_RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
    },
  ],
};

const customStyleUrl = process.env.EXPO_PUBLIC_MAP_STYLE_URL?.trim();

/** MapLibre style used by default (OSM raster unless overridden). */
export const DEFAULT_MAP_STYLE: string | StyleSpecification =
  customStyleUrl && customStyleUrl.length > 0 ? customStyleUrl : OSM_RASTER_STYLE;
