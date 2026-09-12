import { useState } from 'react';
import { Text, StyleSheet, Alert, Pressable, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { staffService } from '@/services/api';
import { useStoreSwitcherStore } from '@/stores/storeSwitcherStore';
import { STAFF_ROLE_LABELS, type StaffRole } from '@/types/store';
import { colors, radius, spacing, typography } from '@/theme';

const ROLE_OPTIONS: StaffRole[] = ['store_manager', 'order_manager', 'inventory_manager'];

export default function AddStaffScreen() {
  const queryClient = useQueryClient();
  const activeStoreId = useStoreSwitcherStore((s) => s.activeStoreId);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'order_manager' as StaffRole,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      staffService.create({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        storeId: activeStoreId ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      router.back();
    },
    onError: () => {
      Alert.alert('Error', 'Could not add staff member. Please try again.');
    },
  });

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      Alert.alert('Required', 'Please enter staff member name');
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      Alert.alert('Required', 'Please enter a valid email address');
      return;
    }
    if (form.phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Required', 'Please enter a valid phone number');
      return;
    }
    createMutation.mutate();
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Add Staff Member' }} />
      <ScreenWrapper>
        <Text style={styles.title}>New Staff Member</Text>
        <Text style={styles.subtitle}>Add a team member to help manage your store</Text>

        <Input
          label="Full Name *"
          value={form.name}
          onChangeText={(v) => update('name', v)}
          placeholder="e.g. Priya Singh"
        />
        <Input
          label="Email *"
          value={form.email}
          onChangeText={(v) => update('email', v)}
          placeholder="staff@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Phone *"
          value={form.phone}
          onChangeText={(v) => update('phone', v)}
          placeholder="9876543210"
          keyboardType="phone-pad"
        />

        <Text style={styles.sectionLabel}>Role *</Text>
        <View style={styles.roleList}>
          {ROLE_OPTIONS.map((role) => {
            const isSelected = form.role === role;
            return (
              <Pressable
                key={role}
                style={[styles.roleChip, isSelected && styles.roleChipSelected]}
                onPress={() => update('role', role)}
              >
                <Text style={[styles.roleChipText, isSelected && styles.roleChipTextSelected]}>
                  {STAFF_ROLE_LABELS[role]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Button title="Add Staff Member" onPress={handleSubmit} loading={createMutation.isPending} fullWidth />
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  sectionLabel: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  roleList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  roleChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  roleChipSelected: {
    borderColor: colors.primary,
    backgroundColor: '#E8F5E9',
  },
  roleChipText: { ...typography.body, color: colors.textSecondary },
  roleChipTextSelected: { color: colors.primary, fontWeight: '600' },
});
