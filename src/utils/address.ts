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

type NominatimAddress = {
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state_district?: string;
  postcode?: string;
};

type NominatimResult = {
  display_name?: string;
  address?: NominatimAddress;
};

/** Parse Nominatim reverse/forward geocode JSON into our address fields */
export function parseNominatimResult(
  result: NominatimResult,
  lat: number,
  lng: number
): AddressResult | null {
  const address = result.address;
  if (!address) return null;

  const city =
    address.city ??
    address.town ??
    address.village ??
    address.county ??
    address.state_district ??
    '';
  const area = address.suburb ?? address.neighbourhood ?? address.road ?? '';
  const pincode = address.postcode ?? '';
  const addressLine =
    result.display_name ??
    [address.road, area, city].filter(Boolean).join(', ');

  return {
    addressLine,
    city,
    area,
    pincode,
    latitude: lat,
    longitude: lng,
  };
}

type PhotonProperties = {
  name?: string;
  street?: string;
  city?: string;
  district?: string;
  state?: string;
  postcode?: string;
  country?: string;
};

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: PhotonProperties;
};

/** Parse a Photon (OpenStreetMap) search result into our address fields */
export function parsePhotonFeature(feature: PhotonFeature): AddressResult | null {
  const coords = feature.geometry?.coordinates;
  if (!coords?.length) return null;

  const [lng, lat] = coords;
  const props = feature.properties ?? {};
  const city = props.city ?? props.district ?? props.state ?? '';
  const area = props.name ?? props.street ?? '';
  const pincode = props.postcode ?? '';
  const addressLine = [props.name, props.street, city, props.state, props.country]
    .filter(Boolean)
    .join(', ');

  return {
    addressLine,
    city,
    area,
    pincode,
    latitude: lat,
    longitude: lng,
  };
}
