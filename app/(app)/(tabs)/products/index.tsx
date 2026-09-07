import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { ProductCard } from '@/components/cards/ProductCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { productsService, categoriesService, storesService } from '@/services/api';
import { useStoreSwitcherStore } from '@/stores/storeSwitcherStore';
import { PRODUCT_TABS, type ProductStatus } from '@/types/product';
import type { ProductCategory } from '@/types/category';
import { colors, radius, spacing, typography } from '@/theme';

export default function ProductsScreen() {
  const [activeTab, setActiveTab] = useState<ProductStatus>('active');
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const { stores, activeStoreId, setStores, getActiveStore } = useStoreSwitcherStore();
  const activeStore = getActiveStore();

  const { data: storesData } = useQuery({
    queryKey: ['stores'],
    queryFn: storesService.list,
  });

  useEffect(() => {
    if (storesData) setStores(storesData);
  }, [storesData, setStores]);

  const storeId = activeStoreId ?? stores[0]?.id ?? storesData?.[0]?.id;

  const { data: categories } = useQuery({
    queryKey: ['categories', storeId],
    queryFn: () => categoriesService.list(storeId!),
    enabled: !!storeId,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', activeTab, storeId, selectedCategoryId],
    queryFn: () =>
      productsService.list({
        status: activeTab,
        storeId: storeId!,
        categoryId: selectedCategoryId ?? undefined,
      }),
    enabled: !!storeId,
  });

  const filtered = data?.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  function navigateToAddProduct(categoryId: string) {
    if (!storeId) return;
    router.push({
      pathname: '/(app)/products/add',
      params: { storeId, categoryId },
    });
  }

  function handleAddPress() {
    if (!storeId) {
      Alert.alert('No Store', 'Please set up a store before adding products.', [
        { text: 'Go to Stores', onPress: () => router.push('/(app)/stores') },
      ]);
      return;
    }

    if (!categories?.length) {
      Alert.alert(
        'Category Required',
        'Add at least one product category before adding products.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add Category',
            onPress: () => router.push(`/(app)/stores/${storeId}/categories/add`),
          },
        ]
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

      {categories && categories.length > 0 && (
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
            onPress={() => setActiveTab(tab.key as ProductStatus)}
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
            categories?.length
              ? 'No products in this category yet.'
              : 'Add a category first, then start listing products.'
          }
          actionLabel={categories?.length ? 'Add Product' : 'Add Category'}
          onAction={handleAddPress}
        />
      ) : (
        <FlatList
          data={filtered}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={() => router.push(`/(app)/products/${item.id}`)} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={() => setPickerVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPickerVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {categories?.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.modalItem} onPress={() => handleCategoryPick(cat)}>
                <Text style={styles.modalItemText}>{cat.name}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  modalTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemText: { ...typography.body, color: colors.text },
});
