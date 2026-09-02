import { USE_MOCK_API, apiClient } from './client';
import { mockApi } from './mock';
import type { OrderStatus } from '@/types/order';
import type { ProductStatus, Product } from '@/types/product';
import type { UserLocation } from '@/types/location';
import type { PartnerDeliveryPreferences } from '@/types/delivery';
import type { BankAccount } from '@/types/index';

export const authService = {
  sendOtp: (phone: string) =>
    USE_MOCK_API
      ? mockApi.auth.sendOtp(phone)
      : apiClient('/auth/otp/send', { method: 'POST', body: { phone: `+91${phone}`, userType: 'SELLER' } }),
  verifyOtp: (phone: string, otp: string) =>
    USE_MOCK_API
      ? mockApi.auth.verifyOtp(phone, otp)
      : apiClient<{ token: string; refreshToken: string }>('/auth/otp/verify', {
          method: 'POST',
          body: { phone: `+91${phone}`, otp, userType: 'STORE_OWNER' },
        }),
  logout: () =>
    USE_MOCK_API ? mockApi.auth.logout() : apiClient('/auth/logout', { method: 'POST' }),
};

export const configService = {
  getFeatureFlags: () => mockApi.config.getFeatureFlags(),
};

export const partnerService = {
  getProfile: () =>
    USE_MOCK_API ? mockApi.partner.getProfile() : apiClient('/seller/me'),
};

export const ordersService = {
  list: (status?: OrderStatus) =>
    USE_MOCK_API ? mockApi.orders.list(status) : apiClient('/seller/orders'),
  get: (id: string) =>
    USE_MOCK_API ? mockApi.orders.get(id) : apiClient(`/seller/orders/${id}`),
  updateStatus: (id: string, status: OrderStatus) =>
    USE_MOCK_API
      ? mockApi.orders.updateStatus(id, status)
      : apiClient(`/seller/orders/${id}/${status}`, { method: 'POST' }),
  requestDelivery: (orderId: string) => mockApi.orders.requestDelivery(orderId),
  cancelDeliveryRequest: (orderId: string) => mockApi.orders.cancelDeliveryRequest(orderId),
};

export const productsService = {
  list: (status?: ProductStatus) =>
    USE_MOCK_API ? mockApi.products.list(status) : apiClient('/seller/products'),
  get: (id: string) =>
    USE_MOCK_API ? mockApi.products.get(id) : apiClient(`/products/${id}`),
  create: (data: Partial<Product>) =>
    USE_MOCK_API ? mockApi.products.create(data) : apiClient('/seller/products', { method: 'POST', body: data }),
  update: (id: string, data: Partial<Product>) =>
    USE_MOCK_API ? mockApi.products.update(id, data) : apiClient(`/seller/products/${id}`, { method: 'PATCH', body: data }),
  searchCatalog: (query: string) =>
    USE_MOCK_API ? mockApi.products.searchCatalog(query) : apiClient(`/products?q=${encodeURIComponent(query)}`),
  getNearby: (location: UserLocation) =>
    USE_MOCK_API ? mockApi.products.getNearby(location) : apiClient('/products?limit=20'),
};

export const storesService = {
  list: () => (USE_MOCK_API ? mockApi.stores.list() : apiClient('/seller/stores')),
  get: (id: string) => (USE_MOCK_API ? mockApi.stores.get(id) : apiClient(`/seller/stores/${id}`)),
  getNearby: (location: UserLocation) => mockApi.stores.getNearby(location),
  toggleStatus: (id: string, isOpen: boolean) => mockApi.stores.toggleStatus(id, isOpen),
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
  getSummary: () => (USE_MOCK_API ? mockApi.earnings.getSummary() : apiClient('/seller/earnings')),
  getChart: (period: string) => mockApi.earnings.getChart(period),
  getPayouts: () => mockApi.earnings.getPayouts(),
};

export const analyticsService = {
  getOverview: () => mockApi.analytics.getOverview(),
};

export const kycService = {
  getStatus: () => mockApi.kyc.getStatus(),
  uploadDocument: (type: string, uri: string) => mockApi.kyc.uploadDocument(type, uri),
};

export const bankService = {
  get: () => mockApi.bank.get(),
  update: (data: Partial<BankAccount>) => mockApi.bank.update(data),
};

export const staffService = {
  list: () => mockApi.staff.list(),
};

export const notificationsService = {
  list: () => mockApi.notifications.list(),
  markRead: (id: string) => mockApi.notifications.markRead(id),
};

export const bannersService = {
  list: () => mockApi.banners.list(),
};

export const inventoryService = {
  list: () => (USE_MOCK_API ? mockApi.inventory.list() : apiClient('/seller/inventory')),
  update: (id: string, quantity: number) =>
    USE_MOCK_API ? mockApi.inventory.update(id, quantity) : apiClient(`/seller/inventory/${id}`, { method: 'PATCH', body: { quantity } }),
};

export const supportService = {
  listTickets: () => mockApi.support.listTickets(),
  createTicket: (subject: string, message: string) => mockApi.support.createTicket(subject, message),
};
