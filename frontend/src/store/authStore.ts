import { create } from 'zustand';
import { authApi } from '../services/api';

interface AuthState {
  user: any | null;
  company: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { companyName: string; email: string; password: string; name: string }) => Promise<void>;
  logout: () => Promise<void>;
  loadProfile: () => Promise<void>;
  setUser: (user: any) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  company: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.login({ email, password });
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      set({ user: data.data.user, company: data.data.company, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.error || 'Error al iniciar sesión');
    }
  },

  register: async (registerData) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.register(registerData);
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      set({ user: data.data.user, company: data.data.company, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.error || 'Error al registrar');
    }
  },

  logout: async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, company: null, isAuthenticated: false });
  },

  loadProfile: async () => {
    try {
      const { data } = await authApi.getProfile();
      set({ user: data.data, company: data.data.company });
    } catch { get().logout(); }
  },

  setUser: (user) => set({ user }),
}));
