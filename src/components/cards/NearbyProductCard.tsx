import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, shadows } from '@/theme';
import { formatCurrency } from '@/utils/format';
import { formatDistance } from '@/utils/geo';
import type { NearbyProduct } from '@/types/product';

type Props = {
  product: NearbyProduct;
  onPress: () => void;
};

export function NearbyProductCard({ product, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imagePlaceholder}>
        <Ionicons name="cube-outline" size={28} color={colors.textMuted} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.store}>{product.storeName}</Text>
        <View style={styles.row}>
          <Text style={styles.price}>{formatCurrency(product.sellingPrice)}</Text>
          {product.discountPercent > 0 && (
            <Text style={styles.mrp}>{formatCurrency(product.mrp)}</Text>
          )}
        </View>
        <View style={styles.footer}>
          <Ionicons name="navigate-outline" size={12} color={colors.primary} />
          <Text style={styles.distance}>{formatDistance(product.distanceKm)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    margin: spacing.xs,
    overflow: 'hidden',
    ...shadows.sm,
    maxWidth: '48%',
  },
  imagePlaceholder: {
    height: 100,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: spacing.md },
  name: { ...typography.bodyMedium, color: colors.text, minHeight: 40 },
  store: { ...typography.caption, color: colors.primary, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  price: { ...typography.bodyMedium, color: colors.text, fontWeight: '700' },
  mrp: { ...typography.caption, color: colors.textMuted, textDecorationLine: 'line-through' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  distance: { ...typography.caption, color: colors.textSecondary },
});
