import type { AddressResult, MapFocus } from '@/utils/address';

export type LocationPickerProps = {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  onCurrentLocationResolved?: (result: AddressResult) => void;
  mapFocus?: MapFocus;
  label?: string;
  deliveryRadiusKm?: number;
};

export const DEFAULT_MAP_CENTER = {
  latitude: 30.901,
  longitude: 75.8573,
};
