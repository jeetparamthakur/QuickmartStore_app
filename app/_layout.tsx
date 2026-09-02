import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@/stores/authStore';
import { useFeatureFlagStore } from '@/stores/featureFlagStore';
import { setAuthTokenGetter, setOnUnauthorized } from '@/services/api/client';
import { configService } from '@/services/api';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30000 },
  },
});

export default function RootLayout() {
  const loadSession = useAuthStore((s) => s.loadSession);
  const logout = useAuthStore((s) => s.logout);
  const setFlags = useFeatureFlagStore((s) => s.setFlags);

  useEffect(() => {
    setAuthTokenGetter(() => useAuthStore.getState().token);
    setOnUnauthorized(() => logout());
  }, [logout]);

  useEffect(() => {
    async function init() {
      await loadSession();
      try {
        const flags = await configService.getFeatureFlags();
        setFlags(flags);
      } catch {
        // use defaults
      }
      await SplashScreen.hideAsync();
    }
    init();
  }, [loadSession, setFlags]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(app)" />
            <Stack.Screen name="(customer)" />
          </Stack>
        </BottomSheetModalProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
