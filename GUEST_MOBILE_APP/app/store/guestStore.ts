import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Guest } from '../types';

interface GuestStore {
  guest: Guest | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  
  setGuest: (guest: Guest) => void;
  setToken: (token: string) => void;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useGuestStore = create<GuestStore>((set) => ({
  guest: null,
  token: null,
  isAuthenticated: false,
  loading: true,

  setGuest: (guest: Guest) => {
    set({ guest, isAuthenticated: true });
    AsyncStorage.setItem('guestData', JSON.stringify(guest));
  },

  setToken: (token: string) => {
    set({ token, isAuthenticated: true });
    AsyncStorage.setItem('guestToken', token);
  },

  logout: async () => {
    await AsyncStorage.removeItem('guestToken');
    await AsyncStorage.removeItem('guestData');
    set({ guest: null, token: null, isAuthenticated: false });
  },

  loadFromStorage: async () => {
    try {
      const token = await AsyncStorage.getItem('guestToken');
      const guestData = await AsyncStorage.getItem('guestData');
      
      if (token && guestData) {
        const guest = JSON.parse(guestData);
        set({ token, guest, isAuthenticated: true, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
      set({ loading: false });
    }
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },
}));
