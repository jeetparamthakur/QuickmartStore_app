import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EarningsCard } from '@/components/cards/EarningsCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { earningsService } from '@/services/api';
import { formatCurrency } from '@/utils/format';
import { colors, radius, spacing, typography } from '@/theme';
import type { PayoutStatus } from '@/types/index';

const payoutVariant: Record<PayoutStatus, 'success' | 'warning' | 'danger'> = {
  completed: 'success',
  processing: 'warning',
  failed: 'danger',
};

export default function PayoutsScreen() {
  const { data: summary } = useQuery({
    queryKey: ['earnings-summary'],
    queryFn: earningsService.getSummary,
  });

  const { data: payouts } = useQuery({
    queryKey: ['payouts'],
    queryFn: earningsService.getPayouts,
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Payout Management' }} />
      <ScreenWrapper scroll={false}>
        {summary && (
          <View style={styles.summary}>
            <EarningsCard label="Available Balance" value={summary.availableBalance} icon="wallet-outline" isCurrency />
            <EarningsCard label="Pending Settlement" value={summary.pendingSettlement} icon="time-outline" isCurrency />
          </View>
        )}

        <Text style={styles.sectionTitle}>Payout History</Text>

        {!payouts?.length ? (
          <EmptyState icon="cash-outline" title="No Payouts" message="Your payout history will appear here." />
        ) : (
          <FlatList
            data={payouts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.payoutCard}>
                <View>
                  <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
                  <Text style={styles.date}>{item.date}</Text>
                  {item.reference && <Text style={styles.ref}>Ref: {item.reference}</Text>}
                </View>
                <StatusBadge label={item.status.toUpperCase()} variant={payoutVariant[item.status]} />
              </View>
            )}
          />
        )}
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  list: { paddingBottom: spacing.xxxl },
  payoutCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  amount: { ...typography.h3, color: colors.text },
  date: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  ref: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
});
