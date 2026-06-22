import { create } from 'zustand';
import { Notification } from '../types';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  
  addNotification: (notification: Notification) => void;
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  updateUnreadCount: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification: Notification) => {
    set((state) => {
      const newNotifications = [notification, ...state.notifications];
      const unreadCount = newNotifications.filter((n) => !n.read).length;
      return {
        notifications: newNotifications,
        unreadCount,
      };
    });
  },

  setNotifications: (notifications: Notification[]) => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    set({ notifications, unreadCount });
  },

  markAsRead: (id: string) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      const unreadCount = notifications.filter((n) => !n.read).length;
      return { notifications, unreadCount };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  updateUnreadCount: () => {
    const unreadCount = get().notifications.filter((n) => !n.read).length;
    set({ unreadCount });
  },
}));
