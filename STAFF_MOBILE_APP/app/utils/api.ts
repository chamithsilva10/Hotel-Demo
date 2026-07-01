import axios from 'axios'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

function unwrap<T>(payload: any): T {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return payload.data as T
  }

  return payload as T
}

export const apiClient = {
  loginStaff: async (payload: { employeeId: string; department: string; password: string }) =>
    unwrap(
      await api
        .post('/api/auth/staff-login', payload)
        .then((response) => response.data),
    ),

  getRequests: async () => unwrap(await api.get('/api/requests').then((response) => response.data)),
  getMessages: async (conversationId?: string | number) =>
    unwrap(
      await api
        .get('/api/messages', {
          params: conversationId ? { conversationId } : undefined,
        })
        .then((response) => response.data),
    ),
  getNotifications: async () =>
    unwrap(await api.get('/api/notifications').then((response) => response.data)),
  updateTaskStatus: async (payload: { id: string; status: string }) =>
    unwrap(await api.patch('/api/requests', payload).then((response) => response.data)),
}
