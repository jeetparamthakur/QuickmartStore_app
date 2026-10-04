import { TurboModuleRegistry } from 'react-native';

/** True when @maplibre/maplibre-react-native is linked in the native binary (dev client / release). */
export function isMapLibreNativeAvailable(): boolean {
  return TurboModuleRegistry.get('MLRNCameraModule') != null;
}
