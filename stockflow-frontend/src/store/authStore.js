import { create } from 'zustand';
import api from '../api/axios';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('stockflow_user')) || null,
  token: localStorage.getItem('stockflow_token') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('stockflow_token', data.token);
      localStorage.setItem('stockflow_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (name, email, password, storeName) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
        storeName,
      });
      localStorage.setItem('stockflow_token', data.token);
      localStorage.setItem('stockflow_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('stockflow_token');
    localStorage.removeItem('stockflow_user');
    set({ user: null, token: null, error: null });
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put('/auth/profile', profileData);
      localStorage.setItem('stockflow_user', JSON.stringify(data.user));
      set({ user: data.user, isLoading: false });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Update failed',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));