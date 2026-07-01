import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

// Navigation
import RootNavigator from './app/navigation/RootNavigator';

// Services
import { socketService } from './app/utils/socket';
import { registerForPushNotificationsAsync } from './app/utils/notifications';

// Stores
import { useGuestStore } from './app/store/guestStore';
import { useRequestStore } from './app/store/requestStore';
import { useNotificationStore } from './app/store/notificationStore';

export default function App() {
  const { isAuthenticated, loadFromStorage } = useGuestStore();
  const { updateRequest } = useRequestStore();
  const { addNotification } = useNotificationStore();
  
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Load guest data from storage
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Connect socket when authenticated
      socketService.connect();

      // Register for push notifications
      registerForPushNotificationsAsync();

      // Setup socket listeners
      setupSocketListeners();

      // Setup notification listeners
      setupNotificationListeners();

      return () => {
        // Cleanup
        socketService.removeAllListeners();
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      };
    } else {
      // Disconnect socket when not authenticated
      socketService.disconnect();
    }
  }, [isAuthenticated]);

  const setupSocketListeners = () => {
    // Listen for request status changes
    socketService.onRequestStatusChanged((data) => {
      console.log('Request status changed:', data);
      updateRequest(data.requestId, {
        status: data.status,
        updatedAt: data.updatedAt,
      });

      // Show notification
      const statusMessages: Record<string, string> = {
        accepted: 'Your request has been accepted',
        'in-progress': 'Staff is working on your request',
        completed: 'Your request has been completed',
      };

      if (statusMessages[data.status]) {
        addNotification({
          id: Date.now().toString(),
          type: 'request-accepted',
          title: 'Request Updated',
          message: statusMessages[data.status],
          priority: 'Medium',
          timestamp: new Date().toISOString(),
          read: false,
          requestId: data.requestId,
        });
      }
    });

    // Listen for newly created requests from other connected roles
    socketService.onRequestCreated((data) => {
      console.log('Request created:', data);
      updateRequest(data.id, data as any);
    });

    // Listen for staff assignment
    socketService.onRequestAssigned((data) => {
      console.log('Request assigned:', data);
      updateRequest(data.requestId, {
        assignedStaffId: data.staffId,
        assignedStaffName: data.staffName,
      });

      addNotification({
        id: Date.now().toString(),
        type: 'staff-assigned',
        title: 'Staff Assigned',
        message: `${data.staffName} has been assigned to your request`,
        priority: 'Medium',
        timestamp: new Date().toISOString(),
        read: false,
        requestId: data.requestId,
      });
    });

    // Listen for new messages
    socketService.onMessageReceived((data) => {
      console.log('Message received:', data);
      
      // Only show notification if sender is not guest
      if (data.senderRole !== 'guest') {
        addNotification({
          id: Date.now().toString(),
          type: 'new-message',
          title: 'New Message',
          message: data.message,
          priority: data.priority || 'Low',
          timestamp: data.timestamp,
          read: false,
          requestId: data.requestId,
        });
      }
    });

    // Listen for general notifications
    socketService.onNotification((data) => {
      console.log('Notification received:', data);
      addNotification(data);
    });
  };

  const setupNotificationListeners = () => {
    // Handle notification received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received in foreground:', notification);
      }
    );

    // Handle notification tap
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);
        
        // You can navigate to specific screen based on notification data
        const data = response.notification.request.content.data;
        if (data?.requestId) {
          // Navigate to chat or request detail
          console.log('Navigate to request:', data.requestId);
        }
      }
    );
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
