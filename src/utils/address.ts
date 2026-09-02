export type AddressResult = {
  addressLine: string;
  city: string;
  area: string;
  pincode: string;
  latitude: number;
  longitude: number;
};

export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export function hasGoogleMapsKey(): boolean {
  return GOOGLE_MAPS_API_KEY.length > 0;
}

/** Parse Google Places address_components into our address fields */
export function parseAddressComponents(
  components: { long_name: string; short_name: string; types: string[] }[],
  formattedAddress: string,
  lat: number,
  lng: number
): AddressResult {
  let city = '';
  let area = '';
  let pincode = '';

  for (const c of components) {
    if (c.types.includes('postal_code')) pincode = c.long_name;
    if (c.types.includes('locality')) city = c.long_name;
    if (!city && c.types.includes('administrative_area_level_2')) city = c.long_name;
    if (c.types.includes('sublocality') || c.types.includes('sublocality_level_1')) {
      area = c.long_name;
    }
    if (!area && c.types.includes('neighborhood')) area = c.long_name;
  }

  return {
    addressLine: formattedAddress,
    city,
    area,
    pincode,
    latitude: lat,
    longitude: lng,
  };
}
