import type {
  ApprovalStatus,
  BusinessDetails,
  OnboardingStep,
  PartnerProfile,
  PartnerType,
  SellerSetup,
  StoreDetails,
} from '@/types/partner';
import type { KycInfo } from '@/types/index';

type SellerMeResponse = {
  id: string;
  name?: string;
  partnerType?: PartnerType;
  onboardingStep?: OnboardingStep;
  approvalStatus?: ApprovalStatus;
  isStoreOpen?: boolean;
  businessDetails?: BusinessDetails;
  storeDetails?: StoreDetails;
  sellerSetup?: SellerSetup;
  kyc?: KycInfo;
};

export function mapPartnerProfile(data: unknown): PartnerProfile {
  const d = (data ?? {}) as SellerMeResponse;
  return {
    id: String(d.id ?? 'unknown'),
    name: String(d.name ?? ''),
    partnerType: d.partnerType ?? 'STORE',
    approvalStatus: d.approvalStatus ?? 'pending',
    onboardingStep: d.onboardingStep ?? 'partner_type',
    isStoreOpen: d.isStoreOpen ?? true,
    businessDetails: d.businessDetails,
    storeDetails: d.storeDetails,
    sellerSetup: d.sellerSetup,
  };
}

export function getPostAuthRoute(profile: PartnerProfile): string {
  if (profile.onboardingStep === 'completed' && profile.approvalStatus === 'approved') {
    return '/(app)/(tabs)';
  }
  if (
    profile.onboardingStep === 'pending_approval' ||
    profile.onboardingStep === 'completed' ||
    profile.approvalStatus === 'under_review' ||
    profile.approvalStatus === 'rejected'
  ) {
    if (profile.approvalStatus !== 'approved') {
      return '/(onboarding)/pending-approval';
    }
  }
  const routes: Record<OnboardingStep, string> = {
    partner_type: '/(onboarding)/partner-type',
    business_details: '/(onboarding)/business-details',
    store_details: '/(onboarding)/store-details',
    seller_setup: '/(onboarding)/seller-setup',
    kyc: '/(onboarding)/kyc',
    bank_setup: '/(onboarding)/bank-setup',
    pending_approval: '/(onboarding)/pending-approval',
    completed: '/(app)/(tabs)',
  };
  return routes[profile.onboardingStep] ?? '/(onboarding)/partner-type';
}
