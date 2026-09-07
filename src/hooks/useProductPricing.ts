import { useRef, useState, useCallback, useMemo } from 'react';
import type { ProductUnitType, PricingMode } from '@/types/product';
import {
  calcTotalFromRate,
  calcRateFromTotal,
  calcMargin,
  calcSellingFromMargin,
} from '@/utils/pricing';

export type ProductPricingState = {
  unitType: ProductUnitType;
  customUnit: string;
  packageSize: string;
  purchasePrice: string;
  pricePerUnit: string;
  sellingPrice: string;
  marginPercent: string;
  mrp: string;
  pricingMode: PricingMode;
};

const initialState: ProductPricingState = {
  unitType: 'pcs',
  customUnit: '',
  packageSize: '1',
  purchasePrice: '',
  pricePerUnit: '',
  sellingPrice: '',
  marginPercent: '',
  mrp: '',
  pricingMode: 'total',
};

type EditableField =
  | 'packageSize'
  | 'purchasePrice'
  | 'pricePerUnit'
  | 'sellingPrice'
  | 'marginPercent'
  | 'mrp';

export function useProductPricing() {
  const [state, setState] = useState<ProductPricingState>(initialState);
  const lastEditedRef = useRef<EditableField | 'pricingMode' | null>(null);

  const parsed = useMemo(() => {
    const packageSize = Number(state.packageSize) || 0;
    const purchasePrice = Number(state.purchasePrice) || 0;
    const pricePerUnit = Number(state.pricePerUnit) || 0;
    const sellingPrice = Number(state.sellingPrice) || 0;
    const marginPercent = Number(state.marginPercent) || 0;
    const mrp = Number(state.mrp) || 0;
    const margin = calcMargin(purchasePrice, sellingPrice);
    return { packageSize, purchasePrice, pricePerUnit, sellingPrice, marginPercent, mrp, margin };
  }, [state]);

  const syncFromField = useCallback(
    (field: EditableField, next: ProductPricingState) => {
      const packageSize = Number(next.packageSize) || 0;
      const purchasePrice = Number(next.purchasePrice) || 0;

      if (field === 'pricePerUnit' && packageSize > 0) {
        const rate = Number(next.pricePerUnit) || 0;
        const total = calcTotalFromRate(rate, packageSize);
        next.sellingPrice = total > 0 ? String(total) : '';
        const { percent } = calcMargin(purchasePrice, total);
        next.marginPercent = purchasePrice > 0 && total > 0 ? String(percent) : next.marginPercent;
      } else if (field === 'sellingPrice' && packageSize > 0) {
        const total = Number(next.sellingPrice) || 0;
        const rate = calcRateFromTotal(total, packageSize);
        next.pricePerUnit = total > 0 ? String(rate) : '';
        const { percent } = calcMargin(purchasePrice, total);
        next.marginPercent = purchasePrice > 0 && total > 0 ? String(percent) : next.marginPercent;
      } else if (field === 'marginPercent' && purchasePrice > 0) {
        const percent = Number(next.marginPercent) || 0;
        const total = calcSellingFromMargin(purchasePrice, percent);
        next.sellingPrice = String(total);
        if (packageSize > 0) {
          next.pricePerUnit = String(calcRateFromTotal(total, packageSize));
        }
      } else if (field === 'purchasePrice') {
        if (next.pricingMode === 'margin' && Number(next.marginPercent)) {
          const percent = Number(next.marginPercent) || 0;
          const total = calcSellingFromMargin(purchasePrice, percent);
          next.sellingPrice = String(total);
          if (packageSize > 0) {
            next.pricePerUnit = String(calcRateFromTotal(total, packageSize));
          }
        } else if (Number(next.sellingPrice)) {
          const { percent } = calcMargin(purchasePrice, Number(next.sellingPrice));
          next.marginPercent = purchasePrice > 0 ? String(percent) : '';
        }
      } else if (field === 'packageSize') {
        const size = Number(next.packageSize) || 0;
        if (next.pricingMode === 'per_unit' && Number(next.pricePerUnit) && size > 0) {
          const total = calcTotalFromRate(Number(next.pricePerUnit), size);
          next.sellingPrice = String(total);
          const { percent } = calcMargin(purchasePrice, total);
          next.marginPercent = purchasePrice > 0 ? String(percent) : '';
        } else if (Number(next.sellingPrice) && size > 0) {
          next.pricePerUnit = String(calcRateFromTotal(Number(next.sellingPrice), size));
        }
      }

      return next;
    },
    []
  );

  const updateField = useCallback(
    (field: EditableField, value: string) => {
      lastEditedRef.current = field;
      setState((prev) => {
        const next = { ...prev, [field]: value };
        return syncFromField(field, next);
      });
    },
    [syncFromField]
  );

  const setUnitType = useCallback((unitType: ProductUnitType) => {
    setState((prev) => ({ ...prev, unitType, customUnit: unitType === 'other' ? prev.customUnit : '' }));
  }, []);

  const setCustomUnit = useCallback((customUnit: string) => {
    setState((prev) => ({ ...prev, customUnit }));
  }, []);

  const setPricingMode = useCallback((mode: PricingMode) => {
    lastEditedRef.current = 'pricingMode';
    setState((prev) => ({ ...prev, pricingMode: mode }));
  }, []);

  const isStepValid = useMemo(() => {
    const { packageSize, purchasePrice, sellingPrice } = parsed;
    if (packageSize <= 0) return false;
    if (purchasePrice < 0) return false;
    if (sellingPrice <= 0) return false;
    if (state.unitType === 'other' && !state.customUnit.trim()) return false;
    return true;
  }, [parsed, state.unitType, state.customUnit]);

  const hasNegativeMargin = parsed.margin.amount < 0 && parsed.purchasePrice > 0 && parsed.sellingPrice > 0;

  return {
    state,
    parsed,
    updateField,
    setUnitType,
    setCustomUnit,
    setPricingMode,
    isStepValid,
    hasNegativeMargin,
  };
}
