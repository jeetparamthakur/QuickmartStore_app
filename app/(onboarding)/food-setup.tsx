import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { StepProgress } from '@/components/layout/StepProgress';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LocationPicker } from '@/components/location/LocationPicker';
import { AddressSearchInput } from '@/components/location/AddressSearchInput';
import { DeliveryRadiusSlider } from '@/components/location/DeliveryRadiusSlider';
import { useCityMapFocus } from '@/hooks/useCityMapFocus';
import { usePartnerStore } from '@/stores/partnerStore';
import { useAuthStore } from '@/stores/authStore';
import { onboardingService } from '@/services/api';
import type { AddressResult } from '@/utils/address';
import { colors, radius, spacing, typography } from '@/theme';

export default function FoodSetupScreen() {
  const setFoodSetup = usePartnerStore((s) => s.setFoodSetup);
  const setProfile = usePartnerStore((s) => s.setProfile);
  const existing = usePartnerStore((s) => s.profile?.foodSetup);
  const businessDetails = usePartnerStore((s) => s.profile?.businessDetails);
  const authPhone = useAuthStore((s) => s.phone);
  const [loading, setLoading] = useState(false);
  const { mapFocus, onCityChange, markCityFromAddress } = useCityMapFocus();

  const [form, setForm] = useState({
    name: existing?.name ?? businessDetails?.businessName ?? businessDetails?.storeName ?? '',
    description: existing?.description ?? businessDetails?.description ?? '',
    cuisine: existing?.cuisine ?? '',
    address: existing?.address ?? '',
    city: existing?.city ?? '',
    area: existing?.area ?? '',
    pincode: existing?.pincode ?? '',
    latitude: existing?.latitude ?? 0,
    longitude: existing?.longitude ?? 0,
    openingTime: existing?.openingTime ?? '08:00',
    closingTime: existing?.closingTime ?? '22:00',
    is24Hours: existing?.is24Hours ?? false,
    deliveryRadius: existing?.deliveryRadius ?? 5,
  });

  function update(key: string, value: string | number | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function applyAddress(result: AddressResult) {
    markCityFromAddress();
    setForm((current) => ({
      ...current,
      address: result.addressLine,
      city: result.city || current.city,
      area: result.area || current.area,
      pincode: result.pincode || current.pincode,
      latitude: result.latitude,
      longitude: result.longitude,
    }));
  }

  function handleCityChange(city: string) {
    update('city', city);
    onCityChange(city);
  }

  async function handleContinue() {
    if (!form.name.trim()) {
      Alert.alert('Required', 'Please enter restaurant name');
      return;
    }
    if (!form.city || form.pincode.length !== 6) {
      Alert.alert('Required', 'Please enter city and 6-digit pincode');
      return;
    }
    if (!form.latitude || !form.longitude) {
      Alert.alert('Required', 'Please pin your restaurant location on the map');
      return;
    }

    const foodSetup = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      cuisine: form.cuisine.trim() || undefined,
      contactNumber: authPhone ?? existing?.contactNumber ?? '',
      openingTime: form.is24Hours ? '00:00' : form.openingTime,
      closingTime: form.is24Hours ? '23:59' : form.closingTime,
    };

    setFoodSetup(foodSetup);
    setLoading(true);
    try {
      const profile = await onboardingService.update({
        foodSetup,
        onboardingStep: 'kyc',
      });
      setProfile(profile);
      router.push('/(onboarding)/kyc');
    } catch {
      Alert.alert('Error', 'Could not save food setup. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Food Setup' }} />
      <ScreenWrapper>
        <StepProgress currentStep={3} totalSteps={5} />
        <Text style={styles.title}>Restaurant Setup</Text>
        <Text style={styles.subtitle}>
          Set your restaurant location, hours, and delivery area
        </Text>

        <Input
          label="Restaurant Name *"
          value={form.name}
          onChangeText={(v) => update('name', v)}
        />
        <Input
          label="Description"
          value={form.description}
          onChangeText={(v) => update('description', v)}
          multiline
          numberOfLines={3}
        />
        <Input
          label="Cuisine Type"
          value={form.cuisine}
          onChangeText={(v) => update('cuisine', v)}
          placeholder="e.g. North Indian, Chinese"
        />

        <Text style={styles.sectionLabel}>Restaurant Location</Text>
        <AddressSearchInput
          onSelect={applyAddress}
          placeholder="Search restaurant address on Google Maps..."
        />
        <Input
          label="City *"
          value={form.city}
          onChangeText={handleCityChange}
          placeholder="e.g. Ludhiana"
        />
        <Input
          label="Area / Locality *"
          value={form.area}
          onChangeText={(v) => update('area', v)}
          placeholder="e.g. Model Town"
        />
        <Input
          label="Pincode *"
          value={form.pincode}
          onChangeText={(v) => update('pincode', v.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
        />
        <Input
          label="Address *"
          value={form.address}
          onChangeText={(v) => update('address', v)}
          multiline
        />

        <LocationPicker
          latitude={form.latitude}
          longitude={form.longitude}
          deliveryRadiusKm={form.deliveryRadius}
          mapFocus={mapFocus}
          onCurrentLocationResolved={applyAddress}
          onLocationChange={(lat, lng) => {
            setForm((current) => ({ ...current, latitude: lat, longitude: lng }));
          }}
          label="Pin restaurant location on map *"
        />

        <DeliveryRadiusSlider
          value={form.deliveryRadius}
          onChange={(v) => update('deliveryRadius', v)}
        />

        <Text style={styles.sectionLabel}>Operating Hours</Text>
        <Pressable
          style={styles.hoursOption}
          onPress={() => update('is24Hours', !form.is24Hours)}
        >
          <View style={[styles.checkbox, form.is24Hours && styles.checkboxChecked]}>
            {form.is24Hours && <Ionicons name="checkmark" size={14} color={colors.white} />}
          </View>
          <View style={styles.hoursOptionText}>
            <Text style={styles.hoursOptionTitle}>24 Hours Service</Text>
            <Text style={styles.hoursOptionHint}>Restaurant is open round the clock</Text>
          </View>
        </Pressable>

        {!form.is24Hours && (
          <>
            <Input
              label="Opening Time"
              value={form.openingTime}
              onChangeText={(v) => update('openingTime', v)}
              placeholder="08:00"
            />
            <Input
              label="Closing Time"
              value={form.closingTime}
              onChangeText={(v) => update('closingTime', v)}
              placeholder="22:00"
            />
          </>
        )}

        <Button title="Continue" onPress={handleContinue} loading={loading} fullWidth />
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
  hoursOptionTitle: { ...typography.body, color: colors.text, fontWeight: '600', marginBottom: spacing.xs },
  hoursOptionHint: { ...typography.bodySmall, color: colors.textSecondary },
});
