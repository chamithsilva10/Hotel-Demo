import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

// Screens
import QRLoginScreen from '../screens/QRLoginScreen';
import HomeScreen from '../screens/HomeScreen';
import RequestTrackerScreen from '../screens/RequestTrackerScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ServiceRequestScreen from '../screens/ServiceRequestScreen';
import ChatScreen from '../screens/ChatScreen';

// Types
import { RootStackParamList, MainTabParamList } from '../types';
import { useGuestStore } from '../store/guestStore';
import { useNotificationStore } from '../store/notificationStore';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main Tabs Navigator
function MainTabs() {
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Requests') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#3b82f6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Hotel Services',
        }}
      />
      <Tab.Screen 
        name="Requests" 
        component={RequestTrackerScreen}
        options={{
          title: 'My Requests',
        }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

// Root Stack Navigator
export default function RootNavigator() {
  const { isAuthenticated, loading } = useGuestStore();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen 
            name="QRLogin" 
            component={QRLoginScreen}
            options={{
              headerShown: false,
            }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs}
            />
            <Stack.Screen 
              name="ServiceRequest" 
              component={ServiceRequestScreen}
              options={{
                headerShown: true,
                title: 'New Service Request',
                headerStyle: {
                  backgroundColor: '#3b82f6',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen}
              options={{
                headerShown: true,
                headerStyle: {
                  backgroundColor: '#3b82f6',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
});
