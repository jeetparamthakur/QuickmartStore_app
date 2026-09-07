import * as Location from 'expo-location';
import {
  GOOGLE_MAPS_API_KEY,
  hasGoogleMapsKey,
  mapExpoGeocodedAddress,
  parseGoogleGeocodeResult,
  type AddressResult,
  type MapFocus,
} from '@/utils/address';

async function googleReverseGeocode(lat: number, lng: number): Promise<AddressResult | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const result = data.results?.[0];
  if (!result) return null;
  return parseGoogleGeocodeResult(result, lat, lng);
}

async function googleGeocodeCity(city: string): Promise<MapFocus | null> {
  const query = encodeURIComponent(`${city}, India`);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${GOOGLE_MAPS_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const location = data.results?.[0]?.geometry?.location;
  if (!location) return null;
  return { latitude: location.lat, longitude: location.lng };
}

/** Reverse geocode coordinates into city, area, pincode, and address */
export async function reverseGeocode(lat: number, lng: number): Promise<AddressResult> {
  if (hasGoogleMapsKey()) {
    try {
      const googleResult = await googleReverseGeocode(lat, lng);
      if (googleResult) return googleResult;
    } catch {
      // fall through to expo-location
    }
  }

  const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
  if (results[0]) {
    return mapExpoGeocodedAddress(results[0], lat, lng);
  }

  return {
    addressLine: '',
    city: '',
    area: '',
    pincode: '',
    latitude: lat,
    longitude: lng,
  };
}

/** Forward geocode a city name for map camera pan (does not move the pin) */
export async function geocodeCity(city: string): Promise<MapFocus | null> {
  const trimmed = city.trim();
  if (trimmed.length < 3) return null;

  if (hasGoogleMapsKey()) {
    try {
      const googleResult = await googleGeocodeCity(trimmed);
      if (googleResult) return googleResult;
    } catch {
      // fall through to expo-location
    }
  }

  const results = await Location.geocodeAsync(`${trimmed}, India`);
  if (!results[0]) return null;
  return { latitude: results[0].latitude, longitude: results[0].longitude };
}
