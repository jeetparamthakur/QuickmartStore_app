import { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Redirect, router, Stack } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LocationPicker } from '@/components/location/LocationPicker';
import { AddressSearchInput } from '@/components/location/AddressSearchInput';
import { DeliveryRadiusSlider } from '@/components/location/DeliveryRadiusSlider';
import { useCityMapFocus } from '@/hooks/useCityMapFocus';
import { usePartnerProfile } from '@/hooks/usePartnerProfile';
import { usePartnerStore } from '@/stores/partnerStore';
import { onboardingService } from '@/services/api';
import { preservePartnerAccess } from '@/services/api/mappers/partnerProfile';
import { appAlert } from '@/utils/appDialog';
import type { AddressResult } from '@/utils/address';
import { colors, spacing, typography } from '@/theme';

export default function ProductVisibilityScreen() {
  const { profile } = usePartnerProfile({ refreshOnFocus: false });
  const setProfile = usePartnerStore((s) => s.setProfile);
  const existing = profile?.sellerSetup;
  const businessDetails = profile?.businessDetails;

  const [form, setForm] = useState({
    pickupAddress: existing?.pickupAddress ?? '',
    city: existing?.city ?? '',
    area: existing?.area ?? '',
    pincode: existing?.pincode ?? '',
    latitude: existing?.latitude ?? 0,
    longitude: existing?.longitude ?? 0,
    deliveryRadius: existing?.deliveryRadius ?? 5,
    deliveryPreference: existing?.deliveryPreference ?? 'platform',
  });
  const [loading, setLoading] = useState(false);
  const { mapFocus, onCityChange, markCityFromAddress } = useCityMapFocus();

  useEffect(() => {
    if (!existing) return;
    setForm({
      pickupAddress: existing.pickupAddress ?? '',
      city: existing.city ?? '',
      area: existing.area ?? '',
      pincode: existing.pincode ?? '',
      latitude: existing.latitude ?? 0,
      longitude: existing.longitude ?? 0,
      deliveryRadius: existing.deliveryRadius ?? 5,
      deliveryPreference: existing.deliveryPreference ?? 'platform',
    });
  }, [existing]);

  if (profile && profile.partnerType !== 'INDEPENDENT_SELLER') {
    return <Redirect href="/(app)/settings/business" />;
  }

  function update(key: string, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function applyAddress(result: AddressResult) {
    markCityFromAddress();
    setForm((f) => ({
      ...f,
      pickupAddress: result.addressLine,
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

  async function handleSave() {
    if (!form.city || form.pincode.length !== 6) {
      appAlert('Required', 'Please enter city and 6-digit pincode');
      return;
    }
    if (!form.latitude || !form.longitude) {
      appAlert('Required', 'Please pin your pickup location on the map');
      return;
    }

    const sellerSetup = {
      sellerName: existing?.sellerName ?? businessDetails?.fullName?.trim() ?? '',
      shopName: existing?.shopName ?? businessDetails?.businessName?.trim(),
      ...form,
    };

    setLoading(true);
    try {
      const currentProfile = usePartnerStore.getState().profile;
      const updated = await onboardingService.update({ sellerSetup });
      setProfile(preservePartnerAccess(currentProfile, updated));
      appAlert(
        'Saved',
        `Products will be visible to customers within ${Math.round(form.deliveryRadius)} km of your pickup location.`,
        [{ text: 'Done', onPress: () => router.back() }],
      );
    } catch {
      appAlert('Error', 'Could not save product visibility settings. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Product Visibility' }} />
      <ScreenWrapper>
        <Text style={styles.title}>Product Visibility</Text>
        <Text style={styles.subtitle}>
          Customers inside your visibility radius can see your products. Customers outside this range will not see them.
        </Text>

        <Text style={styles.sectionLabel}>Pickup Location</Text>
        <AddressSearchInput onSelect={applyAddress} placeholder="Search pickup address..." />
        <Input label="City *" value={form.city} onChangeText={handleCityChange} />
        <Input label="Area *" value={form.area} onChangeText={(v) => update('area', v)} />
        <Input
          label="Pincode *"
          value={form.pincode}
          onChangeText={(v) => update('pincode', v.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
        />
        <Input
          label="Pickup Address *"
          value={form.pickupAddress}
          onChangeText={(v) => update('pickupAddress', v)}
          multiline
        />

        <LocationPicker
          latitude={form.latitude}
          longitude={form.longitude}
          deliveryRadiusKm={form.deliveryRadius}
          mapFocus={mapFocus}
          onCurrentLocationResolved={applyAddress}
          onLocationChange={(lat, lng) => {
            setForm((f) => ({ ...f, latitude: lat, longitude: lng }));
          }}
        />

        <DeliveryRadiusSlider
          value={form.deliveryRadius}
          onChange={(v) => update('deliveryRadius', v)}
          hint={`Customers within ${Math.round(form.deliveryRadius)} km of your pickup location will see your products.`}
        />

        <Button title="Save Changes" onPress={handleSave} loading={loading} fullWidth />
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  sectionLabel: { ...typography.h3, color: colors.text, marginBottom: spacing.md, marginTop: spacing.sm },
});
