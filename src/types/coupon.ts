export type SellerCoupon = {
  id: string;
  code: string;
  name: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: string;
  minOrderAmount: string;
  maxDiscount?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  perCustomerLimit: number;
  scopeType: 'GLOBAL' | 'STORE' | 'INDEPENDENT_SELLER';
  storeId?: string | null;
  independentSellerId?: string | null;
  fundingSource: 'PLATFORM' | 'SELLER';
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
};

export type CreateSellerCouponInput = {
  code: string;
  name: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: string;
  minOrderAmount?: string;
  maxDiscount?: string;
  usageLimit?: number;
  perCustomerLimit?: number;
  storeId?: string;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
};
