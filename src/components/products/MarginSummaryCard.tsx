import { View, Text, StyleSheet } from 'react-native';
import type { ProductUnitType } from '@/types/product';
import { formatCurrency } from '@/utils/format';
import { formatRateLabel } from '@/utils/pricing';
import { colors, radius, spacing, typography } from '@/theme';

type Props = {
  purchasePrice: number;
  sellingPrice: number;
  marginAmount: number;
  marginPercent: number;
  pricePerUnit: number;
  unitType: ProductUnitType;
  customUnit?: string;
};

export function MarginSummaryCard({
  purchasePrice,
  sellingPrice,
  marginAmount,
  marginPercent,
  pricePerUnit,
  unitType,
  customUnit,
}: Props) {
  const showCard = purchasePrice >= 0 && sellingPrice > 0;

  if (!showCard) return null;

  const marginColor = marginAmount >= 0 ? colors.success : colors.danger;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Pricing Summary</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Purchase Price</Text>
        <Text style={styles.value}>{formatCurrency(purchasePrice)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Selling Price</Text>
        <Text style={styles.value}>{formatCurrency(sellingPrice)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Profit</Text>
        <Text style={[styles.value, { color: marginColor }]}>
          {formatCurrency(marginAmount)} ({marginPercent}%)
        </Text>
      </View>
      {pricePerUnit > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Rate</Text>
          <Text style={styles.value}>{formatRateLabel(pricePerUnit, unitType, customUnit)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.md, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: { ...typography.bodySmall, color: colors.textSecondary },
  value: { ...typography.bodyMedium, color: colors.text, fontWeight: '600' },
});
