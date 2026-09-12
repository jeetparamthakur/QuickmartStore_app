import { Stack } from 'expo-router';
import { OnboardingStepGuard } from '@/components/onboarding/OnboardingStepGuard';
import { colors } from '@/theme';

export default function OnboardingLayout() {
  return (
    <>
      <OnboardingStepGuard />
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTitle: '',
          contentStyle: { backgroundColor: colors.background },
          gestureEnabled: false,
        }}
      />
    </>
  );
}
