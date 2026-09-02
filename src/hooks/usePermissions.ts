import { useMemo } from 'react';
import { usePartnerStore } from '@/stores/partnerStore';
import { useFeatureFlagStore } from '@/stores/featureFlagStore';
import { partnerModules, getPermissions } from '@/constants/partnerModules';
import type { PartnerType } from '@/types/partner';

export function usePartnerConfig() {
  const partnerType = usePartnerStore((s) => s.profile?.partnerType ?? 'STORE');
  return useMemo(() => partnerModules[partnerType], [partnerType]);
}

export function usePermissions() {
  const partnerType = usePartnerStore((s) => s.profile?.partnerType ?? 'STORE');
  const flags = useFeatureFlagStore((s) => s.flags);
  return useMemo(() => getPermissions(partnerType, flags), [partnerType, flags]);
}

export function useFeatureFlag(flag: keyof import('@/types/partner').FeatureFlags) {
  return useFeatureFlagStore((s) => s.flags[flag]);
}

export function usePartnerType(): PartnerType {
  return usePartnerStore((s) => s.profile?.partnerType ?? 'STORE');
}
