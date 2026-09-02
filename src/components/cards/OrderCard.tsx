import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, shadows } from '@/theme';
import { formatCurrency } from '@/utils/format';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import type { Order } from '@/types/order';
import { DELIVERY_REQUEST_STATUS_LABELS } from '@/types/order';

type Props = {
  order: Order;
  onPress: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  showTimer?: boolean;
  prepTime?: string;
};

export function OrderCard({ order, onPress, onAccept, onReject, showTimer, prepTime }: Props) {
  const statusVariant = {
    new: 'primary' as const,
    accepted: 'info' as const,
    preparing: 'warning' as const,
    ready: 'success' as const,
    completed: 'neutral' as const,
    cancelled: 'danger' as const,
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.header}>
        <Text style={styles.orderNum}>Order #{order.orderNumber}</Text>
        <StatusBadge label={order.status.toUpperCase()} variant={statusVariant[order.status]} />
      </View>
      <Text style={styles.items}>{order.itemCount} Items</Text>
      <Text style={styles.amount}>{formatCurrency(order.total)}</Text>
      <Text style={styles.delivery}>
        Delivery: {order.deliveryType === 'platform' ? 'Platform Delivery' : order.deliveryType === 'self' ? 'Self Delivery' : 'Pickup'}
      </Text>
      {order.deliveryType === 'platform' &&
        order.deliveryRequestStatus !== 'none' &&
        DELIVERY_REQUEST_STATUS_LABELS[order.deliveryRequestStatus] && (
          <View style={styles.deliveryBadge}>
            <StatusBadge
              label={DELIVERY_REQUEST_STATUS_LABELS[order.deliveryRequestStatus]}
              variant={
                order.deliveryRequestStatus === 'accepted' || order.deliveryRequestStatus === 'picked_up'
                  ? 'success'
                  : order.deliveryRequestStatus === 'rejected'
                    ? 'danger'
                    : 'info'
              }
            />
          </View>
        )}
      {showTimer && prepTime && (
        <View style={styles.timer}>
          <Ionicons name="timer-outline" size={16} color={colors.warning} />
          <Text style={styles.timerText}>Prepare within: {prepTime}</Text>
        </View>
      )}
      {order.status === 'new' && onAccept && onReject && (
        <View style={styles.actions}>
          <Button title="Accept" onPress={onAccept} size="sm" style={styles.acceptBtn} />
          <Button title="Reject" onPress={onReject} variant="danger" size="sm" style={styles.rejectBtn} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  orderNum: { ...typography.bodyMedium, color: colors.text },
  items: { ...typography.bodySmall, color: colors.textSecondary },
  amount: { ...typography.h2, color: colors.text, marginVertical: spacing.xs },
  delivery: { ...typography.caption, color: colors.textMuted },
  deliveryBadge: { alignSelf: 'flex-start', marginTop: spacing.sm },
  timer: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.xs },
  timerText: { ...typography.bodySmall, color: colors.warning, fontWeight: '600' },
  actions: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.sm },
  acceptBtn: { flex: 1 },
  rejectBtn: { flex: 1 },
});
