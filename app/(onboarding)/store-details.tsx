import { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { StepProgress } from '@/components/layout/StepProgress';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LocationPicker } from '@/components/location/LocationPicker';
import { AddressSearchInput } from '@/components/location/AddressSearchInput';
import { DeliveryRadiusSlider } from '@/components/location/DeliveryRadiusSlider';
import { usePartnerStore } from '@/stores/partnerStore';
import type { AddressResult } from '@/utils/address';
import { colors, radius, spacing, typography } from '@/theme';

export default function StoreDetailsScreen() {
  const setStoreDetails = usePartnerStore((s) => s.setStoreDetails);
  const existing = usePartnerStore((s) => s.profile?.storeDetails);

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    category: existing?.category ?? '',
    description: existing?.description ?? '',
    address: existing?.address ?? '',
    city: existing?.city ?? '',
    area: existing?.area ?? '',
    pincode: existing?.pincode ?? '',
    latitude: existing?.latitude ?? 0,
    longitude: existing?.longitude ?? 0,
    openingTime: existing?.openingTime ?? '08:00',
    closingTime: existing?.closingTime ?? '22:00',
    deliveryRadius: existing?.deliveryRadius ?? 5,
    partnerPickupRadiusKm: existing?.partnerPickupRadiusKm ?? 3,
    platformDeliveryEnabled: existing?.platformDeliveryEnabled ?? true,
    contactNumber: existing?.contactNumber ?? '',
  });

  function update(key: string, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function applyAddress(result: AddressResult) {
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

  function handleContinue() {
    if (!form.city || form.pincode.length !== 6) {
      Alert.alert('Required', 'Please enter city and 6-digit pincode');
      return;
    }
    if (!form.latitude || !form.longitude) {
      Alert.alert('Required', 'Please pin your store location on the map');
      return;
    }

    setStoreDetails({
      ...form,
      deliveryRadius: form.deliveryRadius,
    });
    router.push('/(onboarding)/kyc');
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Store Details' }} />
      <ScreenWrapper>
        <StepProgress currentStep={3} totalSteps={5} />
        <Text style={styles.title}>Store Details</Text>
        <Text style={styles.subtitle}>
          Set your store location and how far customers can see your products
        </Text>

        <TouchableOpacity style={styles.uploadBox}>
          <Ionicons name="camera-outline" size={32} color={colors.textMuted} />
          <Text style={styles.uploadText}>Upload Store Logo</Text>
        </TouchableOpacity>

        <Input label="Store Name *" value={form.name} onChangeText={(v) => update('name', v)} />
        <Input label="Store Category *" value={form.category} onChangeText={(v) => update('category', v)} />
        <Input label="Store Description" value={form.description} onChangeText={(v) => update('description', v)} multiline />

        <Text style={styles.sectionLabel}>Store Location</Text>
        <AddressSearchInput onSelect={applyAddress} placeholder="Search store address on Google Maps..." />

        <Input label="City *" value={form.city} onChangeText={(v) => update('city', v)} placeholder="e.g. Ludhiana" />
        <Input label="Area / Locality *" value={form.area} onChangeText={(v) => update('area', v)} placeholder="e.g. Model Town" />
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
          onLocationChange={(lat, lng) => {
            update('latitude', lat);
            update('longitude', lng);
          }}
          label="Pin store location on map *"
        />

        <DeliveryRadiusSlider
          value={form.deliveryRadius}
          onChange={(v) => update('deliveryRadius', v)}
        />

        <Text style={styles.sectionLabel}>Delivery Partner Pickup</Text>
        <DeliveryRadiusSlider
          value={form.partnerPickupRadiusKm}
          onChange={(v) => update('partnerPickupRadiusKm', v)}
          min={1}
          max={10}
          label="Delivery Partner Pickup Radius"
          hint={`Partners within ${Math.round(form.partnerPickupRadiusKm)} km of your store can accept delivery requests for ready orders.`}
        />

        <Input label="Opening Time" value={form.openingTime} onChangeText={(v) => update('openingTime', v)} placeholder="08:00" />
        <Input label="Closing Time" value={form.closingTime} onChangeText={(v) => update('closingTime', v)} placeholder="22:00" />
        <Input label="Store Contact Number *" value={form.contactNumber} onChangeText={(v) => update('contactNumber', v)} keyboardType="phone-pad" />

        <Button title="Continue" onPress={handleContinue} fullWidth />
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  sectionLabel: { ...typography.h3, color: colors.text, marginBottom: spacing.md, marginTop: spacing.sm },
  uploadBox: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  uploadText: { ...typography.bodySmall, color: colors.textMuted, marginTop: spacing.sm },
});
