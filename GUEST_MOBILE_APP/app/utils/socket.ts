import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  async connect() {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('guestToken');
      
      if (!token) {
        console.log('No token available, skipping socket connection');
        return;
      }

      this.socket = io(SOCKET_URL, {
        auth: {
          token,
          role: 'guest',
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        this.isConnected = true;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
      });

    } catch (error) {
      console.error('Error connecting socket:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Socket disconnected manually');
    }
  }

  // Listen for request status updates
  onRequestStatusChanged(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('request:status-changed', callback);
    }
  }

  // Listen for request assignments
  onRequestAssigned(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('request:assigned', callback);
    }
  }

  // Listen for new request creations
  onRequestCreated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('request:created', callback);
    }
  }

  // Listen for new messages
  onMessageReceived(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('chat:message-received', callback);
    }
  }

  // Listen for new notifications
  onNotification(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('notification:new', callback);
    }
  }

  // Emit events
  sendMessage(requestId: string, message: string, priority?: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat:send', {
        requestId,
        message,
        priority,
        senderRole: 'guest',
      });
    }
  }

  joinRequestRoom(requestId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-request-room', requestId);
    }
  }

  leaveRequestRoom(requestId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-request-room', requestId);
    }
  }

  // Remove listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  removeListener(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
