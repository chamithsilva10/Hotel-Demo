// Guest Types
export interface Guest {
  id: string;
  name: string;
  email: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  phoneNumber?: string;
}

// Service Request Types
export type ServiceType = 
  | 'room-service' 
  | 'housekeeping' 
  | 'maintenance' 
  | 'concierge' 
  | 'spa' 
  | 'other';

export type Priority = 'Critical' | 'Medium' | 'Low';

export type RequestStatus = 
  | 'pending' 
  | 'accepted' 
  | 'in-progress' 
  | 'completed' 
  | 'cancelled';

export interface ServiceRequest {
  id: string;
  guestId: string;
  guestName?: string;
  roomNumber: string;
  type: ServiceType;
  description: string;
  priority: Priority;
  status: RequestStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  estimatedTime?: number; // in minutes
  imageUrl?: string;
}

// Chat Message Types
export interface ChatMessage {
  id: string;
  requestId: string;
  message: string;
  senderRole: 'guest' | 'staff' | 'system';
  senderId: string;
  senderName: string;
  timestamp: string;
  read: boolean;
  priority?: Priority;
}

// Notification Types
export type NotificationType = 
  | 'request-accepted' 
  | 'request-in-progress' 
  | 'request-completed' 
  | 'new-message' 
  | 'staff-assigned'
  | 'general';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: Priority;
  timestamp: string;
  read: boolean;
  requestId?: string;
  data?: any;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  token: string;
  guest: Guest;
}

// Navigation Types
export type RootStackParamList = {
  QRLogin: undefined;
  MainTabs: undefined;
  ServiceRequest: { serviceType?: ServiceType };
  Chat: { requestId: string; requestTitle: string };
};

export type MainTabParamList = {
  Home: undefined;
  Requests: undefined;
  Notifications: undefined;
  Profile: undefined;
};

// Store State Types
export interface GuestStore {
  guest: Guest | null;
  token: string | null;
  isAuthenticated: boolean;
  setGuest: (guest: Guest) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export interface RequestStore {
  requests: ServiceRequest[];
  loading: boolean;
  error: string | null;
  addRequest: (request: ServiceRequest) => void;
  updateRequest: (id: string, updates: Partial<ServiceRequest>) => void;
  setRequests: (requests: ServiceRequest[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

// Socket Event Types
export interface SocketEvents {
  'request:created': ServiceRequest;
  'request:status-changed': {
    requestId: string;
    status: RequestStatus;
    updatedAt: string;
  };
  'request:assigned': {
    requestId: string;
    staffId: string;
    staffName: string;
  };
  'chat:message-received': ChatMessage;
  'notification:new': Notification;
}
