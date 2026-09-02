import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { ProductCard } from '@/components/cards/ProductCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { productsService } from '@/services/api';
import { PRODUCT_TABS, type ProductStatus } from '@/types/product';
import { colors, spacing, typography } from '@/theme';

export default function ProductsScreen() {
  const [activeTab, setActiveTab] = useState<ProductStatus>('active');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', activeTab],
    queryFn: () => productsService.list(activeTab),
  });

  const filtered = data?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScreenWrapper scroll={false} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(app)/products/add')}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search Products" />

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
          message="Start growing your business by adding your first product."
          actionLabel="Add Product"
          onAction={() => router.push('/(app)/products/add')}
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { ...typography.h1, color: colors.text },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
