import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, Circle, UrlTile, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { reverseGeocode } from '@/services/geocoding';
import { appAlert } from '@/utils/appDialog';
import type { AddressResult, MapFocus } from '@/utils/address';
import { colors, radius, spacing, typography } from '@/theme';

type Props = {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  onCurrentLocationResolved?: (result: AddressResult) => void;
  mapFocus?: MapFocus;
  label?: string;
  deliveryRadiusKm?: number;
};

const DEFAULT_REGION: Region = {
  latitude: 30.901,
  longitude: 75.8573,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  onCurrentLocationResolved,
  mapFocus,
  label = 'Pin your location on map',
  deliveryRadiusKm,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const [loadingGps, setLoadingGps] = useState(false);
  const hasPin = latitude !== 0 || longitude !== 0;

  useEffect(() => {
    if (hasPin && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: deliveryRadiusKm ? deliveryRadiusKm * 0.025 : 0.02,
        longitudeDelta: deliveryRadiusKm ? deliveryRadiusKm * 0.025 : 0.02,
      });
    }
  }, [latitude, longitude, deliveryRadiusKm, hasPin]);

  useEffect(() => {
    if (!mapFocus || !mapRef.current) return;
    mapRef.current.animateToRegion({
      latitude: mapFocus.latitude,
      longitude: mapFocus.longitude,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
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
      mapRef.current?.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });

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

  function handleMapPress(e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    onLocationChange(lat, lng);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={styles.map}
          mapType={Platform.OS === 'android' ? 'none' : 'standard'}
          initialRegion={{
            ...DEFAULT_REGION,
            latitude: latitude || DEFAULT_REGION.latitude,
            longitude: longitude || DEFAULT_REGION.longitude,
          }}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {Platform.OS === 'android' && (
            <UrlTile urlTemplate={OSM_TILE_URL} maximumZ={19} flipY={false} />
          )}
          {hasPin && (
            <>
              <Marker
                coordinate={{ latitude, longitude }}
                draggable
                onDragEnd={(e) => {
                  const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
                  onLocationChange(lat, lng);
                }}
              />
              {deliveryRadiusKm != null && deliveryRadiusKm > 0 && (
                <Circle
                  center={{ latitude, longitude }}
                  radius={deliveryRadiusKm * 1000}
                  strokeColor={colors.primary}
                  fillColor="rgba(99, 102, 241, 0.15)"
                  strokeWidth={2}
                />
              )}
            </>
          )}
        </MapView>
      </View>

      {deliveryRadiusKm != null && deliveryRadiusKm > 0 && hasPin && (
        <Text style={styles.radiusHint}>
          Shaded circle = {deliveryRadiusKm} km product visibility area
        </Text>
      )}

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

      <Text style={styles.hint}>Tap on map or drag the pin to set exact location</Text>
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
    height: 240,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: { flex: 1 },
  radiusHint: {
    ...typography.caption,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontWeight: '600',
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
