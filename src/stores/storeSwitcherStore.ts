import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { Store } from '@/types/store';

const ACTIVE_STORE_KEY = 'active_store_id';

type StoreSwitcherState = {
  stores: Store[];
  activeStoreId: string | null;
  hydrated: boolean;
  setStores: (stores: Store[]) => void;
  setActiveStore: (id: string) => Promise<void>;
  getActiveStore: () => Store | undefined;
  hydrateActiveStore: () => Promise<void>;
  reset: () => Promise<void>;
};

async function persistActiveStoreId(id: string | null) {
  if (id) {
    await SecureStore.setItemAsync(ACTIVE_STORE_KEY, id);
  } else {
    await SecureStore.deleteItemAsync(ACTIVE_STORE_KEY);
  }
}

function resolveActiveStoreId(
  stores: Store[],
  preferred: string | null,
  fallback: string | null,
): string | null {
  if (preferred && stores.some((store) => store.id === preferred)) return preferred;
  if (fallback && stores.some((store) => store.id === fallback)) return fallback;
  return stores[0]?.id ?? null;
}

export const useStoreSwitcherStore = create<StoreSwitcherState>((set, get) => ({
  stores: [],
  activeStoreId: null,
  hydrated: false,

  hydrateActiveStore: async () => {
    const persisted = await SecureStore.getItemAsync(ACTIVE_STORE_KEY);
    const { stores, activeStoreId } = get();
    const resolved = resolveActiveStoreId(stores, persisted, activeStoreId);
    set({ activeStoreId: resolved, hydrated: true });
    if (resolved) await persistActiveStoreId(resolved);
  },

  setStores: (stores) => {
    void (async () => {
      const persisted = await SecureStore.getItemAsync(ACTIVE_STORE_KEY);
      const { activeStoreId } = get();
      const resolved = resolveActiveStoreId(stores, persisted, activeStoreId);
      set({ stores, activeStoreId: resolved });
      if (resolved) await persistActiveStoreId(resolved);
    })();
  },

  setActiveStore: async (id) => {
    const { stores } = get();
    if (!stores.some((store) => store.id === id)) return;
    set({ activeStoreId: id });
    await persistActiveStoreId(id);
  },

  getActiveStore: () => {
    const { stores, activeStoreId } = get();
    return stores.find((s) => s.id === activeStoreId);
  },

  reset: async () => {
    set({ stores: [], activeStoreId: null, hydrated: false });
    await SecureStore.deleteItemAsync(ACTIVE_STORE_KEY);
  },
}));
