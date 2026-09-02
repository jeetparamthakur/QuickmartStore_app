import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, shadows } from '@/theme';
import { formatCurrency } from '@/utils/format';
import { StatusBadge } from '../ui/StatusBadge';
import type { Product } from '@/types/product';

type Props = {
  product: Product;
  onPress: () => void;
};

const stockVariant = {
  in_stock: 'success' as const,
  low_stock: 'warning' as const,
  out_of_stock: 'danger' as const,
};

export function ProductCard({ product, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imagePlaceholder}>
        <Ionicons name="image-outline" size={32} color={colors.textMuted} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.category}>{product.category}</Text>
        <View style={styles.row}>
          <Text style={styles.price}>{formatCurrency(product.sellingPrice)}</Text>
          {product.discountPercent > 0 && (
            <Text style={styles.mrp}>{formatCurrency(product.mrp)}</Text>
          )}
        </View>
        <View style={styles.footer}>
          <StatusBadge
            label={product.stockStatus.replace('_', ' ').toUpperCase()}
            variant={stockVariant[product.stockStatus]}
          />
          <Text style={styles.qty}>Qty: {product.quantity}</Text>
        </View>
        {product.status === 'rejected' && product.rejectionReason && (
          <Text style={styles.rejectReason}>{product.rejectionReason}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, marginLeft: spacing.md },
  name: { ...typography.bodyMedium, color: colors.text },
  category: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: spacing.sm },
  price: { ...typography.bodyMedium, color: colors.primary, fontWeight: '700' },
  mrp: { ...typography.caption, color: colors.textMuted, textDecorationLine: 'line-through' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  qty: { ...typography.caption, color: colors.textSecondary },
  rejectReason: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
});
