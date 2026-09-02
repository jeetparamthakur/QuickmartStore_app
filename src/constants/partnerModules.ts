import type { PartnerType, PartnerPermissions } from '@/types/partner';
import type { FeatureFlags } from '@/types/partner';

export type DashboardMetric = {
  key: string;
  label: string;
  icon: string;
};

export type QuickAction = {
  key: string;
  label: string;
  icon: string;
  route: string;
};

export type PartnerModuleConfig = {
  dashboardMetrics: DashboardMetric[];
  quickActions: QuickAction[];
  tabs: ('dashboard' | 'orders' | 'products' | 'earnings' | 'profile')[];
  showInventory: boolean;
  showMultiStore: boolean;
  showStaff: boolean;
  showAnalytics: boolean;
  showPrepTimer: boolean;
  showDeliveryPartnerSettings: boolean;
  simplifiedDashboard: boolean;
};

const baseTabs: PartnerModuleConfig['tabs'] = [
  'dashboard',
  'orders',
  'products',
  'earnings',
  'profile',
];

export const partnerModules: Record<PartnerType, PartnerModuleConfig> = {
  STORE: {
    dashboardMetrics: [
      { key: 'sales', label: "Today's Sales", icon: 'cash' },
      { key: 'orders', label: 'Orders', icon: 'receipt' },
      { key: 'pending', label: 'Pending', icon: 'time' },
      { key: 'earnings', label: 'Earnings', icon: 'wallet' },
    ],
    quickActions: [
      { key: 'add_product', label: 'Add Product', icon: 'add-circle', route: '/(app)/products/add' },
      { key: 'inventory', label: 'Add Inventory', icon: 'cube', route: '/(app)/inventory' },
      { key: 'orders', label: 'View Orders', icon: 'list', route: '/(app)/(tabs)/orders' },
      { key: 'store', label: 'Update Store', icon: 'storefront', route: '/(app)/stores' },
      { key: 'earnings', label: 'View Earnings', icon: 'trending-up', route: '/(app)/(tabs)/earnings' },
    ],
    tabs: baseTabs,
    showInventory: true,
    showMultiStore: true,
    showStaff: true,
    showAnalytics: true,
    showPrepTimer: false,
    showDeliveryPartnerSettings: true,
    simplifiedDashboard: false,
  },
  INDEPENDENT_SELLER: {
    dashboardMetrics: [
      { key: 'orders', label: 'Orders', icon: 'receipt' },
      { key: 'earnings', label: 'Earnings', icon: 'wallet' },
    ],
    quickActions: [
      { key: 'add_product', label: 'Add Product', icon: 'add-circle', route: '/(app)/products/add' },
      { key: 'orders', label: 'My Orders', icon: 'list', route: '/(app)/(tabs)/orders' },
      { key: 'earnings', label: 'My Earnings', icon: 'trending-up', route: '/(app)/(tabs)/earnings' },
    ],
    tabs: baseTabs,
    showInventory: true,
    showMultiStore: false,
    showStaff: false,
    showAnalytics: false,
    showPrepTimer: false,
    showDeliveryPartnerSettings: false,
    simplifiedDashboard: true,
  },
  BRAND: {
    dashboardMetrics: [
      { key: 'sales', label: "Today's Sales", icon: 'cash' },
      { key: 'orders', label: 'Orders', icon: 'receipt' },
      { key: 'views', label: 'Product Views', icon: 'eye' },
      { key: 'earnings', label: 'Earnings', icon: 'wallet' },
    ],
    quickActions: [
      { key: 'add_product', label: 'Add Product', icon: 'add-circle', route: '/(app)/products/add' },
      { key: 'orders', label: 'Orders', icon: 'list', route: '/(app)/(tabs)/orders' },
      { key: 'analytics', label: 'Performance', icon: 'bar-chart', route: '/(app)/analytics' },
      { key: 'earnings', label: 'Earnings', icon: 'trending-up', route: '/(app)/(tabs)/earnings' },
    ],
    tabs: baseTabs,
    showInventory: true,
    showMultiStore: false,
    showStaff: false,
    showAnalytics: true,
    showPrepTimer: false,
    showDeliveryPartnerSettings: false,
    simplifiedDashboard: false,
  },
  DARK_STORE: {
    dashboardMetrics: [
      { key: 'live_orders', label: 'Live Orders', icon: 'flash' },
      { key: 'pending', label: 'Pending', icon: 'time' },
      { key: 'prep_time', label: 'Avg Prep Time', icon: 'timer' },
      { key: 'earnings', label: 'Earnings', icon: 'wallet' },
    ],
    quickActions: [
      { key: 'orders', label: 'Live Orders', icon: 'flash', route: '/(app)/(tabs)/orders' },
      { key: 'inventory', label: 'Inventory', icon: 'cube', route: '/(app)/inventory' },
      { key: 'add_product', label: 'Add Product', icon: 'add-circle', route: '/(app)/products/add' },
      { key: 'analytics', label: 'Delivery Perf', icon: 'bicycle', route: '/(app)/analytics' },
    ],
    tabs: baseTabs,
    showInventory: true,
    showMultiStore: true,
    showStaff: true,
    showAnalytics: true,
    showPrepTimer: true,
    showDeliveryPartnerSettings: true,
    simplifiedDashboard: false,
  },
};

export function getPermissions(
  partnerType: PartnerType,
  flags: FeatureFlags
): PartnerPermissions {
  const base = partnerModules[partnerType];
  return {
    manageOrders: true,
    manageProducts: true,
    manageInventory: base.showInventory,
    viewEarnings: true,
    manageStores: base.showMultiStore && flags.multi_store_enabled,
    manageStaff: base.showStaff && flags.staff_management_enabled,
    viewAnalytics: base.showAnalytics,
  };
}
