/** Approximate zoom level from a latitude delta (react-native-maps style). */
export function latitudeDeltaToZoom(latitudeDelta: number): number {
  const safeDelta = Math.max(latitudeDelta, 0.001);
  return Math.max(3, Math.min(18, Math.log2(360 / safeDelta) - 1));
}

/** Build a GeoJSON polygon approximating a circle on the map. */
export function createCirclePolygon(
  latitude: number,
  longitude: number,
  radiusMeters: number,
  points = 64
): GeoJSON.Feature<GeoJSON.Polygon> {
  const coordinates: [number, number][] = [];
  const distanceX = radiusMeters / (111320 * Math.cos((latitude * Math.PI) / 180));
  const distanceY = radiusMeters / 110540;

  for (let i = 0; i < points; i += 1) {
    const theta = (i / points) * (2 * Math.PI);
    coordinates.push([longitude + distanceX * Math.cos(theta), latitude + distanceY * Math.sin(theta)]);
  }

  coordinates.push(coordinates[0]);

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates],
    },
    properties: {},
  };
}
