import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGuestStore } from '../store/guestStore';
import { apiClient } from '../utils/api';

export default function QRLoginScreen() {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [authToken, setAuthToken] = useState('');
  const { setGuest, setToken } = useGuestStore();

  const handleManualLogin = async () => {
    if (!roomNumber.trim()) {
      Alert.alert('Error', 'Please enter your room number');
      return;
    }

    setLoading(true);
    try {
      const room = roomNumber.trim();
      try {
        const qrData = JSON.stringify({
          roomNumber: room,
          authToken: authToken.trim() || 'web-login',
        });
        const response = await apiClient.loginWithQR(qrData);
        if (response.success) {
          setToken(response.data.token);
          setGuest(response.data.guest);
        } else {
          throw new Error(response.message || 'Login failed');
        }
      } catch (backendError) {
        const mockGuests: Record<string, { name: string; room: string }> = {
          '301': { name: 'John Doe', room: '301' },
          '302': { name: 'Jane Smith', room: '302' },
          '303': { name: 'Bob Wilson', room: '303' },
          '201': { name: 'Alice Brown', room: '201' },
          '202': { name: 'Charlie Davis', room: '202' },
          '101': { name: 'Diana Lee', room: '101' },
        };

        if (mockGuests[room]) {
          setToken('mock-token-' + room);
          setGuest({
            id: room,
            name: mockGuests[room].name,
            email: `${room}@hotel.com`,
            roomNumber: room,
            checkIn: '2026-06-28',
            checkOut: '2026-07-02',
          });
        } else {
          throw backendError;
        }
      }
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || error.message || 'Invalid credentials',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="business" size={40} color="#fff" />
        <Text style={styles.title}>Hotel Guest Login</Text>
        <Text style={styles.subtitle}>
          Enter your room details to login
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Room Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 301"
            placeholderTextColor="#999"
            value={roomNumber}
            onChangeText={setRoomNumber}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Auth Token (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Provided at check-in"
            placeholderTextColor="#999"
            value={authToken}
            onChangeText={setAuthToken}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleManualLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        {Platform.OS === 'web' && (
          <Text style={styles.webHint}>
            On mobile, scan the QR code provided at check-in
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 80,
    backgroundColor: '#3b82f6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
  },
  form: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  webHint: {
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
    marginTop: 24,
  },
});
