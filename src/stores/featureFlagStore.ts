import { create } from 'zustand';
import type { FeatureFlags } from '@/types/partner';

const defaultFlags: FeatureFlags = {
  seller_ads_enabled: false,
  staff_management_enabled: true,
  multi_store_enabled: true,
  instant_payout_enabled: false,
  product_approval_enabled: true,
};

type FeatureFlagState = {
  flags: FeatureFlags;
  setFlags: (flags: FeatureFlags) => void;
  isEnabled: (flag: keyof FeatureFlags) => boolean;
};

export const useFeatureFlagStore = create<FeatureFlagState>((set, get) => ({
  flags: defaultFlags,
  setFlags: (flags) => set({ flags }),
  isEnabled: (flag) => get().flags[flag],
}));
