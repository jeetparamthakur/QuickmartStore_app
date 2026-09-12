import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export type ProfileMenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  badge?: number;
  subtitle?: string;
  iconColor?: string;
  iconBg?: string;
};

type Props = {
  title: string;
  items: ProfileMenuItem[];
  onItemPress: (route: string) => void;
};

export function ProfileMenuGroup({ title, items, onItemPress }: Props) {
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.menuItem, index < items.length - 1 && styles.menuItemBorder]}
            onPress={() => onItemPress(item.route)}
            activeOpacity={0.65}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.iconBg ?? colors.primaryLight }]}>
              <Ionicons
                name={item.icon}
                size={20}
                color={item.iconColor ?? colors.primary}
              />
            </View>
            <View style={styles.labelWrap}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.subtitle ? <Text style={styles.menuSubtitle}>{item.subtitle}</Text> : null}
            </View>
            {item.badge != null && item.badge > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge > 99 ? '99+' : item.badge}</Text>
              </View>
            ) : null}
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrap: { flex: 1 },
  menuLabel: { ...typography.body, color: colors.text },
  menuSubtitle: { ...typography.caption, color: colors.textMuted, marginTop: 1 },
  badge: {
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { ...typography.caption, color: colors.white, fontWeight: '700', fontSize: 10 },
});
