# Smart Hotel Service Scheduling - Backend API Setup

## Overview

This is an Express.js REST API for the Hotel Service Scheduling System with real-time capabilities via Socket.io and Firebase FCM for push notifications.

## Tech Stack

- **Framework**: Express.js (Node.js)
- **Real-time**: Socket.io
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Database**: Firebase Realtime Database or Firestore (or PostgreSQL with alternative setup)
- **Authentication**: Firebase Auth or JWT
- **Hosting**: Firebase Functions, Vercel, or Railway

## Project Structure

```
backend/
├── src/
│   ├── models/
│   │   ├── Guest.ts
│   │   ├── ServiceRequest.ts
│   │   ├── ChatMessage.ts
│   │   └── StaffMember.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── requests.ts
│   │   ├── chat.ts
│   │   ├── notifications.ts
│   │   └── staff.ts
│   ├── services/
│   │   ├── fcmService.ts
│   │   ├── socketService.ts
│   │   └── authService.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── socket/
│   │   └── events.ts
│   ├── app.ts
│   └── server.ts
├── .env.example
├── package.json
└── tsconfig.json
```

## Database Schema

### Guest Collection
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "roomNumber": "string",
  "checkIn": "ISO 8601 date",
  "checkOut": "ISO 8601 date",
  "fcmToken": "string",
  "createdAt": "ISO 8601 date"
}
```

### ServiceRequest Collection
```json
{
  "id": "string",
  "guestId": "string",
  "type": "Room Service|Housekeeping|Maintenance|Concierge",
  "description": "string",
  "priority": "Critical|Medium|Low",
  "status": "pending|accepted|in-progress|completed",
  "assignedStaffId": "string or null",
  "createdAt": "ISO 8601 date",
  "updatedAt": "ISO 8601 date",
  "completedAt": "ISO 8601 date or null",
  "estimatedTime": "number (minutes)"
}
```

### ChatMessage Collection
```json
{
  "id": "string",
  "guestId": "string",
  "requestId": "string",
  "message": "string",
  "priority": "Critical|Medium|Low",
  "senderRole": "guest|staff|system",
  "senderId": "string",
  "timestamp": "ISO 8601 date",
  "isQuickOption": "boolean"
}
```

### StaffMember Collection
```json
{
  "id": "string",
  "employeeId": "string",
  "name": "string",
  "department": "Housekeeping|Maintenance|Room Service|Concierge",
  "fcmToken": "string",
  "isOnDuty": "boolean",
  "currentTaskCount": "number",
  "createdAt": "ISO 8601 date"
}
```

## Environment Variables

Create `.env` file:
```
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Socket.io
SOCKET_CORS_ORIGIN=http://localhost:3000,http://localhost:19000

# Admin Panel (for v0 dashboard)
ADMIN_API_KEY=admin_key_for_dashboard
```

## Key API Endpoints

### Authentication
- `POST /api/auth/guest-login` - QR code based login for guests
- `POST /api/auth/staff-login` - Employee ID + password for staff
- `POST /api/auth/register-guest` - Guest registration
- `POST /api/auth/logout` - Logout and revoke tokens

### Service Requests
- `GET /api/requests` - Get all requests (filtered by role)
- `POST /api/requests` - Create new request
- `GET /api/requests/:id` - Get request details
- `PUT /api/requests/:id` - Update request (admin/staff)
- `PUT /api/requests/:id/status` - Change request status
- `PUT /api/requests/:id/assign` - Assign to staff member

### Chat & Messaging
- `POST /api/requests/:id/messages` - Send message
- `GET /api/requests/:id/messages` - Get all messages for request
- `POST /api/requests/:id/quick-reply` - Send quick option message

### Notifications
- `POST /api/notifications/fcm-token` - Register FCM token
- `GET /api/notifications/history` - Get notification history
- `DELETE /api/notifications/:id` - Mark notification as read

### Staff Management
- `GET /api/staff` - List all staff
- `PUT /api/staff/:id/status` - Update staff online/offline
- `GET /api/staff/:id/tasks` - Get staff's assigned tasks

## Socket.io Events

### Client → Server
```javascript
// Request events
'request:create' - New service request
'request:update' - Update request status
'request:assign' - Assign staff to request
'chat:send' - Send chat message
'staff:set-available' - Staff availability change
'staff:claim-task' - Staff claims a task
```

### Server → Client
```javascript
// Broadcast to all admins
'request:created' - New request received
'request:assigned' - Request assigned to staff
'request:status-changed' - Status update
'notification:high-priority' - Critical request alert

// Direct to guest
'chat:message-received' - New message
'status:updated' - Request status changed

// Direct to staff
'task:assigned' - New task assigned
'task:updated' - Task status changed
'chat:new-message' - Guest message received
```

## Firebase Cloud Messaging (FCM) Setup

1. Go to Firebase Console
2. Enable FCM in your project
3. Generate service account key JSON
4. Add to `.env` as `FIREBASE_PRIVATE_KEY`

### Notification Types

**Critical Requests** (Guest)
- Sound: Unique alert tone
- Title: "Critical Service Needed"
- Data includes room and issue type

**Critical Requests** (Staff)
- Sound: Alert tone
- Title: "New Critical Task"
- Auto-highlight in task list

**Medium Requests** (Guest)
- Sound: Standard notification sound
- Title: "Service Request Update"

**Medium Requests** (Staff)
- Sound: Standard notification sound
- Title: "New Task Assigned"

**Low Requests**
- No sound (silent)
- Badge only

## Authentication Flow

### Guest QR Login
1. Guest scans QR code from hotel app/portal
2. QR contains temporary code + room number
3. Backend validates QR code
4. Returns JWT token + guest data
5. Token stored securely on device

### Staff Login
1. Staff enters Employee ID + Department + Password
2. Backend validates against staff database
3. Role-based access control assigned
4. Department-specific data filtering enabled
5. JWT token issued with department scope

## Real-time Status Updates

Using Socket.io for bidirectional updates:

1. **Request Creation**: Admin/Guest creates → Socket broadcasts to relevant staff
2. **Status Change**: Staff updates status → Socket notifies guest & admin
3. **Assignment**: Admin assigns task → Socket notifies staff + FCM push
4. **Chat Message**: Message sent → Socket broadcasts to chat participants
5. **Staff Availability**: Staff goes online/offline → Socket updates dashboard

## Critical Alerts Handler

For Critical priority requests:
1. FCM push sent immediately with unique sound
2. Socket event broadcast to all available staff
3. Banner notification in admin dashboard
4. Staff mobile app displays modal alert
5. Auto-refresh request list on receiving end

## Deployment

### Option 1: Firebase Functions
```bash
firebase deploy --only functions
```

### Option 2: Vercel
```bash
vercel deploy
```

### Option 3: Railway/Render
Connect GitHub repo for auto-deployment

## Testing

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run with Socket.io debugging
DEBUG=* npm run dev

# Run tests
npm test
```

## API Response Format

All endpoints return:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Success message"
}
```

Errors:
```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message"
}
```

## Rate Limiting

- Guest requests: 100/hour per user
- Staff requests: 500/hour per user
- Admin requests: Unlimited

## Security

- All requests require valid JWT token
- Role-based access control enforced
- CORS configured for specific origins
- Request validation on all endpoints
- Rate limiting on sensitive endpoints
- HTTPS enforced in production

## Performance Optimization

- Socket.io with Redis adapter for scaling
- Database query caching
- Real-time request filtering
- Efficient pagination
- Compression middleware enabled
