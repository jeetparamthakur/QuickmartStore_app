import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing, typography } from '@/theme';

type Props = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  accent: string;
  accentMuted: string;
  onPress: () => void;
};

export function PartnerTypeCard({
  title,
  description,
  icon,
  selected,
  accent,
  accentMuted,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.card,
        selected && { borderColor: accent, backgroundColor: accentMuted },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: selected ? accent : colors.surfaceSecondary }]}>
          <Ionicons name={icon} size={26} color={selected ? colors.white : accent} />
        </View>
        <View style={[styles.radio, selected && { borderColor: accent }]}>
          {selected ? <View style={[styles.radioDot, { backgroundColor: accent }]} /> : null}
        </View>
      </View>
      <Text style={[styles.title, selected && { color: colors.text }]}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {selected ? (
        <View style={[styles.selectedPill, { backgroundColor: accent }]}>
          <Ionicons name="checkmark" size={14} color={colors.white} />
          <Text style={styles.selectedPillText}>Selected</Text>
        </View>
      ) : (
        <Text style={styles.tapHint}>Tap to select</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 140,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.sm,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  selectedPillText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  tapHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.md,
    fontWeight: '500',
  },
});
