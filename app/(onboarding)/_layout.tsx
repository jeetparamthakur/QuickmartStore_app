import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { StepProgress } from '@/components/layout/StepProgress';
import { usePartnerStore } from '@/stores/partnerStore';
import { colors, spacing } from '@/theme';

const stepMap: Record<string, number> = {
  'partner-type': 1,
  'business-details': 2,
  'store-details': 3,
  'seller-setup': 3,
  'food-setup': 3,
  kyc: 4,
  'bank-setup': 5,
};

export default function OnboardingLayout() {
  const step = usePartnerStore((s) => s.profile?.onboardingStep);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTitle: '',
        contentStyle: { backgroundColor: colors.background },
      }}
      screenListeners={({ route }) => ({
        focus: () => {},
      })}
    />
  );
}
