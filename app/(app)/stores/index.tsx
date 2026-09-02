import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { StoreCard } from '@/components/cards/StoreCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStoreSwitcherStore } from '@/stores/storeSwitcherStore';
import { useFeatureFlag } from '@/hooks/usePermissions';
import { storesService } from '@/services/api';
import { colors, spacing, typography } from '@/theme';
import { useEffect } from 'react';

export default function StoresScreen() {
  const multiStoreEnabled = useFeatureFlag('multi_store_enabled');
  const { stores, activeStoreId, setStores, setActiveStore } = useStoreSwitcherStore();

  const { data } = useQuery({
    queryKey: ['stores'],
    queryFn: storesService.list,
  });

  useEffect(() => {
    if (data) setStores(data);
  }, [data, setStores]);

  return (
    <>
      <Stack.Screen options={{ title: 'My Stores' }} />
      <ScreenWrapper scroll={false}>
        <Text style={styles.subtitle}>Switch between your store branches</Text>

        {!stores.length ? (
          <EmptyState icon="storefront-outline" title="No Stores" message="Add your first store to get started." />
        ) : (
          <FlatList
            data={stores}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <StoreCard
                store={item}
                selected={item.id === activeStoreId}
                onPress={() => {
                  setActiveStore(item.id);
                  router.push(`/(app)/stores/${item.id}`);
                }}
              />
            )}
          />
        )}

        {multiStoreEnabled && (
          <TouchableOpacity style={styles.addBtn}>
            <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
            <Text style={styles.addText}>Add New Store</Text>
          </TouchableOpacity>
        )}
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  list: { paddingBottom: spacing.xxxl },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 16,
    marginTop: spacing.md,
  },
  addText: { ...typography.bodyMedium, color: colors.primary },
});
