import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilter?: () => void;
};

export function SearchBar({ value, onChangeText, placeholder = 'Search...', onFilter }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={colors.textMuted} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
      />
      {onFilter && (
        <TouchableOpacity onPress={onFilter}>
          <Ionicons name="options-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  input: { flex: 1, ...typography.body, color: colors.text, paddingVertical: spacing.xs },
});
