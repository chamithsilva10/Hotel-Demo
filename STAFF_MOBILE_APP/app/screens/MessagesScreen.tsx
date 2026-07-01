import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { apiClient } from '../utils/api'
import { socketService } from '../utils/socket'

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadConversations = async () => {
    try {
      const response = await apiClient.getMessages()
      setConversations(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Failed to load staff conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()

    const syncConversations = () => {
      loadConversations()
    }

    socketService.on('chat:message-received', syncConversations)
    socketService.on('request:status-changed', syncConversations)

    return () => {
      socketService.off('chat:message-received', syncConversations)
      socketService.off('request:status-changed', syncConversations)
    }
  }, [])

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
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
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <FlatList
        data={conversations}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.conversation}>
            <View style={styles.avatar} />
            <View style={styles.content}>
              <Text style={styles.name}>{item.name || `Conversation ${item.id}`}</Text>
              <Text style={styles.lastMsg}>{item.lastMessage || item.message || 'No messages yet'}</Text>
            </View>
            <Text style={styles.time}>{item.timestamp || item.time || 'now'}</Text>
          </TouchableOpacity>
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
  conversation: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#3b82f6', marginRight: 12 },
  content: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: '#f8fafc' },
  lastMsg: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  time: { fontSize: 12, color: '#64748b' },
})
