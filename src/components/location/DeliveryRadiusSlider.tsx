import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, spacing, typography } from '@/theme';

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  hint?: string;
};

export function DeliveryRadiusSlider({
  value,
  onChange,
  min = 1,
  max = 20,
  label = 'Product Visibility Radius',
  hint,
}: Props) {
  const defaultHint = `Your products will be visible within ${Math.round(value)} km of your location.`;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{Math.round(value)} km</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeText}>{min} km</Text>
        <Text style={styles.rangeText}>{max} km</Text>
      </View>
      <Text style={styles.hint}>{hint ?? defaultHint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  label: { ...typography.bodyMedium, color: colors.text, flex: 1 },
  value: { ...typography.h3, color: colors.primary },
  slider: { width: '100%', height: 40 },
  rangeLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  rangeText: { ...typography.caption, color: colors.textMuted },
  hint: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
});
