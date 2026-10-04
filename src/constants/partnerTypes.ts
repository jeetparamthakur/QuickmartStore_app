import type { PartnerType } from '@/types/partner';

/** Partner types shown on the onboarding seller-type screen (new signups). */
export const ONBOARDING_PARTNER_TYPES: PartnerType[] = ['STORE', 'FOOD_STORE'];

export function isOnboardingPartnerType(type: PartnerType): boolean {
  return ONBOARDING_PARTNER_TYPES.includes(type);
}
