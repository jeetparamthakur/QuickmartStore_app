import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { UrlTile, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { reverseGeocode } from '@/services/geocoding';
import { appAlert } from '@/utils/appDialog';
import type { LocationPickerProps } from './LocationPicker.types';
import { DEFAULT_MAP_CENTER } from './LocationPicker.types';
import { colors, radius, spacing, typography } from '@/theme';

const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

/** Google Maps / react-native-maps implementation — enable with EXPO_PUBLIC_USE_GOOGLE_MAPS=true */
export function GoogleLocationPicker({
  latitude,
  longitude,
  onLocationChange,
  onCurrentLocationResolved,
  mapFocus,
  label = 'Pin your location on map',
}: LocationPickerProps) {
  const mapRef = useRef<MapView>(null);
  const [loadingGps, setLoadingGps] = useState(false);
  const hasPin = latitude !== 0 || longitude !== 0;

  function animateTo(lat: number, lng: number) {
    mapRef.current?.animateCamera(
      {
        center: { latitude: lat, longitude: lng },
        pitch: 55,
        zoom: 18,
      },
      { duration: 400 }
    );
  }

  useEffect(() => {
    if (!hasPin) return;
    animateTo(latitude, longitude);
  }, [latitude, longitude, hasPin]);

  useEffect(() => {
    if (!mapFocus || !mapRef.current) return;
    mapRef.current.animateToRegion({
      latitude: mapFocus.latitude,
      longitude: mapFocus.longitude,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    });
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

  function handleRegionChangeComplete(region: Region) {
    onLocationChange(region.latitude, region.longitude);
  }

  const initialRegion: Region = {
    latitude: latitude || DEFAULT_MAP_CENTER.latitude,
    longitude: longitude || DEFAULT_MAP_CENTER.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={styles.map}
          mapType={Platform.OS === 'android' ? 'none' : 'standard'}
          initialRegion={initialRegion}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation
          showsMyLocationButton={false}
          pitchEnabled
          rotateEnabled
        >
          {Platform.OS === 'android' && (
            <UrlTile urlTemplate={OSM_TILE_URL} maximumZ={19} flipY={false} />
          )}
        </MapView>

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
      {Platform.OS === 'android' && (
        <Text style={styles.attribution}>© OpenStreetMap contributors</Text>
      )}
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
