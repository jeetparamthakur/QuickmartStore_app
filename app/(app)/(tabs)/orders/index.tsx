import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useTabScreenInsets } from '@/hooks/useTabScreenInsets';
import { OrderCard } from '@/components/cards/OrderCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { usePartnerConfig } from '@/hooks/usePermissions';
import { useActiveStoreId } from '@/hooks/useActiveStoreId';
import { ordersService } from '@/services/api';
import { ORDER_TABS, ORDER_STATUS_LABELS, type OrderStatus } from '@/types/order';
import { getPrepTimeRemaining } from '@/utils/format';
import { colors, spacing, typography } from '@/theme';

export default function OrdersScreen() {
  const { contentPaddingBottom } = useTabScreenInsets();
  const [activeTab, setActiveTab] = useState<OrderStatus>('new');
  const [prepTimes, setPrepTimes] = useState<Record<string, string>>({});
  const config = usePartnerConfig();
  const queryClient = useQueryClient();
  const { storeId, isReady, activeStore } = useActiveStoreId();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orders', activeTab, storeId],
    queryFn: () => ordersService.list(activeTab, storeId),
    enabled: isReady,
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => ordersService.updateStatus(id, 'accepted'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => ordersService.updateStatus(id, 'cancelled'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (!data) return;
      const times: Record<string, string> = {};
      data.forEach((o) => {
        if (o.prepDeadline) times[o.id] = getPrepTimeRemaining(o.prepDeadline);
      });
      setPrepTimes(times);
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const renderOrder = useCallback(
    ({ item }: { item: NonNullable<typeof data>[0] }) => (
      <OrderCard
        order={item}
        onPress={() => router.push(`/(app)/orders/${item.id}`)}
        onAccept={() => acceptMutation.mutate(item.id)}
        onReject={() => rejectMutation.mutate(item.id)}
        showTimer={config.showPrepTimer && (item.status === 'new' || item.status === 'preparing')}
        prepTime={prepTimes[item.id]}
      />
    ),
    [acceptMutation, rejectMutation, config.showPrepTimer, prepTimes]
  );

  return (
    <ScreenWrapper scroll={false} edges={['top']}>
      <Text style={styles.title}>Orders</Text>
      {activeStore && (
        <Text style={styles.storeLabel}>{activeStore.name}</Text>
      )}

      <View style={styles.tabs}>
        {ORDER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {ORDER_STATUS_LABELS[tab]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.list}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : isError ? (
        <ErrorState type="network" onRetry={() => refetch()} />
      ) : !data?.length ? (
        <EmptyState
          icon="receipt-outline"
          title="No Orders Yet"
          message={`You don't have any ${ORDER_STATUS_LABELS[activeTab].toLowerCase()} orders.`}
        />
      ) : (
        <FlatList
          data={data}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: contentPaddingBottom }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  storeLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.lg },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: colors.white },
  list: { paddingBottom: spacing.xxxl },
});
