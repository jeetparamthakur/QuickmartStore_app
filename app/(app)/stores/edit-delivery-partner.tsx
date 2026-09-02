import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { LocationPicker } from '@/components/location/LocationPicker';
import { DeliveryRadiusSlider } from '@/components/location/DeliveryRadiusSlider';
import { storesService } from '@/services/api';
import { colors, spacing, typography } from '@/theme';

export default function EditDeliveryPartnerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: store } = useQuery({
    queryKey: ['store', id],
    queryFn: () => storesService.get(id!),
    enabled: !!id,
  });

  const [partnerPickupRadiusKm, setPartnerPickupRadiusKm] = useState(3);
  const [platformDeliveryEnabled, setPlatformDeliveryEnabled] = useState(true);

  useEffect(() => {
    if (store) {
      setPartnerPickupRadiusKm(store.partnerPickupRadiusKm);
      setPlatformDeliveryEnabled(store.platformDeliveryEnabled);
    }
  }, [store]);

  const updateMutation = useMutation({
    mutationFn: () =>
      storesService.updatePartnerPickupSettings(id!, {
        partnerPickupRadiusKm,
        platformDeliveryEnabled,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['store', id] });
      router.back();
    },
  });

  function handleSave() {
    if (!store?.latitude || !store?.longitude) {
      Alert.alert('Required', 'Set store location first before configuring delivery partner radius');
      return;
    }
    updateMutation.mutate();
  }

  if (!store) return null;

  return (
    <>
      <Stack.Screen options={{ title: 'Delivery Partner Settings' }} />
      <ScreenWrapper>
        <Text style={styles.title}>Delivery Partner Pickup Radius</Text>
        <Text style={styles.subtitle}>
          Set how close a delivery partner must be to your store to accept pickup requests
        </Text>

        <View style={styles.toggleRow}>
          <View style={styles.toggleText}>
            <Text style={styles.toggleLabel}>Enable Platform Delivery Requests</Text>
            <Text style={styles.toggleHint}>
              Allow delivery partners to pick up ready orders from your store
            </Text>
          </View>
          <Switch
            value={platformDeliveryEnabled}
            onValueChange={setPlatformDeliveryEnabled}
            trackColor={{ true: colors.successLight, false: colors.border }}
            thumbColor={platformDeliveryEnabled ? colors.success : colors.textMuted}
          />
        </View>

        {store.latitude && store.longitude ? (
          <LocationPicker
            latitude={store.latitude}
            longitude={store.longitude}
            onLocationChange={() => {}}
            label="Store pickup point"
            deliveryRadiusKm={partnerPickupRadiusKm}
          />
        ) : (
          <Text style={styles.warning}>
            Store location not set. Edit location first to preview pickup zone on map.
          </Text>
        )}

        <DeliveryRadiusSlider
          value={partnerPickupRadiusKm}
          onChange={setPartnerPickupRadiusKm}
          min={1}
          max={10}
          label="How close must a delivery partner be?"
          hint={`Partners within ${Math.round(partnerPickupRadiusKm)} km of your store can accept delivery requests for ready orders.`}
        />

        <Button title="Save Settings" onPress={handleSave} loading={updateMutation.isPending} fullWidth />
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleText: { flex: 1, marginRight: spacing.md },
  toggleLabel: { ...typography.bodyMedium, color: colors.text },
  toggleHint: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  warning: { ...typography.bodySmall, color: colors.warning, marginBottom: spacing.lg },
});
