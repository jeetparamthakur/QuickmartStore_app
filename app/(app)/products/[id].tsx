import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { productsService } from '@/services/api';
import { formatCurrency } from '@/utils/format';
import { formatPackageSize, formatRateLabel } from '@/utils/pricing';
import { colors, radius, spacing, typography } from '@/theme';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsService.get(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <ScreenWrapper>
        <Skeleton height={200} />
      </ScreenWrapper>
    );
  }

  if (!product) return null;

  return (
    <>
      <Stack.Screen options={{ title: product.name }} />
      <ScreenWrapper>
        <View style={styles.imagePlaceholder} />
        <View style={styles.header}>
          <Text style={styles.name}>{product.name}</Text>
          <StatusBadge label={product.status.replace('_', ' ').toUpperCase()} variant="primary" />
        </View>
        <Text style={styles.category}>{product.category} {product.brand ? `• ${product.brand}` : ''}</Text>
        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(product.sellingPrice)}</Text>
          {product.discountPercent > 0 && (
            <>
              <Text style={styles.mrp}>{formatCurrency(product.mrp)}</Text>
              <Text style={styles.discount}>{product.discountPercent}% off</Text>
            </>
          )}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Package</Text>
            <Text style={styles.infoValue}>
              {formatPackageSize(product.packageSize, product.unitType, product.customUnit)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Stock</Text>
            <Text style={styles.infoValue}>{product.quantity} packs</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>SKU</Text>
            <Text style={styles.infoValue}>{product.sku}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <StatusBadge label={product.stockStatus.replace('_', ' ').toUpperCase()} variant={
              product.stockStatus === 'in_stock' ? 'success' : product.stockStatus === 'low_stock' ? 'warning' : 'danger'
            } />
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Seller Pricing</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Purchase Price</Text>
            <Text style={styles.infoValue}>{formatCurrency(product.purchasePrice)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Selling Price</Text>
            <Text style={styles.infoValue}>{formatCurrency(product.sellingPrice)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Margin</Text>
            <Text style={[styles.infoValue, { color: product.marginAmount >= 0 ? colors.success : colors.danger }]}>
              {formatCurrency(product.marginAmount)} ({product.marginPercent}%)
            </Text>
          </View>
          {product.pricePerUnit > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rate</Text>
              <Text style={styles.infoValue}>
                {formatRateLabel(product.pricePerUnit, product.unitType, product.customUnit)}
              </Text>
            </View>
          )}
        </View>

        {product.status === 'rejected' && product.rejectionReason && (
          <View style={styles.rejectBox}>
            <Text style={styles.rejectTitle}>Rejection Reason</Text>
            <Text style={styles.rejectReason}>{product.rejectionReason}</Text>
            <Button title="Edit & Resubmit" onPress={() => router.push('/(app)/products/add')} fullWidth />
          </View>
        )}
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  imagePlaceholder: { height: 200, backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, marginBottom: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { ...typography.h2, color: colors.text, flex: 1, marginRight: spacing.md },
  category: { ...typography.bodySmall, color: colors.textMuted, marginTop: spacing.xs },
  description: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  price: { ...typography.h1, color: colors.primary },
  mrp: { ...typography.body, color: colors.textMuted, textDecorationLine: 'line-through' },
  discount: { ...typography.bodySmall, color: colors.success, fontWeight: '600' },
  infoCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.xl },
  sectionTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.md, fontWeight: '600' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  infoLabel: { ...typography.bodySmall, color: colors.textSecondary },
  infoValue: { ...typography.bodyMedium, color: colors.text },
  rejectBox: { backgroundColor: colors.dangerLight, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.lg },
  rejectTitle: { ...typography.bodyMedium, color: colors.danger, marginBottom: spacing.sm },
  rejectReason: { ...typography.bodySmall, color: colors.text, marginBottom: spacing.lg },
});
