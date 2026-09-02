import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, shadows } from '@/theme';
import { StatusBadge } from '../ui/StatusBadge';
import type { Store } from '@/types/store';

type Props = {
  store: Store;
  onPress: () => void;
  selected?: boolean;
};

export function StoreCard({ store, onPress, selected }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="storefront" size={24} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{store.name}</Text>
          <Text style={styles.address}>{store.address}</Text>
        </View>
        <StatusBadge
          label={store.isOpen ? 'Open' : 'Closed'}
          variant={store.isOpen ? 'success' : 'neutral'}
          dot
        />
      </View>
      <Text style={styles.orders}>{store.activeOrders} Active Orders</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: { borderColor: colors.primary },
  header: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, marginLeft: spacing.md },
  name: { ...typography.bodyMedium, color: colors.text },
  address: { ...typography.caption, color: colors.textSecondary },
  orders: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
});
