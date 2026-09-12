import type {
  ApprovalStatus,
  BusinessDetails,
  FoodSetup,
  OnboardingStep,
  PartnerProfile,
  PartnerType,
  SellerSetup,
  StoreDetails,
} from '@/types/partner';
import type { BankAccount, KycInfo } from '@/types/index';

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
  foodSetup?: FoodSetup;
  bankDetails?: BankAccount;
  kyc?: KycInfo;
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object') return undefined;
  return value as Record<string, unknown>;
}

function mapBankDetails(value: unknown): BankAccount | undefined {
  const d = asRecord(value);
  if (!d) return undefined;

  const accountHolderName = String(d.accountHolderName ?? d.account_holder_name ?? '').trim();
  const bankName = String(d.bankName ?? d.bank_name ?? '').trim();
  const accountNumber = String(d.accountNumber ?? d.account_number ?? '').trim();
  const ifscCode = String(d.ifscCode ?? d.ifsc_code ?? '').trim();
  const rawStatus = String(d.verificationStatus ?? d.verification_status ?? 'pending');

  if (!accountHolderName && !bankName && !accountNumber && !ifscCode) {
    return undefined;
  }

  const verificationStatus =
    rawStatus === 'verified' || rawStatus === 'failed' || rawStatus === 'pending'
      ? rawStatus
      : 'pending';

  return {
    accountHolderName,
    bankName,
    accountNumber,
    ifscCode,
    verificationStatus,
  };
}

export function mapPartnerProfile(data: unknown): PartnerProfile {
  const d = (data ?? {}) as SellerMeResponse;
  const businessDetails = d.businessDetails;

  return {
    id: String(d.id ?? 'unknown'),
    name: String(d.name ?? businessDetails?.fullName ?? ''),
    partnerType: d.partnerType ?? 'STORE',
    approvalStatus: d.approvalStatus ?? 'pending',
    onboardingStep: d.onboardingStep ?? 'partner_type',
    isStoreOpen: d.isStoreOpen ?? true,
    businessDetails,
    storeDetails: d.storeDetails,
    sellerSetup: d.sellerSetup,
    foodSetup: d.foodSetup,
    bankDetails: mapBankDetails(d.bankDetails),
  };
}

/** Keep app access when a settings update returns stale onboarding state from the API. */
export function preservePartnerAccess(
  current: PartnerProfile | null | undefined,
  updated: PartnerProfile,
): PartnerProfile {
  if (
    current?.onboardingStep === 'completed' &&
    current.approvalStatus === 'approved'
  ) {
    return {
      ...updated,
      onboardingStep: 'completed',
      approvalStatus: 'approved',
    };
  }
  return updated;
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
    food_setup: '/(onboarding)/food-setup',
    kyc: '/(onboarding)/kyc',
    bank_setup: '/(onboarding)/bank-setup',
    pending_approval: '/(onboarding)/pending-approval',
    completed: '/(app)/(tabs)',
  };
  return routes[profile.onboardingStep] ?? '/(onboarding)/partner-type';
}
