import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { categoriesService } from '@/services/api';
import type { ProductCategory } from '@/types/category';
import { colors, radius, spacing, typography } from '@/theme';

export default function StoreCategoriesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoriesService.list(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: (categoryId: string) => categoriesService.delete(categoryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories', id] }),
    onError: (error: Error) => Alert.alert('Cannot Delete', error.message),
  });

  function handleAddProduct(category: ProductCategory) {
    router.push({
      pathname: '/(app)/products/add',
      params: { storeId: id!, categoryId: category.id },
    });
  }

  function confirmDelete(category: ProductCategory) {
    Alert.alert(
      'Delete Category',
      `Delete "${category.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(category.id) },
      ]
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Product Categories' }} />
      <ScreenWrapper scroll={false}>
        {isLoading ? (
          <SkeletonCard />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !data?.length ? (
          <EmptyState
            icon="albums-outline"
            title="No Categories Yet"
            message="Add your first category to start listing products in this store."
            actionLabel="Add Category"
            onAction={() => router.push(`/(app)/stores/${id}/categories/add`)}
          />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <Text style={styles.productCount}>
                    {item.productCount ?? 0} product{(item.productCount ?? 0) === 1 ? '' : 's'}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <Button
                    title="Add Product"
                    onPress={() => handleAddProduct(item)}
                    style={styles.actionBtn}
                  />
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item)}>
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListFooterComponent={
              <Button
                title="Add Category"
                variant="secondary"
                onPress={() => router.push(`/(app)/stores/${id}/categories/add`)}
                fullWidth
                style={styles.footerBtn}
              />
            }
          />
        )}
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: spacing.xxxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryName: { ...typography.bodyMedium, color: colors.text },
  productCount: { ...typography.caption, color: colors.textSecondary },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  actionBtn: { flex: 1 },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtn: { marginTop: spacing.sm },
});
