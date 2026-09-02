import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { EarningsCard } from '@/components/cards/EarningsCard';
import { BannerCard } from '@/components/cards/BannerCard';
import { QuickActionButton } from '@/components/ui/QuickActionButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePartnerStore } from '@/stores/partnerStore';
import { usePartnerConfig, useFeatureFlag } from '@/hooks/usePermissions';
import { earningsService, bannersService } from '@/services/api';
import { getGreeting, formatCurrency } from '@/utils/format';
import { colors, spacing, typography } from '@/theme';

export default function DashboardScreen() {
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

  const metrics = config.simplifiedDashboard
    ? [
        { key: 'orders', label: 'Orders', value: 24, icon: 'receipt-outline' as const },
        { key: 'earnings', label: 'Earnings', value: earnings?.today ?? 0, icon: 'wallet-outline' as const, isCurrency: true },
      ]
    : [
        { key: 'sales', label: "Today's Sales", value: earnings?.today ?? 0, icon: 'cash-outline' as const, isCurrency: true },
        { key: 'orders', label: 'Orders', value: 24, icon: 'receipt-outline' as const },
        { key: 'pending', label: 'Pending', value: 5, icon: 'time-outline' as const },
        { key: 'earnings', label: 'Earnings', value: earnings?.pendingSettlement ?? 0, icon: 'wallet-outline' as const, isCurrency: true },
      ];

  return (
    <ScreenWrapper edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}, {profile?.name ?? 'Partner'} 👋</Text>
          <Text style={styles.subGreeting}>Here's your business overview</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(app)/notifications')}>
          <Ionicons name="notifications-outline" size={26} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.statusCard}>
        <View>
          <Text style={styles.statusLabel}>Store Status</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: profile?.isStoreOpen ? colors.success : colors.textMuted }]} />
            <Text style={styles.statusText}>{profile?.isStoreOpen ? 'OPEN' : 'CLOSED'}</Text>
          </View>
        </View>
        <Switch
          value={profile?.isStoreOpen ?? false}
          onValueChange={toggleStoreOpen}
          trackColor={{ true: colors.successLight, false: colors.border }}
          thumbColor={profile?.isStoreOpen ? colors.success : colors.textMuted}
        />
      </View>

      <Text style={styles.sectionTitle}>Today's Metrics</Text>
      {earningsLoading ? (
        <View style={styles.metricsRow}>
          <Skeleton height={100} style={{ flex: 1 }} />
          <Skeleton height={100} style={{ flex: 1 }} />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsScroll}>
          {metrics.map((m) => (
            <EarningsCard
              key={m.key}
              label={m.label}
              value={m.isCurrency ? (m.value as number) : m.value}
              icon={m.icon}
              isCurrency={m.isCurrency}
            />
          ))}
        </ScrollView>
      )}

      <Text style={styles.sectionTitle}>Quick Actions</Text>
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
          <Text style={styles.sectionTitle}>Announcements</Text>
          {banners.map((b) => (
            <BannerCard key={b.id} banner={b} />
          ))}
        </>
      )}

      {adsEnabled && (
        <View style={styles.adsCard}>
          <Text style={styles.adsTitle}>Promote Your Product 🚀</Text>
          <Text style={styles.adsDesc}>Get More Visibility</Text>
          <TouchableOpacity style={styles.adsBtn}>
            <Text style={styles.adsBtnText}>Promote Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  greeting: { ...typography.h2, color: colors.text },
  subGreeting: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  statusLabel: { ...typography.caption, color: colors.textSecondary },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { ...typography.bodyMedium, color: colors.text, fontWeight: '700' },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  metricsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  metricsScroll: { marginBottom: spacing.xl },
  actions: { gap: spacing.lg, paddingBottom: spacing.lg },
  adsCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  adsTitle: { ...typography.bodyMedium, color: colors.text },
  adsDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  adsBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  adsBtnText: { ...typography.label, color: colors.white },
});
