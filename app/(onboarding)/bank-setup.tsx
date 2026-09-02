import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, Stack } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { StepProgress } from '@/components/layout/StepProgress';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { usePartnerStore } from '@/stores/partnerStore';
import { bankService } from '@/services/api';
import { colors, spacing, typography } from '@/theme';

export default function BankSetupScreen() {
  const setOnboardingStep = usePartnerStore((s) => s.setOnboardingStep);
  const [form, setForm] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });
  const [loading, setLoading] = useState(false);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleContinue() {
    setLoading(true);
    try {
      await bankService.update(form);
      setOnboardingStep('pending_approval');
      router.replace('/(onboarding)/pending-approval');
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
