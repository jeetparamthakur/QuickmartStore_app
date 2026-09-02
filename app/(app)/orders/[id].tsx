import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { ordersService, storesService } from '@/services/api';
import { formatCurrency, getPrepTimeRemaining, maskPhone } from '@/utils/format';
import type { OrderStatus } from '@/types/order';
import { DELIVERY_REQUEST_STATUS_LABELS } from '@/types/order';
import { colors, radius, spacing, typography } from '@/theme';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [prepTime, setPrepTime] = useState('--:--');
  const queryClient = useQueryClient();

  const { data: order, isLoading, isError, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersService.get(id!),
    enabled: !!id,
  });

  const { data: store } = useQuery({
    queryKey: ['store', order?.storeId],
    queryFn: () => storesService.get(order!.storeId!),
    enabled: !!order?.storeId,
  });

  const updateMutation = useMutation({
    mutationFn: (status: OrderStatus) => ordersService.updateStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
  });

  const requestDeliveryMutation = useMutation({
    mutationFn: () => ordersService.requestDelivery(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: (err: Error) => Alert.alert('Unable to Request', err.message),
  });

  const cancelDeliveryMutation = useMutation({
    mutationFn: () => ordersService.cancelDeliveryRequest(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: (err: Error) => Alert.alert('Unable to Cancel', err.message),
  });

  useEffect(() => {
    if (!order?.prepDeadline) return;
    const interval = setInterval(() => {
      setPrepTime(getPrepTimeRemaining(order.prepDeadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [order?.prepDeadline]);

  if (isLoading) {
    return (
      <ScreenWrapper>
        <Skeleton height={200} />
        <Skeleton height={20} style={{ marginTop: 16 }} />
        <Skeleton height={20} style={{ marginTop: 8 }} />
      </ScreenWrapper>
    );
  }

  if (isError || !order) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  const showCustomerDetails = order.status !== 'new';
  const isPlatformReady = order.status === 'ready' && order.deliveryType === 'platform';
  const platformDisabled = !!order.storeId && store && !store.platformDeliveryEnabled;
  const canRequestDelivery =
    isPlatformReady &&
    (order.deliveryRequestStatus === 'none' || order.deliveryRequestStatus === 'rejected') &&
    !platformDisabled;

  return (
    <>
      <Stack.Screen options={{ title: `Order #${order.orderNumber}` }} />
      <ScreenWrapper>
        <View style={styles.header}>
          <Text style={styles.orderNum}>Order #{order.orderNumber}</Text>
          <StatusBadge label={order.status.toUpperCase()} variant="primary" />
        </View>

        {order.prepDeadline && (
          <View style={styles.timerCard}>
            <Text style={styles.timerLabel}>Prepare within</Text>
            <Text style={styles.timerValue}>{prepTime}</Text>
          </View>
        )}

        {isPlatformReady && order.deliveryRequestStatus !== 'none' && (
          <View style={styles.deliveryCard}>
            <Text style={styles.deliveryCardTitle}>Delivery Partner Status</Text>
            <Text style={styles.deliveryCardStatus}>
              {getDeliveryStatusMessage(order.deliveryRequestStatus, order.assignedPartnerName)}
            </Text>
            {order.deliveryRequestStatus === 'requested' && (
              <Text style={styles.deliveryCardHint}>
                Waiting for a delivery partner to accept this request
              </Text>
            )}
          </View>
        )}

        {showCustomerDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Details</Text>
            {order.customerName && <Text style={styles.detail}>{order.customerName}</Text>}
            {order.customerPhone && <Text style={styles.detail}>{maskPhone(order.customerPhone)}</Text>}
            {order.customerAddress && <Text style={styles.detail}>{order.customerAddress}</Text>}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Products</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.variant && <Text style={styles.itemVariant}>{item.variant}</Text>}
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Product Total</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount</Text>
            <Text style={styles.summaryValue}>-{formatCurrency(order.discount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.deliveryFee)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Platform Charges</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.platformCharges)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Final Amount</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {order.status === 'new' && (
            <>
              <Button title="Accept Order" onPress={() => updateMutation.mutate('accepted')} fullWidth />
              <Button title="Reject Order" variant="danger" onPress={() => updateMutation.mutate('cancelled')} fullWidth />
            </>
          )}
          {order.status === 'accepted' && (
            <Button title="Start Preparing" onPress={() => updateMutation.mutate('preparing')} fullWidth />
          )}
          {order.status === 'preparing' && (
            <Button title="Mark Ready for Pickup" onPress={() => updateMutation.mutate('ready')} fullWidth />
          )}
          {canRequestDelivery && (
            <Button
              title={order.deliveryRequestStatus === 'rejected' ? 'Request Delivery Again' : 'Request Delivery Partner'}
              onPress={() => requestDeliveryMutation.mutate()}
              loading={requestDeliveryMutation.isPending}
              fullWidth
            />
          )}
          {isPlatformReady && order.deliveryRequestStatus === 'requested' && (
            <Button
              title="Cancel Delivery Request"
              variant="secondary"
              onPress={() => cancelDeliveryMutation.mutate()}
              loading={cancelDeliveryMutation.isPending}
              fullWidth
            />
          )}
          {platformDisabled && isPlatformReady && order.deliveryRequestStatus === 'none' && (
            <Text style={styles.disabledHint}>
              Platform delivery is disabled for this store. Enable it in Delivery Partner Settings.
            </Text>
          )}
          {order.status === 'ready' && order.deliveryType !== 'platform' && (
            <Button title="Mark Completed" onPress={() => updateMutation.mutate('completed')} fullWidth />
          )}
        </View>
      </ScreenWrapper>
    </>
  );
}

function getDeliveryStatusMessage(
  status: keyof typeof DELIVERY_REQUEST_STATUS_LABELS,
  partnerName?: string
): string {
  switch (status) {
    case 'requested':
      return 'Delivery Requested';
    case 'accepted':
      return partnerName ? `Partner accepted — ${partnerName} is on the way` : 'Partner accepted — awaiting pickup';
    case 'rejected':
      return 'Delivery partner declined the request';
    case 'picked_up':
      return partnerName ? `${partnerName} picked up the order` : 'Order picked up by delivery partner';
    case 'delivered':
      return 'Order delivered to customer';
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  orderNum: { ...typography.h2, color: colors.text },
  timerCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  timerLabel: { ...typography.bodySmall, color: colors.warning },
  timerValue: { ...typography.display, color: colors.warning, fontVariant: ['tabular-nums'] },
  deliveryCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  deliveryCardTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.xs },
  deliveryCardStatus: { ...typography.body, color: colors.primary, fontWeight: '600' },
  deliveryCardHint: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  section: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.md },
  detail: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: 4 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  itemImage: { width: 48, height: 48, borderRadius: 8, backgroundColor: colors.surfaceSecondary },
  itemInfo: { flex: 1, marginLeft: spacing.md },
  itemName: { ...typography.bodyMedium, color: colors.text },
  itemVariant: { ...typography.caption, color: colors.textMuted },
  itemQty: { ...typography.caption, color: colors.textSecondary },
  itemPrice: { ...typography.bodyMedium, color: colors.text },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  summaryLabel: { ...typography.bodySmall, color: colors.textSecondary },
  summaryValue: { ...typography.bodySmall, color: colors.text },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.sm },
  totalLabel: { ...typography.bodyMedium, color: colors.text, fontWeight: '700' },
  totalValue: { ...typography.h3, color: colors.primary },
  actions: { gap: spacing.md, marginTop: spacing.lg },
  disabledHint: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },
});
