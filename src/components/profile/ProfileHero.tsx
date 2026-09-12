import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, radius, shadows, spacing, typography } from '@/theme';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getInitials } from '@/utils/format';
import type { ApprovalStatus, PartnerType } from '@/types/partner';
import { PARTNER_TYPE_LABELS } from '@/types/partner';

type Props = {
  name: string;
  businessName: string;
  partnerType?: PartnerType;
  approvalStatus?: ApprovalStatus;
  phone?: string;
  unreadCount?: number;
  onEditPress: () => void;
  onNotificationsPress: () => void;
};

const approvalConfig: Record<ApprovalStatus, { label: string; variant: 'success' | 'warning' | 'info' | 'danger' }> = {
  approved: { label: 'Verified', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  under_review: { label: 'Under Review', variant: 'info' },
  rejected: { label: 'Rejected', variant: 'danger' },
};

export function ProfileHero({
  name,
  businessName,
  partnerType,
  approvalStatus = 'pending',
  phone,
  unreadCount = 0,
  onEditPress,
  onNotificationsPress,
}: Props) {
  const approval = approvalConfig[approvalStatus];
  const partnerLabel = partnerType ? PARTNER_TYPE_LABELS[partnerType] : 'Partner';

  return (
    <LinearGradient colors={[...gradients.hero]} style={styles.gradient}>
      <View style={styles.topRow}>
        <Text style={styles.screenTitle}>Profile</Text>
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={onNotificationsPress} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onEditPress} activeOpacity={0.8}>
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.profileRow}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.business} numberOfLines={1}>{businessName}</Text>
          {phone ? <Text style={styles.phone}>{phone}</Text> : null}
          <View style={styles.badges}>
            <StatusBadge label={partnerLabel} variant="primary" />
            <StatusBadge label={approval.label} variant={approval.variant} dot />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    marginBottom: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  screenTitle: { ...typography.h2, color: colors.text },
  topActions: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.white,
  },
  notifBadgeText: { fontSize: 9, fontWeight: '700', color: colors.white },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  avatarRing: {
    padding: 3,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    ...shadows.md,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 26, fontWeight: '700', color: colors.white },
  info: { flex: 1 },
  name: { ...typography.h2, color: colors.primary },
  business: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  phone: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
});
