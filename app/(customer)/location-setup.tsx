import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import * as Location from 'expo-location';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LocationPicker } from '@/components/location/LocationPicker';
import { AddressSearchInput } from '@/components/location/AddressSearchInput';
import { useUserLocationStore } from '@/stores/userLocationStore';
import type { UserLocation } from '@/types/location';
import type { AddressResult } from '@/utils/address';
import { colors, spacing, typography } from '@/theme';

export default function LocationSetupScreen() {
  const setLocation = useUserLocationStore((s) => s.setLocation);
  const existing = useUserLocationStore((s) => s.location);

  const [form, setForm] = useState({
    city: existing?.city ?? '',
    area: existing?.area ?? '',
    pincode: existing?.pincode ?? '',
    addressLine: existing?.addressLine ?? '',
    latitude: existing?.latitude ?? 0,
    longitude: existing?.longitude ?? 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    detectCityFromGps();
  }, []);

  async function detectCityFromGps() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const pos = await Location.getCurrentPositionAsync({});
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      if (geo) {
        setForm((f) => ({
          ...f,
          city: f.city || geo.city || geo.subregion || '',
          area: f.area || geo.district || geo.street || '',
          pincode: f.pincode || geo.postalCode || '',
          addressLine: f.addressLine || [geo.name, geo.street, geo.city].filter(Boolean).join(', '),
          latitude: f.latitude || pos.coords.latitude,
          longitude: f.longitude || pos.coords.longitude,
        }));
      }
    } catch {
      // GPS optional
    }
  }

  function update(key: string, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function applyAddress(result: AddressResult) {
    setForm((f) => ({
      ...f,
      addressLine: result.addressLine,
      city: result.city || f.city,
      area: result.area || f.area,
      pincode: result.pincode || f.pincode,
      latitude: result.latitude,
      longitude: result.longitude,
    }));
  }

  async function handleSubmit() {
    if (!form.city.trim()) {
      Alert.alert('Required', 'Please enter your city');
      return;
    }
    if (form.pincode.length !== 6) {
      Alert.alert('Required', 'Please enter a valid 6-digit pincode');
      return;
    }
    if (!form.addressLine.trim()) {
      Alert.alert('Required', 'Please enter your full address');
      return;
    }
    if (!form.latitude || !form.longitude) {
      Alert.alert('Required', 'Please pin your location on the map');
      return;
    }

    setLoading(true);
    try {
      const location: UserLocation = {
        city: form.city.trim(),
        area: form.area.trim(),
        pincode: form.pincode.trim(),
        addressLine: form.addressLine.trim(),
        latitude: form.latitude,
        longitude: form.longitude,
      };
      await setLocation(location);
      router.replace('/(customer)/products');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Delivery Location' }} />
      <ScreenWrapper>
        <Text style={styles.title}>Where should we deliver?</Text>
        <Text style={styles.subtitle}>
          Search your address or pin on map — we'll show products from nearby stores only
        </Text>

        <AddressSearchInput onSelect={applyAddress} placeholder="Search your address on Google Maps..." />

        <Input label="City *" value={form.city} onChangeText={(v) => update('city', v)} placeholder="e.g. Ludhiana" />
        <Input label="Area / Locality *" value={form.area} onChangeText={(v) => update('area', v)} />
        <Input
          label="Pincode *"
          value={form.pincode}
          onChangeText={(v) => update('pincode', v.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
        />
        <Input label="Full Address *" value={form.addressLine} onChangeText={(v) => update('addressLine', v)} multiline />

        <LocationPicker
          latitude={form.latitude}
          longitude={form.longitude}
          onLocationChange={(lat, lng) => {
            update('latitude', lat);
            update('longitude', lng);
          }}
          label="Pin exact delivery location on map *"
        />

        <Button title="Show Products Near Me" onPress={handleSubmit} loading={loading} fullWidth />
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
});
