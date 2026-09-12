import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { StepProgress } from '@/components/layout/StepProgress';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { UnitTypeSelector } from '@/components/products/UnitTypeSelector';
import { MarginSummaryCard } from '@/components/products/MarginSummaryCard';
import { productsService, categoriesService } from '@/services/api';
import { usePartnerStore } from '@/stores/partnerStore';
import { useProductPricing } from '@/hooks/useProductPricing';
import { appAlert } from '@/utils/appDialog';
import { formatDiscount } from '@/utils/format';
import { getUnitLabel } from '@/utils/pricing';
import { isPartnerLocationComplete, getLocationWarningMessage } from '@/utils/partnerLocation';
import type { PricingMode } from '@/types/product';
import { colors, radius, spacing, typography } from '@/theme';

const PRICING_MODE_OPTIONS: { value: PricingMode; label: string }[] = [
  { value: 'total', label: 'Total Price' },
  { value: 'per_unit', label: 'Per Unit' },
  { value: 'margin', label: 'Margin %' },
];

export default function AddProductScreen() {
  const { storeId, categoryId } = useLocalSearchParams<{ storeId?: string; categoryId?: string }>();
  const profile = usePartnerStore((s) => s.profile);
  const queryClient = useQueryClient();
  const isIndependentSeller = profile?.partnerType === 'INDEPENDENT_SELLER';
  const locationComplete = isPartnerLocationComplete(profile);
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '',
    brand: '',
    description: '',
    quantity: '',
    lowStockThreshold: '5',
    sku: '',
  });
  const pricing = useProductPricing();
  const [suggestions, setSuggestions] = useState<{ id: string; name: string; brand: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: category, isError: categoryError } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => categoriesService.get(categoryId!),
    enabled: !isIndependentSeller && !!categoryId,
  });

  const { data: storeCategories } = useQuery({
    queryKey: ['categories', storeId],
    queryFn: () => categoriesService.list(storeId!),
    enabled: !isIndependentSeller && !!storeId,
  });

  useEffect(() => {
    if (isIndependentSeller) return;
    if (!storeId || !categoryId) {
      router.replace('/(app)/(tabs)/products');
      return;
    }
    if (storeCategories && storeCategories.length === 0) {
      router.replace(`/(app)/stores/${storeId}/categories/add`);
    }
  }, [isIndependentSeller, storeId, categoryId, storeCategories]);

  useEffect(() => {
    if (isIndependentSeller || !categoryError) return;
    appAlert('Invalid Category', 'The selected category could not be found.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }, [categoryError, isIndependentSeller]);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === 'name' && value.length > 2) {
      productsService.searchCatalog(value).then(setSuggestions);
    }
  }

  function applySuggestion(suggestion: { name: string; brand: string }) {
    setForm((f) => ({ ...f, name: suggestion.name, brand: suggestion.brand }));
  }

  async function pickImages() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages(result.assets.map((a) => a.uri));
    }
  }

  function handlePricingNext() {
    if (!pricing.isStepValid) {
      appAlert('Incomplete Pricing', 'Please fill in unit, package size, purchase price, and selling price.');
      return;
    }
    if (pricing.hasNegativeMargin) {
      appAlert(
        'Negative Margin',
        'Your selling price is lower than the purchase price. You can continue, but you will make a loss on this product.',
        [
          { text: 'Go Back', style: 'cancel' },
          { text: 'Continue', onPress: () => setStep(4) },
        ],
      );
      return;
    }
    setStep(4);
  }

  async function handleSubmit() {
    if (!isIndependentSeller && (!storeId || !categoryId || !category)) return;

    if (!locationComplete) {
      const isIndependent = profile?.partnerType === 'INDEPENDENT_SELLER';
      appAlert(
        isIndependent ? 'Pickup Location Required' : 'Store Location Required',
        isIndependent
          ? 'Complete your pickup location and delivery radius before publishing products.'
          : 'Complete your store location and visibility radius before publishing products.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: isIndependent ? 'Go to Settings' : 'Go to Stores',
            onPress: () => router.push(isIndependent ? '/(app)/settings/product-visibility' : '/(app)/stores'),
          },
        ],
      );
      return;
    }

    setLoading(true);
    try {
      const { parsed, state: pricingState } = pricing;
      const mrp = parsed.mrp || parsed.sellingPrice;
      const sellingPrice = parsed.sellingPrice;
      const productStatus = locationComplete ? 'active' : 'draft';
      await productsService.create({
        name: form.name,
        categoryId: isIndependentSeller ? 'independent' : categoryId!,
        category: isIndependentSeller ? 'General' : category!.name,
        brand: form.brand,
        description: form.description,
        images,
        mrp,
        sellingPrice,
        discountPercent: formatDiscount(mrp, sellingPrice),
        quantity: Number(form.quantity) || 0,
        lowStockThreshold: Number(form.lowStockThreshold) || 5,
        sku: form.sku || `SKU-${Date.now()}`,
        storeId: isIndependentSeller ? undefined : storeId,
        status: productStatus,
        unitType: pricingState.unitType,
        customUnit: pricingState.unitType === 'other' ? pricingState.customUnit : undefined,
        packageSize: parsed.packageSize,
        purchasePrice: parsed.purchasePrice,
        pricePerUnit: parsed.pricePerUnit,
        marginAmount: parsed.margin.amount,
        marginPercent: parsed.margin.percent,
      });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      router.back();
      if (productStatus === 'active') {
        appAlert(
          'Product Added',
          isIndependentSeller
            ? 'Your product is live under the Active tab. The admin team has been notified and may review it later.'
            : 'Your product is now live under the Active tab.',
        );
      }
    } catch {
      appAlert('Error', 'Could not save product. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!isIndependentSeller && !category) return null;

  const unitLabel = getUnitLabel(pricing.state.unitType, pricing.state.customUnit);

  return (
    <>
      <Stack.Screen options={{ title: 'Add Product' }} />
      <ScreenWrapper>
        {!locationComplete && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              {getLocationWarningMessage(profile?.partnerType)}
            </Text>
          </View>
        )}
        <StepProgress currentStep={step} totalSteps={4} label={`Step ${step} of 4`} />

        {step === 1 && (
          <>
            <Text style={styles.title}>Product Images</Text>
            <TouchableOpacity style={styles.uploadArea} onPress={pickImages}>
              <Ionicons name="camera-outline" size={40} color={colors.textMuted} />
              <Text style={styles.uploadText}>Upload Images (Camera / Gallery)</Text>
              {images.length > 0 && <Text style={styles.imageCount}>{images.length} image(s) selected</Text>}
            </TouchableOpacity>
            <Button title="Next" onPress={() => setStep(2)} fullWidth disabled={images.length === 0} />
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.title}>Basic Information</Text>
            {!isIndependentSeller && category && (
              <View style={styles.categoryRow}>
                <Text style={styles.categoryLabel}>Category</Text>
                <Text style={styles.categoryValue}>{category.name}</Text>
              </View>
            )}
            <Input label="Product Name *" value={form.name} onChangeText={(v) => update('name', v)} />
            {suggestions.length > 0 && (
              <View style={styles.suggestions}>
                <Text style={styles.suggestTitle}>Suggestions:</Text>
                {suggestions.map((s) => (
                  <TouchableOpacity key={s.id} style={styles.suggestItem} onPress={() => applySuggestion(s)}>
                    <Text style={styles.suggestName}>{s.name}</Text>
                    <Text style={styles.suggestBrand}>{s.brand}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Input label="Brand" value={form.brand} onChangeText={(v) => update('brand', v)} />
            <Input label="Description" value={form.description} onChangeText={(v) => update('description', v)} multiline />
            <View style={styles.navRow}>
              <Button title="Back" variant="secondary" onPress={() => setStep(1)} style={styles.navBtn} />
              <Button title="Next" onPress={() => setStep(3)} style={styles.navBtn} disabled={!form.name.trim()} />
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.title}>Pricing & Units</Text>
            <UnitTypeSelector
              value={pricing.state.unitType}
              customUnit={pricing.state.customUnit}
              onChange={pricing.setUnitType}
              onCustomUnitChange={pricing.setCustomUnit}
            />
            <Input
              label={`Package Size (${unitLabel}) *`}
              value={pricing.state.packageSize}
              onChangeText={(v) => pricing.updateField('packageSize', v)}
              keyboardType="numeric"
              placeholder={`e.g. 500 for 500 ${unitLabel}`}
            />
            <Input
              label="Purchase Price (Cost) *"
              value={pricing.state.purchasePrice}
              onChangeText={(v) => pricing.updateField('purchasePrice', v)}
              keyboardType="numeric"
              placeholder="What you paid for this package"
            />

            <Text style={styles.sectionLabel}>Set Price By</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeChips}>
              {PRICING_MODE_OPTIONS.map((opt) => {
                const isSelected = pricing.state.pricingMode === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => pricing.setPricingMode(opt.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {pricing.state.pricingMode === 'per_unit' && (
              <Input
                label={`Price per ${unitLabel} *`}
                value={pricing.state.pricePerUnit}
                onChangeText={(v) => pricing.updateField('pricePerUnit', v)}
                keyboardType="numeric"
                placeholder={`Rate per ${unitLabel}`}
              />
            )}
            {pricing.state.pricingMode === 'total' && (
              <Input
                label="Selling Price (Total) *"
                value={pricing.state.sellingPrice}
                onChangeText={(v) => pricing.updateField('sellingPrice', v)}
                keyboardType="numeric"
                placeholder="Total price for this package"
              />
            )}
            {pricing.state.pricingMode === 'margin' && (
              <Input
                label="Target Margin % *"
                value={pricing.state.marginPercent}
                onChangeText={(v) => pricing.updateField('marginPercent', v)}
                keyboardType="numeric"
                placeholder="e.g. 20 for 20% profit"
              />
            )}

            {pricing.state.pricingMode !== 'total' && (
              <Input
                label="Selling Price (Total)"
                value={pricing.state.sellingPrice}
                onChangeText={(v) => pricing.updateField('sellingPrice', v)}
                keyboardType="numeric"
                editable={false}
              />
            )}
            {pricing.state.pricingMode !== 'per_unit' && pricing.parsed.pricePerUnit > 0 && (
              <Text style={styles.hint}>
                Rate: ₹{pricing.parsed.pricePerUnit.toLocaleString('en-IN')}/{unitLabel}
              </Text>
            )}

            <Input
              label="MRP"
              value={pricing.state.mrp}
              onChangeText={(v) => pricing.updateField('mrp', v)}
              keyboardType="numeric"
              placeholder="Maximum retail price"
            />
            {pricing.state.mrp && pricing.parsed.sellingPrice > 0 && (
              <Text style={styles.discount}>
                Discount: {formatDiscount(Number(pricing.state.mrp), pricing.parsed.sellingPrice)}%
              </Text>
            )}

            <MarginSummaryCard
              purchasePrice={pricing.parsed.purchasePrice}
              sellingPrice={pricing.parsed.sellingPrice}
              marginAmount={pricing.parsed.margin.amount}
              marginPercent={pricing.parsed.margin.percent}
              pricePerUnit={pricing.parsed.pricePerUnit}
              unitType={pricing.state.unitType}
              customUnit={pricing.state.customUnit}
            />

            <View style={styles.navRow}>
              <Button title="Back" variant="secondary" onPress={() => setStep(2)} style={styles.navBtn} />
              <Button title="Next" onPress={handlePricingNext} style={styles.navBtn} disabled={!pricing.isStepValid} />
            </View>
          </>
        )}

        {step === 4 && (
          <>
            <Text style={styles.title}>Inventory</Text>
            <Text style={styles.inventoryHint}>
              Package: {pricing.parsed.packageSize} {unitLabel} • Selling at ₹{pricing.parsed.sellingPrice}
            </Text>
            <Input
              label="Available Quantity (packs in stock) *"
              value={form.quantity}
              onChangeText={(v) => update('quantity', v)}
              keyboardType="numeric"
            />
            <Input label="Low Stock Alert Level" value={form.lowStockThreshold} onChangeText={(v) => update('lowStockThreshold', v)} keyboardType="numeric" />
            <Input label="SKU" value={form.sku} onChangeText={(v) => update('sku', v)} />
            <View style={styles.navRow}>
              <Button title="Back" variant="secondary" onPress={() => setStep(3)} style={styles.navBtn} />
              <Button title="Submit Product" onPress={handleSubmit} loading={loading} style={styles.navBtn} />
            </View>
          </>
        )}
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  warning: {
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  warningText: { ...typography.bodySmall, color: colors.warning },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  categoryLabel: { ...typography.bodySmall, color: colors.textSecondary },
  categoryValue: { ...typography.bodyMedium, color: colors.text },
  uploadArea: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    padding: spacing.xxxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  uploadText: { ...typography.body, color: colors.textMuted, marginTop: spacing.md },
  imageCount: { ...typography.caption, color: colors.primary, marginTop: spacing.sm },
  suggestions: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  suggestTitle: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  suggestItem: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  suggestName: { ...typography.bodyMedium, color: colors.text },
  suggestBrand: { ...typography.caption, color: colors.textMuted },
  sectionLabel: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  modeChips: { gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  chipText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '500' },
  chipTextSelected: { color: colors.primary, fontWeight: '600' },
  hint: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.md },
  discount: { ...typography.bodyMedium, color: colors.success, marginBottom: spacing.lg },
  inventoryHint: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.lg },
  navRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  navBtn: { flex: 1 },
});
