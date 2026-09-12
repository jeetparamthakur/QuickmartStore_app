import { useCallback } from 'react';
import { useFocusEffect, useSegments, router } from 'expo-router';
import { usePartnerStore } from '@/stores/partnerStore';
import { partnerService } from '@/services/api';
import { getPostAuthRoute } from '@/services/api/mappers/partnerProfile';
import {
  getScreenStepFromSegments,
  shouldRedirectFromScreen,
} from '@/utils/onboardingSteps';

export function OnboardingStepGuard() {
  const segments = useSegments();
  const setProfile = usePartnerStore((s) => s.setProfile);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function check() {
        try {
          const profile = await partnerService.getProfile();
          if (!active) return;

          setProfile(profile);

          const currentScreenStep = getScreenStepFromSegments(segments as string[]);
          if (!currentScreenStep) return;

          if (
            shouldRedirectFromScreen(
              currentScreenStep,
              profile.onboardingStep,
              profile.partnerType,
            )
          ) {
            router.replace(getPostAuthRoute(profile) as '/');
          }
        } catch {
          // Keep current screen if profile fetch fails
        }
      }

      check();

      return () => {
        active = false;
      };
    }, [segments, setProfile]),
  );

  return null;
}
