import { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Map,
  Camera,
  UserLocation,
  type CameraRef,
  type ViewStateChangeEvent,
} from '@maplibre/maplibre-react-native';
import type { NativeSyntheticEvent } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { reverseGeocode } from '@/services/geocoding';
import { appAlert } from '@/utils/appDialog';
import { DEFAULT_MAP_STYLE } from '@/constants/mapStyle';
import { colors, radius, spacing, typography } from '@/theme';
import type { LocationPickerProps } from './LocationPicker.types';
import { DEFAULT_MAP_CENTER } from './LocationPicker.types';

const MAP_PITCH = 55;
const PIN_ZOOM = 17;

/** MapLibre + OpenStreetMap — free, no Google API key required. */
export function MapLibreLocationPicker({
  latitude,
  longitude,
  onLocationChange,
  onCurrentLocationResolved,
  mapFocus,
  label = 'Pin your location on map',
}: LocationPickerProps) {
  const cameraRef = useRef<CameraRef>(null);
  const [loadingGps, setLoadingGps] = useState(false);
  const hasPin = latitude !== 0 || longitude !== 0;

  const initialCenter = useMemo(
    () => ({
      latitude: latitude || DEFAULT_MAP_CENTER.latitude,
      longitude: longitude || DEFAULT_MAP_CENTER.longitude,
    }),
    [latitude, longitude]
  );

  function animateTo(lat: number, lng: number, zoom = PIN_ZOOM) {
    cameraRef.current?.easeTo({
      center: [lng, lat],
      zoom,
      pitch: MAP_PITCH,
      duration: 400,
    });
  }

  function handleRegionDidChange(event: NativeSyntheticEvent<ViewStateChangeEvent>) {
    const { center, userInteraction } = event.nativeEvent;
    const [lng, lat] = center;
    if (userInteraction || !hasPin) {
      onLocationChange(lat, lng);
    }
  }

  useEffect(() => {
    if (!hasPin) return;
    animateTo(latitude, longitude);
  }, [latitude, longitude, hasPin]);

  useEffect(() => {
    if (!mapFocus) return;
    animateTo(mapFocus.latitude, mapFocus.longitude, 14);
  }, [mapFocus]);

  async function useCurrentLocation() {
    setLoadingGps(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        appAlert('Permission required', 'Location permission is needed to use your current location.');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude: lat, longitude: lng } = pos.coords;
      onLocationChange(lat, lng);
      animateTo(lat, lng);

      if (onCurrentLocationResolved) {
        try {
          const address = await reverseGeocode(lat, lng);
          onCurrentLocationResolved(address);
        } catch {
          onCurrentLocationResolved({
            addressLine: '',
            city: '',
            area: '',
            pincode: '',
            latitude: lat,
            longitude: lng,
          });
        }
      }
    } catch {
      appAlert('Location Error', 'Could not fetch your current location. Please try again or pin on the map.');
    } finally {
      setLoadingGps(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.mapWrap}>
        <Map
          style={styles.map}
          mapStyle={DEFAULT_MAP_STYLE}
          logo={false}
          attribution
          compass
          compassPosition={{ top: 8, right: 8 }}
          attributionPosition={{ bottom: 4, right: 4 }}
          touchPitch
          touchRotate
          onRegionDidChange={handleRegionDidChange}
        >
          <Camera
            ref={cameraRef}
            initialViewState={{
              center: [initialCenter.longitude, initialCenter.latitude],
              zoom: PIN_ZOOM,
              pitch: MAP_PITCH,
            }}
          />
          <UserLocation />
        </Map>

        <View style={styles.centerPin} pointerEvents="none">
          <Ionicons name="location" size={40} color={colors.primary} />
        </View>
      </View>

      <TouchableOpacity style={styles.gpsBtn} onPress={useCurrentLocation} disabled={loadingGps}>
        {loadingGps ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <>
            <Ionicons name="locate" size={18} color={colors.primary} />
            <Text style={styles.gpsText}>Use Current Location</Text>
          </>
        )}
      </TouchableOpacity>

      {hasPin && (
        <Text style={styles.coords}>
          {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </Text>
      )}

      <Text style={styles.hint}>
        Move, zoom, and tilt the map until the pin marks your exact spot
      </Text>
      <Text style={styles.attribution}>© OpenStreetMap contributors</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  mapWrap: {
    height: 280,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: { flex: 1 },
  centerPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.md,
  },
  gpsText: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  coords: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },
  hint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' },
  attribution: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
