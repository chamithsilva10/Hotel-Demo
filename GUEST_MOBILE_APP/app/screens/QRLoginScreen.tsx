import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useGuestStore } from '../store/guestStore';
import { apiClient } from '../utils/api';

export default function QRLoginScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setGuest, setToken } = useGuestStore();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const handleBarCodeScanned = async ({ type, data }: any) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);

    try {
      console.log('QR Code scanned:', data);
      
      // Call API to login with QR code
      const response = await apiClient.loginWithQR(data);
      
      if (response.success) {
        // Save token and guest data
        setToken(response.data.token);
        setGuest(response.data.guest);
        
        Alert.alert(
          'Welcome!',
          `Welcome ${response.data.guest.name}! You're now logged in.`,
          [{ text: 'OK' }]
        );
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('QR Login error:', error);
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || error.message || 'Invalid QR code. Please try again.',
        [
          {
            text: 'Retry',
            onPress: () => {
              setScanned(false);
              setLoading(false);
            },
          },
        ]
      );
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={80} color="#666" />
        <Text style={styles.permissionText}>
          Camera permission is required to scan QR codes
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hotel Guest Login</Text>
        <Text style={styles.subtitle}>
          Scan the QR code provided at check-in
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
        </CameraView>
      </View>

      <View style={styles.footer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Logging in...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.instructionText}>
              Position the QR code within the frame
            </Text>
            {scanned && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.retryButtonText}>Scan Again</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#3b82f6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#3b82f6',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#3b82f6',
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
