import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useFeatureFlag } from '@/hooks/usePermissions';
import { staffService } from '@/services/api';
import { STAFF_ROLE_LABELS } from '@/types/store';
import { colors, radius, spacing, typography } from '@/theme';
import { Redirect } from 'expo-router';

export default function StaffScreen() {
  const staffEnabled = useFeatureFlag('staff_management_enabled');

  const { data: staff } = useQuery({
    queryKey: ['staff'],
    queryFn: staffService.list,
    enabled: staffEnabled,
  });

  if (!staffEnabled) {
    return <Redirect href="/(app)/(tabs)/profile" />;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Staff Management' }} />
      <ScreenWrapper scroll={false}>
        <Text style={styles.subtitle}>Manage staff roles and permissions</Text>

        {!staff?.length ? (
          <EmptyState icon="people-outline" title="No Staff" message="Add staff members to help manage your store." />
        ) : (
          <FlatList
            data={staff}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.header}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name[0]}</Text>
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <StatusBadge label={STAFF_ROLE_LABELS[item.role]} variant="primary" />
                  </View>
                </View>
                <Text style={styles.contact}>{item.email} • {item.phone}</Text>
                <View style={styles.permissions}>
                  {Object.entries(item.permissions).map(([key, val]) =>
                    val ? (
                      <View key={key} style={styles.permChip}>
                        <Text style={styles.permText}>{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
                      </View>
                    ) : null
                  )}
                </View>
              </View>
            )}
          />
        )}
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  list: { paddingBottom: spacing.xxxl },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 18 },
  info: { marginLeft: spacing.md, flex: 1, gap: spacing.xs },
  name: { ...typography.bodyMedium, color: colors.text },
  contact: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  permissions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md },
  permChip: { backgroundColor: colors.surfaceSecondary, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 8 },
  permText: { ...typography.caption, color: colors.textSecondary, textTransform: 'capitalize' },
});
