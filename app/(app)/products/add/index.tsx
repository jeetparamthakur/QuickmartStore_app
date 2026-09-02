import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { StepProgress } from '@/components/layout/StepProgress';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { productsService } from '@/services/api';
import { usePartnerStore } from '@/stores/partnerStore';
import { formatDiscount } from '@/utils/format';
import { colors, radius, spacing, typography } from '@/theme';

function isPartnerLocationComplete(profile: ReturnType<typeof usePartnerStore.getState>['profile']) {
  const sd = profile?.storeDetails;
  if (!sd) return false;
  return !!(sd.latitude && sd.longitude && sd.city && sd.pincode?.length === 6);
}

export default function AddProductScreen() {
  const profile = usePartnerStore((s) => s.profile);
  const locationComplete = isPartnerLocationComplete(profile);
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '',
    category: '',
    brand: '',
    description: '',
    mrp: '',
    sellingPrice: '',
    quantity: '',
    lowStockThreshold: '5',
    sku: '',
  });
  const [suggestions, setSuggestions] = useState<{ id: string; name: string; brand: string }[]>([]);
  const [loading, setLoading] = useState(false);

  function update(key: string, value: string) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if ((key === 'mrp' || key === 'sellingPrice') && next.mrp && next.sellingPrice) {
        // discount auto-calculated on submit
      }
      return next;
    });
    if (key === 'name' && value.length > 2) {
      productsService.searchCatalog(value).then(setSuggestions);
    }
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

  async function handleSubmit() {
    if (!locationComplete) {
      Alert.alert(
        'Store Location Required',
        'Complete your store location and visibility radius before publishing products. Customers need this to see your products.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Stores', onPress: () => router.push('/(app)/stores') },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const mrp = Number(form.mrp) || 0;
      const sellingPrice = Number(form.sellingPrice) || 0;
      await productsService.create({
        name: form.name,
        category: form.category,
        brand: form.brand,
        description: form.description,
        images,
        mrp,
        sellingPrice,
        discountPercent: formatDiscount(mrp, sellingPrice),
        quantity: Number(form.quantity) || 0,
        lowStockThreshold: Number(form.lowStockThreshold) || 5,
        sku: form.sku || `SKU-${Date.now()}`,
        storeId: 's1',
        status: locationComplete ? 'pending_review' : 'draft',
      });
      router.back();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Add Product' }} />
      <ScreenWrapper>
        {!locationComplete && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              Set your store location and visibility radius first. Products won't be visible to customers until location is complete.
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
            <Input label="Product Name *" value={form.name} onChangeText={(v) => update('name', v)} />
            {suggestions.length > 0 && (
              <View style={styles.suggestions}>
                <Text style={styles.suggestTitle}>Suggestions:</Text>
                {suggestions.map((s) => (
                  <TouchableOpacity key={s.id} style={styles.suggestItem} onPress={() => update('name', s.name)}>
                    <Text style={styles.suggestName}>{s.name}</Text>
                    <Text style={styles.suggestBrand}>{s.brand}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Input label="Category *" value={form.category} onChangeText={(v) => update('category', v)} />
            <Input label="Brand" value={form.brand} onChangeText={(v) => update('brand', v)} />
            <Input label="Description" value={form.description} onChangeText={(v) => update('description', v)} multiline />
            <View style={styles.navRow}>
              <Button title="Back" variant="secondary" onPress={() => setStep(1)} style={styles.navBtn} />
              <Button title="Next" onPress={() => setStep(3)} style={styles.navBtn} />
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.title}>Pricing</Text>
            <Input label="MRP *" value={form.mrp} onChangeText={(v) => update('mrp', v)} keyboardType="numeric" />
            <Input label="Selling Price *" value={form.sellingPrice} onChangeText={(v) => update('sellingPrice', v)} keyboardType="numeric" />
            {form.mrp && form.sellingPrice && (
              <Text style={styles.discount}>
                Discount: {formatDiscount(Number(form.mrp), Number(form.sellingPrice))}%
              </Text>
            )}
            <View style={styles.navRow}>
              <Button title="Back" variant="secondary" onPress={() => setStep(2)} style={styles.navBtn} />
              <Button title="Next" onPress={() => setStep(4)} style={styles.navBtn} />
            </View>
          </>
        )}

        {step === 4 && (
          <>
            <Text style={styles.title}>Inventory</Text>
            <Input label="Available Quantity *" value={form.quantity} onChangeText={(v) => update('quantity', v)} keyboardType="numeric" />
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
  discount: { ...typography.bodyMedium, color: colors.success, marginBottom: spacing.lg },
  navRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  navBtn: { flex: 1 },
});
