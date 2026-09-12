import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Switch } from 'react-native';
import { Stack, router, type Href } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { EmptyState } from '@/components/ui/EmptyState';
import { couponsService } from '@/services/api';
import { useActiveStoreId } from '@/hooks/useActiveStoreId';
import type { SellerCoupon } from '@/types/coupon';
import { colors, radius, spacing, typography } from '@/theme';

const COUPON_ADD_ROUTE = '/(app)/coupons/add' as Href;

function formatDiscount(coupon: SellerCoupon) {
  const value = parseFloat(coupon.value);
  if (coupon.type === 'PERCENTAGE') {
    return `${value}% off`;
  }
  return `₹${value} off`;
}

export default function CouponsScreen() {
  const queryClient = useQueryClient();
  const { storeId } = useActiveStoreId();

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['coupons', storeId],
    queryFn: () => couponsService.list(storeId),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      couponsService.update(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
    onError: () => Alert.alert('Error', 'Could not update coupon.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
    onError: () => Alert.alert('Error', 'Could not delete coupon.'),
  });

  function confirmDelete(coupon: SellerCoupon) {
    Alert.alert('Delete coupon', `Remove ${coupon.code}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(coupon.id),
      },
    ]);
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Coupons' }} />
      <ScreenWrapper scroll={false}>
        <Text style={styles.subtitle}>
          Offer discounts to your customers. Discounts are deducted from your payout.
        </Text>

        {isLoading ? (
          <Text style={styles.muted}>Loading coupons…</Text>
        ) : !coupons?.length ? (
          <EmptyState
            icon="pricetag-outline"
            title="No coupons yet"
            message="Create a coupon code for your customers to use at checkout."
            actionLabel="Create coupon"
            onAction={() => router.push(COUPON_ADD_ROUTE)}
          />
        ) : (
          <FlatList
            data={coupons}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.info}>
                    <Text style={styles.code}>{item.code}</Text>
                    <Text style={styles.meta}>
                      {formatDiscount(item)} · Min ₹{item.minOrderAmount} · Used {item.usedCount}
                      {item.usageLimit ? `/${item.usageLimit}` : ''}
                    </Text>
                  </View>
                  <Switch
                    value={item.isActive}
                    onValueChange={(v) => toggleMutation.mutate({ id: item.id, isActive: v })}
                  />
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() =>
                      router.push({ pathname: COUPON_ADD_ROUTE, params: { id: item.id } } as Href)
                    }
                  >
                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => confirmDelete(item)}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}

        {!!coupons?.length && (
          <TouchableOpacity style={styles.fab} onPress={() => router.push(COUPON_ADD_ROUTE)}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.md },
  muted: { ...typography.body, color: colors.textMuted },
  list: { paddingBottom: spacing.xxl, gap: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  info: { flex: 1, paddingRight: spacing.sm },
  code: { ...typography.h3, fontFamily: 'monospace' },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { ...typography.caption, color: colors.primary },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
