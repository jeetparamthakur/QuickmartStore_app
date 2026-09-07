import { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { usePartnerStore } from '@/stores/partnerStore';
import { partnerService } from '@/services/api';
import { setOnboardingComplete } from '@/stores/authStore';
import { syncOnboardingComplete } from '@/utils/syncOnboarding';
import { colors, spacing, typography } from '@/theme';

export default function PendingApprovalScreen() {
  const profile = usePartnerStore((s) => s.profile);
  const setProfile = usePartnerStore((s) => s.setProfile);
  const setApprovalStatus = usePartnerStore((s) => s.setApprovalStatus);

  useFocusEffect(
    useCallback(() => {
      async function refresh() {
        try {
          const updated = await partnerService.getProfile();
          setProfile(updated);
          await syncOnboardingComplete(updated);
          if (updated.approvalStatus === 'approved' && updated.onboardingStep === 'completed') {
            router.replace('/(app)/(tabs)');
          }
        } catch {
          // ignore refresh errors
        }
      }
      refresh();
    }, [setProfile]),
  );

  async function handleDemoApprove() {
    setApprovalStatus('approved');
    await setOnboardingComplete(true);
    router.replace('/(app)/(tabs)');
  }

  const status = profile?.approvalStatus ?? 'pending';
  const statusVariant = {
    pending: 'warning' as const,
    under_review: 'info' as const,
    approved: 'success' as const,
    rejected: 'danger' as const,
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Approval Status' }} />
      <ScreenWrapper scroll={false}>
        <View style={styles.container}>
          <View style={styles.iconWrap}>
            <Ionicons
              name={status === 'rejected' ? 'close-circle' : 'hourglass-outline'}
              size={64}
              color={status === 'rejected' ? colors.danger : colors.warning}
            />
          </View>
          <StatusBadge
            label={status.replace('_', ' ').toUpperCase()}
            variant={statusVariant[status]}
          />
          <Text style={styles.title}>
            {status === 'rejected' ? 'Verification Rejected' : 'Awaiting Admin Approval'}
          </Text>
          <Text style={styles.message}>
            {status === 'rejected'
              ? 'Your documents were rejected. Please re-upload and resubmit.'
              : 'Your application is under review. We will notify you once approved. This usually takes 24-48 hours.'}
          </Text>

          {status === 'rejected' && (
            <Button title="Re-upload Documents" onPress={() => router.push('/(onboarding)/kyc')} fullWidth />
          )}

          {__DEV__ && (
            <Button
              title="Continue (Demo Approved)"
              onPress={handleDemoApprove}
              variant="secondary"
              fullWidth
              style={styles.demoBtn}
            />
          )}
        </View>
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  iconWrap: { marginBottom: spacing.lg },
  title: { ...typography.h2, color: colors.text, textAlign: 'center', marginTop: spacing.lg },
  message: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md },
  demoBtn: { marginTop: spacing.xl },
});
