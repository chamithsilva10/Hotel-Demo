import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { apiClient } from '../utils/api'
import { socketService } from '../utils/socket'

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadNotifications = async () => {
    try {
      const response = await apiClient.getNotifications()
      setNotifications(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Failed to load staff notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()

    const syncNotifications = () => {
      loadNotifications()
    }

    socketService.on('notification:new', syncNotifications)
    socketService.on('request:status-changed', syncNotifications)

    return () => {
      socketService.off('notification:new', syncNotifications)
      socketService.off('request:status-changed', syncNotifications)
    }
  }, [])

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#3b82f6" />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <View style={[styles.notif, { borderLeftColor: item.type === 'critical' ? '#ef4444' : '#10b981' }]}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.msg}>{item.message || item.msg}</Text>
            <Text style={styles.time}>{item.timestamp || item.time || 'now'}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { paddingTop: 50, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 16, paddingVertical: 8 },
  notif: { backgroundColor: '#1e293b', borderLeftWidth: 4, borderRadius: 8, padding: 12, marginVertical: 8 },
  title: { fontSize: 14, fontWeight: '600', color: '#f8fafc' },
  msg: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  time: { fontSize: 11, color: '#64748b', marginTop: 6 },
})
