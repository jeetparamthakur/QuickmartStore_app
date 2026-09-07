import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/theme';

type Props = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function QuickActionButton({ label, icon, onPress }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.button, animatedStyle]}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.92); }}
      onPressOut={() => { scale.value = withSpring(1); }}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', width: 80 },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: { ...typography.caption, color: colors.text, textAlign: 'center', fontWeight: '600' },
});
