export type Store = {
  id: string;
  name: string;
  category: string;
  description: string;
  logo?: string;
  coverImage?: string;
  address: string;
  city?: string;
  area?: string;
  pincode?: string;
  serviceablePincodes?: string[];
  latitude?: number;
  longitude?: number;
  openingTime: string;
  closingTime: string;
  deliveryRadius: number;
  partnerPickupRadiusKm: number;
  platformDeliveryEnabled: boolean;
  contactNumber: string;
  isOpen: boolean;
  activeOrders: number;
  partnerId: string;
};

export type StaffRole = 'store_manager' | 'order_manager' | 'inventory_manager';

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  storeId: string;
  permissions: {
    manageOrders: boolean;
    manageProducts: boolean;
    manageInventory: boolean;
    viewEarnings: boolean;
  };
  createdAt: string;
};

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  store_manager: 'Store Manager',
  order_manager: 'Order Manager',
  inventory_manager: 'Inventory Manager',
};
