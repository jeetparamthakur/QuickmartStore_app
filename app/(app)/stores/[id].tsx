import { View, Text, StyleSheet, Switch } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { storesService } from '@/services/api';
import { isStoreLocationComplete } from '@/utils/geo';
import { usePartnerConfig } from '@/hooks/usePermissions';
import { colors, radius, spacing, typography } from '@/theme';

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const partnerConfig = usePartnerConfig();

  const { data: store } = useQuery({
    queryKey: ['store', id],
    queryFn: () => storesService.get(id!),
    enabled: !!id,
  });

  const toggleMutation = useMutation({
    mutationFn: (isOpen: boolean) => storesService.toggleStatus(id!, isOpen),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stores'] }),
  });

  if (!store) return null;

  const locationComplete = isStoreLocationComplete(store);

  return (
    <>
      <Stack.Screen options={{ title: store.name }} />
      <ScreenWrapper>
        <View style={styles.statusCard}>
          <View>
            <Text style={styles.statusLabel}>Store Status</Text>
            <StatusBadge label={store.isOpen ? 'Open' : 'Closed'} variant={store.isOpen ? 'success' : 'neutral'} dot />
          </View>
          <Switch
            value={store.isOpen}
            onValueChange={(v) => toggleMutation.mutate(v)}
            trackColor={{ true: colors.successLight, false: colors.border }}
            thumbColor={store.isOpen ? colors.success : colors.textMuted}
          />
        </View>

        {!locationComplete && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              Store location incomplete. Set location and radius so customers can see your products.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Information</Text>
          <InfoRow label="Category" value={store.category} />
          <InfoRow label="City" value={store.city ?? '-'} />
          <InfoRow label="Area" value={store.area ?? '-'} />
          <InfoRow label="Pincode" value={store.pincode ?? '-'} />
          <InfoRow label="Address" value={store.address} />
          <InfoRow label="Contact" value={store.contactNumber} />
          <InfoRow label="Hours" value={`${store.openingTime} - ${store.closingTime}`} />
          <InfoRow label="Product Visibility Radius" value={`${store.deliveryRadius} km`} />
          {partnerConfig.showDeliveryPartnerSettings && (
            <>
              <InfoRow label="Partner Pickup Radius" value={`${store.partnerPickupRadiusKm} km`} />
              <InfoRow
                label="Platform Delivery"
                value={store.platformDeliveryEnabled ? 'Enabled' : 'Disabled'}
              />
            </>
          )}
          <InfoRow label="Active Orders" value={String(store.activeOrders)} />
        </View>

        <Text style={styles.description}>{store.description}</Text>

        <Button
          title="Edit Location & Visibility Radius"
          variant="secondary"
          onPress={() => router.push({ pathname: '/(app)/stores/edit-location', params: { id: id! } })}
          fullWidth
        />
        {partnerConfig.showDeliveryPartnerSettings && (
          <Button
            title="Edit Delivery Partner Settings"
            variant="secondary"
            onPress={() =>
              router.push({ pathname: '/(app)/stores/edit-delivery-partner', params: { id: id! } })
            }
            fullWidth
            style={{ marginTop: spacing.md }}
          />
        )}
      </ScreenWrapper>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statusLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  warning: {
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  warningText: { ...typography.bodySmall, color: colors.warning },
  section: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  label: { ...typography.bodySmall, color: colors.textSecondary },
  value: { ...typography.bodySmall, color: colors.text, fontWeight: '500', flex: 1, textAlign: 'right' },
  description: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
});
