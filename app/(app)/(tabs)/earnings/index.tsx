import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LineChart } from 'react-native-gifted-charts';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { EarningsCard } from '@/components/cards/EarningsCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { earningsService } from '@/services/api';
import { useActiveStoreId } from '@/hooks/useActiveStoreId';
import { formatCurrency } from '@/utils/format';
import { colors, spacing, typography } from '@/theme';

const PERIODS = ['Today', 'Week', 'Month'] as const;

export default function EarningsScreen() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('Week');
  const { storeId, isReady, activeStore } = useActiveStoreId();

  const { data: summary, isLoading, isError, refetch } = useQuery({
    queryKey: ['earnings-summary', storeId],
    queryFn: () => earningsService.getSummary(storeId),
    enabled: isReady,
  });

  const { data: chartData } = useQuery({
    queryKey: ['earnings-chart', period],
    queryFn: () => earningsService.getChart(period.toLowerCase()),
  });

  if (isError) {
    return (
      <ScreenWrapper scroll={false}>
        <ErrorState onRetry={() => refetch()} />
      </ScreenWrapper>
    );
  }

  const chartPoints = chartData?.map((d) => ({ value: d.value, label: d.label })) ?? [];

  return (
    <ScreenWrapper edges={['top']}>
      <Text style={styles.title}>Earnings</Text>
      {activeStore && <Text style={styles.storeLabel}>{activeStore.name}</Text>}

      {isLoading ? (
        <View style={styles.metricsRow}>
          <Skeleton height={100} style={{ flex: 1 }} />
          <Skeleton height={100} style={{ flex: 1 }} />
        </View>
      ) : summary ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsScroll}>
            <EarningsCard label="Today" value={summary.today} icon="today-outline" isCurrency />
            <EarningsCard label="This Week" value={summary.week} icon="calendar-outline" isCurrency />
            <EarningsCard label="This Month" value={summary.month} icon="calendar" isCurrency />
            <EarningsCard label="Total" value={summary.total} icon="trophy-outline" isCurrency />
          </ScrollView>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>{formatCurrency(summary.availableBalance)}</Text>

            {(summary.commissionRate != null || (summary.commissionTotal ?? 0) > 0) && (
              <View style={styles.commissionCard}>
                <View style={styles.commissionHeader}>
                  <Text style={styles.commissionTitle}>Platform Commission</Text>
                  {summary.commissionRate != null && (
                    <Text style={styles.commissionRate}>{summary.commissionRate}%</Text>
                  )}
                </View>
                {summary.commissionLabel && (
                  <Text style={styles.commissionMeta}>{summary.commissionLabel}</Text>
                )}
                {(summary.grossTotal ?? 0) > 0 && (
                  <View style={styles.commissionRow}>
                    <Text style={styles.commissionLabel}>Gross Sales</Text>
                    <Text style={styles.commissionValue}>{formatCurrency(summary.grossTotal ?? 0)}</Text>
                  </View>
                )}
                {(summary.commissionTotal ?? 0) > 0 && (
                  <View style={styles.commissionRow}>
                    <Text style={styles.commissionLabel}>Commission Deducted</Text>
                    <Text style={[styles.commissionValue, styles.commissionDeduction]}>
                      -{formatCurrency(summary.commissionTotal ?? 0)}
                    </Text>
                  </View>
                )}
                <View style={styles.commissionRow}>
                  <Text style={styles.commissionLabel}>Net Earnings</Text>
                  <Text style={styles.commissionValue}>{formatCurrency(summary.total)}</Text>
                </View>
                {summary.scheduledCommission && (
                  <Text style={styles.scheduledNote}>
                    {summary.scheduledCommission.rate}% from {summary.scheduledCommission.effectiveFrom} ({summary.scheduledCommission.ruleName})
                  </Text>
                )}
              </View>
            )}

            <View style={styles.settlementRow}>
              <View>
                <Text style={styles.settlementLabel}>Next Settlement</Text>
                <Text style={styles.settlementValue}>{formatCurrency(summary.nextSettlement)}</Text>
              </View>
              <View>
                <Text style={styles.settlementLabel}>Settlement Date</Text>
                <Text style={styles.settlementValue}>{summary.nextSettlementDate}</Text>
              </View>
            </View>
            <Button title="View Payouts" variant="secondary" onPress={() => router.push('/(app)/payouts')} fullWidth />
          </View>
        </>
      ) : (
        <EmptyState icon="wallet-outline" title="No Earnings" message="Your earnings will appear here." />
      )}

      <View style={styles.periodTabs}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodTab, period === p && styles.periodTabActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {chartPoints.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Sales Trend</Text>
          <LineChart
            data={chartPoints}
            width={Dimensions.get('window').width - 64}
            height={180}
            color={colors.primary}
            thickness={2}
            hideDataPoints={false}
            dataPointsColor={colors.primary}
            yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
          />
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  storeLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.lg },
  metricsRow: { flexDirection: 'row', gap: spacing.md },
  metricsScroll: { marginBottom: spacing.lg },
  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  balanceLabel: { ...typography.bodySmall, color: colors.textSecondary },
  balanceValue: { ...typography.display, color: colors.primary, marginVertical: spacing.sm },
  commissionCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commissionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  commissionTitle: { ...typography.bodyMedium, color: colors.text, fontWeight: '600' },
  commissionRate: { ...typography.h3, color: colors.warning },
  commissionMeta: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.sm },
  commissionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  commissionLabel: { ...typography.caption, color: colors.textSecondary },
  commissionValue: { ...typography.bodySmall, color: colors.text, fontWeight: '600' },
  commissionDeduction: { color: colors.danger },
  scheduledNote: {
    ...typography.caption,
    color: colors.warning,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settlementRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  settlementLabel: { ...typography.caption, color: colors.textMuted },
  settlementValue: { ...typography.bodyMedium, color: colors.text, marginTop: 2 },
  periodTabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  periodTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  periodText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '600' },
  periodTextActive: { color: colors.white },
  chartContainer: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.lg },
  chartTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.md },
});
