import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, ServiceType } from '../types';
import { useGuestStore } from '../store/guestStore';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface ServiceButton {
  id: ServiceType;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  description: string;
}

const services: ServiceButton[] = [
  {
    id: 'room-service',
    title: 'Room Service',
    icon: 'restaurant',
    color: '#ef4444',
    description: 'Order food & beverages',
  },
  {
    id: 'housekeeping',
    title: 'Housekeeping',
    icon: 'bed',
    color: '#3b82f6',
    description: 'Cleaning & supplies',
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    icon: 'construct',
    color: '#f59e0b',
    description: 'Repairs & technical',
  },
  {
    id: 'concierge',
    title: 'Concierge',
    icon: 'information-circle',
    color: '#8b5cf6',
    description: 'Information & booking',
  },
  {
    id: 'spa',
    title: 'Spa & Wellness',
    icon: 'fitness',
    color: '#10b981',
    description: 'Spa services',
  },
  {
    id: 'other',
    title: 'Other',
    icon: 'ellipsis-horizontal',
    color: '#6b7280',
    description: 'Custom request',
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { guest } = useGuestStore();

  const handleServicePress = (serviceType: ServiceType) => {
    navigation.navigate('ServiceRequest', { serviceType });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Guest Info Card */}
        <View style={styles.guestCard}>
          <View style={styles.guestInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={32} color="#fff" />
            </View>
            <View style={styles.guestDetails}>
              <Text style={styles.guestName}>{guest?.name || 'Guest'}</Text>
              <View style={styles.roomInfo}>
                <Ionicons name="home" size={16} color="#64748b" />
                <Text style={styles.roomNumber}>Room {guest?.roomNumber}</Text>
              </View>
            </View>
          </View>
          <View style={styles.checkoutInfo}>
            <Text style={styles.checkoutLabel}>Check-out</Text>
            <Text style={styles.checkoutDate}>
              {guest?.checkOut ? formatDate(guest.checkOut) : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome!</Text>
          <Text style={styles.welcomeText}>
            How can we help you today? Select a service below.
          </Text>
        </View>

        {/* Service Buttons */}
        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceButton}
              onPress={() => handleServicePress(service.id)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.serviceIcon, { backgroundColor: service.color }]}
              >
                <Ionicons name={service.icon} size={32} color="#fff" />
              </View>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceDescription}>
                {service.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Requests' } as any)}
          >
            <Ionicons name="list" size={24} color="#3b82f6" />
            <Text style={styles.actionText}>View My Requests</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Notifications' } as any)}
          >
            <Ionicons name="notifications" size={24} color="#3b82f6" />
            <Text style={styles.actionText}>View Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  guestCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  guestDetails: {
    flex: 1,
  },
  guestName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomNumber: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  checkoutInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  checkoutLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  checkoutDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  welcomeSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 22,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  serviceButton: {
    width: '50%',
    padding: 8,
  },
  serviceIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
  },
});
