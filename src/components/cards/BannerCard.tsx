import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, shadows } from '@/theme';
import type { Banner } from '@/types/index';

type Props = {
  banner: Banner;
  onPress?: () => void;
};

const typeIcons: Record<NonNullable<Banner['type']>, keyof typeof Ionicons.glyphMap> = {
  campaign: 'megaphone',
  policy: 'document-text',
  commission: 'cash',
  offer: 'gift',
  training: 'school',
};

export function BannerCard({ banner, onPress }: Props) {
  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    if (banner.linkUrl) {
      void Linking.openURL(banner.linkUrl);
    }
  };

  const iconName = typeIcons[banner.type ?? 'campaign'];

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.9}>
      {banner.imageUrl ? (
        <Image source={{ uri: banner.imageUrl }} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={styles.iconWrap}>
          <Ionicons name={iconName} size={20} color={colors.primary} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{banner.title}</Text>
        {banner.description ? (
          <Text style={styles.description} numberOfLines={2}>{banner.description}</Text>
        ) : null}
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
    padding: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    marginRight: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: { flex: 1 },
  title: { ...typography.bodyMedium, color: colors.text },
  description: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
