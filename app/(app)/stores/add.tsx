import { useState } from 'react';
import { Text, StyleSheet, Alert, Pressable, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LocationPicker } from '@/components/location/LocationPicker';
import { AddressSearchInput } from '@/components/location/AddressSearchInput';
import { DeliveryRadiusSlider } from '@/components/location/DeliveryRadiusSlider';
import { useCityMapFocus } from '@/hooks/useCityMapFocus';
import { useAuthStore } from '@/stores/authStore';
import { storesService } from '@/services/api';
import type { AddressResult } from '@/utils/address';
import { colors, radius, spacing, typography } from '@/theme';

export default function AddStoreScreen() {
  const queryClient = useQueryClient();
  const authPhone = useAuthStore((s) => s.phone);
  const { mapFocus, onCityChange, markCityFromAddress } = useCityMapFocus();

  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    area: '',
    pincode: '',
    latitude: 0,
    longitude: 0,
    openingTime: '08:00',
    closingTime: '22:00',
    is24Hours: false,
    deliveryRadius: 5,
    partnerPickupRadiusKm: 3,
    platformDeliveryEnabled: true,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      storesService.create({
        name: form.name.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        area: form.area.trim(),
        pincode: form.pincode,
        latitude: form.latitude,
        longitude: form.longitude,
        deliveryRadius: form.deliveryRadius,
        openingTime: form.is24Hours ? '00:00' : form.openingTime,
        closingTime: form.is24Hours ? '23:59' : form.closingTime,
        is24Hours: form.is24Hours,
        partnerPickupRadiusKm: form.partnerPickupRadiusKm,
        platformDeliveryEnabled: form.platformDeliveryEnabled,
        contactNumber: authPhone ?? '',
      }),
    onSuccess: (store) => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      router.replace(`/(app)/stores/${store.id}`);
    },
    onError: () => {
      Alert.alert('Error', 'Could not create store. Please try again.');
    },
  });

  function update(key: string, value: string | number | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function applyAddress(result: AddressResult) {
    markCityFromAddress();
    setForm((f) => ({
      ...f,
      address: result.addressLine,
      city: result.city || f.city,
      area: result.area || f.area,
      pincode: result.pincode || f.pincode,
      latitude: result.latitude,
      longitude: result.longitude,
    }));
  }

  function handleCityChange(city: string) {
    update('city', city);
    onCityChange(city);
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      Alert.alert('Required', 'Please enter a store name');
      return;
    }
    if (!form.city || form.pincode.length !== 6) {
      Alert.alert('Required', 'Please enter city and 6-digit pincode');
      return;
    }
    if (!form.latitude || !form.longitude) {
      Alert.alert('Required', 'Please pin your store location on the map');
      return;
    }
    createMutation.mutate();
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Add New Store' }} />
      <ScreenWrapper>
        <Text style={styles.title}>New Store Branch</Text>
        <Text style={styles.subtitle}>Add another store location under your account</Text>

        <Input
          label="Store Name *"
          value={form.name}
          onChangeText={(v) => update('name', v)}
          placeholder="e.g. Paras Mart - Sector 18"
        />
        <Input
          label="Description"
          value={form.description}
          onChangeText={(v) => update('description', v)}
          placeholder="Short description for this branch"
          multiline
        />

        <Text style={styles.sectionLabel}>Store Location</Text>
        <AddressSearchInput onSelect={applyAddress} placeholder="Search store address..." />
        <Input label="City *" value={form.city} onChangeText={handleCityChange} />
        <Input label="Area / Locality *" value={form.area} onChangeText={(v) => update('area', v)} />
        <Input
          label="Pincode *"
          value={form.pincode}
          onChangeText={(v) => update('pincode', v.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
        />
        <Input label="Store Address *" value={form.address} onChangeText={(v) => update('address', v)} multiline />

        <LocationPicker
          latitude={form.latitude}
          longitude={form.longitude}
          deliveryRadiusKm={form.deliveryRadius}
          mapFocus={mapFocus}
          onCurrentLocationResolved={applyAddress}
          onLocationChange={(lat, lng) => {
            setForm((f) => ({ ...f, latitude: lat, longitude: lng }));
          }}
          label="Pin store location on map *"
        />

        <DeliveryRadiusSlider
          value={form.deliveryRadius}
          onChange={(v) => update('deliveryRadius', v)}
        />

        <Text style={styles.sectionLabel}>Store Hours</Text>
        <Pressable style={styles.hoursOption} onPress={() => update('is24Hours', !form.is24Hours)}>
          <View style={[styles.checkbox, form.is24Hours && styles.checkboxChecked]}>
            {form.is24Hours && <Ionicons name="checkmark" size={14} color={colors.white} />}
          </View>
          <View style={styles.hoursOptionText}>
            <Text style={styles.hoursOptionTitle}>24 Hours Service</Text>
          </View>
        </Pressable>

        {!form.is24Hours && (
          <>
            <Input label="Opening Time" value={form.openingTime} onChangeText={(v) => update('openingTime', v)} />
            <Input label="Closing Time" value={form.closingTime} onChangeText={(v) => update('closingTime', v)} />
          </>
        )}

        <Button title="Create Store" onPress={handleSubmit} loading={createMutation.isPending} fullWidth />
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  sectionLabel: { ...typography.h3, color: colors.text, marginBottom: spacing.md, marginTop: spacing.sm },
  hoursOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    backgroundColor: colors.background,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  hoursOptionText: { flex: 1 },
  hoursOptionTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
});
