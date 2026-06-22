import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { RootNavigator } from './app/navigation/RootNavigator'

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
    </GestureHandlerRootView>
  )
}
