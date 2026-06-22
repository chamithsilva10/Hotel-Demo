import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Priority, ServiceType } from '../types';
import { apiClient } from '../utils/api';
import { useRequestStore } from '../store/requestStore';
import { useGuestStore } from '../store/guestStore';

type NavigationProp = StackNavigationProp<RootStackParamList, 'ServiceRequest'>;
type RouteProps = RouteProp<RootStackParamList, 'ServiceRequest'>;

const serviceTypes: { value: ServiceType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'room-service', label: 'Room Service', icon: 'restaurant' },
  { value: 'housekeeping', label: 'Housekeeping', icon: 'bed' },
  { value: 'maintenance', label: 'Maintenance', icon: 'construct' },
  { value: 'concierge', label: 'Concierge', icon: 'information-circle' },
  { value: 'spa', label: 'Spa & Wellness', icon: 'fitness' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'Critical', label: 'Critical', color: '#ef4444' },
  { value: 'Medium', label: 'Medium', color: '#f59e0b' },
  { value: 'Low', label: 'Low', color: '#10b981' },
];

export default function ServiceRequestScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { addRequest } = useRequestStore();
  const { guest } = useGuestStore();

  const [serviceType, setServiceType] = useState<ServiceType>(
    route.params?.serviceType || 'room-service'
  );
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Required', 'Please enter a description for your request.');
      return;
    }

    if (description.trim().length < 10) {
      Alert.alert('Too Short', 'Please provide more details (at least 10 characters).');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.createRequest({
        type: serviceType,
        description: description.trim(),
        priority,
      });

      if (response.success) {
        addRequest(response.data);
        
        Alert.alert(
          'Request Submitted',
          'Your service request has been submitted successfully. Our staff will attend to it shortly.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error(response.message || 'Failed to submit request');
      }
    } catch (error: any) {
      console.error('Submit request error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Failed to submit request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Guest Info */}
        <View style={styles.guestInfo}>
          <Ionicons name="home" size={20} color="#64748b" />
          <Text style={styles.guestText}>
            Room {guest?.roomNumber} • {guest?.name}
          </Text>
        </View>

        {/* Service Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Type</Text>
          <View style={styles.serviceTypeGrid}>
            {serviceTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.serviceTypeButton,
                  serviceType === type.value && styles.serviceTypeButtonActive,
                ]}
                onPress={() => setServiceType(type.value)}
              >
                <Ionicons
                  name={type.icon}
                  size={24}
                  color={serviceType === type.value ? '#3b82f6' : '#64748b'}
                />
                <Text
                  style={[
                    styles.serviceTypeText,
                    serviceType === type.value && styles.serviceTypeTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Please describe your request in detail..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={6}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
          <Text style={styles.helperText}>
            Minimum 10 characters • {description.length}/500
          </Text>
        </View>

        {/* Priority Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority Level</Text>
          <View style={styles.priorityContainer}>
            {priorities.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.priorityButton,
                  { borderColor: p.color },
                  priority === p.value && { backgroundColor: p.color },
                ]}
                onPress={() => setPriority(p.value)}
              >
                <Text
                  style={[
                    styles.priorityText,
                    { color: priority === p.value ? '#fff' : p.color },
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.priorityInfo}>
            <Ionicons name="information-circle" size={16} color="#64748b" />
            <Text style={styles.priorityInfoText}>
              {priority === 'Critical'
                ? 'For urgent issues requiring immediate attention'
                : priority === 'Medium'
                ? 'For standard requests with normal response time'
                : 'For non-urgent requests'}
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.submitButtonText}>Submit Request</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  guestText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
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
  serviceTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  serviceTypeButton: {
    width: '33.33%',
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    margin: 4,
  },
  serviceTypeButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  serviceTypeText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  serviceTypeTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
    minHeight: 120,
  },
  helperText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priorityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  priorityInfoText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 8,
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
