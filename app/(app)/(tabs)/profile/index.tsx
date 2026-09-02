import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { usePartnerStore } from '@/stores/partnerStore';
import { useAuthStore } from '@/stores/authStore';
import { usePermissions, useFeatureFlag } from '@/hooks/usePermissions';
import { notificationsService } from '@/services/api';
import { colors, radius, spacing, typography } from '@/theme';

const menuSections = [
  {
    title: 'Account',
    items: [
      { label: 'Personal Information', icon: 'person-outline', route: '/(app)/settings' },
      { label: 'Business Information', icon: 'business-outline', route: '/(app)/settings' },
      { label: 'Bank Details', icon: 'card-outline', route: '/(app)/settings' },
      { label: 'KYC', icon: 'shield-checkmark-outline', route: '/(onboarding)/kyc' },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Store Management', icon: 'storefront-outline', route: '/(app)/stores', permission: 'manageStores' as const },
      { label: 'Staff', icon: 'people-outline', route: '/(app)/staff', permission: 'manageStaff' as const },
      { label: 'Analytics', icon: 'bar-chart-outline', route: '/(app)/analytics', permission: 'viewAnalytics' as const },
      { label: 'Inventory', icon: 'cube-outline', route: '/(app)/inventory', permission: 'manageInventory' as const },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Notifications', icon: 'notifications-outline', route: '/(app)/notifications' },
      { label: 'Help & Support', icon: 'help-circle-outline', route: '/(app)/support' },
      { label: 'Settings', icon: 'settings-outline', route: '/(app)/settings' },
    ],
  },
];

export default function ProfileScreen() {
  const profile = usePartnerStore((s) => s.profile);
  const logout = useAuthStore((s) => s.logout);
  const permissions = usePermissions();
  const adsEnabled = useFeatureFlag('seller_ads_enabled');

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.list,
  });

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  async function handleLogout() {
    await logout();
    usePartnerStore.getState().reset();
    router.replace('/(auth)/login');
  }

  return (
    <ScreenWrapper edges={['top']}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.name?.[0] ?? 'P'}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{profile?.name ?? 'Partner'}</Text>
          <Text style={styles.business}>{profile?.businessDetails?.businessName ?? 'Business'}</Text>
          <Text style={styles.type}>{profile?.partnerType?.replace('_', ' ')}</Text>
        </View>
      </View>

      {adsEnabled && (
        <TouchableOpacity style={styles.promoCard}>
          <Text style={styles.promoTitle}>Promote Your Product 🚀</Text>
          <Text style={styles.promoDesc}>Get more visibility for your products</Text>
        </TouchableOpacity>
      )}

      {menuSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item) => {
            if ('permission' in item && item.permission && !permissions[item.permission]) return null;
            return (
              <TouchableOpacity
                key={item.label}
                style={styles.menuItem}
                onPress={() => router.push(item.route as any)}
              >
                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={22} color={colors.textSecondary} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      <Button title="Logout" variant="danger" onPress={handleLogout} fullWidth style={styles.logout} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.white },
  profileInfo: { marginLeft: spacing.lg, flex: 1 },
  name: { ...typography.h2, color: colors.text },
  business: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  type: { ...typography.caption, color: colors.primary, marginTop: 4, textTransform: 'capitalize' },
  promoCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  promoTitle: { ...typography.bodyMedium, color: colors.text },
  promoDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  section: { marginBottom: spacing.xl },
  sectionTitle: { ...typography.caption, color: colors.textMuted, fontWeight: '600', marginBottom: spacing.sm, textTransform: 'uppercase' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  menuLabel: { ...typography.body, color: colors.text, flex: 1 },
  badge: {
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { ...typography.caption, color: colors.white, fontWeight: '700', fontSize: 10 },
  logout: { marginTop: spacing.md, marginBottom: spacing.xxxl },
});
