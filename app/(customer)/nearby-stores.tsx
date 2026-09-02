import { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { NearbyStoreCard } from '@/components/cards/NearbyStoreCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useUserLocationStore } from '@/stores/userLocationStore';
import { storesService } from '@/services/api';
import { colors, radius, spacing, typography } from '@/theme';

export default function NearbyStoresScreen() {
  const location = useUserLocationStore((s) => s.location);
  const loadLocation = useUserLocationStore((s) => s.loadLocation);
  const isLoaded = useUserLocationStore((s) => s.isLoaded);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  useEffect(() => {
    if (isLoaded && !location) {
      router.replace('/(customer)/location-setup');
    }
  }, [isLoaded, location]);

  const { data: stores, isLoading, isError, refetch } = useQuery({
    queryKey: ['nearby-stores', location?.latitude, location?.longitude, location?.pincode],
    queryFn: () => storesService.getNearby(location!),
    enabled: !!location,
  });

  if (!isLoaded || !location) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Nearby Stores' }} />
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

        <Text style={styles.heading}>Stores near you</Text>
        <Text style={styles.subheading}>
          {stores?.length ?? 0} store(s) delivering to your area
        </Text>

        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !stores?.length ? (
          <EmptyState
            icon="storefront-outline"
            title="No Stores Nearby"
            message="No shops deliver to your location yet. Try a different pincode or area."
            actionLabel="Change Location"
            onAction={() => router.push('/(customer)/location-setup')}
          />
        ) : (
          <FlatList
            data={stores}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <NearbyStoreCard
                store={item}
                rank={index + 1}
                onPress={() => router.push(`/(customer)/store/${item.id}`)}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
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
    marginBottom: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationText: { flex: 1 },
  locationLabel: { ...typography.caption, color: colors.textMuted },
  locationValue: { ...typography.bodyMedium, color: colors.text },
  change: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  heading: { ...typography.h2, color: colors.text },
  subheading: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.lg },
  list: { paddingBottom: spacing.xxxl },
});
