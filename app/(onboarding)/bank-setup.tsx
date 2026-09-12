import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { StepProgress } from '@/components/layout/StepProgress';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { usePartnerStore } from '@/stores/partnerStore';
import { bankService, onboardingService } from '@/services/api';
import { colors, spacing, typography } from '@/theme';

export default function BankSetupScreen() {
  const setOnboardingStep = usePartnerStore((s) => s.setOnboardingStep);
  const setProfile = usePartnerStore((s) => s.setProfile);
  const bankDetails = usePartnerStore((s) => s.profile?.bankDetails);
  const [form, setForm] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bankDetails) return;
    setForm({
      accountHolderName: bankDetails.accountHolderName ?? '',
      bankName: bankDetails.bankName ?? '',
      accountNumber: bankDetails.accountNumber ?? '',
      ifscCode: bankDetails.ifscCode ?? '',
    });
  }, [bankDetails]);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleContinue() {
    if (!form.accountHolderName || !form.bankName || !form.accountNumber || !form.ifscCode) {
      Alert.alert('Required', 'Please fill in all bank details');
      return;
    }

    setLoading(true);
    try {
      await bankService.update(form);
      const profile = await onboardingService.complete(form);
      setProfile(profile);
      setOnboardingStep('pending_approval');
      router.replace('/(onboarding)/pending-approval');
    } catch {
      Alert.alert('Error', 'Could not submit for approval. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Bank & Payout' }} />
      <ScreenWrapper>
        <StepProgress currentStep={5} totalSteps={5} />
        <Text style={styles.title}>Bank & Payout Setup</Text>
        <Text style={styles.subtitle}>Add bank details to receive earnings</Text>

        <View style={styles.badge}>
          <StatusBadge label="Verification Pending" variant="warning" />
        </View>

        <Input label="Account Holder Name *" value={form.accountHolderName} onChangeText={(v) => update('accountHolderName', v)} />
        <Input label="Bank Name *" value={form.bankName} onChangeText={(v) => update('bankName', v)} />
        <Input label="Account Number *" value={form.accountNumber} onChangeText={(v) => update('accountNumber', v)} keyboardType="numeric" />
        <Input label="IFSC Code *" value={form.ifscCode} onChangeText={(v) => update('ifscCode', v)} autoCapitalize="characters" />

        <Button title="Submit for Approval" onPress={handleContinue} loading={loading} fullWidth />
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  badge: { marginBottom: spacing.xl, alignSelf: 'flex-start' },
});
