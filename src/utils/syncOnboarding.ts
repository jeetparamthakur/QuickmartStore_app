import { setOnboardingComplete } from '@/stores/authStore';
import type { PartnerProfile } from '@/types/partner';

export async function syncOnboardingComplete(profile: PartnerProfile): Promise<void> {
  const complete =
    profile.onboardingStep === 'completed' && profile.approvalStatus === 'approved';
  await setOnboardingComplete(complete);
}
