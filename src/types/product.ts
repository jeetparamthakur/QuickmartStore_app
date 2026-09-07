export type ProductStatus =
  | 'active'
  | 'draft'
  | 'out_of_stock'
  | 'pending_review'
  | 'rejected';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export type ProductUnitType = 'kg' | 'g' | 'l' | 'ml' | 'pcs' | 'units' | 'other';

export type PricingMode = 'total' | 'per_unit' | 'margin';

export const PRODUCT_UNIT_LABELS: Record<ProductUnitType, string> = {
  kg: 'kg',
  g: 'g',
  l: 'L',
  ml: 'ml',
  pcs: 'pcs',
  units: 'units',
  other: 'other',
};

export type ProductVariant = {
  id: string;
  size?: string;
  color?: string;
  price: number;
  stock: number;
  sku: string;
};

export type Product = {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  brand?: string;
  description: string;
  images: string[];
  mrp: number;
  sellingPrice: number;
  discountPercent: number;
  offerPrice?: number;
  quantity: number;
  lowStockThreshold: number;
  sku: string;
  status: ProductStatus;
  stockStatus: StockStatus;
  variants?: ProductVariant[];
  rejectionReason?: string;
  storeId?: string;
  createdAt: string;
  unitType: ProductUnitType;
  customUnit?: string;
  packageSize: number;
  purchasePrice: number;
  pricePerUnit: number;
  marginAmount: number;
  marginPercent: number;
};

export type ProductListFilters = {
  status?: ProductStatus;
  storeId?: string;
  categoryId?: string;
};

export const PRODUCT_TABS: { key: ProductStatus | 'all'; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'draft', label: 'Draft' },
  { key: 'out_of_stock', label: 'Out of Stock' },
  { key: 'pending_review', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
];

export type CatalogSuggestion = {
  id: string;
  name: string;
  brand: string;
  category: string;
  image?: string;
};

export type NearbyProduct = Product & {
  storeId: string;
  storeName: string;
  distanceKm: number;
  deliveryRadiusKm: number;
};

export type NearbyProductsResponse = {
  products: NearbyProduct[];
  serviceableStoreCount: number;
};
