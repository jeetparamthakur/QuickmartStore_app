import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useUserLocationStore } from '@/stores/userLocationStore';
import { storesService, productsService } from '@/services/api';
import { formatDistance, getDistanceKm, isCustomerWithinStoreRadius } from '@/utils/geo';
import { formatCurrency } from '@/utils/format';
import { colors, radius, spacing, typography } from '@/theme';

export default function CustomerStoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userLocation = useUserLocationStore((s) => s.location);

  const { data: store, isLoading } = useQuery({
    queryKey: ['store', id],
    queryFn: () => storesService.get(id!),
    enabled: !!id,
  });

  const { data: nearbyData } = useQuery({
    queryKey: ['nearby-products', userLocation?.latitude, userLocation?.longitude],
    queryFn: () => productsService.getNearby(userLocation!),
    enabled: !!userLocation,
  });

  const storeProducts = nearbyData?.products.filter((p) => p.storeId === id) ?? [];
  const canDeliver = store && userLocation ? isCustomerWithinStoreRadius(store, userLocation) : false;

  const distanceKm =
    store?.latitude && store?.longitude && userLocation
      ? getDistanceKm(userLocation.latitude, userLocation.longitude, store.latitude, store.longitude)
      : null;

  if (isLoading) {
    return (
      <ScreenWrapper>
        <Skeleton height={120} />
      </ScreenWrapper>
    );
  }

  if (!store) return null;

  return (
    <>
      <Stack.Screen options={{ title: store.name }} />
      <ScreenWrapper scroll={false}>
        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <Ionicons name="storefront" size={40} color={colors.primary} />
          </View>
          <Text style={styles.name}>{store.name}</Text>
          <Text style={styles.category}>{store.category}</Text>
          <View style={styles.badges}>
            <StatusBadge label={store.isOpen ? 'Open' : 'Closed'} variant={store.isOpen ? 'success' : 'neutral'} dot />
            {distanceKm != null && (
              <StatusBadge label={formatDistance(distanceKm)} variant="primary" />
            )}
          </View>
        </View>

        {!canDeliver && (
          <View style={styles.outOfRange}>
            <Text style={styles.outOfRangeText}>
              This store does not deliver to your location (outside {store.deliveryRadius} km radius).
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Products from this store</Text>

        {!canDeliver ? (
          <EmptyState
            icon="location-outline"
            title="Outside Delivery Range"
            message={`You are ${distanceKm != null ? formatDistance(distanceKm) : 'too far'} from this store. Their visibility radius is ${store.deliveryRadius} km.`}
          />
        ) : storeProducts.length === 0 ? (
          <EmptyState icon="cube-outline" title="No Products" message="This store has no active products right now." />
        ) : (
          <FlatList
            data={storeProducts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.productRow}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>{formatCurrency(item.sellingPrice)}</Text>
                </View>
                <StatusBadge label="In Range" variant="success" />
              </View>
            )}
          />
        )}
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: spacing.lg },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  name: { ...typography.h2, color: colors.text, textAlign: 'center' },
  category: { ...typography.body, color: colors.primary, marginTop: spacing.xs },
  badges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  outOfRange: {
    backgroundColor: colors.dangerLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  outOfRangeText: { ...typography.bodySmall, color: colors.danger },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  list: { paddingBottom: spacing.xxxl },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  productInfo: { flex: 1 },
  productName: { ...typography.bodyMedium, color: colors.text },
  productPrice: { ...typography.bodySmall, color: colors.primary, marginTop: 2 },
});
