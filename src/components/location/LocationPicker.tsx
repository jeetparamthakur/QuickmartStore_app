import type { ComponentType } from 'react';
import { useGoogleMapsProvider } from '@/utils/address';
import { isMapLibreNativeAvailable } from '@/utils/mapLibreNative';
import { GoogleLocationPicker } from './GoogleLocationPicker';
import type { LocationPickerProps } from './LocationPicker.types';

export type { LocationPickerProps } from './LocationPicker.types';

let mapLibrePicker: ComponentType<LocationPickerProps> | null = null;

function MapLibreLocationPicker(props: LocationPickerProps) {
  if (!mapLibrePicker) {
    mapLibrePicker = require('./MapLibreLocationPicker').MapLibreLocationPicker;
  }
  const Picker = mapLibrePicker;
  return <Picker {...props} />;
}

/** Default: MapLibre + OSM when native module is present; otherwise react-native-maps + OSM tiles. */
export function LocationPicker(props: LocationPickerProps) {
  if (useGoogleMapsProvider()) {
    return <GoogleLocationPicker {...props} />;
  }

  if (isMapLibreNativeAvailable()) {
    return <MapLibreLocationPicker {...props} />;
  }

  return <GoogleLocationPicker {...props} />;
}
