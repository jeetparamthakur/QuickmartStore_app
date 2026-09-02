import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore, isOnboardingComplete } from '@/stores/authStore';
import { usePartnerStore, getOnboardingRoute } from '@/stores/partnerStore';
import { partnerService } from '@/services/api';
import { colors } from '@/theme';

export default function Index() {
  const { isLoading, isAuthenticated } = useAuthStore();
  const profile = usePartnerStore((s) => s.profile);
  const setProfile = usePartnerStore((s) => s.setProfile);
  const [checking, setChecking] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    async function check() {
      if (isAuthenticated) {
        const done = await isOnboardingComplete();
        setOnboardingDone(done);
        if (done && !profile) {
          try {
            const p = await partnerService.getProfile();
            setProfile(p);
          } catch {
            // ignore
          }
        }
      }
      setChecking(false);
    }
    if (!isLoading) check();
  }, [isLoading, isAuthenticated, profile, setProfile]);

  if (isLoading || checking) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/splash" />;
  }

  if (!onboardingDone || !profile || profile.onboardingStep !== 'completed') {
    const step = profile?.onboardingStep ?? 'partner_type';
    return <Redirect href={getOnboardingRoute(step) as '/'} />;
  }

  if (profile.approvalStatus !== 'approved') {
    return <Redirect href="/(onboarding)/pending-approval" />;
  }

  return <Redirect href="/(app)/(tabs)" />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
