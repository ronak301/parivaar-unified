import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEY } from '../api/client';

interface AuthUser {
  _id: string;
  enrollmentId: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  communityIds: string[];
  profilePicture?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isNewUser: boolean;
  setAuth: (token: string, user: AuthUser, isNewUser: boolean) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isNewUser: false,

  setAuth: async (token, user, isNewUser) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
    set({ token, user, isNewUser });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync('auth_user');
    set({ user: null, token: null, isNewUser: false });
  },

  hydrate: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const userJson = await SecureStore.getItemAsync('auth_user');
    if (token && userJson) {
      set({ token, user: JSON.parse(userJson), isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },
}));
