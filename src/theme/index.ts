export const colors = {
  primary: '#F97316',
  primaryDark: '#EA580C',
  primaryLight: '#FB923C',
  primaryMuted: '#FFF7ED',
  secondary: '#E11D48',
  background: '#FFFBF7',
  surface: '#FFFFFF',
  surfaceSecondary: '#FEF3E8',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#FDE8D0',
  borderLight: '#FFF7ED',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#D97706',
  infoLight: '#FEF3C7',
  overlay: 'rgba(15, 23, 42, 0.5)',
  white: '#FFFFFF',
  black: '#000000',
  orderNew: '#F97316',
  orderAccepted: '#FB923C',
  orderPreparing: '#F59E0B',
  orderReady: '#10B981',
  orderCompleted: '#64748B',
  orderCancelled: '#EF4444',
};

export const gradients = {
  primary: ['#FB923C', '#F97316', '#EA580C'] as const,
  hero: ['#FFF7ED', '#FFFBF7'] as const,
  promo: ['#F97316', '#E11D48'] as const,
};

export const metricAccents = {
  sales: { bg: '#FFF7ED', icon: '#F97316' },
  orders: { bg: '#FFF1F2', icon: '#E11D48' },
  pending: { bg: '#FEF3C7', icon: '#D97706' },
  earnings: { bg: '#D1FAE5', icon: '#059669' },
  default: { bg: '#FFF7ED', icon: '#F97316' },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 16, fontWeight: '500' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  label: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
};

export const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const theme = { colors, gradients, metricAccents, spacing, radius, typography, shadows };

export type Theme = typeof theme;
