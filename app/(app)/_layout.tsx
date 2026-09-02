import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { usePartnerStore } from '@/stores/partnerStore';
import { OrderAlertListener } from '@/components/layout/OrderAlertListener';

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const profile = usePartnerStore((s) => s.profile);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!profile || profile.onboardingStep !== 'completed') {
    return <Redirect href="/(onboarding)/partner-type" />;
  }

  if (profile.approvalStatus !== 'approved') {
    return <Redirect href="/(onboarding)/pending-approval" />;
  }

  return (
    <>
      <OrderAlertListener />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F8FAFC' } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="orders/[id]" options={{ headerShown: true, title: 'Order Details' }} />
      <Stack.Screen name="products/add/index" options={{ headerShown: true, title: 'Add Product' }} />
      <Stack.Screen name="products/[id]" options={{ headerShown: true, title: 'Product Details' }} />
      <Stack.Screen name="inventory/index" options={{ headerShown: true, title: 'Inventory' }} />
      <Stack.Screen name="stores/index" options={{ headerShown: true, title: 'My Stores' }} />
      <Stack.Screen name="stores/[id]" options={{ headerShown: true, title: 'Store Details' }} />
      <Stack.Screen name="stores/edit-location" options={{ headerShown: true, title: 'Edit Location' }} />
      <Stack.Screen name="stores/edit-delivery-partner" options={{ headerShown: true, title: 'Delivery Partner Settings' }} />
      <Stack.Screen name="staff/index" options={{ headerShown: true, title: 'Staff Management' }} />
      <Stack.Screen name="analytics/index" options={{ headerShown: true, title: 'Analytics' }} />
      <Stack.Screen name="payouts/index" options={{ headerShown: true, title: 'Payouts' }} />
      <Stack.Screen name="notifications/index" options={{ headerShown: true, title: 'Notifications' }} />
      <Stack.Screen name="support/index" options={{ headerShown: true, title: 'Help & Support' }} />
      <Stack.Screen name="settings/index" options={{ headerShown: true, title: 'Settings' }} />
      </Stack>
    </>
  );
}
