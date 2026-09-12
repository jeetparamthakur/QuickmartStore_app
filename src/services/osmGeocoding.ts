import {
  parseNominatimResult,
  parsePhotonFeature,
  type AddressResult,
  type MapFocus,
} from '@/utils/address';

const USER_AGENT = 'QuickmartStoreApp/1.0 (partner onboarding)';
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const PHOTON_BASE = 'https://photon.komoot.io/api';
const INDIA_BBOX = '68.1,6.5,97.4,35.5';

function osmHeaders(): HeadersInit {
  return {
    Accept: 'application/json',
    'User-Agent': USER_AGENT,
  };
}

export async function nominatimReverseGeocode(
  lat: number,
  lng: number
): Promise<AddressResult | null> {
  const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
  const res = await fetch(url, { headers: osmHeaders() });
  if (!res.ok) return null;
  const data = await res.json();
  return parseNominatimResult(data, lat, lng);
}

export async function nominatimGeocodeCity(city: string): Promise<MapFocus | null> {
  const query = encodeURIComponent(`${city}, India`);
  const url = `${NOMINATIM_BASE}/search?q=${query}&format=json&limit=1&countrycodes=in`;
  const res = await fetch(url, { headers: osmHeaders() });
  if (!res.ok) return null;
  const data = (await res.json()) as { lat?: string; lon?: string }[];
  const hit = data[0];
  if (!hit?.lat || !hit?.lon) return null;
  return { latitude: Number(hit.lat), longitude: Number(hit.lon) };
}

export async function photonSearchAddresses(query: string): Promise<AddressResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const params = new URLSearchParams({
    q: trimmed,
    limit: '6',
    lang: 'en',
    bbox: INDIA_BBOX,
  });

  const res = await fetch(`${PHOTON_BASE}/?${params.toString()}`, {
    headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as { features?: Parameters<typeof parsePhotonFeature>[0][] };
  return (data.features ?? [])
    .map((feature) => parsePhotonFeature(feature))
    .filter((result): result is AddressResult => result != null);
}
