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
    set((s) => {
      const profile = s.profile ?? defaultProfile;
      const isStore = profile.partnerType === 'STORE';

      return {
        profile: {
          ...profile,
          businessDetails: details,
          name: details.fullName,
          onboardingStep: isStore ? 'store_details' : 'seller_setup',
          ...(isStore && details.storeName
            ? {
                storeDetails: {
                  ...profile.storeDetails,
                  name: details.storeName,
                  description: details.description ?? profile.storeDetails?.description ?? '',
                  address: profile.storeDetails?.address ?? '',
                  city: profile.storeDetails?.city ?? '',
                  area: profile.storeDetails?.area ?? '',
                  pincode: profile.storeDetails?.pincode ?? '',
                  openingTime: profile.storeDetails?.openingTime ?? '08:00',
                  closingTime: profile.storeDetails?.closingTime ?? '22:00',
                  is24Hours: profile.storeDetails?.is24Hours ?? false,
                  deliveryRadius: profile.storeDetails?.deliveryRadius ?? 5,
                  partnerPickupRadiusKm: profile.storeDetails?.partnerPickupRadiusKm ?? 3,
                  platformDeliveryEnabled: profile.storeDetails?.platformDeliveryEnabled ?? true,
                  contactNumber: profile.storeDetails?.contactNumber ?? details.mobile ?? '',
                },
              }
            : {}),
        },
      };
    }),

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
