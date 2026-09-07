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
  email: string;
  description: string;
  panNumber: string;
  storeName?: string;
  businessName?: string;
  businessType?: string;
  mobile?: string;
  gstNumber?: string;
  registrationDetails?: string;
};

export type StoreDetails = {
  name: string;
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
  is24Hours: boolean;
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
  STORE: 'Build Your Store',
  INDEPENDENT_SELLER: 'Independent Seller',
  BRAND: 'Brand / Business',
  DARK_STORE: 'Dark Store Partner',
};

export const PARTNER_TYPE_DESCRIPTIONS: Record<PartnerType, string> = {
  STORE: 'Create and manage your store with inventory, orders, and payouts in one place.',
  INDEPENDENT_SELLER: 'Sell your products independently without setting up a full store.',
  BRAND: 'Apne branded products multiple customers tak pahunchayein.',
  DARK_STORE: 'Fast delivery ke liye inventory-based fulfillment store operate karein.',
};

export const PARTNER_TYPE_BENEFITS: Record<PartnerType, string[]> = {
  STORE: [
    'Manage multiple products and inventory',
    'Track orders and earnings in real time',
    'Configure delivery and service area',
  ],
  INDEPENDENT_SELLER: [
    'List products without a physical storefront',
    'Manage orders and payouts easily',
    'Set your own pickup and service radius',
  ],
  BRAND: [],
  DARK_STORE: [],
};
