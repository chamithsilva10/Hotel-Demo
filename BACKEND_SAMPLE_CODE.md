# Backend Sample Implementation

## Project Setup

```bash
# Create project
mkdir hotel-service-api
cd hotel-service-api
npm init -y

# Install dependencies
npm install express cors dotenv firebase socket.io axios
npm install -D typescript ts-node @types/express @types/node

# Setup TypeScript
npx tsc --init
```

## Sample Files

### 1. `.env.example`

```
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://project.firebaseio.com

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d

# Socket.io
SOCKET_CORS_ORIGIN=http://localhost:3000,http://localhost:19000,http://localhost:19001

# API
ADMIN_API_KEY=admin_key_for_dashboard
```

### 2. `src/app.ts`

```typescript
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();

// Middleware
app.use(cors({
  origin: process.env.SOCKET_CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Hotel Service API is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes will be added here
// app.use('/api/auth', authRoutes);
// app.use('/api/requests', requestRoutes);
// app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.type || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

export default app;
```

### 3. `src/server.ts`

```typescript
import app from './app';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { initializeSocket } from './socket/events';

const PORT = process.env.PORT || 3001;
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Initialize Socket.io event handlers
initializeSocket(io);

httpServer.listen(PORT, () => {
  console.log(`🚀 Hotel Service API running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io listening on ws://localhost:${PORT}`);
});

export { io };
```

### 4. `src/socket/events.ts`

```typescript
import { Server, Socket } from 'socket.io';

export function initializeSocket(io: Server) {
  // Authentication middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    // Verify token here
    next();
  });

  // Connection handling
  io.on('connection', (socket: Socket) => {
    console.log(`🔗 User connected: ${socket.id}`);

    // Join user to their room (e.g., guest-123, staff-456)
    const userId = socket.handshake.auth.userId;
    const userType = socket.handshake.auth.userType; // 'guest' or 'staff'
    socket.join(`${userType}-${userId}`);

    // Request events
    socket.on('request:create', (data) => {
      console.log('New request created:', data);
      // Broadcast to all staff
      io.to('staff-all').emit('request:created', data);
    });

    socket.on('request:update', (data) => {
      console.log('Request updated:', data);
      io.emit('request:status-changed', data);
    });

    socket.on('request:assign', (data) => {
      console.log('Task assigned to staff:', data);
      // Send to specific staff member
      io.to(`staff-${data.staffId}`).emit('task:assigned', data);
    });

    // Chat events
    socket.on('chat:send', (data) => {
      console.log('Chat message:', data);
      // Broadcast to request participants
      io.to(`request-${data.requestId}`).emit('chat:message-received', data);
    });

    // Staff availability
    socket.on('staff:set-available', (data) => {
      console.log('Staff availability changed:', data);
      io.emit('staff:status-changed', data);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
}
```

### 5. `src/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    type: 'guest' | 'staff' | 'admin';
    department?: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'No token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid token',
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.type)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    }
    next();
  };
};
```

### 6. Sample Auth Route: `src/routes/auth.ts`

```typescript
import express, { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router: Router = express.Router();

// Guest QR Login
router.post('/guest-qr-login', async (req: Request, res: Response) => {
  try {
    const { qrData, roomNumber } = req.body;

    // Validate QR data (implement your QR validation logic)
    if (!qrData || !roomNumber) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'QR data and room number required',
      });
    }

    // Get or create guest in database
    const guest = {
      id: `guest-${roomNumber}-${Date.now()}`,
      name: 'Guest', // From QR or database
      roomNumber,
      email: '',
    };

    // Generate JWT token
    const token = jwt.sign(
      { id: guest.id, type: 'guest' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        guest,
      },
      message: 'Guest logged in successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: (error as Error).message,
    });
  }
});

// Staff Login
router.post('/staff-login', async (req: Request, res: Response) => {
  try {
    const { employeeId, password, department } = req.body;

    // Validate credentials against staff database
    if (!employeeId || !password || !department) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Employee ID, password, and department required',
      });
    }

    // Verify staff member (implement your database query)
    const staff = {
      id: `staff-${employeeId}`,
      employeeId,
      name: 'Staff Member', // From database
      department,
    };

    // Generate JWT token
    const token = jwt.sign(
      { id: staff.id, type: 'staff', department },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        staff,
      },
      message: 'Staff logged in successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: (error as Error).message,
    });
  }
});

export default router;
```

### 7. Sample Request Route: `src/routes/requests.ts`

```typescript
import express, { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { io } from '../server';

const router: Router = express.Router();

// Create new service request
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { type, description, priority, estimatedTime } = req.body;
    const guestId = req.user?.id;

    if (!type || !description || !priority) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Type, description, and priority required',
      });
    }

    // Create request in database
    const request = {
      id: `req-${Date.now()}`,
      guestId,
      type,
      description,
      priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedTime,
    };

    // Save to Firebase/Database
    // await saveToDatabase(request);

    // Emit real-time event
    io.to('staff-all').emit('request:created', request);

    res.json({
      success: true,
      data: request,
      message: 'Service request created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: (error as Error).message,
    });
  }
});

// Get all requests (filtered by role)
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { status, priority } = req.query;
    const userType = req.user?.type;

    // Build query based on user type
    let requests: any[] = [];

    if (userType === 'guest') {
      // Get requests for this guest only
      // requests = await getGuestRequests(req.user.id);
    } else if (userType === 'staff') {
      // Get requests for this staff's department
      // requests = await getDepartmentRequests(req.user.department);
    } else {
      // Admin gets all requests
      // requests = await getAllRequests();
    }

    // Apply filters
    if (status) {
      requests = requests.filter(r => r.status === status);
    }
    if (priority) {
      requests = requests.filter(r => r.priority === priority);
    }

    res.json({
      success: true,
      data: requests,
      message: 'Requests retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: (error as Error).message,
    });
  }
});

// Update request status
router.put('/:id/status', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'accepted', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid status',
      });
    }

    // Update in database
    // const updated = await updateRequestStatus(id, status);

    // Emit real-time update
    io.emit('request:status-changed', { requestId: id, newStatus: status });

    res.json({
      success: true,
      data: { id, status, updatedAt: new Date().toISOString() },
      message: 'Request status updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: (error as Error).message,
    });
  }
});

export default router;
```

### 8. Firebase Config: `src/services/firebase.ts`

```typescript
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

export const db = admin.database();
export const auth = admin.auth();
export const messaging = admin.messaging();

export default admin;
```

### 9. FCM Service: `src/services/fcmService.ts`

```typescript
import { messaging } from './firebase';

export const sendPushNotification = async (
  fcmTokens: string[],
  {
    title,
    body,
    data,
    priority,
  }: {
    title: string;
    body: string;
    data?: Record<string, string>;
    priority: 'high' | 'normal' | 'low';
  }
) => {
  try {
    const message = {
      notification: { title, body },
      data: {
        ...data,
        priority,
      },
      tokens: fcmTokens,
      android: {
        priority,
        notification: {
          sound: priority === 'high' ? 'critical_alert' : 'default',
          priority,
        },
      },
      apns: {
        headers: {
          'apns-priority': priority === 'high' ? '10' : '5',
        },
        payload: {
          aps: {
            sound: priority === 'high' ? 'critical_alert.caf' : 'default',
            'content-available': 1,
          },
        },
      },
    };

    const response = await messaging.sendMulticast(message);
    console.log(`Sent ${response.successCount} notifications`);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};
```

### 10. `package.json`

```json
{
  "name": "hotel-service-api",
  "version": "1.0.0",
  "description": "Hotel Service Scheduling System API",
  "main": "dist/server.js",
  "scripts": {
    "dev": "ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "firebase-admin": "^11.5.0",
    "socket.io": "^4.5.4",
    "jsonwebtoken": "^9.0.0",
    "axios": "^1.3.4"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^18.11.18",
    "@types/jsonwebtoken": "^9.0.1",
    "typescript": "^4.9.4",
    "ts-node": "^10.9.1",
    "@types/cors": "^2.8.13"
  }
}
```

## Implementation Steps

1. Create project structure as shown above
2. Install dependencies: `npm install`
3. Create `.env` file from `.env.example`
4. Configure Firebase:
   - Go to Firebase Console
   - Create new project
   - Generate service account key (JSON)
   - Copy credentials to `.env`
5. Create remaining routes (chat, staff, notifications)
6. Test with Postman/Thunder Client
7. Connect mobile and web apps
8. Deploy to hosting platform

## Next Steps

- Implement database operations (Firebase Realtime DB or Firestore)
- Add validation middleware
- Implement pagination
- Add error logging
- Setup Swagger documentation
- Write unit tests
- Configure production environment
- Setup CI/CD pipeline
