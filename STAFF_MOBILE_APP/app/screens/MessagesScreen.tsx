import React from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'

export default function MessagesScreen() {
  const conversations = [
    { id: 1, name: 'Manager - Task Updates', lastMsg: 'New task assigned to you', time: '2m ago' },
    { id: 2, name: 'Guest (Room 301)', lastMsg: 'When will service arrive?', time: '15m ago' },
    { id: 3, name: 'Team Chat', lastMsg: 'Lunch break in 10 mins', time: '1h ago' },
  ]

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
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.lastMsg}>{item.lastMsg}</Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
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
  list: { paddingHorizontal: 16, paddingVertical: 8 },
  conversation: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#3b82f6', marginRight: 12 },
  content: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: '#f8fafc' },
  lastMsg: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  time: { fontSize: 12, color: '#64748b' },
})
