import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View, Text } from 'react-native'

import LoginScreen from '../screens/LoginScreen'
import TaskDashboardScreen from '../screens/TaskDashboardScreen'
import TaskDetailScreen from '../screens/TaskDetailScreen'
import ScheduleScreen from '../screens/ScheduleScreen'
import MessagesScreen from '../screens/MessagesScreen'
import NotificationsScreen from '../screens/NotificationsScreen'
import ProfileScreen from '../screens/ProfileScreen'

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
          borderTopWidth: 1,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={TaskDashboardScreen}
        options={{
          tabBarLabel: 'Tasks',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 4 }} />
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          tabBarLabel: 'Schedule',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 4 }} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 4 }} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 4 }} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 4 }} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

export const RootNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen
              name="TaskDetail"
              component={TaskDetailScreen}
              options={{
                headerShown: true,
                title: 'Task Details',
                headerStyle: { backgroundColor: '#1e293b' },
                headerTintColor: '#f8fafc',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
