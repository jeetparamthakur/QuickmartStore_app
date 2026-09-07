import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, radius, shadows, spacing, typography } from '@/theme';
import { getGreeting } from '@/utils/format';

type Props = {
  name?: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function DashboardHeader({ name = 'Partner' }: Props) {
  return (
    <LinearGradient colors={[...gradients.hero]} style={styles.gradient}>
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.subGreeting}>Here's your business overview</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => router.push('/(app)/notifications')}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.md },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  avatarText: { ...typography.label, color: colors.white, fontWeight: '700' },
  textWrap: { flex: 1 },
  greeting: { ...typography.caption, color: colors.textSecondary },
  name: { ...typography.h2, color: colors.primary, marginTop: 2 },
  subGreeting: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
});
