export type PartnerType = 'STORE' | 'INDEPENDENT_SELLER' | 'BRAND' | 'DARK_STORE';

export type OnboardingStep =
  | 'partner_type'
  | 'business_details'
  | 'store_details'
  | 'seller_setup'
  | 'kyc'
  | 'bank_setup'
  | 'pending_approval'
  | 'completed';

export type ApprovalStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export type FeatureFlags = {
  seller_ads_enabled: boolean;
  staff_management_enabled: boolean;
  multi_store_enabled: boolean;
  instant_payout_enabled: boolean;
  product_approval_enabled: boolean;
};

export type PartnerPermissions = {
  manageOrders: boolean;
  manageProducts: boolean;
  manageInventory: boolean;
  viewEarnings: boolean;
  manageStores: boolean;
  manageStaff: boolean;
  viewAnalytics: boolean;
};

export type BusinessDetails = {
  fullName: string;
  businessName: string;
  businessType: string;
  mobile: string;
  email: string;
  description: string;
  gstNumber?: string;
  panNumber?: string;
  registrationDetails?: string;
};

export type StoreDetails = {
  name: string;
  category: string;
  description: string;
  logo?: string;
  coverImage?: string;
  address: string;
  city: string;
  area: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  openingTime: string;
  closingTime: string;
  deliveryRadius: number;
  partnerPickupRadiusKm: number;
  platformDeliveryEnabled: boolean;
  contactNumber: string;
};

export type SellerSetup = {
  sellerName: string;
  shopName?: string;
  pickupAddress: string;
  city: string;
  area: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  deliveryRadius: number;
  productCategory: string;
  deliveryPreference: string;
};

export type PartnerProfile = {
  id: string;
  partnerType: PartnerType;
  businessDetails?: BusinessDetails;
  storeDetails?: StoreDetails;
  sellerSetup?: SellerSetup;
  approvalStatus: ApprovalStatus;
  onboardingStep: OnboardingStep;
  isStoreOpen: boolean;
  name: string;
};

export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  STORE: 'Store / Shop Owner',
  INDEPENDENT_SELLER: 'Independent Seller',
  BRAND: 'Brand / Business',
  DARK_STORE: 'Dark Store Partner',
};

export const PARTNER_TYPE_DESCRIPTIONS: Record<PartnerType, string> = {
  STORE: 'Apne store ke multiple products aur inventory manage karein.',
  INDEPENDENT_SELLER: 'Apne ek ya multiple products online sell karein.',
  BRAND: 'Apne branded products multiple customers tak pahunchayein.',
  DARK_STORE: 'Fast delivery ke liye inventory-based fulfillment store operate karein.',
};
