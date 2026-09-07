import { useState, useEffect } from 'react';
import { Text, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LocationPicker } from '@/components/location/LocationPicker';
import { AddressSearchInput } from '@/components/location/AddressSearchInput';
import { DeliveryRadiusSlider } from '@/components/location/DeliveryRadiusSlider';
import { useCityMapFocus } from '@/hooks/useCityMapFocus';
import { storesService } from '@/services/api';
import type { AddressResult } from '@/utils/address';
import { colors, spacing, typography } from '@/theme';

export default function EditStoreLocationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { mapFocus, onCityChange, markCityFromAddress } = useCityMapFocus();

  const { data: store } = useQuery({
    queryKey: ['store', id],
    queryFn: () => storesService.get(id!),
    enabled: !!id,
  });

  const [form, setForm] = useState({
    address: '',
    city: '',
    area: '',
    pincode: '',
    latitude: 0,
    longitude: 0,
    deliveryRadius: 5,
  });

  useEffect(() => {
    if (store) {
      setForm({
        address: store.address,
        city: store.city ?? '',
        area: store.area ?? '',
        pincode: store.pincode ?? '',
        latitude: store.latitude ?? 0,
        longitude: store.longitude ?? 0,
        deliveryRadius: store.deliveryRadius,
      });
    }
  }, [store]);

  const updateMutation = useMutation({
    mutationFn: () =>
      storesService.updateLocation(id!, {
        address: form.address,
        city: form.city,
        area: form.area,
        pincode: form.pincode,
        latitude: form.latitude,
        longitude: form.longitude,
        deliveryRadius: form.deliveryRadius,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['store', id] });
      queryClient.invalidateQueries({ queryKey: ['nearby-products'] });
      router.back();
    },
  });

  function update(key: string, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function applyAddress(result: AddressResult) {
    markCityFromAddress();
    setForm((f) => ({
      ...f,
      address: result.addressLine,
      city: result.city || f.city,
      area: result.area || f.area,
      pincode: result.pincode || f.pincode,
      latitude: result.latitude,
      longitude: result.longitude,
    }));
  }

  function handleCityChange(city: string) {
    update('city', city);
    onCityChange(city);
  }

  function handleSave() {
    if (!form.city || form.pincode.length !== 6) {
      Alert.alert('Required', 'City and 6-digit pincode are required');
      return;
    }
    if (!form.latitude || !form.longitude) {
      Alert.alert('Required', 'Please pin store location on map');
      return;
    }
    updateMutation.mutate();
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Location & Radius' }} />
      <ScreenWrapper>
        <Text style={styles.title}>Store Location & Visibility</Text>
        <Text style={styles.subtitle}>
          Update your store location and product visibility radius
        </Text>

        <AddressSearchInput onSelect={applyAddress} />
        <Input label="City *" value={form.city} onChangeText={handleCityChange} />
        <Input label="Area *" value={form.area} onChangeText={(v) => update('area', v)} />
        <Input
          label="Pincode *"
          value={form.pincode}
          onChangeText={(v) => update('pincode', v.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
        />
        <Input label="Address *" value={form.address} onChangeText={(v) => update('address', v)} multiline />

        <LocationPicker
          latitude={form.latitude}
          longitude={form.longitude}
          deliveryRadiusKm={form.deliveryRadius}
          mapFocus={mapFocus}
          onCurrentLocationResolved={applyAddress}
          onLocationChange={(lat, lng) => {
            setForm((f) => ({ ...f, latitude: lat, longitude: lng }));
          }}
        />

        <DeliveryRadiusSlider
          value={form.deliveryRadius}
          onChange={(v) => update('deliveryRadius', v)}
        />

        <Button title="Save Changes" onPress={handleSave} loading={updateMutation.isPending} fullWidth />

        <Button
          title="Delivery Partner Settings"
          variant="secondary"
          onPress={() =>
            router.push({ pathname: '/(app)/stores/edit-delivery-partner', params: { id: id! } })
          }
          fullWidth
          style={{ marginTop: spacing.md }}
        />
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
});
