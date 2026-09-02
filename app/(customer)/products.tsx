import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { NearbyProductCard } from '@/components/cards/NearbyProductCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useUserLocationStore } from '@/stores/userLocationStore';
import { productsService } from '@/services/api';
import { colors, radius, spacing, typography } from '@/theme';

export default function CustomerProductsScreen() {
  const location = useUserLocationStore((s) => s.location);
  const loadLocation = useUserLocationStore((s) => s.loadLocation);
  const isLoaded = useUserLocationStore((s) => s.isLoaded);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  useEffect(() => {
    if (isLoaded && !location) {
      router.replace('/(customer)/location-setup');
    }
  }, [isLoaded, location]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['nearby-products', location?.latitude, location?.longitude],
    queryFn: () => productsService.getNearby(location!),
    enabled: !!location,
  });

  const filtered = data?.products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.storeName.toLowerCase().includes(search.toLowerCase())
  );

  if (!isLoaded || !location) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Products Near You' }} />
      <ScreenWrapper scroll={false} edges={['bottom']}>
        <TouchableOpacity
          style={styles.locationBar}
          onPress={() => router.push('/(customer)/location-setup')}
        >
          <Ionicons name="location" size={20} color={colors.primary} />
          <View style={styles.locationText}>
            <Text style={styles.locationLabel}>Delivering to</Text>
            <Text style={styles.locationValue} numberOfLines={1}>
              {location.area}, {location.city} – {location.pincode}
            </Text>
          </View>
          <Text style={styles.change}>Change</Text>
        </TouchableOpacity>

        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search products or stores..."
        />

        <View style={styles.statsRow}>
          <Text style={styles.heading}>{filtered?.length ?? 0} products available</Text>
          <TouchableOpacity onPress={() => router.push('/(customer)/nearby-stores')}>
            <Text style={styles.storesLink}>View stores</Text>
          </TouchableOpacity>
        </View>

        {data && (
          <Text style={styles.subheading}>
            From {data.serviceableStoreCount} store(s) within delivery range
          </Text>
        )}

        {isLoading ? (
          <View style={styles.grid}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !filtered?.length ? (
          <EmptyState
            icon="cube-outline"
            title="No Products in Your Area"
            message="No stores deliver to your location. Try changing your address or moving the map pin closer to a store."
            actionLabel="Change Location"
            onAction={() => router.push('/(customer)/location-setup')}
          />
        ) : (
          <FlatList
            data={filtered}
            numColumns={2}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <NearbyProductCard
                product={item}
                onPress={() => router.push(`/(customer)/store/${item.storeId}`)}
              />
            )}
          />
        )}
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationText: { flex: 1 },
  locationLabel: { ...typography.caption, color: colors.textMuted },
  locationValue: { ...typography.bodyMedium, color: colors.text },
  change: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heading: { ...typography.h3, color: colors.text },
  storesLink: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  subheading: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md },
  grid: { flexDirection: 'row', gap: spacing.md },
  gridRow: { justifyContent: 'space-between' },
  list: { paddingBottom: spacing.xxxl },
});
