import { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useQuery } from '@tanstack/react-query';
import { ordersService } from '@/services/api';
import { useActiveStoreId } from '@/hooks/useActiveStoreId';
import { formatCurrency } from '@/utils/format';
import { colors, radius, spacing, typography } from '@/theme';

const ALERT_SOUND_URI = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';

type Props = {
  enabled?: boolean;
};

export function OrderAlertListener({ enabled = true }: Props) {
  const seenIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const player = useAudioPlayer(ALERT_SOUND_URI);
  const { storeId, isReady } = useActiveStoreId();
  const [alertOrder, setAlertOrder] = useState<{
    id: string;
    orderNumber: string;
    total: number;
  } | null>(null);

  const { data: newOrders } = useQuery({
    queryKey: ['orders', 'new', storeId],
    queryFn: () => ordersService.list('new', storeId),
    refetchInterval: enabled && isReady ? 15000 : false,
    enabled: enabled && isReady,
  });

  useEffect(() => {
    if (!newOrders?.length) return;

    if (!initialized.current) {
      newOrders.forEach((o) => seenIds.current.add(o.id));
      initialized.current = true;
      return;
    }

    const latest = newOrders.find((o) => !seenIds.current.has(o.id));
    if (latest) {
      seenIds.current.add(latest.id);
      setAlertOrder({
        id: latest.id,
        orderNumber: latest.orderNumber,
        total: latest.total,
      });
      playAlertSound();
    }
  }, [newOrders]);

  useEffect(() => {
    if (!alertOrder) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [alertOrder, pulseAnim]);

  async function playAlertSound() {
    try {
      await player.seekTo(0);
      player.play();
    } catch {
      // sound optional
    }
  }

  return (
    <Modal visible={!!alertOrder} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.alert, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="notifications" size={40} color={colors.primary} />
          <Text style={styles.title}>New Order!</Text>
          <Text style={styles.orderNum}>Order #{alertOrder?.orderNumber}</Text>
          <Text style={styles.amount}>{alertOrder ? formatCurrency(alertOrder.total) : ''}</Text>
          <TouchableOpacity style={styles.dismiss} onPress={() => setAlertOrder(null)}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  alert: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xxxl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  title: { ...typography.h2, color: colors.text, marginTop: spacing.md },
  orderNum: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
  amount: { ...typography.h1, color: colors.primary, marginTop: spacing.sm },
  dismiss: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  dismissText: { ...typography.button, color: colors.white },
});
