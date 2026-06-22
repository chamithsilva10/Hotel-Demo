import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGuestStore } from '../store/guestStore';
import { useRequestStore } from '../store/requestStore';
import { useNotificationStore } from '../store/notificationStore';
import { socketService } from '../utils/socket';

export default function ProfileScreen() {
  const { guest, logout } = useGuestStore();
  const { clearRequests } = useRequestStore();
  const { clearNotifications } = useNotificationStore();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            // Disconnect socket
            socketService.disconnect();
            
            // Clear stores
            clearRequests();
            clearNotifications();
            
            // Logout
            await logout();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={48} color="#fff" />
        </View>
        <Text style={styles.guestName}>{guest?.name || 'Guest'}</Text>
        <Text style={styles.guestEmail}>{guest?.email || 'No email'}</Text>
      </View>

      {/* Guest Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Guest Information</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="home" size={20} color="#3b82f6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Room Number</Text>
              <Text style={styles.infoValue}>{guest?.roomNumber || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar" size={20} color="#3b82f6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Check-in Date</Text>
              <Text style={styles.infoValue}>
                {guest?.checkIn ? formatDate(guest.checkIn) : 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Check-out Date</Text>
              <Text style={styles.infoValue}>
                {guest?.checkOut ? formatDate(guest.checkOut) : 'N/A'}
              </Text>
            </View>
          </View>

          {guest?.phoneNumber && (
            <>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="call" size={20} color="#3b82f6" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  <Text style={styles.infoValue}>{guest.phoneNumber}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={24} color="#1e293b" />
          <Text style={styles.menuText}>Notification Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="language-outline" size={24} color="#1e293b" />
          <Text style={styles.menuText}>Language</Text>
          <View style={styles.menuRight}>
            <Text style={styles.menuValue}>English</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="moon-outline" size={24} color="#1e293b" />
          <Text style={styles.menuText}>Dark Mode</Text>
          <View style={styles.menuRight}>
            <Text style={styles.menuValue}>Off</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#1e293b" />
          <Text style={styles.menuText}>Help & FAQ</Text>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="chatbubbles-outline" size={24} color="#1e293b" />
          <Text style={styles.menuText}>Contact Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="information-circle-outline" size={24} color="#1e293b" />
          <Text style={styles.menuText}>About</Text>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>Hotel Guest App v1.0.0</Text>
        <Text style={styles.copyrightText}>© 2024 Hotel Management System</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  guestName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  guestEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  menuItem: {
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
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuValue: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fee2e2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  versionText: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 11,
    color: '#cbd5e1',
  },
});
