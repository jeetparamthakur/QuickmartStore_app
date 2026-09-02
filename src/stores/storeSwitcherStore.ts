import { create } from 'zustand';
import type { Store } from '@/types/store';

type StoreSwitcherState = {
  stores: Store[];
  activeStoreId: string | null;
  setStores: (stores: Store[]) => void;
  setActiveStore: (id: string) => void;
  getActiveStore: () => Store | undefined;
};

export const useStoreSwitcherStore = create<StoreSwitcherState>((set, get) => ({
  stores: [],
  activeStoreId: null,

  setStores: (stores) =>
    set({
      stores,
      activeStoreId: get().activeStoreId ?? stores[0]?.id ?? null,
    }),

  setActiveStore: (id) => set({ activeStoreId: id }),

  getActiveStore: () => {
    const { stores, activeStoreId } = get();
    return stores.find((s) => s.id === activeStoreId);
  },
}));
