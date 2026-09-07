import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const PHONE_KEY = 'auth_phone';
const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

type AuthState = {
  token: string | null;
  refreshToken: string | null;
  phone: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setTokens: (token: string, refreshToken: string) => Promise<void>;
  setPhone: (phone: string) => Promise<void>;
  loadSession: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  phone: null,
  isLoading: true,
  isAuthenticated: false,

  setTokens: async (token, refreshToken) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    set({ token, refreshToken, isAuthenticated: true });
  },

  setPhone: async (phone) => {
    await SecureStore.setItemAsync(PHONE_KEY, phone);
    set({ phone });
  },

  loadSession: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      const phone = await SecureStore.getItemAsync(PHONE_KEY);
      set({
        token,
        refreshToken,
        phone,
        isAuthenticated: !!token,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(PHONE_KEY);
    set({ token: null, refreshToken: null, phone: null, isAuthenticated: false });
  },
}));

export async function isOnboardingComplete(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(ONBOARDING_COMPLETE_KEY);
  return value === 'true';
}

export async function setOnboardingComplete(complete: boolean): Promise<void> {
  await SecureStore.setItemAsync(ONBOARDING_COMPLETE_KEY, complete ? 'true' : 'false');
}
