import { useEffect, useState } from 'react';
import { Text, StyleSheet, Alert, Pressable, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { couponsService } from '@/services/api';
import { useActiveStoreId } from '@/hooks/useActiveStoreId';
import type { CreateSellerCouponInput } from '@/types/coupon';
import { colors, radius, spacing, typography } from '@/theme';

const TYPE_OPTIONS: CreateSellerCouponInput['type'][] = ['PERCENTAGE', 'FIXED'];

export default function AddCouponScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const queryClient = useQueryClient();
  const { storeId, requiresStoreId } = useActiveStoreId();
  const isEdit = Boolean(id);

  const { data: coupons } = useQuery({
    queryKey: ['coupons', storeId],
    queryFn: () => couponsService.list(storeId),
    enabled: isEdit,
  });

  const existing = coupons?.find((c) => c.id === id);

  const [form, setForm] = useState({
    code: '',
    name: '',
    type: 'PERCENTAGE' as CreateSellerCouponInput['type'],
    value: '10',
    minOrderAmount: '0',
    maxDiscount: '',
    usageLimit: '100',
    perCustomerLimit: '1',
    startsAt: '',
    expiresAt: '',
    isActive: true,
  });

  useEffect(() => {
    if (!existing) return;
    setForm({
      code: existing.code,
      name: existing.name,
      type: existing.type,
      value: existing.value,
      minOrderAmount: existing.minOrderAmount,
      maxDiscount: existing.maxDiscount ?? '',
      usageLimit: existing.usageLimit ? String(existing.usageLimit) : '',
      perCustomerLimit: String(existing.perCustomerLimit),
      startsAt: existing.startsAt ? existing.startsAt.slice(0, 10) : '',
      expiresAt: existing.expiresAt ? existing.expiresAt.slice(0, 10) : '',
      isActive: existing.isActive,
    });
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const body: CreateSellerCouponInput = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim() || form.code.trim(),
        type: form.type,
        value: form.value,
        minOrderAmount: form.minOrderAmount || '0',
        maxDiscount: form.maxDiscount || undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        perCustomerLimit: Number(form.perCustomerLimit || 1),
        storeId: requiresStoreId ? storeId : undefined,
        startsAt: form.startsAt || undefined,
        expiresAt: form.expiresAt || undefined,
        isActive: form.isActive,
      };
      return isEdit && id
        ? couponsService.update(id, body)
        : couponsService.create(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      router.back();
    },
    onError: () => Alert.alert('Error', 'Could not save coupon. Please try again.'),
  });

  function update(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit() {
    if (!form.code.trim()) {
      Alert.alert('Required', 'Enter a coupon code');
      return;
    }
    if (requiresStoreId && !storeId) {
      Alert.alert('Store required', 'Select a store before creating a coupon.');
      return;
    }
    saveMutation.mutate();
  }

  return (
    <>
      <Stack.Screen options={{ title: isEdit ? 'Edit coupon' : 'Create coupon' }} />
      <ScreenWrapper>
        <Text style={styles.subtitle}>
          Customers apply this code at checkout. The discount comes from your earnings.
        </Text>

        <Input
          label="Coupon code *"
          value={form.code}
          onChangeText={(v) => update('code', v.toUpperCase())}
          placeholder="SAVE20"
          autoCapitalize="characters"
          editable={!isEdit}
        />
        <Input
          label="Display name"
          value={form.name}
          onChangeText={(v) => update('name', v)}
          placeholder="Summer sale"
        />

        <Text style={styles.label}>Discount type</Text>
        <View style={styles.typeRow}>
          {TYPE_OPTIONS.map((type) => (
            <Pressable
              key={type}
              style={[styles.typeChip, form.type === type && styles.typeChipActive]}
              onPress={() => update('type', type)}
            >
              <Text style={[styles.typeText, form.type === type && styles.typeTextActive]}>
                {type === 'PERCENTAGE' ? 'Percentage' : 'Fixed ₹'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Input
          label={form.type === 'PERCENTAGE' ? 'Discount %' : 'Discount amount (₹)'}
          value={form.value}
          onChangeText={(v) => update('value', v)}
          keyboardType="decimal-pad"
        />
        <Input
          label="Minimum order (₹)"
          value={form.minOrderAmount}
          onChangeText={(v) => update('minOrderAmount', v)}
          keyboardType="decimal-pad"
        />
        {form.type === 'PERCENTAGE' && (
          <Input
            label="Max discount (₹)"
            value={form.maxDiscount}
            onChangeText={(v) => update('maxDiscount', v)}
            keyboardType="decimal-pad"
          />
        )}
        <Input
          label="Usage limit"
          value={form.usageLimit}
          onChangeText={(v) => update('usageLimit', v)}
          keyboardType="number-pad"
        />
        <Input
          label="Per customer limit"
          value={form.perCustomerLimit}
          onChangeText={(v) => update('perCustomerLimit', v)}
          keyboardType="number-pad"
        />

        <Button
          title={saveMutation.isPending ? 'Saving…' : isEdit ? 'Update coupon' : 'Create coupon'}
          onPress={handleSubmit}
          disabled={saveMutation.isPending}
        />
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg },
  label: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeText: { ...typography.caption, color: colors.text },
  typeTextActive: { color: '#fff' },
});
