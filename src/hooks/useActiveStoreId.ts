import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { storesService } from '@/services/api';
import { useStoreSwitcherStore } from '@/stores/storeSwitcherStore';
import { usePartnerType } from '@/hooks/usePermissions';
import { partnerModules } from '@/constants/partnerModules';

export function useActiveStoreId() {
  const partnerType = usePartnerType();
  const config = partnerModules[partnerType];
  const requiresStoreId = config.showMultiStore;

  const { stores, activeStoreId, setStores, hydrateActiveStore, hydrated } =
    useStoreSwitcherStore();

  const { data: storesData, isSuccess } = useQuery({
    queryKey: ['stores'],
    queryFn: storesService.list,
    enabled: requiresStoreId,
  });

  useEffect(() => {
    if (!requiresStoreId) return;
    void hydrateActiveStore();
  }, [requiresStoreId, hydrateActiveStore]);

  useEffect(() => {
    if (storesData) setStores(storesData);
  }, [storesData, setStores]);

  const storeId = requiresStoreId
    ? activeStoreId ?? stores[0]?.id ?? storesData?.[0]?.id ?? undefined
    : undefined;

  const isReady = !requiresStoreId || (hydrated && (isSuccess || stores.length > 0));

  return {
    storeId,
    requiresStoreId,
    isReady,
    activeStore: stores.find((s) => s.id === storeId),
    stores: stores.length ? stores : storesData ?? [],
    setActiveStore: useStoreSwitcherStore.getState().setActiveStore,
  };
}
