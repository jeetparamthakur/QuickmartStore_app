import { create } from 'zustand';
import type {
  ApprovalStatus,
  BusinessDetails,
  OnboardingStep,
  PartnerProfile,
  PartnerType,
  SellerSetup,
  StoreDetails,
} from '@/types/partner';

type PartnerState = {
  profile: PartnerProfile | null;
  setPartnerType: (type: PartnerType) => void;
  setBusinessDetails: (details: BusinessDetails) => void;
  setStoreDetails: (details: StoreDetails) => void;
  setSellerSetup: (setup: SellerSetup) => void;
  setOnboardingStep: (step: OnboardingStep) => void;
  setApprovalStatus: (status: ApprovalStatus) => void;
  toggleStoreOpen: () => void;
  setProfile: (profile: PartnerProfile) => void;
  reset: () => void;
};

const defaultProfile: PartnerProfile = {
  id: 'partner-1',
  partnerType: 'STORE',
  approvalStatus: 'pending',
  onboardingStep: 'partner_type',
  isStoreOpen: true,
  name: 'Rahul',
};

export const usePartnerStore = create<PartnerState>((set, get) => ({
  profile: null,

  setPartnerType: (type) =>
    set((s) => ({
      profile: {
        ...(s.profile ?? defaultProfile),
        partnerType: type,
        onboardingStep: 'business_details',
      },
    })),

  setBusinessDetails: (details) =>
    set((s) => ({
      profile: {
        ...(s.profile ?? defaultProfile),
        businessDetails: details,
        name: details.fullName,
        onboardingStep:
          s.profile?.partnerType === 'STORE' ||
          s.profile?.partnerType === 'DARK_STORE'
            ? 'store_details'
            : 'seller_setup',
      },
    })),

  setStoreDetails: (details) =>
    set((s) => ({
      profile: {
        ...(s.profile ?? defaultProfile),
        storeDetails: details,
        onboardingStep: 'kyc',
      },
    })),

  setSellerSetup: (setup) =>
    set((s) => ({
      profile: {
        ...(s.profile ?? defaultProfile),
        sellerSetup: setup,
        onboardingStep: 'kyc',
      },
    })),

  setOnboardingStep: (step) =>
    set((s) => ({
      profile: s.profile ? { ...s.profile, onboardingStep: step } : null,
    })),

  setApprovalStatus: (status) =>
    set((s) => ({
      profile: s.profile
        ? {
            ...s.profile,
            approvalStatus: status,
            onboardingStep:
              status === 'approved' ? 'completed' : 'pending_approval',
          }
        : null,
    })),

  toggleStoreOpen: () =>
    set((s) => ({
      profile: s.profile
        ? { ...s.profile, isStoreOpen: !s.profile.isStoreOpen }
        : null,
    })),

  setProfile: (profile) => set({ profile }),

  reset: () => set({ profile: null }),
}));

export function getOnboardingRoute(step: OnboardingStep): string {
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
  return routes[step];
}
