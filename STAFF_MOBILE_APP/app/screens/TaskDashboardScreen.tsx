import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native'
import { apiClient } from '../utils/api'
import { socketService } from '../utils/socket'

export default function TaskDashboardScreen({ navigation }: any) {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const normalizeTask = (request: any) => ({
    id: request.id,
    room: request.roomNumber,
    service: request.type,
    guest: request.guestName || 'Guest',
    priority: request.priority || 'Medium',
    description: request.description || '',
    status: request.status || 'pending',
    time: request.createdAt ? new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
  })

  const loadTasks = async () => {
    try {
      const response = await apiClient.getRequests()
      setTasks(Array.isArray(response) ? response.map(normalizeTask) : [])
    } catch (error) {
      console.error('Failed to load staff tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()

    const handleSync = () => {
      loadTasks()
    }

    socketService.on('request:created', handleSync)
    socketService.on('request:assigned', handleSync)
    socketService.on('request:status-changed', handleSync)

    return () => {
      socketService.off('request:created', handleSync)
      socketService.off('request:assigned', handleSync)
      socketService.off('request:status-changed', handleSync)
    }
  }, [])

  const visibleTasks = useMemo(() => {
    return [...tasks].sort((left, right) => {
      const order: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 }
      return (order[left.priority] ?? 99) - (order[right.priority] ?? 99)
    })
  }, [tasks])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return '#ef4444'
      case 'Medium':
        return '#f59e0b'
      case 'Low':
        return '#10b981'
      default:
        return '#3b82f6'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#64748b'
      case 'accepted':
        return '#3b82f6'
      case 'in-progress':
        return '#a855f7'
      case 'completed':
        return '#10b981'
      default:
        return '#64748b'
    }
  }

  const renderTaskCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() =>
        navigation.navigate('TaskDetail', { task: item })
      }
    >
      <View style={styles.taskHeader}>
        <View>
          <Text style={styles.roomNumber}>Room {item.room}</Text>
          <Text style={styles.service}>{item.service}</Text>
        </View>
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(item.priority) + '30' },
          ]}
        >
          <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
            {item.priority}
          </Text>
        </View>
      </View>

      <Text style={styles.guest}>{item.guest}</Text>
      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.taskFooter}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  )

  const stats = [
    { label: 'Total Tasks', value: '12', color: '#3b82f6' },
    { label: 'In Progress', value: '3', color: '#a855f7' },
    { label: 'Completed', value: '7', color: '#10b981' },
    { label: 'Critical', value: '1', color: '#ef4444' },
  ]

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <Text style={styles.headerSubtitle}>Live hotel requests and assignments</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsScroll}
        contentContainerStyle={styles.statsContainer}
      >
        {stats.map((stat, idx) => (
          <View key={idx} style={[styles.statCard, { borderLeftColor: stat.color }]}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>All Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, styles.filterButtonInactive]}>
          <Text style={styles.filterButtonTextInactive}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, styles.filterButtonInactive]}>
          <Text style={styles.filterButtonTextInactive}>Completed</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={visibleTasks}
        renderItem={renderTaskCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        scrollEnabled={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={async () => {
            setRefreshing(true)
            await loadTasks()
            setRefreshing(false)
          }} tintColor="#3b82f6" />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  statsScroll: {
    paddingVertical: 12,
  },
  statsContainer: {
    paddingHorizontal: 8,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#1e293b',
    borderLeftWidth: 4,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 140,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterButtonInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  filterButtonTextInactive: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  taskCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roomNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  service: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  guest: {
    fontSize: 14,
    color: '#e2e8f0',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#cbd5e1',
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
    color: '#64748b',
  },
})
