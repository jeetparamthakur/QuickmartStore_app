import { USE_MOCK_API, apiClient, normalizePhone, uploadImageOnly, uploadMultipart } from './client';
import { mapBackendBanner } from './mappers/banner';
import { mockApi } from './mock';
import { partnerService, resolvePartnerProfile } from './partnerService';
import type { Order, OrderStatus } from '@/types/order';
import type { ProductTab, Product, ProductListFilters, CatalogSuggestion } from '@/types/product';
import { matchesProductTab } from '@/types/product';
import type { ProductCategory } from '@/types/category';
import type { UserLocation } from '@/types/location';
import type { PartnerDeliveryPreferences } from '@/types/delivery';
import type { BankAccount, EarningsSummary, InventoryItem, KycInfo } from '@/types/index';
import type { StaffMember, Store } from '@/types/store';
import type { OnboardingStep, PartnerType } from '@/types/partner';

export type { ProductListFilters };

function withStoreId(path: string, storeId?: string): string {
  if (!storeId) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}storeId=${encodeURIComponent(storeId)}`;
}

function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export const authService = {
  sendOtp: (phone: string) =>
    USE_MOCK_API
      ? mockApi.auth.sendOtp(phone)
      : apiClient('/auth/otp/send', {
          method: 'POST',
          body: { phone: normalizePhone(phone), userType: 'SELLER' },
        }),
  verifyOtp: (phone: string, otp: string) =>
    USE_MOCK_API
      ? mockApi.auth.verifyOtp(phone, otp)
      : apiClient<{ token: string; refreshToken: string }>('/auth/otp/verify', {
          method: 'POST',
          body: { phone: normalizePhone(phone), otp, userType: 'SELLER' },
        }),
  logout: () =>
    USE_MOCK_API ? mockApi.auth.logout() : apiClient('/auth/logout', { method: 'POST' }),
};

export const configService = {
  getFeatureFlags: () => mockApi.config.getFeatureFlags(),
};

export { partnerService };

export type OnboardingUpdatePayload = {
  onboardingStep?: OnboardingStep;
  partnerType?: PartnerType;
  businessDetails?: Record<string, unknown>;
  storeDetails?: Record<string, unknown>;
  sellerSetup?: Record<string, unknown>;
  foodSetup?: Record<string, unknown>;
  bankDetails?: Record<string, unknown>;
};

export const onboardingService = {
  update: async (data: OnboardingUpdatePayload) => {
    if (USE_MOCK_API) {
      return mockApi.partner.updateOnboarding(data);
    }
    const response = await apiClient('/seller/onboarding', { method: 'PATCH', body: data });
    return resolvePartnerProfile(response);
  },
  complete: async (bankDetails?: Record<string, unknown>) => {
    if (USE_MOCK_API) {
      return mockApi.partner.completeOnboarding(bankDetails);
    }
    const response = await apiClient('/seller/onboarding/complete', {
      method: 'POST',
      body: { bankDetails },
    });
    return resolvePartnerProfile(response);
  },
  uploadFoodImage: (uri: string) =>
    USE_MOCK_API
      ? mockApi.partner.uploadFoodImage(uri)
      : uploadImageOnly<{ success: boolean; url: string }>(
          '/seller/onboarding/food-image',
          uri,
        ),
};

export const ordersService = {
  list: (status?: OrderStatus, storeId?: string) =>
    USE_MOCK_API
      ? mockApi.orders.list(status)
      : apiClient<Order[]>(withStoreId('/seller/orders', storeId)),
  get: (id: string) =>
    USE_MOCK_API ? mockApi.orders.get(id) : apiClient<Order>(`/seller/orders/${id}`),
  updateStatus: (id: string, status: OrderStatus) =>
    USE_MOCK_API
      ? mockApi.orders.updateStatus(id, status)
      : apiClient<Order>(`/seller/orders/${id}/${status}`, { method: 'POST' }),
  requestDelivery: (orderId: string) => mockApi.orders.requestDelivery(orderId),
  cancelDeliveryRequest: (orderId: string) => mockApi.orders.cancelDeliveryRequest(orderId),
};

export const productsService = {
  list: async (filters?: ProductListFilters) => {
    if (USE_MOCK_API) return mockApi.products.list(filters);
    const query = buildQuery({
      storeId: filters?.storeId,
    });
    const products = await apiClient<Product[]>(`/seller/products${query}`);
    if (!Array.isArray(products)) return [];
    return products.filter((p) => {
      if (filters?.tab && !matchesProductTab(p, filters.tab)) return false;
      if (filters?.categoryId && p.categoryId !== filters.categoryId) return false;
      return true;
    });
  },
  get: (id: string, storeId?: string) =>
    USE_MOCK_API
      ? mockApi.products.get(id)
      : apiClient<Product>(withStoreId(`/seller/products/${id}`, storeId)),
  create: (data: Partial<Product>) =>
    USE_MOCK_API ? mockApi.products.create(data) : apiClient<Product>('/seller/products', { method: 'POST', body: data }),
  update: (id: string, data: Partial<Product>) =>
    USE_MOCK_API ? mockApi.products.update(id, data) : apiClient<Product>(`/seller/products/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string, storeId?: string) =>
    USE_MOCK_API
      ? mockApi.products.delete(id)
      : apiClient(withStoreId(`/seller/products/${id}`, storeId), { method: 'DELETE' }),
  searchCatalog: (query: string) =>
    USE_MOCK_API
      ? mockApi.products.searchCatalog(query)
      : apiClient<CatalogSuggestion[]>(`/products?q=${encodeURIComponent(query)}`),
  getNearby: (location: UserLocation) =>
    USE_MOCK_API ? mockApi.products.getNearby(location) : apiClient('/products?limit=20'),
};

export const categoriesService = {
  list: (storeId: string) =>
    USE_MOCK_API
      ? mockApi.categories.list(storeId)
      : apiClient<ProductCategory[]>(`/seller/stores/${storeId}/categories`),
  get: (id: string) =>
    USE_MOCK_API ? mockApi.categories.get(id) : apiClient<ProductCategory>(`/seller/categories/${id}`),
  create: (storeId: string, data: { name: string }) =>
    USE_MOCK_API
      ? mockApi.categories.create(storeId, data)
      : apiClient(`/seller/stores/${storeId}/categories`, { method: 'POST', body: data }),
  update: (id: string, data: { name: string }) =>
    USE_MOCK_API
      ? mockApi.categories.update(id, data)
      : apiClient(`/seller/categories/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) =>
    USE_MOCK_API
      ? mockApi.categories.delete(id)
      : apiClient(`/seller/categories/${id}`, { method: 'DELETE' }),
};

export const storesService = {
  list: () => (USE_MOCK_API ? mockApi.stores.list() : apiClient<Store[]>('/seller/stores')),
  get: (id: string) => (USE_MOCK_API ? mockApi.stores.get(id) : apiClient<Store>(`/seller/stores/${id}`)),
  create: (data: Record<string, unknown>) =>
    USE_MOCK_API
      ? mockApi.stores.create(data as never)
      : apiClient<Store>('/seller/stores', { method: 'POST', body: data }),
  getNearby: (location: UserLocation) => mockApi.stores.getNearby(location),
  toggleStatus: (id: string, isOpen: boolean) =>
    USE_MOCK_API
      ? mockApi.stores.toggleStatus(id, isOpen)
      : apiClient(`/seller/stores/${id}`, { method: 'PATCH', body: { isOpen } }),
  updateLocation: (id: string, data: Record<string, unknown>) =>
    USE_MOCK_API ? mockApi.stores.updateLocation(id, data as never) : apiClient(`/seller/stores/${id}`, { method: 'PATCH', body: data }),
  updatePartnerPickupSettings: (id: string, data: Record<string, unknown>) =>
    mockApi.stores.updatePartnerPickupSettings(id, data as never),
};

export const deliveryService = {
  getAvailableRequests: (latitude: number, longitude: number, preferences: PartnerDeliveryPreferences) =>
    mockApi.delivery.getAvailableRequests(latitude, longitude, preferences),
  acceptRequest: (requestId: string, partnerId: string, partnerName: string) =>
    mockApi.delivery.acceptRequest(requestId, partnerId, partnerName),
  rejectRequest: (requestId: string, partnerId: string) =>
    mockApi.delivery.rejectRequest(requestId, partnerId),
};

export const earningsService = {
  getSummary: (storeId?: string) =>
    USE_MOCK_API
      ? mockApi.earnings.getSummary()
      : apiClient<EarningsSummary>(withStoreId('/seller/earnings', storeId)),
  getChart: (period: string) => mockApi.earnings.getChart(period),
  getPayouts: () => mockApi.earnings.getPayouts(),
};

export const analyticsService = {
  getOverview: () => mockApi.analytics.getOverview(),
};

export const kycService = {
  getStatus: () =>
    USE_MOCK_API ? mockApi.kyc.getStatus() : apiClient<KycInfo>('/seller/kyc/status'),
  uploadDocument: (type: string, uri: string) =>
    USE_MOCK_API
      ? mockApi.kyc.uploadDocument(type, uri)
      : uploadMultipart('/seller/kyc/documents', type, uri),
  submit: () =>
    USE_MOCK_API
      ? mockApi.kyc.getStatus()
      : apiClient('/seller/kyc/submit', { method: 'POST' }),
};

export const bankService = {
  get: async () => {
    if (USE_MOCK_API) return mockApi.bank.get();
    const profile = await partnerService.getProfile();
    return (
      profile.bankDetails ?? {
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        verificationStatus: 'pending' as const,
      }
    );
  },
  update: (data: Partial<BankAccount>) =>
    USE_MOCK_API ? mockApi.bank.update(data) : apiClient('/seller/onboarding', { method: 'PATCH', body: { bankDetails: data } }),
};

export const couponsService = {
  list: (storeId?: string) =>
    USE_MOCK_API
      ? Promise.resolve([] as import('@/types/coupon').SellerCoupon[])
      : apiClient<import('@/types/coupon').SellerCoupon[]>(
          storeId ? `/seller/coupons/store/${storeId}` : '/seller/coupons',
        ),
  create: (data: import('@/types/coupon').CreateSellerCouponInput) =>
    USE_MOCK_API
      ? Promise.reject(new Error('Coupons require backend'))
      : apiClient('/seller/coupons', { method: 'POST', body: data }),
  update: (id: string, data: Partial<import('@/types/coupon').CreateSellerCouponInput>) =>
    USE_MOCK_API
      ? Promise.reject(new Error('Coupons require backend'))
      : apiClient(`/seller/coupons/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) =>
    USE_MOCK_API
      ? Promise.reject(new Error('Coupons require backend'))
      : apiClient(`/seller/coupons/${id}`, { method: 'DELETE' }),
};

export const staffService = {
  list: () => (USE_MOCK_API ? mockApi.staff.list() : apiClient<StaffMember[]>('/seller/staff')),
  create: (data: { name: string; email: string; phone: string; role: string; storeId?: string }) =>
    USE_MOCK_API
      ? mockApi.staff.create(data as never)
      : apiClient('/seller/staff', { method: 'POST', body: data }),
  delete: (id: string) =>
    USE_MOCK_API
      ? mockApi.staff.delete(id)
      : apiClient(`/seller/staff/${id}`, { method: 'DELETE' }),
};

export const notificationsService = {
  list: () => mockApi.notifications.list(),
  markRead: (id: string) => mockApi.notifications.markRead(id),
};

export const bannersService = {
  list: async () => {
    if (USE_MOCK_API) return mockApi.banners.list();
    const data = await apiClient<Array<Parameters<typeof mapBackendBanner>[0]>>('/banners');
    return data.map(mapBackendBanner);
  },
};

export const inventoryService = {
  list: (storeId?: string) =>
    USE_MOCK_API
      ? mockApi.inventory.list()
      : apiClient<InventoryItem[]>(withStoreId('/seller/inventory', storeId)),
  update: (productId: string, quantity: number, storeId?: string) =>
    USE_MOCK_API
      ? mockApi.inventory.updateStock(productId, quantity)
      : apiClient(withStoreId(`/seller/inventory/${productId}`, storeId), {
          method: 'PATCH',
          body: { quantity },
        }),
  updateStock: (productId: string, quantity: number, storeId?: string) =>
    inventoryService.update(productId, quantity, storeId),
};

export const supportService = {
  getFaqs: () => mockApi.support.getFaqs(),
  listTickets: () => mockApi.support.listTickets(),
  createTicket: (subject: string, message: string) => mockApi.support.createTicket(subject, message),
};
