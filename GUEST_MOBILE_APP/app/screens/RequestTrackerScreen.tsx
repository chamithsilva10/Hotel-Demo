import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, ServiceRequest, RequestStatus, Priority } from '../types';
import { apiClient } from '../utils/api';
import { useRequestStore } from '../store/requestStore';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const statusColors: Record<RequestStatus, string> = {
  pending: '#94a3b8',
  accepted: '#3b82f6',
  'in-progress': '#f59e0b',
  completed: '#10b981',
  cancelled: '#ef4444',
};

const priorityColors: Record<Priority, string> = {
  Critical: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981',
};

export default function RequestTrackerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { requests, setRequests, setLoading, loading } = useRequestStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getRequests();
      if (response.success) {
        setRequests(response.data);
      }
    } catch (error) {
      console.error('Load requests error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
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

  const getServiceIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      'room-service': 'restaurant',
      housekeeping: 'bed',
      maintenance: 'construct',
      concierge: 'information-circle',
      spa: 'fitness',
      other: 'ellipsis-horizontal',
    };
    return icons[type] || 'help-circle';
  };

  const renderRequest = ({ item }: { item: ServiceRequest }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => navigation.navigate('Chat', {
        requestId: item.id,
        requestTitle: item.type.replace('-', ' '),
      })}
      activeOpacity={0.7}
    >
      <View style={styles.requestHeader}>
        <View style={styles.serviceInfo}>
          <View style={[styles.iconContainer, { backgroundColor: `${priorityColors[item.priority]}20` }]}>
            <Ionicons
              name={getServiceIcon(item.type)}
              size={24}
              color={priorityColors[item.priority]}
            />
          </View>
          <View style={styles.requestDetails}>
            <Text style={styles.serviceType}>
              {item.type.replace('-', ' ').toUpperCase()}
            </Text>
            <Text style={styles.requestTime}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: priorityColors[item.priority] }]}>
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.requestFooter}>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
          <Text style={styles.statusText}>
            {item.status.replace('-', ' ').toUpperCase()}
          </Text>
        </View>
        {item.assignedStaffName && (
          <View style={styles.staffInfo}>
            <Ionicons name="person" size={14} color="#64748b" />
            <Text style={styles.staffName}>{item.assignedStaffName}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );

  if (loading && requests.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  if (requests.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="file-tray-outline" size={80} color="#cbd5e1" />
        <Text style={styles.emptyTitle}>No Requests Yet</Text>
        <Text style={styles.emptyText}>
          You haven't made any service requests.{'\n'}
          Start by requesting a service from the home screen.
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' } as any)}
        >
          <Text style={styles.emptyButtonText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderRequest}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
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
  emptyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestDetails: {
    flex: 1,
  },
  serviceType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  requestTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  requestFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  staffInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    flex: 1,
  },
  staffName: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  chevron: {
    marginLeft: 'auto',
  },
});
