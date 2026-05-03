import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

interface AuthUser {
  id: string;
  email: string;
  nombre: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken: string) => Promise<void>;
  clearAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: async (user: AuthUser, accessToken: string) => {
    try {
      await SecureStore.setItemAsync('accessToken', accessToken);
    } catch {
      // SecureStore not available (web/test environment)
    }
    set({ user, accessToken, isAuthenticated: true });
  },

  clearAuth: async () => {
    try {
      await SecureStore.deleteItemAsync('accessToken');
    } catch {
      // ignore
    }
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
