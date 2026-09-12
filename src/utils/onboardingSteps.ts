import type { OnboardingStep, PartnerType } from '@/types/partner';

export const SCREEN_TO_STEP: Record<string, OnboardingStep> = {
  'partner-type': 'partner_type',
  'business-details': 'business_details',
  'store-details': 'store_details',
  'seller-setup': 'seller_setup',
  'food-setup': 'food_setup',
  kyc: 'kyc',
  'bank-setup': 'bank_setup',
  'pending-approval': 'pending_approval',
};

export function getOnboardingStepSequence(partnerType: PartnerType): OnboardingStep[] {
  const setupStep: OnboardingStep =
    partnerType === 'FOOD_STORE'
      ? 'food_setup'
      : partnerType === 'INDEPENDENT_SELLER'
        ? 'seller_setup'
        : 'store_details';

  return [
    'partner_type',
    'business_details',
    setupStep,
    'kyc',
    'bank_setup',
    'pending_approval',
    'completed',
  ];
}

export function getStepIndex(step: OnboardingStep, partnerType: PartnerType): number {
  const sequence = getOnboardingStepSequence(partnerType);
  const index = sequence.indexOf(step);
  return index === -1 ? sequence.length : index;
}

export function getScreenStepFromSegments(segments: string[]): OnboardingStep | null {
  const screen = segments[segments.length - 1];
  return SCREEN_TO_STEP[screen] ?? null;
}

export function shouldRedirectFromScreen(
  currentScreenStep: OnboardingStep,
  savedStep: OnboardingStep,
  partnerType: PartnerType,
): boolean {
  if (currentScreenStep === 'pending_approval') {
    return false;
  }

  if (
    currentScreenStep === 'kyc' &&
    (savedStep === 'pending_approval' || savedStep === 'bank_setup' || savedStep === 'completed')
  ) {
    return false;
  }

  if (savedStep === 'pending_approval' || savedStep === 'completed') {
    return currentScreenStep !== 'kyc';
  }

  return getStepIndex(currentScreenStep, partnerType) < getStepIndex(savedStep, partnerType);
}
