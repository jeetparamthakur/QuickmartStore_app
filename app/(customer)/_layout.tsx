import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { useUserLocationStore } from '@/stores/userLocationStore';

const LOCATION_EXEMPT = ['location-setup'];

export default function CustomerLayout() {
  const location = useUserLocationStore((s) => s.location);
  const isLoaded = useUserLocationStore((s) => s.isLoaded);
  const loadLocation = useUserLocationStore((s) => s.loadLocation);
  const segments = useSegments();

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  useEffect(() => {
    if (!isLoaded) return;
    const current = segments[segments.length - 1];
    if (!location && current && !LOCATION_EXEMPT.includes(current)) {
      router.replace('/(customer)/location-setup');
    }
  }, [isLoaded, location, segments]);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#F8FAFC' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="location-setup" options={{ title: 'Delivery Location' }} />
      <Stack.Screen name="products" options={{ title: 'Products Near You' }} />
      <Stack.Screen name="nearby-stores" options={{ title: 'Nearby Stores' }} />
      <Stack.Screen name="store/[id]" options={{ title: 'Store' }} />
    </Stack>
  );
}
