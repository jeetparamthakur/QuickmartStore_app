import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, shadows } from '@/theme';
import { formatCurrency } from '@/utils/format';

type Props = {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  isCurrency?: boolean;
};

export function EarningsCard({ label, value, icon = 'wallet-outline', isCurrency }: Props) {
  const displayValue = isCurrency && typeof value === 'number' ? formatCurrency(value) : value;
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.value}>{displayValue}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.sm,
    minWidth: '45%',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  value: { ...typography.h2, color: colors.text },
  label: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
});
