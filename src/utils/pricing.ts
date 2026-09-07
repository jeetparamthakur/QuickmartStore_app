import type { ProductUnitType } from '@/types/product';
import { PRODUCT_UNIT_LABELS } from '@/types/product';

export function getUnitLabel(unitType: ProductUnitType, customUnit?: string): string {
  if (unitType === 'other' && customUnit) return customUnit;
  return PRODUCT_UNIT_LABELS[unitType];
}

export function formatPackageSize(
  size: number,
  unitType: ProductUnitType,
  customUnit?: string
): string {
  const label = getUnitLabel(unitType, customUnit);
  const formatted = size % 1 === 0 ? String(size) : size.toFixed(2).replace(/\.?0+$/, '');
  return `${formatted} ${label}`;
}

export function calcTotalFromRate(pricePerUnit: number, packageSize: number): number {
  if (packageSize <= 0) return 0;
  return Math.round(pricePerUnit * packageSize * 100) / 100;
}

export function calcRateFromTotal(sellingPrice: number, packageSize: number): number {
  if (packageSize <= 0) return 0;
  return Math.round((sellingPrice / packageSize) * 100) / 100;
}

export function calcMargin(purchasePrice: number, sellingPrice: number): { amount: number; percent: number } {
  const amount = Math.round((sellingPrice - purchasePrice) * 100) / 100;
  const percent =
    purchasePrice > 0 ? Math.round((amount / purchasePrice) * 10000) / 100 : 0;
  return { amount, percent };
}

export function calcSellingFromMargin(purchasePrice: number, marginPercent: number): number {
  return Math.round(purchasePrice * (1 + marginPercent / 100) * 100) / 100;
}

export function formatRateLabel(pricePerUnit: number, unitType: ProductUnitType, customUnit?: string): string {
  const label = getUnitLabel(unitType, customUnit);
  return `₹${pricePerUnit.toLocaleString('en-IN')}/${label}`;
}
