import type { Banner, BannerPlacement } from '@/types/index';

type ApiBanner = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
  placement?: string;
  sortOrder?: number;
  isActive?: boolean;
};

function toPlacement(value?: string): BannerPlacement {
  if (value === 'HOME_MIDDLE' || value === 'CATEGORY') return value;
  return 'HOME_TOP';
}

export function mapBackendBanner(raw: ApiBanner): Banner {
  return {
    id: raw.id,
    title: raw.title,
    imageUrl: raw.imageUrl,
    linkUrl: raw.linkUrl ?? undefined,
    placement: toPlacement(raw.placement),
    sortOrder: raw.sortOrder ?? 0,
    description: raw.title,
    type: 'campaign',
  };
}
