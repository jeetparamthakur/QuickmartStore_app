import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/theme';

type Props = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export function QuickActionButton({ label, icon, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', width: 72 },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { ...typography.caption, color: colors.text, textAlign: 'center' },
});
