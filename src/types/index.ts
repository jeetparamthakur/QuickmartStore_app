export type KycStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export type KycDocumentType = 'pan' | 'gst' | 'business' | 'address_proof';

export type KycDocument = {
  id: string;
  type: KycDocumentType;
  uri: string;
  uploadedAt: string;
};

export type KycInfo = {
  status: KycStatus;
  documents: KycDocument[];
  rejectionReason?: string;
};

export type BankAccount = {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
};

export type PayoutStatus = 'completed' | 'processing' | 'failed';

export type Payout = {
  id: string;
  amount: number;
  status: PayoutStatus;
  date: string;
  reference?: string;
};

export type EarningsSummary = {
  today: number;
  week: number;
  month: number;
  total: number;
  pendingSettlement: number;
  availableBalance: number;
  nextSettlement: number;
  nextSettlementDate: string;
};

export type EarningsChartPoint = {
  label: string;
  value: number;
};

export type AnalyticsOverview = {
  totalViews: number;
  productViews: number;
  orders: number;
  conversionRate: number;
  topProducts: { id: string; name: string; sales: number }[];
  lowProducts: { id: string; name: string; sales: number }[];
};

export type NotificationType =
  | 'new_order'
  | 'order_cancelled'
  | 'low_stock'
  | 'product_approved'
  | 'product_rejected'
  | 'payout'
  | 'announcement'
  | 'promotional';

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, string>;
};

export type Banner = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  actionUrl?: string;
  type: 'campaign' | 'policy' | 'commission' | 'offer' | 'training';
};

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved';

export type SupportTicket = {
  id: string;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  createdAt: string;
};

export type InventoryItem = {
  id: string;
  productId: string;
  productName: string;
  available: number;
  lowStockThreshold: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
};

export type InventoryHistoryEntry = {
  id: string;
  productId: string;
  productName: string;
  change: number;
  newQuantity: number;
  reason: string;
  createdAt: string;
};
