import { useState } from 'react';
import { Text, StyleSheet, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { StepProgress } from '@/components/layout/StepProgress';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { usePartnerStore } from '@/stores/partnerStore';
import { useAuthStore } from '@/stores/authStore';
import { onboardingService } from '@/services/api';
import type { BusinessDetails } from '@/types/partner';
import { formatPanInput, validateEmail, validatePanFormat } from '@/utils/validation';
import { colors, spacing, typography } from '@/theme';

export default function BusinessDetailsScreen() {
  const setBusinessDetails = usePartnerStore((s) => s.setBusinessDetails);
  const setProfile = usePartnerStore((s) => s.setProfile);
  const existing = usePartnerStore((s) => s.profile?.businessDetails);
  const partnerType = usePartnerStore((s) => s.profile?.partnerType);
  const authPhone = useAuthStore((s) => s.phone);
  const [loading, setLoading] = useState(false);

  const isStore = partnerType === 'STORE';
  const isFoodStore = partnerType === 'FOOD_STORE';

  const [form, setForm] = useState({
    fullName: existing?.fullName ?? '',
    storeName: existing?.storeName ?? '',
    businessName: existing?.businessName ?? '',
    businessType: existing?.businessType ?? '',
    mobile: existing?.mobile ?? authPhone ?? '',
    email: existing?.email ?? '',
    description: existing?.description ?? '',
    gstNumber: existing?.gstNumber ?? '',
    panNumber: existing?.panNumber ?? '',
  });

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleContinue() {
    if (isStore) {
      if (!form.fullName.trim() || !form.storeName.trim() || !form.email.trim()) {
        Alert.alert('Required', 'Please fill in all required fields');
        return;
      }
      if (!validateEmail(form.email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address');
        return;
      }
      if (!form.panNumber.trim()) {
        Alert.alert('Required', 'PAN number is required');
        return;
      }
      if (!validatePanFormat(form.panNumber)) {
        Alert.alert('Invalid PAN', 'Please enter a valid PAN number (e.g. ABCDE1234F)');
        return;
      }

      const details: BusinessDetails = {
        fullName: form.fullName.trim(),
        storeName: form.storeName.trim(),
        email: form.email.trim(),
        description: form.description.trim(),
        panNumber: form.panNumber.trim().toUpperCase(),
        mobile: authPhone ?? '',
        gstNumber: form.gstNumber.trim() || undefined,
      };
      setBusinessDetails(details);
      setLoading(true);
      try {
        const profile = await onboardingService.update({
          businessDetails: details,
          onboardingStep: 'store_details',
        });
        setProfile(profile);
        router.push('/(onboarding)/store-details');
      } catch {
        Alert.alert('Error', 'Could not save business details. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (isFoodStore) {
      if (!form.fullName.trim() || !form.businessName.trim() || !form.email.trim()) {
        Alert.alert('Required', 'Please fill in all required fields');
        return;
      }
      if (!validateEmail(form.email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address');
        return;
      }
      if (!form.panNumber.trim()) {
        Alert.alert('Required', 'PAN number is required');
        return;
      }
      if (!validatePanFormat(form.panNumber)) {
        Alert.alert('Invalid PAN', 'Please enter a valid PAN number (e.g. ABCDE1234F)');
        return;
      }

      const details: BusinessDetails = {
        fullName: form.fullName.trim(),
        businessName: form.businessName.trim(),
        businessType: form.businessType.trim() || 'Food / Restaurant',
        mobile: form.mobile.trim() || authPhone || '',
        email: form.email.trim(),
        description: form.description.trim(),
        panNumber: form.panNumber.trim().toUpperCase(),
        gstNumber: form.gstNumber.trim() || undefined,
      };
      setBusinessDetails(details);
      setLoading(true);
      try {
        const profile = await onboardingService.update({
          businessDetails: details,
          onboardingStep: 'food_setup',
        });
        setProfile(profile);
        router.push('/(onboarding)/food-setup');
      } catch {
        Alert.alert('Error', 'Could not save business details. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      const details: BusinessDetails = {
        fullName: form.fullName.trim(),
        businessName: form.businessName.trim(),
        businessType: form.businessType.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        description: form.description.trim(),
        panNumber: form.panNumber.trim(),
        gstNumber: form.gstNumber.trim() || undefined,
      };
      setBusinessDetails(details);
      setLoading(true);
      try {
        const profile = await onboardingService.update({
          businessDetails: details,
          onboardingStep: 'seller_setup',
        });
        setProfile(profile);
        router.push('/(onboarding)/seller-setup');
      } catch {
        Alert.alert('Error', 'Could not save business details. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  }

  if (isFoodStore) {
    return (
      <>
        <Stack.Screen options={{ title: 'Restaurant Details' }} />
        <ScreenWrapper>
          <StepProgress currentStep={2} totalSteps={5} />
          <Text style={styles.title}>Restaurant Details</Text>
          <Text style={styles.subtitle}>Tell us about your food business</Text>

          <Input label="Full Name *" value={form.fullName} onChangeText={(v) => update('fullName', v)} />
          <Input
            label="Restaurant / Business Name *"
            value={form.businessName}
            onChangeText={(v) => update('businessName', v)}
          />
          <Input
            label="Email *"
            value={form.email}
            onChangeText={(v) => update('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Restaurant Description"
            value={form.description}
            onChangeText={(v) => update('description', v)}
            multiline
            numberOfLines={3}
          />
          <Input label="GST Number (Optional)" value={form.gstNumber} onChangeText={(v) => update('gstNumber', v)} />
          <Input
            label="PAN Number *"
            value={form.panNumber}
            onChangeText={(v) => update('panNumber', formatPanInput(v))}
            autoCapitalize="characters"
            maxLength={10}
          />

          <Button title="Continue" onPress={handleContinue} loading={loading} fullWidth />
        </ScreenWrapper>
      </>
    );
  }

  if (isStore) {
    return (
      <>
        <Stack.Screen options={{ title: 'Store Details' }} />
        <ScreenWrapper>
          <StepProgress currentStep={2} totalSteps={5} />
          <Text style={styles.title}>Store Details</Text>
          <Text style={styles.subtitle}>Tell us about your store</Text>

          <Input label="Full Name *" value={form.fullName} onChangeText={(v) => update('fullName', v)} />
          <Input label="Store Name *" value={form.storeName} onChangeText={(v) => update('storeName', v)} />
          <Input label="Email *" value={form.email} onChangeText={(v) => update('email', v)} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Store Description" value={form.description} onChangeText={(v) => update('description', v)} multiline numberOfLines={3} />
          <Input label="GST Number (Optional)" value={form.gstNumber} onChangeText={(v) => update('gstNumber', v)} />
          <Input
            label="PAN Number *"
            value={form.panNumber}
            onChangeText={(v) => update('panNumber', formatPanInput(v))}
            autoCapitalize="characters"
            maxLength={10}
          />

          <Button title="Continue" onPress={handleContinue} loading={loading} fullWidth />
        </ScreenWrapper>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Business Details' }} />
      <ScreenWrapper>
        <StepProgress currentStep={2} totalSteps={5} />
        <Text style={styles.title}>Business Details</Text>
        <Text style={styles.subtitle}>Tell us about your business</Text>

        <Input label="Full Name *" value={form.fullName} onChangeText={(v) => update('fullName', v)} />
        <Input label="Business Name *" value={form.businessName} onChangeText={(v) => update('businessName', v)} />
        <Input label="Business Type *" value={form.businessType} onChangeText={(v) => update('businessType', v)} placeholder="e.g. Grocery, Fashion" />
        <Input label="Mobile Number *" value={form.mobile} onChangeText={(v) => update('mobile', v)} keyboardType="phone-pad" />
        <Input label="Email *" value={form.email} onChangeText={(v) => update('email', v)} keyboardType="email-address" />
        <Input label="Business Description" value={form.description} onChangeText={(v) => update('description', v)} multiline numberOfLines={3} />
        <Input label="GST Number (Optional)" value={form.gstNumber} onChangeText={(v) => update('gstNumber', v)} />
        <Input label="PAN Number (Optional)" value={form.panNumber} onChangeText={(v) => update('panNumber', v)} />

        <Button title="Continue" onPress={handleContinue} loading={loading} fullWidth />
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
});
