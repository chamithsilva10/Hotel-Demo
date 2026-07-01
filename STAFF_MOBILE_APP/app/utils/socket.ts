import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'

type StaffSocketEventMap = {
  'request:created': { id: string }
  'request:assigned': { requestId: string; staffId?: string; staffName?: string }
  'request:status-changed': { requestId: string; status: string; updatedAt?: string }
  'chat:message-received': { requestId?: string; conversationId?: string | number }
  'notification:new': { id: string }
}

class SocketService {
  private socket: Socket | null = null
  private authToken: string | null = null

  setAuthToken(token: string | null) {
    this.authToken = token
  }

  connect(auth: { role: 'staff'; userId?: string } = { role: 'staff' }) {
    if (this.socket?.connected) {
      return this.socket
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        ...auth,
        token: this.authToken || undefined,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    return this.socket
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }

  on<K extends keyof StaffSocketEventMap>(event: K, callback: (payload: StaffSocketEventMap[K]) => void) {
    this.socket?.on(event, callback)
  }

  off<K extends keyof StaffSocketEventMap>(event: K, callback: (payload: StaffSocketEventMap[K]) => void) {
    this.socket?.off(event, callback)
  }

  emit(event: 'staff:set-available' | 'staff:claim-task', payload: unknown) {
    this.socket?.emit(event, payload)
  }
}

export const socketService = new SocketService()
