import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { usePartnerStore, getOnboardingRoute } from '@/stores/partnerStore';
import { partnerService } from '@/services/api';
import { getPostAuthRoute } from '@/services/api/mappers/partnerProfile';
import { syncOnboardingComplete } from '@/utils/syncOnboarding';
import { colors } from '@/theme';

export default function Index() {
  const { isLoading, isAuthenticated } = useAuthStore();
  const setProfile = usePartnerStore((s) => s.setProfile);
  const [checking, setChecking] = useState(true);
  const [route, setRoute] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      if (!isAuthenticated) {
        setChecking(false);
        return;
      }

      try {
        const currentProfile = await partnerService.getProfile();
        setProfile(currentProfile);
        await syncOnboardingComplete(currentProfile);
        setRoute(getPostAuthRoute(currentProfile));
      } catch {
        const step = usePartnerStore.getState().profile?.onboardingStep ?? 'partner_type';
        setRoute(getOnboardingRoute(step));
      } finally {
        setChecking(false);
      }
    }

    if (!isLoading) {
      check();
    }
  }, [isLoading, isAuthenticated, setProfile]);

  if (isLoading || checking) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (route) {
    return <Redirect href={route as '/'} />;
  }

  return <Redirect href="/(onboarding)/partner-type" />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
