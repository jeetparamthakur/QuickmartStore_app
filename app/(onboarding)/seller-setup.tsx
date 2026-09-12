import { useState } from 'react';
import { Text, StyleSheet, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { StepProgress } from '@/components/layout/StepProgress';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LocationPicker } from '@/components/location/LocationPicker';
import { AddressSearchInput } from '@/components/location/AddressSearchInput';
import { DeliveryRadiusSlider } from '@/components/location/DeliveryRadiusSlider';
import { useCityMapFocus } from '@/hooks/useCityMapFocus';
import { usePartnerStore } from '@/stores/partnerStore';
import { onboardingService } from '@/services/api';
import type { AddressResult } from '@/utils/address';
import { colors, spacing, typography } from '@/theme';

export default function SellerSetupScreen() {
  const setSellerSetup = usePartnerStore((s) => s.setSellerSetup);
  const setProfile = usePartnerStore((s) => s.setProfile);
  const businessDetails = usePartnerStore((s) => s.profile?.businessDetails);
  const existing = usePartnerStore((s) => s.profile?.sellerSetup);

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

  async function handleContinue() {
    if (!form.city || form.pincode.length !== 6) {
      Alert.alert('Required', 'Please enter city and pincode');
      return;
    }
    if (!form.latitude || !form.longitude) {
      Alert.alert('Required', 'Please pin your pickup location on the map');
      return;
    }
    const sellerSetup = {
      sellerName: businessDetails?.fullName?.trim() ?? existing?.sellerName ?? '',
      shopName: businessDetails?.businessName?.trim() || existing?.shopName,
      ...form,
    };
    setSellerSetup(sellerSetup);
    setLoading(true);
    try {
      const profile = await onboardingService.update({
        sellerSetup,
        onboardingStep: 'kyc',
      });
      setProfile(profile);
      router.push('/(onboarding)/kyc');
    } catch {
      Alert.alert('Error', 'Could not save seller setup. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Seller Setup' }} />
      <ScreenWrapper>
        <StepProgress currentStep={3} totalSteps={5} />
        <Text style={styles.title}>Independent Seller Setup</Text>
        <Text style={styles.subtitle}>Set pickup location and product visibility radius</Text>

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
        <Input label="Pickup Address *" value={form.pickupAddress} onChangeText={(v) => update('pickupAddress', v)} multiline />

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
        />

        <Button title="Continue" onPress={handleContinue} loading={loading} fullWidth />
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  sectionLabel: { ...typography.h3, color: colors.text, marginBottom: spacing.md, marginTop: spacing.sm },
});
