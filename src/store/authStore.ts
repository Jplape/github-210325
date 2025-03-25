import { create } from 'zustand';

interface User {
  email: string;
  id: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  setUser: (user) => {
    console.log('Setting user:', user);
    set({ user });
  },
  setLoading: (loading) => {
    console.log('Setting loading:', loading);
    set({ loading });
  },
  logout: () => {
    console.log('Logging out');
    localStorage.removeItem('auth');
    set({ user: null, loading: false });
  },
  initialize: () => {
    console.log('Initializing auth store');
    set({ user: null, loading: false });
  },
}));

// Réinitialisation au démarrage
if (typeof window !== 'undefined') {
  const store = useAuthStore.getState();
  console.log('Initial auth state:', store);
  store.initialize();
}