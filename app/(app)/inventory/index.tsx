import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useActiveStoreId } from '@/hooks/useActiveStoreId';
import { inventoryService } from '@/services/api';
import { colors, radius, spacing, typography } from '@/theme';

export default function InventoryScreen() {
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { storeId, isReady, activeStore } = useActiveStoreId();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['inventory', storeId],
    queryFn: () => inventoryService.list(storeId),
    enabled: isReady,
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      inventoryService.updateStock(productId, quantity, storeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory', storeId] }),
  });

  function getQty(item: NonNullable<typeof data>[0]) {
    return quantities[item.productId] ?? item.available;
  }

  function adjustQty(productId: string, current: number, delta: number) {
    const newQty = Math.max(0, current + delta);
    setQuantities((q) => ({ ...q, [productId]: newQty }));
  }

  if (isLoading) {
    return (
      <ScreenWrapper>
        <Skeleton height={80} />
        <Skeleton height={80} style={{ marginTop: 12 }} />
      </ScreenWrapper>
    );
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <>
      <Stack.Screen options={{ title: 'Inventory' }} />
      <ScreenWrapper scroll={false}>
        {activeStore && <Text style={styles.storeLabel}>{activeStore.name}</Text>}
        {!data?.length ? (
          <EmptyState icon="cube-outline" title="No Inventory" message="Add products to manage inventory." />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const qty = getQty(item);
              return (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.name}>{item.productName}</Text>
                    <View style={[styles.stockBadge, {
                      backgroundColor: item.stockStatus === 'in_stock' ? colors.successLight :
                        item.stockStatus === 'low_stock' ? colors.warningLight : colors.dangerLight,
                    }]}>
                      <Text style={styles.stockText}>{item.stockStatus.replace('_', ' ')}</Text>
                    </View>
                  </View>
                  <Text style={styles.available}>Available: {qty} Units</Text>
                  <View style={styles.controls}>
                    <TouchableOpacity style={styles.btn} onPress={() => adjustQty(item.productId, qty, -1)}>
                      <Ionicons name="remove" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.qty}>{qty}</Text>
                    <TouchableOpacity style={styles.btn} onPress={() => adjustQty(item.productId, qty, 1)}>
                      <Ionicons name="add" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.updateBtn}
                      onPress={() => updateMutation.mutate({ productId: item.productId, quantity: qty })}
                    >
                      <Text style={styles.updateText}>Update Stock</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  storeLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md },
  list: { paddingBottom: spacing.xxxl },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { ...typography.bodyMedium, color: colors.text, flex: 1 },
  stockBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 12 },
  stockText: { ...typography.caption, fontWeight: '600', textTransform: 'capitalize' },
  available: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.sm },
  controls: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.sm },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { ...typography.h3, color: colors.text, minWidth: 40, textAlign: 'center' },
  updateBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  updateText: { ...typography.label, color: colors.white },
});
