import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Notification, Priority } from '../types';
import { apiClient } from '../utils/api';
import { useNotificationStore } from '../store/notificationStore';
import { setBadgeCount } from '../utils/notifications';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const priorityColors: Record<Priority, string> = {
  Critical: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981',
};

const notificationIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  'request-accepted': 'checkmark-circle',
  'request-in-progress': 'time',
  'request-completed': 'checkmark-done-circle',
  'new-message': 'chatbubble',
  'staff-assigned': 'person-add',
  general: 'notifications',
};

export default function NotificationsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    notifications,
    setNotifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
  } = useNotificationStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await apiClient.getNotifications();
      if (response.success) {
        setNotifications(response.data);
        setBadgeCount(0);
      }
    } catch (error) {
      console.error('Load notifications error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
      try {
        await apiClient.markNotificationAsRead(notification.id);
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    }

    if (notification.requestId) {
      navigation.navigate('Chat', {
        requestId: notification.requestId,
        requestTitle: notification.title,
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    markAllAsRead();
    setBadgeCount(0);
    Alert.alert('Success', 'All notifications marked as read');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.notificationCardUnread]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${priorityColors[item.priority]}20` }]}>
        <Ionicons
          name={notificationIcons[item.type] || 'notifications'}
          size={24}
          color={priorityColors[item.priority]}
        />
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.notificationTime}>{formatTime(item.timestamp)}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
    </TouchableOpacity>
  );

  if (notifications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-off-outline" size={80} color="#cbd5e1" />
        <Text style={styles.emptyTitle}>No Notifications</Text>
        <Text style={styles.emptyText}>
          You don't have any notifications yet.{'\n'}
          We'll notify you about your service requests here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {unreadCount > 0 && (
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllButton}>Mark all as read</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3b82f6']}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  markAllButton: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationCardUnread: {
    backgroundColor: '#eff6ff',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
