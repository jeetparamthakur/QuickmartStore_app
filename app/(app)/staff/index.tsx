import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Stack, router, Redirect } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useFeatureFlag } from '@/hooks/usePermissions';
import { staffService } from '@/services/api';
import { STAFF_ROLE_LABELS, type StaffMember } from '@/types/store';
import { colors, radius, spacing, typography } from '@/theme';

export default function StaffScreen() {
  const staffEnabled = useFeatureFlag('staff_management_enabled');
  const queryClient = useQueryClient();

  const { data: staff } = useQuery({
    queryKey: ['staff'],
    queryFn: staffService.list,
    enabled: staffEnabled,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => staffService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
    onError: () => Alert.alert('Error', 'Could not remove staff member. Please try again.'),
  });

  function confirmDelete(member: StaffMember) {
    Alert.alert(
      'Remove Staff Member',
      `Remove ${member.name} from your store team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteMutation.mutate(member.id) },
      ]
    );
  }

  if (!staffEnabled) {
    return <Redirect href="/(app)/(tabs)/profile" />;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Staff Management' }} />
      <ScreenWrapper scroll={false}>
        <Text style={styles.subtitle}>Manage staff roles and permissions</Text>

        {!staff?.length ? (
          <EmptyState
            icon="people-outline"
            title="No Staff"
            message="Add staff members to help manage your store."
            actionLabel="Add Staff Member"
            onAction={() => router.push('/(app)/staff/add')}
          />
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
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => confirmDelete(item)}
                    disabled={deleteMutation.isPending}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
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
            ListFooterComponent={
              <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(app)/staff/add')}>
                <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
                <Text style={styles.addText}>Add Staff Member</Text>
              </TouchableOpacity>
            }
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
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contact: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  permissions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md },
  permChip: { backgroundColor: colors.surfaceSecondary, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 8 },
  permText: { ...typography.caption, color: colors.textSecondary, textTransform: 'capitalize' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 16,
    marginTop: spacing.sm,
  },
  addText: { ...typography.bodyMedium, color: colors.primary },
});
