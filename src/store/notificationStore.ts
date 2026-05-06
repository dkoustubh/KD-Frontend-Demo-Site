import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
  userId: string;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (userId: string) => void;
  getUnreadCount: (userId: string) => number;
  getUserNotifications: (userId: string) => Notification[];
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: '1',
          title: 'Welcome!',
          message: 'Welcome to the Site Monitoring Platform.',
          type: 'info',
          timestamp: new Date().toISOString(),
          isRead: false,
          userId: '2', // HOD
        },
        {
          id: '2',
          title: 'New Regularization Request',
          message: 'John Doe has submitted a regularization request for May 4th.',
          type: 'warning',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          isRead: false,
          userId: '2',
        },
      ],

      addNotification: (notif) => set((state) => ({
        notifications: [
          {
            ...notif,
            id: Math.random().toString(36).substr(2, 9),
            isRead: false,
            timestamp: new Date().toISOString(),
          },
          ...state.notifications,
        ]
      })),

      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => 
          n.id === id ? { ...n, isRead: true } : n
        )
      })),

      markAllAsRead: (userId) => set((state) => ({
        notifications: state.notifications.map((n) => 
          n.userId === userId ? { ...n, isRead: true } : n
        )
      })),

      getUnreadCount: (userId) => 
        get().notifications.filter((n) => n.userId === userId && !n.isRead).length,

      getUserNotifications: (userId) => 
        get().notifications.filter((n) => n.userId === userId).sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
