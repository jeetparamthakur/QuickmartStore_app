import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { InfoSection } from '@/components/profile/InfoSection';
import { InfoRow } from '@/components/profile/InfoRow';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePartnerProfile } from '@/hooks/usePartnerProfile';
import { useAuthStore } from '@/stores/authStore';
import { formatPhone, getInitials } from '@/utils/format';
import { PARTNER_TYPE_LABELS } from '@/types/partner';
import { colors, gradients, radius, shadows, spacing, typography } from '@/theme';

function displayValue(value?: string | null) {
  return value?.trim() ? value.trim() : '—';
}

export default function PersonalInfoScreen() {
  const { profile, isLoading } = usePartnerProfile();
  const authPhone = useAuthStore((s) => s.phone);

  const name = profile?.businessDetails?.fullName ?? profile?.name;
  const mobile = profile?.businessDetails?.mobile || authPhone;
  const email = profile?.businessDetails?.email;
  const partnerType = profile?.partnerType ? PARTNER_TYPE_LABELS[profile.partnerType] : '—';

  if (isLoading && !profile?.businessDetails) {
    return (
      <>
        <Stack.Screen options={{ title: 'Personal Information' }} />
        <ScreenWrapper>
          <Skeleton height={180} style={{ borderRadius: radius.lg, marginBottom: spacing.xl }} />
          <Skeleton height={220} style={{ borderRadius: radius.lg, marginBottom: spacing.lg }} />
          <Skeleton height={140} style={{ borderRadius: radius.lg }} />
        </ScreenWrapper>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Personal Information' }} />
      <ScreenWrapper>
        <LinearGradient colors={[...gradients.hero]} style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(displayValue(name))}</Text>
          </View>
          <Text style={styles.heroName}>{displayValue(name)}</Text>
          <Text style={styles.heroSub}>{mobile ? formatPhone(mobile) : '—'}</Text>
          <StatusBadge label={partnerType} variant="primary" />
        </LinearGradient>

        <InfoSection title="Contact Details">
          <InfoRow icon="person-outline" label="Full Name" value={displayValue(name)} />
          <InfoRow icon="call-outline" label="Mobile Number" value={mobile ? formatPhone(mobile) : '—'} />
          <InfoRow icon="mail-outline" label="Email Address" value={displayValue(email)} isLast />
        </InfoSection>

        <InfoSection title="Account">
          <InfoRow icon="finger-print-outline" label="Partner ID" value={displayValue(profile?.id)} />
          <InfoRow
            icon="shield-checkmark-outline"
            label="Account Status"
            value={displayValue(profile?.approvalStatus?.replace('_', ' '))}
            isLast
          />
        </InfoSection>

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
          <Text style={styles.noteText}>
            These details are taken from your onboarding information and synced with your account.
          </Text>
        </View>
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.white },
  heroName: { ...typography.h2, color: colors.primary, textAlign: 'center' },
  heroSub: { ...typography.body, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.sm },
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
