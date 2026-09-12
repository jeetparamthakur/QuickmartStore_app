import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { InfoSection } from '@/components/profile/InfoSection';
import { InfoRow } from '@/components/profile/InfoRow';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePartnerProfile } from '@/hooks/usePartnerProfile';
import { colors, radius, spacing, typography } from '@/theme';

const verificationVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  verified: 'success',
  pending: 'warning',
  failed: 'danger',
};

function displayValue(value?: string | null) {
  return value?.trim() ? value.trim() : '—';
}

export default function BankDetailsScreen() {
  const { profile, isLoading } = usePartnerProfile();
  const bank = profile?.bankDetails;

  const status = bank?.verificationStatus ?? 'pending';
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const hasBankData = Boolean(
    bank?.accountHolderName || bank?.bankName || bank?.accountNumber || bank?.ifscCode,
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Bank Details' }} />
      <ScreenWrapper>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="card" size={28} color={colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Payout Account</Text>
          <Text style={styles.headerSub}>Bank account used for settlements</Text>
          {!isLoading && hasBankData && (
            <StatusBadge label={statusLabel} variant={verificationVariant[status] ?? 'warning'} dot />
          )}
        </View>

        {isLoading && !hasBankData ? (
          <View style={styles.skeletons}>
            <Skeleton height={72} style={{ borderRadius: radius.lg, marginBottom: spacing.md }} />
            <Skeleton height={72} style={{ borderRadius: radius.lg, marginBottom: spacing.md }} />
            <Skeleton height={72} style={{ borderRadius: radius.lg }} />
          </View>
        ) : hasBankData ? (
          <InfoSection title="Account Details">
            <InfoRow icon="person-outline" label="Account Holder" value={displayValue(bank?.accountHolderName)} />
            <InfoRow icon="business-outline" label="Bank Name" value={displayValue(bank?.bankName)} />
            <InfoRow icon="keypad-outline" label="Account Number" value={displayValue(bank?.accountNumber)} />
            <InfoRow icon="code-outline" label="IFSC Code" value={displayValue(bank?.ifscCode)} isLast />
          </InfoSection>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="card-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No bank details yet</Text>
            <Text style={styles.emptyText}>
              Complete bank setup during onboarding to receive payouts.
            </Text>
          </View>
        )}

        <View style={styles.note}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
          <Text style={styles.noteText}>
            Your bank details are encrypted and used only for payout transfers.
          </Text>
        </View>
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: { ...typography.h2, color: colors.text },
  headerSub: { ...typography.body, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.sm },
  skeletons: { marginBottom: spacing.xl },
  empty: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  emptyTitle: { ...typography.bodyMedium, color: colors.text, marginTop: spacing.md },
  emptyText: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  noteText: { ...typography.caption, color: colors.textMuted, flex: 1, lineHeight: 18 },
});
