import React from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'

export default function NotificationsScreen() {
  const notifications = [
    { id: 1, type: 'critical', title: 'New Critical Task', msg: 'Room 301 AC urgent', time: '5m ago' },
    { id: 2, type: 'completed', title: 'Task Completed', msg: 'Room 415 housekeeping done', time: '20m ago' },
    { id: 3, type: 'info', title: 'Schedule Change', msg: 'Tomorrow shift moved to 10 AM', time: '2h ago' },
  ]

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
            <Text style={styles.msg}>{item.msg}</Text>
            <Text style={styles.time}>{item.time}</Text>
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
  list: { paddingHorizontal: 16, paddingVertical: 8 },
  notif: { backgroundColor: '#1e293b', borderLeftWidth: 4, borderRadius: 8, padding: 12, marginVertical: 8 },
  title: { fontSize: 14, fontWeight: '600', color: '#f8fafc' },
  msg: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  time: { fontSize: 11, color: '#64748b', marginTop: 6 },
})
