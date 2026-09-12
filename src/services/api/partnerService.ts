import { USE_MOCK_API, apiClient } from './client';
import { mockApi } from './mock';
import { mapPartnerProfile } from './mappers/partnerProfile';
import type { PartnerProfile } from '@/types/partner';

export async function resolvePartnerProfile(data: unknown): Promise<PartnerProfile> {
  return mapPartnerProfile(data);
}

export const partnerService = {
  getProfile: async () => {
    if (USE_MOCK_API) {
      return mockApi.partner.getProfile();
    }
    return resolvePartnerProfile(await apiClient('/seller/me'));
  },
};
