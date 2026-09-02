import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserLocation } from '@/types/location';

const LOCATION_KEY = 'user_delivery_location';

type UserLocationState = {
  location: UserLocation | null;
  isLoaded: boolean;
  setLocation: (location: UserLocation) => Promise<void>;
  loadLocation: () => Promise<void>;
  clearLocation: () => Promise<void>;
  hasLocation: () => boolean;
};

export const useUserLocationStore = create<UserLocationState>((set, get) => ({
  location: null,
  isLoaded: false,

  setLocation: async (location) => {
    await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(location));
    set({ location });
  },

  loadLocation: async () => {
    try {
      const raw = await AsyncStorage.getItem(LOCATION_KEY);
      if (raw) {
        set({ location: JSON.parse(raw) as UserLocation, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  clearLocation: async () => {
    await AsyncStorage.removeItem(LOCATION_KEY);
    set({ location: null });
  },

  hasLocation: () => get().location != null,
}));
