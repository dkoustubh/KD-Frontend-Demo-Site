import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { mockUsers } from '../mock/users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (id: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (id: string) => {
        const foundUser = mockUsers.find(u => u.id.toUpperCase() === id.toUpperCase());
        if (foundUser) {
          set({ user: foundUser, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

