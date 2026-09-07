import type { Order, OrderStatus } from '@/types/order';
import type { Product, ProductStatus, CatalogSuggestion, NearbyProductsResponse } from '@/types/product';
import type { ProductCategory } from '@/types/category';
import type { ProductListFilters } from '@/types/product';
import type { Store, StaffMember } from '@/types/store';
import type { DeliveryRequest, PartnerDeliveryPreferences } from '@/types/delivery';
import type {
  EarningsSummary,
  EarningsChartPoint,
  AnalyticsOverview,
  AppNotification,
  Banner,
  BankAccount,
  KycInfo,
  Payout,
  InventoryItem,
  InventoryHistoryEntry,
  SupportTicket,
} from '@/types/index';
import type { FeatureFlags, PartnerProfile } from '@/types/partner';
import type { UserLocation, NearbyStore } from '@/types/location';
import { findNearbyStores, findNearbyProducts, isPartnerWithinPickupRadius } from '@/utils/geo';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

let mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: '10245',
    status: 'new',
    items: [
      { id: 'i1', productId: 'p1', name: 'Amul Taaza Milk 1L', quantity: 2, price: 56, variant: '1L' },
      { id: 'i2', productId: 'p2', name: 'Britannia Bread', quantity: 1, price: 45 },
    ],
    itemCount: 3,
    subtotal: 157,
    discount: 10,
    deliveryFee: 30,
    platformCharges: 15,
    total: 192,
    deliveryType: 'platform',
    customerName: 'Customer',
    customerPhone: '+91 98XX XXX XXX',
    customerAddress: '123 Main St, Ludhiana',
    createdAt: new Date().toISOString(),
    prepTimeMinutes: 15,
    prepDeadline: new Date(Date.now() + 15 * 60000).toISOString(),
    storeId: 's1',
    sellerId: 'partner-1',
    deliveryRequestStatus: 'none',
  },
  {
    id: '2',
    orderNumber: '10244',
    status: 'preparing',
    items: [
      { id: 'i3', productId: 'p3', name: 'Maggi Noodles', quantity: 4, price: 14 },
    ],
    itemCount: 4,
    subtotal: 56,
    discount: 0,
    deliveryFee: 20,
    platformCharges: 8,
    total: 84,
    deliveryType: 'platform',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    prepTimeMinutes: 10,
    prepDeadline: new Date(Date.now() + 8 * 60000).toISOString(),
    storeId: 's1',
    sellerId: 'partner-1',
    deliveryRequestStatus: 'none',
  },
  {
    id: '4',
    orderNumber: '10246',
    status: 'ready',
    items: [
      { id: 'i5', productId: 'p1', name: 'Amul Taaza Milk 1L', quantity: 1, price: 56 },
      { id: 'i6', productId: 'p2', name: 'Britannia Bread', quantity: 2, price: 45 },
    ],
    itemCount: 3,
    subtotal: 146,
    discount: 0,
    deliveryFee: 25,
    platformCharges: 12,
    total: 183,
    deliveryType: 'platform',
    customerName: 'Amit Kumar',
    customerPhone: '+91 99XX XXX XXX',
    customerAddress: 'Pakhowal Road, Ludhiana',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    storeId: 's1',
    sellerId: 'partner-1',
    deliveryRequestStatus: 'none',
  },
  {
    id: '5',
    orderNumber: '10247',
    status: 'ready',
    items: [
      { id: 'i7', productId: 'p8', name: 'Handmade Soap Set', quantity: 1, price: 299 },
    ],
    itemCount: 1,
    subtotal: 299,
    discount: 0,
    deliveryFee: 30,
    platformCharges: 15,
    total: 344,
    deliveryType: 'platform',
    customerName: 'Neha',
    customerPhone: '+91 97XX XXX XXX',
    customerAddress: 'Rajguru Nagar, Ludhiana',
    createdAt: new Date(Date.now() - 900000).toISOString(),
    sellerId: 'partner-6',
    deliveryRequestStatus: 'none',
  },
  {
    id: '3',
    orderNumber: '10243',
    status: 'completed',
    items: [
      { id: 'i4', productId: 'p4', name: 'Basmati Rice 5kg', quantity: 1, price: 450 },
    ],
    itemCount: 1,
    subtotal: 450,
    discount: 25,
    deliveryFee: 0,
    platformCharges: 22,
    total: 447,
    deliveryType: 'self',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    storeId: 's1',
    sellerId: 'partner-1',
    deliveryRequestStatus: 'none',
  },
];

let mockDeliveryRequests: DeliveryRequest[] = [];

let mockCategories: ProductCategory[] = [
  { id: 'pc1', storeId: 's1', name: 'Dairy', sortOrder: 0, createdAt: new Date().toISOString() },
  { id: 'pc2', storeId: 's1', name: 'Bakery', sortOrder: 1, createdAt: new Date().toISOString() },
  { id: 'pc3', storeId: 's1', name: 'Snacks', sortOrder: 2, createdAt: new Date().toISOString() },
  { id: 'pc4', storeId: 's2', name: 'Dairy', sortOrder: 0, createdAt: new Date().toISOString() },
  { id: 'pc5', storeId: 's3', name: 'Fruits', sortOrder: 0, createdAt: new Date().toISOString() },
  { id: 'pc6', storeId: 's4', name: 'Grocery', sortOrder: 0, createdAt: new Date().toISOString() },
  { id: 'pc7', storeId: 's5', name: 'Snacks', sortOrder: 0, createdAt: new Date().toISOString() },
];

function getCategoryProductCount(categoryId: string): number {
  return mockProducts.filter((p) => p.categoryId === categoryId).length;
}

function withProductCounts(categories: ProductCategory[]): ProductCategory[] {
  return categories.map((c) => ({ ...c, productCount: getCategoryProductCount(c.id) }));
}

let mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Amul Taaza Milk 1L',
    categoryId: 'pc1',
    category: 'Dairy',
    brand: 'Amul',
    description: 'Fresh toned milk',
    images: [],
    mrp: 62,
    sellingPrice: 56,
    discountPercent: 10,
    quantity: 45,
    lowStockThreshold: 10,
    sku: 'MILK-001',
    status: 'active',
    stockStatus: 'in_stock',
    storeId: 's1',
    createdAt: new Date().toISOString(),
    unitType: 'l',
    packageSize: 1,
    purchasePrice: 48,
    pricePerUnit: 56,
    marginAmount: 8,
    marginPercent: 16.67,
  },
  {
    id: 'p2',
    name: 'Britannia Bread',
    categoryId: 'pc2',
    category: 'Bakery',
    brand: 'Britannia',
    description: 'Whole wheat bread',
    images: [],
    mrp: 50,
    sellingPrice: 45,
    discountPercent: 10,
    quantity: 5,
    lowStockThreshold: 10,
    sku: 'BRD-001',
    status: 'active',
    stockStatus: 'low_stock',
    storeId: 's1',
    createdAt: new Date().toISOString(),
    unitType: 'pcs',
    packageSize: 1,
    purchasePrice: 38,
    pricePerUnit: 45,
    marginAmount: 7,
    marginPercent: 18.42,
  },
  {
    id: 'p3',
    name: 'New Product Draft',
    categoryId: 'pc3',
    category: 'Snacks',
    description: 'Draft product',
    images: [],
    mrp: 100,
    sellingPrice: 90,
    discountPercent: 10,
    quantity: 0,
    lowStockThreshold: 5,
    sku: 'DRF-001',
    status: 'draft',
    stockStatus: 'out_of_stock',
    storeId: 's1',
    createdAt: new Date().toISOString(),
    unitType: 'pcs',
    packageSize: 1,
    purchasePrice: 75,
    pricePerUnit: 90,
    marginAmount: 15,
    marginPercent: 20,
  },
  {
    id: 'p4',
    name: 'Fresh Apples 1kg',
    categoryId: 'pc5',
    category: 'Fruits',
    brand: 'Fresh Mart',
    description: 'Crisp red apples',
    images: [],
    mrp: 180,
    sellingPrice: 159,
    discountPercent: 12,
    quantity: 30,
    lowStockThreshold: 5,
    sku: 'APL-001',
    status: 'active',
    stockStatus: 'in_stock',
    storeId: 's3',
    createdAt: new Date().toISOString(),
    unitType: 'kg',
    packageSize: 1,
    purchasePrice: 130,
    pricePerUnit: 159,
    marginAmount: 29,
    marginPercent: 22.31,
  },
  {
    id: 'p5',
    name: 'Maggi Noodles 4-pack',
    categoryId: 'pc7',
    category: 'Snacks',
    brand: 'Maggi',
    description: 'Instant noodles',
    images: [],
    mrp: 56,
    sellingPrice: 52,
    discountPercent: 7,
    quantity: 80,
    lowStockThreshold: 10,
    sku: 'MAG-001',
    status: 'active',
    stockStatus: 'in_stock',
    storeId: 's5',
    createdAt: new Date().toISOString(),
    unitType: 'pcs',
    packageSize: 4,
    purchasePrice: 44,
    pricePerUnit: 13,
    marginAmount: 8,
    marginPercent: 18.18,
  },
  {
    id: 'p6',
    name: 'Basmati Rice 5kg',
    categoryId: 'pc6',
    category: 'Grocery',
    brand: 'Daily Needs',
    description: 'Premium basmati rice',
    images: [],
    mrp: 520,
    sellingPrice: 450,
    discountPercent: 13,
    quantity: 20,
    lowStockThreshold: 5,
    sku: 'RCE-001',
    status: 'active',
    stockStatus: 'in_stock',
    storeId: 's4',
    createdAt: new Date().toISOString(),
    unitType: 'kg',
    packageSize: 5,
    purchasePrice: 380,
    pricePerUnit: 90,
    marginAmount: 70,
    marginPercent: 18.42,
  },
  {
    id: 'p7',
    name: 'Amul Butter 500g',
    categoryId: 'pc4',
    category: 'Dairy',
    brand: 'Amul',
    description: 'Table butter',
    images: [],
    mrp: 280,
    sellingPrice: 265,
    discountPercent: 5,
    quantity: 15,
    lowStockThreshold: 5,
    sku: 'BTR-001',
    status: 'active',
    stockStatus: 'in_stock',
    storeId: 's2',
    createdAt: new Date().toISOString(),
    unitType: 'g',
    packageSize: 500,
    purchasePrice: 230,
    pricePerUnit: 0.53,
    marginAmount: 35,
    marginPercent: 15.22,
  },
];

const mockStores: Store[] = [
  {
    id: 's1',
    name: 'ABC Supermarket',
    category: 'Grocery',
    description: 'Your neighborhood grocery store',
    address: 'Model Town, Ludhiana',
    city: 'Ludhiana',
    area: 'Model Town',
    pincode: '141002',
    serviceablePincodes: ['141002', '141003', '141001'],
    latitude: 30.901,
    longitude: 75.8573,
    openingTime: '08:00',
    closingTime: '22:00',
    deliveryRadius: 5,
    partnerPickupRadiusKm: 3,
    platformDeliveryEnabled: true,
    contactNumber: '+919876543210',
    isOpen: true,
    activeOrders: 24,
    partnerId: 'partner-1',
  },
  {
    id: 's2',
    name: 'XYZ Grocery',
    category: 'Grocery',
    description: 'Fresh groceries daily',
    address: 'Sector 17, Chandigarh',
    city: 'Chandigarh',
    area: 'Sector 17',
    pincode: '160017',
    serviceablePincodes: ['160017', '160018'],
    latitude: 30.7333,
    longitude: 76.7794,
    openingTime: '07:00',
    closingTime: '23:00',
    deliveryRadius: 4,
    partnerPickupRadiusKm: 4,
    platformDeliveryEnabled: true,
    contactNumber: '+919876543211',
    isOpen: true,
    activeOrders: 5,
    partnerId: 'partner-2',
  },
  {
    id: 's3',
    name: 'Fresh Mart',
    category: 'Grocery',
    description: 'Daily fresh vegetables & fruits',
    address: 'Civil Lines, Ludhiana',
    city: 'Ludhiana',
    area: 'Civil Lines',
    pincode: '141001',
    serviceablePincodes: ['141001', '141002'],
    latitude: 30.912,
    longitude: 75.846,
    openingTime: '07:00',
    closingTime: '21:00',
    deliveryRadius: 3,
    partnerPickupRadiusKm: 2,
    platformDeliveryEnabled: true,
    contactNumber: '+919876543212',
    isOpen: true,
    activeOrders: 12,
    partnerId: 'partner-3',
  },
  {
    id: 's4',
    name: 'Daily Needs Store',
    category: 'General Store',
    description: 'Everything you need daily',
    address: 'BRS Nagar, Ludhiana',
    city: 'Ludhiana',
    area: 'BRS Nagar',
    pincode: '141012',
    serviceablePincodes: ['141012', '141013'],
    latitude: 30.876,
    longitude: 75.801,
    openingTime: '08:00',
    closingTime: '22:00',
    deliveryRadius: 4,
    partnerPickupRadiusKm: 3,
    platformDeliveryEnabled: false,
    contactNumber: '+919876543213',
    isOpen: true,
    activeOrders: 8,
    partnerId: 'partner-4',
  },
  {
    id: 's5',
    name: 'Quick Basket',
    category: 'Quick Commerce',
    description: '10-min delivery dark store',
    address: 'Sarabha Nagar, Ludhiana',
    city: 'Ludhiana',
    area: 'Sarabha Nagar',
    pincode: '141001',
    serviceablePincodes: ['141001', '141002', '141003'],
    latitude: 30.895,
    longitude: 75.832,
    openingTime: '06:00',
    closingTime: '23:00',
    deliveryRadius: 6,
    partnerPickupRadiusKm: 5,
    platformDeliveryEnabled: true,
    contactNumber: '+919876543214',
    isOpen: true,
    activeOrders: 31,
    partnerId: 'partner-5',
  },
];

const mockIndependentSellerSetup: Record<
  string,
  { pickupAddress: string; latitude: number; longitude: number }
> = {
  'partner-6': {
    pickupAddress: 'Home Studio, Sarabha Nagar, Ludhiana',
    latitude: 30.888,
    longitude: 75.845,
  },
};

export const mockApi = {
  auth: {
    sendOtp: async (phone: string) => {
      await delay();
      return { success: true, message: 'OTP sent' };
    },
    verifyOtp: async (phone: string, otp: string) => {
      await delay();
      if (otp.length !== 6) throw new Error('Invalid OTP');
      return { token: 'mock-jwt-token', phone };
    },
    logout: async () => {
      await delay(200);
      return { success: true };
    },
  },

  config: {
    getFeatureFlags: async (): Promise<FeatureFlags> => {
      await delay(200);
      return {
        seller_ads_enabled: false,
        staff_management_enabled: true,
        multi_store_enabled: true,
        instant_payout_enabled: false,
        product_approval_enabled: true,
      };
    },
  },

  partner: {
    getProfile: async (): Promise<PartnerProfile> => {
      await delay();
      return {
        id: 'partner-1',
        partnerType: 'STORE',
        name: 'Rahul',
        approvalStatus: 'approved',
        onboardingStep: 'completed',
        isStoreOpen: true,
        businessDetails: {
          fullName: 'Rahul Sharma',
          storeName: 'ABC Supermarket',
          mobile: '+919876543210',
          email: 'rahul@example.com',
          description: 'Neighborhood grocery store',
          panNumber: 'ABCDE1234F',
        },
      };
    },
  },

  orders: {
    list: async (status?: OrderStatus): Promise<Order[]> => {
      await delay();
      if (!status) return [...mockOrders];
      return mockOrders.filter((o) => o.status === status);
    },
    get: async (id: string): Promise<Order> => {
      await delay();
      const order = mockOrders.find((o) => o.id === id);
      if (!order) throw new Error('Order not found');
      return order;
    },
    updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
      await delay();
      mockOrders = mockOrders.map((o) =>
        o.id === id ? { ...o, status } : o
      );
      const order = mockOrders.find((o) => o.id === id)!;
      return order;
    },
    requestDelivery: async (orderId: string): Promise<Order> => {
      await delay();
      const idx = mockOrders.findIndex((o) => o.id === orderId);
      if (idx === -1) throw new Error('Order not found');

      const order = mockOrders[idx];
      if (order.status !== 'ready') {
        throw new Error('Order must be ready before requesting delivery');
      }
      if (order.deliveryType !== 'platform') {
        throw new Error('Delivery requests are only for platform delivery orders');
      }
      if (order.deliveryRequestStatus === 'requested' || order.deliveryRequestStatus === 'accepted') {
        throw new Error('Delivery request already active');
      }

      let pickupLatitude: number;
      let pickupLongitude: number;
      let pickupAddress: string;
      let sellerType: 'STORE' | 'INDEPENDENT_SELLER';
      let partnerPickupRadiusKm: number | null = null;
      const sellerId = order.sellerId ?? 'partner-1';

      if (order.storeId) {
        const store = mockStores.find((s) => s.id === order.storeId);
        if (!store) throw new Error('Store not found');
        if (!store.platformDeliveryEnabled) {
          throw new Error('Platform delivery is disabled for this store');
        }
        if (!store.latitude || !store.longitude) {
          throw new Error('Store location is not set');
        }
        pickupLatitude = store.latitude;
        pickupLongitude = store.longitude;
        pickupAddress = store.address;
        sellerType = 'STORE';
        partnerPickupRadiusKm = store.partnerPickupRadiusKm;
      } else {
        const sellerSetup = mockIndependentSellerSetup[sellerId];
        if (!sellerSetup?.latitude || !sellerSetup?.longitude) {
          throw new Error('Seller pickup location is not set');
        }
        pickupLatitude = sellerSetup.latitude;
        pickupLongitude = sellerSetup.longitude;
        pickupAddress = sellerSetup.pickupAddress;
        sellerType = 'INDEPENDENT_SELLER';
        partnerPickupRadiusKm = null;
      }

      const now = new Date().toISOString();
      const requestId = `dr-${Date.now()}`;
      const deliveryRequest: DeliveryRequest = {
        id: requestId,
        orderId: order.id,
        storeId: order.storeId,
        sellerId,
        sellerType,
        pickupAddress,
        pickupLatitude,
        pickupLongitude,
        partnerPickupRadiusKm,
        status: 'requested',
        orderTotal: order.total,
        itemCount: order.itemCount,
        customerAddress: order.customerAddress,
        createdAt: now,
      };

      mockDeliveryRequests = mockDeliveryRequests.filter((r) => r.orderId !== orderId);
      mockDeliveryRequests.push(deliveryRequest);

      mockOrders[idx] = {
        ...order,
        deliveryRequestStatus: 'requested',
        deliveryRequestedAt: now,
        pickupLatitude,
        pickupLongitude,
        assignedPartnerId: undefined,
        assignedPartnerName: undefined,
      };

      return mockOrders[idx];
    },
    cancelDeliveryRequest: async (orderId: string): Promise<Order> => {
      await delay();
      const idx = mockOrders.findIndex((o) => o.id === orderId);
      if (idx === -1) throw new Error('Order not found');

      const order = mockOrders[idx];
      if (order.deliveryRequestStatus !== 'requested') {
        throw new Error('Only pending delivery requests can be cancelled');
      }

      mockDeliveryRequests = mockDeliveryRequests.filter((r) => r.orderId !== orderId);
      mockOrders[idx] = {
        ...order,
        deliveryRequestStatus: 'none',
        deliveryRequestedAt: undefined,
      };

      return mockOrders[idx];
    },
  },

  products: {
    list: async (filters?: ProductListFilters): Promise<Product[]> => {
      await delay();
      let results = [...mockProducts];
      if (filters?.status) {
        results = results.filter((p) => p.status === filters.status);
      }
      if (filters?.storeId) {
        results = results.filter((p) => p.storeId === filters.storeId);
      }
      if (filters?.categoryId) {
        results = results.filter((p) => p.categoryId === filters.categoryId);
      }
      return results;
    },
    get: async (id: string): Promise<Product> => {
      await delay();
      const product = mockProducts.find((p) => p.id === id);
      if (!product) throw new Error('Product not found');
      return product;
    },
    create: async (data: Partial<Product>): Promise<Product> => {
      await delay();
      if (!data.storeId || !data.categoryId) {
        throw new Error('storeId and categoryId are required');
      }
      const sellingPrice = data.sellingPrice ?? 0;
      const purchasePrice = data.purchasePrice ?? 0;
      const packageSize = data.packageSize ?? 1;
      const pricePerUnit = data.pricePerUnit ?? (packageSize > 0 ? sellingPrice / packageSize : sellingPrice);
      const marginAmount = data.marginAmount ?? sellingPrice - purchasePrice;
      const marginPercent =
        data.marginPercent ??
        (purchasePrice > 0 ? Math.round((marginAmount / purchasePrice) * 10000) / 100 : 0);
      const product: Product = {
        ...data,
        id: `p${Date.now()}`,
        name: data.name ?? 'New Product',
        categoryId: data.categoryId,
        category: data.category ?? 'General',
        description: data.description ?? '',
        images: data.images ?? [],
        mrp: data.mrp ?? 0,
        sellingPrice,
        discountPercent: data.discountPercent ?? 0,
        quantity: data.quantity ?? 0,
        lowStockThreshold: data.lowStockThreshold ?? 5,
        sku: data.sku ?? `SKU-${Date.now()}`,
        status: data.status ?? 'pending_review',
        stockStatus: 'in_stock',
        createdAt: new Date().toISOString(),
        unitType: data.unitType ?? 'pcs',
        packageSize,
        purchasePrice,
        pricePerUnit,
        marginAmount,
        marginPercent,
      };
      mockProducts = [product, ...mockProducts];
      return product;
    },
    update: async (id: string, data: Partial<Product>): Promise<Product> => {
      await delay();
      mockProducts = mockProducts.map((p) =>
        p.id === id ? { ...p, ...data } : p
      );
      return mockProducts.find((p) => p.id === id)!;
    },
    searchCatalog: async (query: string): Promise<CatalogSuggestion[]> => {
      await delay(300);
      if (query.toLowerCase().includes('amul')) {
        return [
          { id: 'cat1', name: 'Amul Taaza Milk 1L', brand: 'Amul', category: 'Dairy' },
          { id: 'cat2', name: 'Amul Gold Milk 1L', brand: 'Amul', category: 'Dairy' },
        ];
      }
      return [];
    },
    getNearby: async (location: UserLocation): Promise<NearbyProductsResponse> => {
      await delay(500);
      const products = findNearbyProducts(mockProducts, mockStores, location);
      const storeIds = new Set(products.map((p) => p.storeId));
      return {
        products,
        serviceableStoreCount: storeIds.size,
      };
    },
  },

  categories: {
    list: async (storeId: string): Promise<ProductCategory[]> => {
      await delay();
      const categories = mockCategories
        .filter((c) => c.storeId === storeId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      return withProductCounts(categories);
    },
    get: async (id: string): Promise<ProductCategory> => {
      await delay();
      const category = mockCategories.find((c) => c.id === id);
      if (!category) throw new Error('Category not found');
      return { ...category, productCount: getCategoryProductCount(id) };
    },
    create: async (storeId: string, data: { name: string }): Promise<ProductCategory> => {
      await delay();
      const trimmed = data.name.trim();
      if (!trimmed) throw new Error('Category name is required');
      const duplicate = mockCategories.find(
        (c) => c.storeId === storeId && c.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (duplicate) throw new Error('A category with this name already exists');
      const storeCategories = mockCategories.filter((c) => c.storeId === storeId);
      const category: ProductCategory = {
        id: `pc${Date.now()}`,
        storeId,
        name: trimmed,
        sortOrder: storeCategories.length,
        productCount: 0,
        createdAt: new Date().toISOString(),
      };
      mockCategories = [...mockCategories, category];
      return category;
    },
    update: async (id: string, data: { name: string }): Promise<ProductCategory> => {
      await delay();
      const idx = mockCategories.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error('Category not found');
      const trimmed = data.name.trim();
      if (!trimmed) throw new Error('Category name is required');
      const storeId = mockCategories[idx].storeId;
      const duplicate = mockCategories.find(
        (c) => c.storeId === storeId && c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (duplicate) throw new Error('A category with this name already exists');
      mockCategories[idx] = { ...mockCategories[idx], name: trimmed };
      return { ...mockCategories[idx], productCount: getCategoryProductCount(id) };
    },
    delete: async (id: string): Promise<void> => {
      await delay();
      const hasProducts = mockProducts.some((p) => p.categoryId === id);
      if (hasProducts) throw new Error('Cannot delete a category that has products');
      mockCategories = mockCategories.filter((c) => c.id !== id);
    },
  },

  stores: {
    list: async (): Promise<Store[]> => {
      await delay();
      return [...mockStores];
    },
    get: async (id: string): Promise<Store> => {
      await delay();
      const store = mockStores.find((s) => s.id === id);
      if (!store) throw new Error('Store not found');
      return store;
    },
    getNearby: async (location: UserLocation): Promise<NearbyStore[]> => {
      await delay(500);
      return findNearbyStores(mockStores, location);
    },
    toggleStatus: async (id: string, isOpen: boolean): Promise<Store> => {
      await delay();
      const idx = mockStores.findIndex((s) => s.id === id);
      mockStores[idx] = { ...mockStores[idx], isOpen };
      return mockStores[idx];
    },
    updateLocation: async (
      id: string,
      data: {
        address: string;
        city: string;
        area: string;
        pincode: string;
        latitude: number;
        longitude: number;
        deliveryRadius: number;
      }
    ): Promise<Store> => {
      await delay();
      const idx = mockStores.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error('Store not found');
      mockStores[idx] = { ...mockStores[idx], ...data };
      return mockStores[idx];
    },
    updatePartnerPickupSettings: async (
      id: string,
      data: { partnerPickupRadiusKm: number; platformDeliveryEnabled: boolean }
    ): Promise<Store> => {
      await delay();
      const idx = mockStores.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error('Store not found');
      mockStores[idx] = { ...mockStores[idx], ...data };
      return mockStores[idx];
    },
  },

  delivery: {
    getAvailableRequests: async (
      latitude: number,
      longitude: number,
      preferences: PartnerDeliveryPreferences
    ): Promise<DeliveryRequest[]> => {
      await delay();
      return mockDeliveryRequests.filter((request) => {
        if (request.status !== 'requested') return false;

        if (request.sellerType === 'INDEPENDENT_SELLER') {
          return preferences.scope === 'all_sellers';
        }

        if (preferences.scope !== 'store') return false;
        if (preferences.storeId && request.storeId !== preferences.storeId) return false;

        if (request.partnerPickupRadiusKm == null || !request.pickupLatitude || !request.pickupLongitude) {
          return false;
        }

        return isPartnerWithinPickupRadius(
          latitude,
          longitude,
          request.pickupLatitude,
          request.pickupLongitude,
          request.partnerPickupRadiusKm
        );
      });
    },
    acceptRequest: async (requestId: string, partnerId: string, partnerName: string): Promise<DeliveryRequest> => {
      await delay();
      const reqIdx = mockDeliveryRequests.findIndex((r) => r.id === requestId);
      if (reqIdx === -1) throw new Error('Delivery request not found');

      const request = mockDeliveryRequests[reqIdx];
      if (request.status !== 'requested') throw new Error('Request is no longer available');

      mockDeliveryRequests[reqIdx] = { ...request, status: 'accepted' };

      const orderIdx = mockOrders.findIndex((o) => o.id === request.orderId);
      if (orderIdx !== -1) {
        mockOrders[orderIdx] = {
          ...mockOrders[orderIdx],
          deliveryRequestStatus: 'accepted',
          assignedPartnerId: partnerId,
          assignedPartnerName: partnerName,
        };
      }

      return mockDeliveryRequests[reqIdx];
    },
    rejectRequest: async (requestId: string, _partnerId: string): Promise<DeliveryRequest> => {
      await delay();
      const reqIdx = mockDeliveryRequests.findIndex((r) => r.id === requestId);
      if (reqIdx === -1) throw new Error('Delivery request not found');

      const request = mockDeliveryRequests[reqIdx];
      mockDeliveryRequests[reqIdx] = { ...request, status: 'rejected' };

      const orderIdx = mockOrders.findIndex((o) => o.id === request.orderId);
      if (orderIdx !== -1) {
        mockOrders[orderIdx] = {
          ...mockOrders[orderIdx],
          deliveryRequestStatus: 'rejected',
          assignedPartnerId: undefined,
          assignedPartnerName: undefined,
        };
      }

      return mockDeliveryRequests[reqIdx];
    },
  },

  earnings: {
    getSummary: async (): Promise<EarningsSummary> => {
      await delay();
      return {
        today: 12450,
        week: 78200,
        month: 324500,
        total: 1250000,
        pendingSettlement: 8500,
        availableBalance: 25000,
        nextSettlement: 8500,
        nextSettlementDate: '2026-09-10',
      };
    },
    getChart: async (period: string): Promise<EarningsChartPoint[]> => {
      await delay();
      return [
        { label: 'Mon', value: 4200 },
        { label: 'Tue', value: 5800 },
        { label: 'Wed', value: 3900 },
        { label: 'Thu', value: 7200 },
        { label: 'Fri', value: 6100 },
        { label: 'Sat', value: 8900 },
        { label: 'Sun', value: 12450 },
      ];
    },
    getPayouts: async (): Promise<Payout[]> => {
      await delay();
      return [
        { id: 'pay1', amount: 15000, status: 'completed', date: '2026-08-25', reference: 'PAY001' },
        { id: 'pay2', amount: 8500, status: 'processing', date: '2026-09-10', reference: 'PAY002' },
      ];
    },
  },

  analytics: {
    getOverview: async (): Promise<AnalyticsOverview> => {
      await delay();
      return {
        totalViews: 12500,
        productViews: 8200,
        orders: 342,
        conversionRate: 2.7,
        topProducts: [
          { id: 'p1', name: 'Amul Taaza Milk 1L', sales: 245 },
          { id: 'p2', name: 'Britannia Bread', sales: 189 },
        ],
        lowProducts: [
          { id: 'p3', name: 'Maggi Noodles', sales: 12 },
        ],
      };
    },
  },

  kyc: {
    getStatus: async (): Promise<KycInfo> => {
      await delay();
      return { status: 'approved', documents: [] };
    },
    uploadDocument: async (type: string, uri: string) => {
      await delay(800);
      return { success: true };
    },
  },

  bank: {
    get: async (): Promise<BankAccount> => {
      await delay();
      return {
        accountHolderName: 'Rahul Sharma',
        bankName: 'HDFC Bank',
        accountNumber: '****4567',
        ifscCode: 'HDFC0001234',
        verificationStatus: 'verified',
      };
    },
    update: async (data: Partial<BankAccount>): Promise<BankAccount> => {
      await delay();
      return {
        accountHolderName: data.accountHolderName ?? '',
        bankName: data.bankName ?? '',
        accountNumber: data.accountNumber ?? '',
        ifscCode: data.ifscCode ?? '',
        verificationStatus: 'pending',
      };
    },
  },

  staff: {
    list: async (): Promise<StaffMember[]> => {
      await delay();
      return [
        {
          id: 'st1',
          name: 'Priya Singh',
          email: 'priya@example.com',
          phone: '+919876543212',
          role: 'order_manager',
          storeId: 's1',
          permissions: {
            manageOrders: true,
            manageProducts: false,
            manageInventory: false,
            viewEarnings: false,
          },
          createdAt: new Date().toISOString(),
        },
      ];
    },
  },

  notifications: {
    list: async (): Promise<AppNotification[]> => {
      await delay();
      return [
        {
          id: 'n1',
          type: 'new_order',
          title: 'New Order #10245',
          message: 'You have a new order worth ₹192',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'n2',
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: 'Britannia Bread is running low (5 units left)',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'n3',
          type: 'payout',
          title: 'Payout Processed',
          message: '₹15,000 has been transferred to your account',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
    },
    markRead: async (id: string) => {
      await delay(200);
      return { success: true };
    },
  },

  banners: {
    list: async (): Promise<Banner[]> => {
      await delay(200);
      return [
        {
          id: 'b1',
          title: 'Festival Campaign 🎉',
          description: 'Boost your sales this festive season with special offers',
          type: 'campaign',
        },
        {
          id: 'b2',
          title: 'Commission Update',
          description: 'New commission structure effective from Oct 1',
          type: 'commission',
        },
      ];
    },
  },

  inventory: {
    list: async (): Promise<InventoryItem[]> => {
      await delay();
      return mockProducts.map((p) => ({
        id: p.id,
        productId: p.id,
        productName: p.name,
        available: p.quantity,
        lowStockThreshold: p.lowStockThreshold,
        stockStatus: p.stockStatus,
      }));
    },
    updateStock: async (productId: string, quantity: number) => {
      await delay();
      mockProducts = mockProducts.map((p) =>
        p.id === productId
          ? {
              ...p,
              quantity,
              stockStatus:
                quantity === 0
                  ? 'out_of_stock'
                  : quantity <= p.lowStockThreshold
                    ? 'low_stock'
                    : 'in_stock',
            }
          : p
      );
      return { success: true };
    },
    getHistory: async (): Promise<InventoryHistoryEntry[]> => {
      await delay();
      return [
        {
          id: 'h1',
          productId: 'p1',
          productName: 'Amul Taaza Milk 1L',
          change: -2,
          newQuantity: 45,
          reason: 'Order fulfilled',
          createdAt: new Date().toISOString(),
        },
      ];
    },
  },

  support: {
    getFaqs: async () => {
      await delay();
      return [
        { id: 'f1', question: 'How do I add a product?', answer: 'Go to Products tab and tap Add Product.' },
        { id: 'f2', question: 'When do I get paid?', answer: 'Settlements happen weekly on Mondays.' },
        { id: 'f3', question: 'How to manage orders?', answer: 'Accept new orders from the Orders tab within 5 minutes.' },
      ];
    },
    createTicket: async (subject: string, description: string): Promise<SupportTicket> => {
      await delay();
      return {
        id: `t${Date.now()}`,
        subject,
        description,
        status: 'open',
        createdAt: new Date().toISOString(),
      };
    },
    listTickets: async (): Promise<SupportTicket[]> => {
      await delay();
      return [];
    },
  },
};
