import type { LocationGeocodedAddress } from 'expo-location';

export type AddressResult = {
  addressLine: string;
  city: string;
  area: string;
  pincode: string;
  latitude: number;
  longitude: number;
};

export type MapFocus = {
  latitude: number;
  longitude: number;
};

export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export function hasGoogleMapsKey(): boolean {
  return GOOGLE_MAPS_API_KEY.length > 0;
}

/** Map expo-location reverse geocode result into our address fields */
export function mapExpoGeocodedAddress(
  address: LocationGeocodedAddress,
  lat: number,
  lng: number
): AddressResult {
  const city = address.city ?? address.district ?? address.subregion ?? '';
  const area = address.subregion ?? address.district ?? address.name ?? '';
  const streetParts = [address.streetNumber, address.street].filter(Boolean);
  const addressLine =
    streetParts.length > 0
      ? streetParts.join(' ')
      : [area, city, address.region].filter(Boolean).join(', ');

  return {
    addressLine,
    city,
    area,
    pincode: address.postalCode ?? '',
    latitude: lat,
    longitude: lng,
  };
}

type GoogleGeocodeResult = {
  formatted_address?: string;
  address_components?: { long_name: string; short_name: string; types: string[] }[];
  geometry?: { location?: { lat: number; lng: number } };
};

/** Parse Google Geocoding API JSON response into AddressResult */
export function parseGoogleGeocodeResult(
  result: GoogleGeocodeResult,
  fallbackLat: number,
  fallbackLng: number
): AddressResult | null {
  const lat = result.geometry?.location?.lat ?? fallbackLat;
  const lng = result.geometry?.location?.lng ?? fallbackLng;
  if (!result.address_components?.length) return null;

  return parseAddressComponents(
    result.address_components,
    result.formatted_address ?? '',
    lat,
    lng
  );
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
