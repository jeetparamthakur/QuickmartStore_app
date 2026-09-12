import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import * as PartnerStore from '@/stores/partnerStore';
import { partnerService } from '@/services/api/partnerService';

export function usePartnerProfile(options?: { refreshOnFocus?: boolean }) {
  const refreshOnFocus = options?.refreshOnFocus ?? true;
  const profile = PartnerStore.usePartnerStore((s) => s.profile);
  const setProfile = PartnerStore.usePartnerStore((s) => s.setProfile);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const fresh = await partnerService.getProfile();
      setProfile(fresh);
      return fresh;
    } finally {
      setIsLoading(false);
    }
  }, [setProfile]);

  useFocusEffect(
    useCallback(() => {
      if (!refreshOnFocus) return;
      refresh();
    }, [refresh, refreshOnFocus]),
  );

  return { profile, isLoading, refresh };
}
