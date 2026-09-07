import type { PartnerProfile } from '@/types/partner';

export function isPartnerLocationComplete(profile: PartnerProfile | null | undefined): boolean {
  if (!profile) return false;

  if (profile.partnerType === 'INDEPENDENT_SELLER') {
    const s = profile.sellerSetup;
    return !!(s?.latitude && s?.longitude && s?.city && s?.pincode?.length === 6);
  }

  const sd = profile.storeDetails;
  return !!(sd?.latitude && sd?.longitude && sd?.city && sd?.pincode?.length === 6);
}

export function getLocationWarningMessage(partnerType?: PartnerProfile['partnerType']): string {
  if (partnerType === 'INDEPENDENT_SELLER') {
    return 'Set your pickup location and delivery radius first. Products won\'t be listed until location is complete.';
  }
  return 'Set your store location and visibility radius first. Products won\'t be listed until location is complete.';
}
