import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to all requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('guestToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      await AsyncStorage.removeItem('guestToken');
      await AsyncStorage.removeItem('guestData');
      // Navigation will be handled by the app
    }
    return Promise.reject(error);
  }
);

// API Methods
export const apiClient = {
  // Authentication
  loginWithQR: async (qrData: string) => {
    const response = await api.post('/api/auth/guest-qr-login', { qrData });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },

  // Service Requests
  getRequests: async () => {
    const response = await api.get('/api/requests');
    return response.data;
  },

  createRequest: async (data: {
    type: string;
    description: string;
    priority: string;
    scheduledTime?: string;
    imageUrl?: string;
  }) => {
    const response = await api.post('/api/requests', data);
    return response.data;
  },

  getRequestById: async (id: string) => {
    const response = await api.get(`/api/requests/${id}`);
    return response.data;
  },

  cancelRequest: async (id: string) => {
    const response = await api.put(`/api/requests/${id}/status`, {
      status: 'cancelled',
    });
    return response.data;
  },

  // Chat Messages
  getMessages: async (requestId: string) => {
    const response = await api.get(`/api/requests/${requestId}/messages`);
    return response.data;
  },

  sendMessage: async (requestId: string, message: string, priority?: string) => {
    const response = await api.post(`/api/requests/${requestId}/messages`, {
      message,
      priority,
    });
    return response.data;
  },

  // Notifications
  registerPushToken: async (token: string) => {
    const response = await api.post('/api/notifications/fcm-token', {
      token,
      platform: 'mobile',
    });
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get('/api/notifications/history');
    return response.data;
  },

  markNotificationAsRead: async (id: string) => {
    const response = await api.put(`/api/notifications/${id}/read`);
    return response.data;
  },

  // Guest Profile
  getProfile: async () => {
    const response = await api.get('/api/guest/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/api/guest/profile', data);
    return response.data;
  },
};

export default api;
