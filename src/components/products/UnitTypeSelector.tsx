import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import type { ProductUnitType } from '@/types/product';
import { PRODUCT_UNIT_LABELS } from '@/types/product';
import { Input } from '@/components/ui/Input';
import { colors, radius, spacing, typography } from '@/theme';

const UNIT_OPTIONS: ProductUnitType[] = ['kg', 'g', 'l', 'ml', 'pcs', 'units', 'other'];

type Props = {
  value: ProductUnitType;
  customUnit: string;
  onChange: (unitType: ProductUnitType) => void;
  onCustomUnitChange: (value: string) => void;
};

export function UnitTypeSelector({ value, customUnit, onChange, onCustomUnitChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Unit Type *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {UNIT_OPTIONS.map((unit) => {
          const isSelected = value === unit;
          return (
            <TouchableOpacity
              key={unit}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onChange(unit)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {PRODUCT_UNIT_LABELS[unit]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {value === 'other' && (
        <Input
          label="Custom Unit Name *"
          value={customUnit}
          onChangeText={onCustomUnitChange}
          placeholder="e.g. bundle, pack"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  chips: { gap: spacing.sm, paddingBottom: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  chipText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '500' },
  chipTextSelected: { color: colors.primary, fontWeight: '600' },
});
