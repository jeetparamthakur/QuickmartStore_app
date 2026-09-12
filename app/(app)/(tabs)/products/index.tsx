import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { ProductCard } from '@/components/cards/ProductCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { BottomSheetPanel } from '@/components/ui/BottomSheetPanel';
import { productsService, categoriesService } from '@/services/api';
import { appAlert } from '@/utils/appDialog';
import { usePartnerType } from '@/hooks/usePermissions';
import { useActiveStoreId } from '@/hooks/useActiveStoreId';
import { PRODUCT_TABS, type ProductTab, matchesProductTab } from '@/types/product';
import type { ProductCategory } from '@/types/category';
import { colors, spacing, typography } from '@/theme';

export default function ProductsScreen() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ProductTab>('active');
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const partnerType = usePartnerType();
  const isStorePartner = partnerType === 'STORE';
  const isIndependentSeller = partnerType === 'INDEPENDENT_SELLER';
  const { storeId, isReady, activeStore } = useActiveStoreId();

  const { data: categories } = useQuery({
    queryKey: ['categories', storeId],
    queryFn: () => categoriesService.list(storeId!),
    enabled: isStorePartner && !!storeId,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', activeTab, storeId, selectedCategoryId, partnerType],
    queryFn: () =>
      productsService.list({
        tab: activeTab,
        storeId: storeId ?? undefined,
        categoryId: selectedCategoryId ?? undefined,
      }),
    enabled: isStorePartner ? !!storeId && isReady : true,
  });

  const filtered = data?.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => productsService.delete(productId, storeId ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: () => appAlert('Error', 'Could not delete product. Please try again.'),
  });

  function confirmDeleteProduct(name: string, productId: string) {
    appAlert(
      'Delete Product',
      `Remove "${name}" from your catalog? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(productId) },
      ],
    );
  }

  function navigateToAddProduct(categoryId: string) {
    if (!storeId) return;
    router.push({
      pathname: '/(app)/products/add',
      params: { storeId, categoryId },
    });
  }

  function handleAddPress() {
    if (isIndependentSeller) {
      router.push('/(app)/products/add');
      return;
    }

    if (!storeId) {
      appAlert('No Store', 'Please set up a store before adding products.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go to Stores', onPress: () => router.push('/(app)/stores') },
      ]);
      return;
    }

    if (!categories?.length) {
      appAlert(
        'Category Required',
        'Add at least one product category before adding products.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add Category',
            onPress: () => router.push(`/(app)/stores/${storeId}/categories/add`),
          },
        ],
      );
      return;
    }

    setPickerVisible(true);
  }

  function handleCategoryPick(category: ProductCategory) {
    setPickerVisible(false);
    navigateToAddProduct(category.id);
  }

  return (
    <ScreenWrapper scroll={false} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Products</Text>
          {activeStore && (
            <TouchableOpacity onPress={() => router.push('/(app)/stores')} style={styles.storeRow}>
              <Ionicons name="storefront-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.storeName}>{activeStore.name}</Text>
              <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddPress}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search Products" />

      {isStorePartner && categories && categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChips}
        >
          <TouchableOpacity
            style={[styles.chip, !selectedCategoryId && styles.chipActive]}
            onPress={() => setSelectedCategoryId(null)}
          >
            <Text style={[styles.chipText, !selectedCategoryId && styles.chipTextActive]}>All</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, selectedCategoryId === cat.id && styles.chipActive]}
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Text style={[styles.chipText, selectedCategoryId === cat.id && styles.chipTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.tabs}>
        {PRODUCT_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <SkeletonCard />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !filtered?.length ? (
        <EmptyState
          icon="cube-outline"
          title="No Products"
          message={
            isIndependentSeller
              ? 'Start listing your products directly.'
              : categories?.length
                ? 'No products in this category yet.'
                : 'Add a category first, then start listing products.'
          }
          actionLabel={isIndependentSeller || categories?.length ? 'Add Product' : 'Add Category'}
          onAction={handleAddPress}
        />
      ) : (
        <FlatList
          data={filtered}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => router.push(`/(app)/products/${item.id}`)}
              onDelete={() => confirmDeleteProduct(item.name, item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {isStorePartner && (
        <BottomSheetPanel
          visible={pickerVisible}
          title="Select Category"
          subtitle="Choose where this product should be listed"
          options={(categories ?? []).map((cat) => ({
            id: cat.id,
            label: cat.name,
            subtitle: `${cat.productCount ?? 0} product${(cat.productCount ?? 0) === 1 ? '' : 's'}`,
            icon: 'albums-outline',
          }))}
          onClose={() => setPickerVisible(false)}
          onSelect={(option) => {
            const category = categories?.find((cat) => cat.id === option.id);
            if (category) handleCategoryPick(category);
          }}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { ...typography.h1, color: colors.text },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  storeName: { ...typography.caption, color: colors.textSecondary },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChips: { gap: spacing.sm, marginBottom: spacing.md, paddingRight: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: colors.primary },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: colors.white },
  list: { paddingBottom: spacing.xxxl },
});
