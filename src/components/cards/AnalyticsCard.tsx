import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, shadows } from '@/theme';

type Props = {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

export function AnalyticsCard({ label, value, icon, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.8 : 1}>
      <Ionicons name={icon} size={24} color={colors.primary} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
    minWidth: '45%',
  },
  value: { ...typography.h2, color: colors.text, marginTop: spacing.sm },
  label: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
});
