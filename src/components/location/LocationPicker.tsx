import { useGoogleMapsProvider } from '@/utils/address';
import { GoogleLocationPicker } from './GoogleLocationPicker';
import { MapLibreLocationPicker } from './MapLibreLocationPicker';
import type { LocationPickerProps } from './LocationPicker.types';

export type { LocationPickerProps } from './LocationPicker.types';

/** Default: MapLibre + OSM. Set EXPO_PUBLIC_USE_GOOGLE_MAPS=true to switch to Google Maps. */
export function LocationPicker(props: LocationPickerProps) {
  if (useGoogleMapsProvider()) {
    return <GoogleLocationPicker {...props} />;
  }

  return <MapLibreLocationPicker {...props} />;
}
