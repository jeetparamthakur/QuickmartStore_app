import { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { router, Stack } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { StepProgress } from '@/components/layout/StepProgress';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { usePartnerStore } from '@/stores/partnerStore';
import { colors, spacing, typography } from '@/theme';

export default function BusinessDetailsScreen() {
  const setBusinessDetails = usePartnerStore((s) => s.setBusinessDetails);
  const existing = usePartnerStore((s) => s.profile?.businessDetails);
  const partnerType = usePartnerStore((s) => s.profile?.partnerType);

  const [form, setForm] = useState({
    fullName: existing?.fullName ?? '',
    businessName: existing?.businessName ?? '',
    businessType: existing?.businessType ?? '',
    mobile: existing?.mobile ?? '',
    email: existing?.email ?? '',
    description: existing?.description ?? '',
    gstNumber: existing?.gstNumber ?? '',
    panNumber: existing?.panNumber ?? '',
  });

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleContinue() {
    setBusinessDetails(form);
    if (partnerType === 'STORE' || partnerType === 'DARK_STORE') {
      router.push('/(onboarding)/store-details');
    } else {
      router.push('/(onboarding)/seller-setup');
    }
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

        <Button title="Continue" onPress={handleContinue} fullWidth />
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
});
