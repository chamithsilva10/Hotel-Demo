import { io, Socket } from 'socket.io-client'

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export type HotelRole = 'admin' | 'staff' | 'guest'

export type HotelSocketEventMap = {
  'request:created': { id: string }
  'request:assigned': { requestId: string; staffId?: string; staffName?: string }
  'request:status-changed': { requestId: string; status: string; updatedAt?: string }
  'chat:message-received': { requestId?: string; conversationId?: string | number }
  'notification:new': { id: string }
  'staff:status-changed': { staffId?: string; isOnDuty?: boolean }
}

let socket: Socket | null = null

export function connectHotelSocket(auth: { token?: string; role: HotelRole; userId?: string }) {
  if (socket?.connected) {
    return socket
  }

  socket = io(SOCKET_URL, {
    auth,
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  })

  return socket
}

export function getHotelSocket() {
  return socket
}

export function disconnectHotelSocket() {
  socket?.disconnect()
  socket = null
}

export function onHotelEvent<K extends keyof HotelSocketEventMap>(
  event: K,
  callback: (payload: HotelSocketEventMap[K]) => void,
) {
  socket?.on(event, callback)
}

export function offHotelEvent<K extends keyof HotelSocketEventMap>(
  event: K,
  callback: (payload: HotelSocketEventMap[K]) => void,
) {
  socket?.off(event, callback)
}
