import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { socketService } from '../utils/socket'

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.avatar} />
        <Text style={styles.name}>Mike Johnson</Text>
        <Text style={styles.dept}>Housekeeping Team Lead</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.info}>
          <Text style={styles.label}>Employee ID</Text>
          <Text style={styles.value}>E001</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.label}>Department</Text>
          <Text style={styles.value}>Housekeeping</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>mike@hotelstaff.com</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText} onPress={() => socketService.disconnect()}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingTop: 50 },
  header: { paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc' },
  card: { backgroundColor: '#1e293b', marginHorizontal: 16, marginVertical: 12, padding: 16, borderRadius: 8, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#3b82f6', marginBottom: 12 },
  name: { fontSize: 18, fontWeight: '600', color: '#f8fafc' },
  dept: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  info: { backgroundColor: '#0f172a', padding: 12, borderRadius: 6, marginVertical: 8, width: '100%' },
  label: { fontSize: 12, color: '#94a3b8' },
  value: { fontSize: 14, color: '#f8fafc', marginTop: 4, fontWeight: '500' },
  logoutBtn: { backgroundColor: '#dc2626', marginHorizontal: 16, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  logoutText: { color: '#fff', fontWeight: '600' },
})
