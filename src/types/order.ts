export type OrderStatus =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type DeliveryType = 'platform' | 'self' | 'pickup';

export type DeliveryRequestStatus =
  | 'none'
  | 'requested'
  | 'accepted'
  | 'rejected'
  | 'picked_up'
  | 'delivered';

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  image?: string;
  quantity: number;
  variant?: string;
  price: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  platformCharges: number;
  total: number;
  deliveryType: DeliveryType;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  createdAt: string;
  prepTimeMinutes?: number;
  prepDeadline?: string;
  storeId?: string;
  sellerId?: string;
  deliveryRequestStatus: DeliveryRequestStatus;
  deliveryRequestedAt?: string;
  assignedPartnerId?: string;
  assignedPartnerName?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'New',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const DELIVERY_REQUEST_STATUS_LABELS: Record<DeliveryRequestStatus, string> = {
  none: '',
  requested: 'Delivery Requested',
  accepted: 'Partner Assigned',
  rejected: 'Request Rejected',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
};

export const ORDER_TABS: OrderStatus[] = [
  'new',
  'accepted',
  'preparing',
  'ready',
  'completed',
  'cancelled',
];
