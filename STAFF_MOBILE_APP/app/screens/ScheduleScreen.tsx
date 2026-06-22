import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'

export default function ScheduleScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Schedule</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.day}>Today - Friday, Dec 15</Text>
        <View style={styles.shift}>
          <Text style={styles.shiftTime}>8:00 AM - 4:00 PM</Text>
          <Text style={styles.shiftType}>Housekeeping Team Lead</Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.day}>Saturday, Dec 16</Text>
        <Text style={styles.noShift}>Day Off</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.day}>Sunday, Dec 17</Text>
        <View style={styles.shift}>
          <Text style={styles.shiftTime}>10:00 AM - 6:00 PM</Text>
          <Text style={styles.shiftType}>Housekeeping Team Lead</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingTop: 50 },
  header: { paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc' },
  card: { backgroundColor: '#1e293b', marginHorizontal: 16, marginVertical: 8, padding: 16, borderRadius: 8 },
  day: { fontSize: 14, fontWeight: '600', color: '#e2e8f0', marginBottom: 12 },
  shift: { backgroundColor: '#334155', padding: 12, borderRadius: 6 },
  shiftTime: { fontSize: 14, fontWeight: '600', color: '#3b82f6' },
  shiftType: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  noShift: { fontSize: 14, color: '#64748b', fontStyle: 'italic' },
})
