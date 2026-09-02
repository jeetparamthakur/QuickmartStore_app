import { View, TextInput, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
};

export function OTPInput({ value, onChange, length = 6 }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        placeholder="• • • • • •"
        placeholderTextColor={colors.textMuted}
        textAlign="center"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: spacing.lg },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    ...typography.h2,
    color: colors.text,
    letterSpacing: 12,
  },
});
