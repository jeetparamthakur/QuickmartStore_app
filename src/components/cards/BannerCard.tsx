import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, shadows } from '@/theme';
import type { Banner } from '@/types/index';

type Props = {
  banner: Banner;
  onPress?: () => void;
};

const typeIcons: Record<Banner['type'], keyof typeof Ionicons.glyphMap> = {
  campaign: 'megaphone',
  policy: 'document-text',
  commission: 'cash',
  offer: 'gift',
  training: 'school',
};

export function BannerCard({ banner, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.accentStripe} />
      <View style={styles.iconWrap}>
        <Ionicons name={typeIcons[banner.type]} size={20} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{banner.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{banner.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  accentStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.primary,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  content: { flex: 1, marginHorizontal: spacing.md },
  title: { ...typography.bodyMedium, color: colors.text },
  description: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
