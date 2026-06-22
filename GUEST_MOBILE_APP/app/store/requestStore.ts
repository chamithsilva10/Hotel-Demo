import { create } from 'zustand';
import { ServiceRequest } from '../types';

interface RequestStore {
  requests: ServiceRequest[];
  loading: boolean;
  error: string | null;
  
  addRequest: (request: ServiceRequest) => void;
  updateRequest: (id: string, updates: Partial<ServiceRequest>) => void;
  setRequests: (requests: ServiceRequest[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getRequestById: (id: string) => ServiceRequest | undefined;
  clearRequests: () => void;
}

export const useRequestStore = create<RequestStore>((set, get) => ({
  requests: [],
  loading: false,
  error: null,

  addRequest: (request: ServiceRequest) => {
    set((state) => ({
      requests: [request, ...state.requests],
    }));
  },

  updateRequest: (id: string, updates: Partial<ServiceRequest>) => {
    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === id ? { ...req, ...updates } : req
      ),
    }));
  },

  setRequests: (requests: ServiceRequest[]) => {
    set({ requests, loading: false, error: null });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error, loading: false });
  },

  getRequestById: (id: string) => {
    return get().requests.find((req) => req.id === id);
  },

  clearRequests: () => {
    set({ requests: [], loading: false, error: null });
  },
}));
