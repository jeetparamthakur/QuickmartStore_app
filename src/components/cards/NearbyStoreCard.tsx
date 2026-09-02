import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, shadows } from '@/theme';
import { formatDistance } from '@/utils/geo';
import { StatusBadge } from '../ui/StatusBadge';
import type { NearbyStore } from '@/types/location';

type Props = {
  store: NearbyStore;
  onPress: () => void;
  rank?: number;
};

export function NearbyStoreCard({ store, onPress, rank }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {rank != null && rank <= 3 && (
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
      )}
      <View style={styles.iconWrap}>
        <Ionicons name="storefront" size={28} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{store.name}</Text>
          <StatusBadge label="Open" variant="success" dot />
        </View>
        <Text style={styles.category}>{store.category}</Text>
        <Text style={styles.address} numberOfLines={1}>{store.address}</Text>
        <View style={styles.footer}>
          <View style={styles.distanceRow}>
            <Ionicons name="navigate-outline" size={14} color={colors.primary} />
            <Text style={styles.distance}>{formatDistance(store.distanceKm)}</Text>
          </View>
          <Text style={styles.delivery}>Delivers within {store.deliveryRadius} km</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  rankBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  rankText: { ...typography.caption, color: colors.white, fontWeight: '700', fontSize: 10 },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, marginHorizontal: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  name: { ...typography.bodyMedium, color: colors.text, flex: 1 },
  category: { ...typography.caption, color: colors.primary, marginTop: 2 },
  address: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distance: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  delivery: { ...typography.caption, color: colors.textMuted },
});
