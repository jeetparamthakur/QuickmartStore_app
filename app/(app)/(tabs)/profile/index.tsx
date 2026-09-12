import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { ProfileMenuGroup, type ProfileMenuItem } from '@/components/profile/ProfileMenuGroup';
import { usePartnerStore } from '@/stores/partnerStore';
import { usePartnerProfile } from '@/hooks/usePartnerProfile';
import { usePermissions, useFeatureFlag } from '@/hooks/usePermissions';
import type { PartnerPermissions } from '@/types/partner';
import { useAuthStore } from '@/stores/authStore';
import { useStoreSwitcherStore } from '@/stores/storeSwitcherStore';
import { notificationsService } from '@/services/api';
import { maskPhone } from '@/utils/format';
import { colors, gradients, metricAccents, radius, shadows, spacing, typography } from '@/theme';

type MenuSection = {
  title: string;
  items: (ProfileMenuItem & {
    permission?: keyof PartnerPermissions;
    partnerTypes?: Array<'STORE' | 'INDEPENDENT_SELLER' | 'FOOD_STORE' | 'BRAND' | 'DARK_STORE'>;
  })[];
};

const menuSections: MenuSection[] = [
  {
    title: 'Account',
    items: [
      { label: 'Personal Information', icon: 'person-outline', route: '/(app)/settings/personal', iconBg: '#E8F5E9', iconColor: '#2E7D32', subtitle: 'Name, phone & email' },
      { label: 'Business Information', icon: 'business-outline', route: '/(app)/settings/business', iconBg: '#F1F8E9', iconColor: '#689F38', subtitle: 'Store, tax & location' },
      {
        label: 'Product Visibility',
        icon: 'navigate-outline',
        route: '/(app)/settings/product-visibility',
        iconBg: '#E3F2FD',
        iconColor: '#1565C0',
        subtitle: 'Pickup location & customer radius',
        partnerTypes: ['INDEPENDENT_SELLER'],
      },
      { label: 'Bank Details', icon: 'card-outline', route: '/(app)/settings/bank', iconBg: '#E8F0E8', iconColor: '#1B5E20', subtitle: 'Payout account' },
      { label: 'KYC Documents', icon: 'shield-checkmark-outline', route: '/(onboarding)/kyc', iconBg: '#FFEBEE', iconColor: '#C62828', subtitle: 'Verify your identity' },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Store Management', icon: 'storefront-outline', route: '/(app)/stores', permission: 'manageStores', iconBg: '#E8F5E9', iconColor: '#2E7D32' },
      { label: 'Staff', icon: 'people-outline', route: '/(app)/staff', permission: 'manageStaff', iconBg: '#F1F8E9', iconColor: '#689F38' },
      { label: 'Coupons', icon: 'pricetag-outline', route: '/(app)/coupons', iconBg: '#FFF3E0', iconColor: '#EF6C00', subtitle: 'Customer discount codes' },
      { label: 'Analytics', icon: 'bar-chart-outline', route: '/(app)/analytics', permission: 'viewAnalytics', iconBg: '#E8F0E8', iconColor: '#1B5E20' },
      { label: 'Inventory', icon: 'cube-outline', route: '/(app)/inventory', permission: 'manageInventory', iconBg: '#E8F5E9', iconColor: '#2E7D32' },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Notifications', icon: 'notifications-outline', route: '/(app)/notifications', iconBg: '#F1F8E9', iconColor: '#689F38' },
      { label: 'Help & Support', icon: 'help-circle-outline', route: '/(app)/support', iconBg: '#E8F5E9', iconColor: '#2E7D32' },
      { label: 'Settings', icon: 'settings-outline', route: '/(app)/settings', iconBg: '#E8F0E8', iconColor: '#64748B' },
    ],
  },
];

export default function ProfileScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const { profile, refresh } = usePartnerProfile();
  const logout = useAuthStore((s) => s.logout);
  const authPhone = useAuthStore((s) => s.phone);
  const permissions = usePermissions();
  const adsEnabled = useFeatureFlag('seller_ads_enabled');

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.list,
  });

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  const displayName =
    profile?.partnerType === 'STORE'
      ? (profile?.businessDetails?.storeName ?? profile?.storeDetails?.name ?? 'Store')
      : (profile?.businessDetails?.businessName ?? 'Business');

  const phone = profile?.businessDetails?.mobile || authPhone;
  const maskedPhone = phone ? maskPhone(phone) : undefined;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      refresh(),
    ]);
    setRefreshing(false);
  }, [queryClient, refresh]);

  async function handleLogout() {
    await logout();
    usePartnerStore.getState().reset();
    await useStoreSwitcherStore.getState().reset();
    router.replace('/(auth)/login');
  }

  const filteredSections = useMemo(
    () =>
      menuSections.map((section) => ({
        ...section,
        items: section.items
          .filter((item) => !item.permission || permissions[item.permission])
          .filter((item) => !item.partnerTypes || (profile?.partnerType && item.partnerTypes.includes(profile.partnerType)))
          .map((item) =>
            item.label === 'Notifications' ? { ...item, badge: unreadCount } : item,
          ),
      })),
    [permissions, unreadCount, profile?.partnerType],
  );

  const quickStats = [
    {
      key: 'orders',
      label: 'Orders',
      value: 'Manage',
      icon: 'receipt-outline' as const,
      route: '/(app)/(tabs)/orders',
      accent: metricAccents.orders,
    },
    {
      key: 'earnings',
      label: 'Earnings',
      value: 'View',
      icon: 'wallet-outline' as const,
      route: '/(app)/(tabs)/earnings',
      accent: metricAccents.earnings,
    },
    {
      key: 'products',
      label: 'Products',
      value: 'Catalog',
      icon: 'cube-outline' as const,
      route: '/(app)/(tabs)/products',
      accent: metricAccents.sales,
    },
  ];

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ScreenWrapper edges={['top']} refreshing={refreshing} onRefresh={onRefresh}>
      <ProfileHero
        name={profile?.name ?? 'Partner'}
        businessName={displayName}
        partnerType={profile?.partnerType}
        approvalStatus={profile?.approvalStatus}
        phone={maskedPhone}
        unreadCount={unreadCount}
        onEditPress={() => router.push('/(app)/settings/personal')}
        onNotificationsPress={() => router.push('/(app)/notifications')}
      />

      <View style={styles.quickStats}>
        {quickStats.map((stat) => (
          <TouchableOpacity
            key={stat.key}
            style={styles.quickStatCard}
            onPress={() => router.push(stat.route as any)}
            activeOpacity={0.75}
          >
            <View style={[styles.quickStatIcon, { backgroundColor: stat.accent.bg }]}>
              <Ionicons name={stat.icon} size={18} color={stat.accent.icon} />
            </View>
            <Text style={styles.quickStatLabel}>{stat.label}</Text>
            <Text style={styles.quickStatValue}>{stat.value}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {adsEnabled && (
        <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/(app)/products/add' as any)}>
          <LinearGradient colors={[...gradients.promo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.promoCard}>
            <View style={styles.promoContent}>
              <View style={styles.promoIconWrap}>
                <Ionicons name="rocket-outline" size={24} color={colors.white} />
              </View>
              <View style={styles.promoText}>
                <Text style={styles.promoTitle}>Promote Your Products</Text>
                <Text style={styles.promoDesc}>Boost visibility and reach more customers</Text>
              </View>
            </View>
            <View style={styles.promoCta}>
              <Ionicons name="arrow-forward" size={18} color={colors.white} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {filteredSections.map((section) => (
        <ProfileMenuGroup
          key={section.title}
          title={section.title}
          items={section.items}
          onItemPress={(route) => router.push(route as any)}
        />
      ))}

      <Button title="Sign Out" variant="danger" onPress={handleLogout} fullWidth style={styles.logout} />

      <Text style={styles.version}>Quickmart Partner · v{appVersion}</Text>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  quickStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickStatIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickStatLabel: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  quickStatValue: { ...typography.bodySmall, color: colors.primary, fontWeight: '600', marginTop: 2 },
  promoCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.md,
  },
  promoContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  promoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoText: { flex: 1 },
  promoTitle: { ...typography.bodyMedium, color: colors.white, fontWeight: '700' },
  promoDesc: { ...typography.caption, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  promoCta: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logout: { marginTop: spacing.sm },
  version: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xxxl,
  },
});
