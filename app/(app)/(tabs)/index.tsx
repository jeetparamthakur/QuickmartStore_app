import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EarningsCard } from '@/components/cards/EarningsCard';
import { BannerCard } from '@/components/cards/BannerCard';
import { QuickActionButton } from '@/components/ui/QuickActionButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePartnerStore } from '@/stores/partnerStore';
import { usePartnerConfig, useFeatureFlag } from '@/hooks/usePermissions';
import { earningsService, bannersService } from '@/services/api';
import { colors, gradients, radius, shadows, spacing, typography } from '@/theme';

type MetricItem = {
  key: string;
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  isCurrency?: boolean;
  metricKey?: 'sales' | 'orders' | 'pending' | 'earnings' | 'default';
};

export default function DashboardScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const profile = usePartnerStore((s) => s.profile);
  const toggleStoreOpen = usePartnerStore((s) => s.toggleStoreOpen);
  const config = usePartnerConfig();
  const adsEnabled = useFeatureFlag('seller_ads_enabled');

  const { data: earnings, isLoading: earningsLoading } = useQuery({
    queryKey: ['earnings-summary'],
    queryFn: earningsService.getSummary,
  });

  const { data: banners } = useQuery({
    queryKey: ['banners'],
    queryFn: bannersService.list,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['earnings-summary'] }),
      queryClient.invalidateQueries({ queryKey: ['banners'] }),
    ]);
    setRefreshing(false);
  }, [queryClient]);

  const isOpen = profile?.isStoreOpen ?? false;

  const metrics: MetricItem[] = config.simplifiedDashboard
    ? [
        { key: 'orders', label: 'Orders', value: 24, icon: 'receipt-outline', metricKey: 'orders' },
        { key: 'earnings', label: 'Earnings', value: earnings?.today ?? 0, icon: 'wallet-outline', isCurrency: true, metricKey: 'earnings' },
      ]
    : [
        { key: 'sales', label: "Today's Sales", value: earnings?.today ?? 0, icon: 'cash-outline', isCurrency: true, metricKey: 'sales' },
        { key: 'orders', label: 'Orders', value: 24, icon: 'receipt-outline', metricKey: 'orders' },
        { key: 'pending', label: 'Pending', value: 5, icon: 'time-outline', metricKey: 'pending' },
        { key: 'earnings', label: 'Earnings', value: earnings?.pendingSettlement ?? 0, icon: 'wallet-outline', isCurrency: true, metricKey: 'earnings' },
      ];

  return (
    <ScreenWrapper edges={['top']} refreshing={refreshing} onRefresh={onRefresh}>
      <DashboardHeader name={profile?.name ?? 'Partner'} />

      <View style={[styles.statusCard, isOpen ? styles.statusCardOpen : styles.statusCardClosed]}>
        <View style={styles.statusLeft}>
          <Text style={styles.statusLabel}>Store Status</Text>
          <View style={[styles.statusPill, isOpen ? styles.statusPillOpen : styles.statusPillClosed]}>
            <View style={[styles.statusDot, { backgroundColor: isOpen ? colors.success : colors.textMuted }]} />
            <Text style={[styles.statusText, isOpen ? styles.statusTextOpen : styles.statusTextClosed]}>
              {isOpen ? 'OPEN' : 'CLOSED'}
            </Text>
          </View>
        </View>
        <Switch
          value={isOpen}
          onValueChange={toggleStoreOpen}
          trackColor={{ true: colors.primaryLight, false: colors.border }}
          thumbColor={isOpen ? colors.primary : colors.textMuted}
        />
      </View>

      <SectionHeader title="Today's Metrics" subtitle="Your performance at a glance" />
      {earningsLoading ? (
        <View style={styles.metricsRow}>
          <Skeleton height={120} style={{ width: 180, borderRadius: radius.xl }} />
          <Skeleton height={120} style={{ flex: 1, borderRadius: radius.lg }} />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsScroll}>
          {metrics.map((m, index) => (
            <EarningsCard
              key={m.key}
              label={m.label}
              value={m.value}
              icon={m.icon}
              isCurrency={m.isCurrency}
              variant={index === 0 ? 'featured' : 'default'}
              metricKey={m.metricKey}
            />
          ))}
        </ScrollView>
      )}

      <SectionHeader title="Quick Actions" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actions}>
        {config.quickActions.map((action) => (
          <QuickActionButton
            key={action.key}
            label={action.label}
            icon={action.icon as keyof typeof Ionicons.glyphMap}
            onPress={() => router.push(action.route as any)}
          />
        ))}
      </ScrollView>

      {banners && banners.length > 0 && (
        <>
          <SectionHeader title="Announcements" />
          {banners.map((b) => (
            <BannerCard key={b.id} banner={b} />
          ))}
        </>
      )}

      {adsEnabled && (
        <LinearGradient colors={[...gradients.promo]} style={styles.adsCard}>
          <Text style={styles.adsTitle}>Promote Your Product 🚀</Text>
          <Text style={styles.adsDesc}>Get more visibility and grow your sales</Text>
          <TouchableOpacity style={styles.adsBtn} activeOpacity={0.85}>
            <Text style={styles.adsBtnText}>Promote Now</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.md,
    borderLeftWidth: 4,
  },
  statusCardOpen: {
    backgroundColor: colors.successLight,
    borderLeftColor: colors.success,
  },
  statusCardClosed: {
    backgroundColor: colors.surfaceSecondary,
    borderLeftColor: colors.textMuted,
  },
  statusLeft: { flex: 1 },
  statusLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: 6,
  },
  statusPillOpen: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  statusPillClosed: { backgroundColor: colors.surface },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { ...typography.label, fontWeight: '700' },
  statusTextOpen: { color: colors.success },
  statusTextClosed: { color: colors.textMuted },
  metricsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  metricsScroll: { marginBottom: spacing.xl },
  actions: { gap: spacing.lg, paddingBottom: spacing.lg },
  adsCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginTop: spacing.md,
    ...shadows.md,
  },
  adsTitle: { ...typography.h3, color: colors.white },
  adsDesc: { ...typography.bodySmall, color: 'rgba(255,255,255,0.85)', marginTop: spacing.xs },
  adsBtn: {
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
  },
  adsBtnText: { ...typography.label, color: colors.primary, fontWeight: '700' },
});
