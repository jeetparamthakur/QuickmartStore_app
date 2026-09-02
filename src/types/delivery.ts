import type { DeliveryRequestStatus } from '@/types/order';

export type DeliveryRequest = {
  id: string;
  orderId: string;
  storeId?: string;
  sellerId: string;
  sellerType: 'STORE' | 'INDEPENDENT_SELLER';
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  partnerPickupRadiusKm: number | null;
  status: DeliveryRequestStatus;
  orderTotal: number;
  itemCount: number;
  customerAddress?: string;
  createdAt: string;
};

export type PartnerDeliveryScope = 'store' | 'all_sellers';

export type PartnerDeliveryPreferences = {
  scope: PartnerDeliveryScope;
  storeId?: string;
};
