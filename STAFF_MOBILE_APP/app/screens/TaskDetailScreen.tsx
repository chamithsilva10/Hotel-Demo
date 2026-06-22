import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native'

export default function TaskDetailScreen({ route }: any) {
  const { task } = route.params
  const [status, setStatus] = useState(task.status)
  const [notes, setNotes] = useState('')

  const handleAccept = () => setStatus('accepted')
  const handleStartWork = () => setStatus('in-progress')
  const handleComplete = () => setStatus('completed')

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.roomNumber}>Room {task.room}</Text>
          <Text style={styles.service}>{task.service}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Details</Text>
          <View style={styles.detail}>
            <Text style={styles.label}>Guest Name</Text>
            <Text style={styles.value}>{task.guest}</Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.label}>Priority</Text>
            <Text style={[styles.value, { color: task.priority === 'Critical' ? '#ef4444' : '#3b82f6' }]}>
              {task.priority}
            </Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}>{task.description}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Notes</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Add your notes about this task..."
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View style={styles.actions}>
          {status === 'pending' && (
            <TouchableOpacity style={styles.buttonPrimary} onPress={handleAccept}>
              <Text style={styles.buttonText}>Accept Task</Text>
            </TouchableOpacity>
          )}
          {status === 'accepted' && (
            <TouchableOpacity style={styles.buttonPrimary} onPress={handleStartWork}>
              <Text style={styles.buttonText}>Start Work</Text>
            </TouchableOpacity>
          )}
          {status === 'in-progress' && (
            <TouchableOpacity style={styles.buttonSuccess} onPress={handleComplete}>
              <Text style={styles.buttonText}>Mark Complete</Text>
            </TouchableOpacity>
          )}
          {status !== 'completed' && (
            <TouchableOpacity style={styles.buttonSecondary}>
              <Text style={styles.buttonTextSecondary}>Contact Guest</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 20 },
  header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 12 },
  roomNumber: { fontSize: 24, fontWeight: 'bold', color: '#f8fafc' },
  service: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#e2e8f0', marginBottom: 12 },
  detail: { marginBottom: 12 },
  label: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  value: { fontSize: 14, color: '#f8fafc' },
  textInput: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 80,
  },
  actions: { gap: 12 },
  buttonPrimary: { backgroundColor: '#3b82f6', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonSuccess: { backgroundColor: '#10b981', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#334155', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonTextSecondary: { color: '#3b82f6', fontSize: 16, fontWeight: '600' },
})
