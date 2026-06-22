import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiClient } from './api';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const priority = notification.request.content.data?.priority || 'Low';
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: priority !== 'Low',
      shouldSetBadge: true,
      priority:
        priority === 'Critical'
          ? Notifications.AndroidNotificationPriority.MAX
          : priority === 'Medium'
          ? Notifications.AndroidNotificationPriority.HIGH
          : Notifications.AndroidNotificationPriority.DEFAULT,
    };
  },
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });

    // Create critical channel
    await Notifications.setNotificationChannelAsync('critical', {
      name: 'Critical Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 200, 500],
      sound: 'default',
      lightColor: '#FF0000',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);

    // Register token with backend
    try {
      await apiClient.registerPushToken(token);
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

export async function schedulePushNotification(
  title: string,
  body: string,
  data?: any,
  seconds: number = 0
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: data?.priority === 'Critical' ? 'default' : undefined,
    },
    trigger: seconds > 0 ? { seconds } : null,
  });
}

export function useNotificationObserver(
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationResponseReceived: (response: Notifications.NotificationResponse) => void
) {
  const notificationListener = Notifications.addNotificationReceivedListener(
    onNotificationReceived
  );

  const responseListener = Notifications.addNotificationResponseReceivedListener(
    onNotificationResponseReceived
  );

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getBadgeCount() {
  return await Notifications.getBadgeCountAsync();
}

export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}
