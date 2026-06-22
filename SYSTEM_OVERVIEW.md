# Smart Hotel Service Scheduling System - Complete Overview

## Project Status

Complete multi-platform system with three integrated applications:

1. ✅ **Admin Web Dashboard** (v0) - READY
2. 📋 **Backend API** (Scaffolding + docs) - READY FOR DEVELOPMENT
3. 📱 **Guest Mobile App** (React Native/Expo) - SCAFFOLDING PROVIDED
4. 👔 **Staff Mobile App** (React Native/Expo) - SCAFFOLDING PROVIDED

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Hotel Service System                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│   Guest App     │  │   Staff App      │  │  Admin Dashboard│
│  (React Native) │  │  (React Native)  │  │  (Next.js/v0)   │
└────────┬────────┘  └────────┬─────────┘  └────────┬────────┘
         │                    │                     │
         └────────┬───────────┴─────────────────────┘
                  │
         ┌────────▼─────────┐
         │   Express API    │
         │   + Socket.io    │
         └────────┬─────────┘
                  │
         ┌────────┴──────────┬──────────────┐
         │                  │              │
    ┌────▼────┐      ┌─────▼─────┐  ┌─────▼──────┐
    │ Firebase │      │ Socket.io │  │ Firebase   │
    │ Database │      │ Realtime  │  │ FCM Push   │
    └──────────┘      └───────────┘  └────────────┘
```

## Features by Application

### Admin Dashboard (WEB)
- Real-time service request tracking
- Staff management and task assignment
- Analytics and performance metrics
- Request filtering by priority/status
- Staff availability monitoring
- Chat history viewing
- Quick statistics overview
- Request creation capability

**Colors/Theme:**
- Dark professional theme (slate-950 background)
- Priority badges: Red (Critical), Yellow (Medium), Green (Low)
- Modern charts and visualizations

### Guest Mobile App
- QR code-based login
- Home screen with quick action grid (6 services)
- Service request form with priority selection
- Real-time request status tracking
- AI chatbot interface with quick options
- Notification history
- Live chat with assigned staff
- Push notification handling

### Staff Mobile App
- Employee ID + department login
- Task dashboard sorted by priority
- Detailed task view with guest info
- Accept/reject/complete actions
- Reply chat panel with quick responses
- Notification center with priority alerts
  - Critical: Unique sound + banner
  - Medium: Standard sound + highlight
  - Low: Silent
- Staff profile and statistics

### Backend API
- REST endpoints for all operations
- Socket.io for real-time updates
- Firebase FCM integration
- Role-based access control
- Database schema management
- Authentication & authorization
- Error handling & logging

## Data Models

### Guests
```
{
  id, name, email, roomNumber,
  checkIn, checkOut, fcmToken
}
```

### Service Requests
```
{
  id, guestId, type, description,
  priority, status, assignedStaffId,
  createdAt, updatedAt, completedAt
}
```

### Staff Members
```
{
  id, employeeId, name, department,
  fcmToken, isOnDuty, currentTaskCount
}
```

### Chat Messages
```
{
  id, guestId, requestId, message,
  priority, senderRole, senderId, timestamp
}
```

## Real-time Events (Socket.io)

**Client → Server:**
- request:create, request:update, request:assign
- chat:send, staff:set-available, staff:claim-task

**Server → Clients:**
- request:created, request:assigned, request:status-changed
- chat:message-received, status:updated, task:assigned
- notification:high-priority

## Push Notifications (Firebase FCM)

### Critical Priority
- **Guest**: Alert sound + "Critical Service Needed" title
- **Staff**: Alert sound + "New Critical Task" title + auto-highlight

### Medium Priority
- Sound: Standard notification tone
- Highlight in UI

### Low Priority
- Silent (badge only)

## Development Roadmap

### Phase 1: Backend Setup (Next)
1. Initialize Express.js project
2. Setup Firebase configuration
3. Create database schema
4. Implement authentication
5. Build REST API endpoints
6. Configure Socket.io events
7. Implement FCM integration
8. Test with Postman/Thunder Client

### Phase 2: Mobile Apps
1. Initialize Expo projects (Guest & Staff)
2. Setup navigation structure
3. Build screens (per spec)
4. Integrate Socket.io client
5. Implement Firebase FCM
6. Test on iOS/Android
7. Deploy to Expo Go/TestFlight

### Phase 3: Admin Enhancements
1. Add analytics charts
2. Add staff management UI
3. Add request creation UI
4. Add system settings
5. Performance optimization

## Setup Instructions

### 1. Admin Dashboard (Already Running)
```bash
# Already running on http://localhost:3000
# Source: /vercel/share/v0-project
```

### 2. Backend API
See `BACKEND_SETUP.md` for complete instructions

### 3. Guest Mobile App
See `MOBILE_APPS_SETUP.md` - Guest App section

### 4. Staff Mobile App
See `MOBILE_APPS_SETUP.md` - Staff App section

## API Endpoints Summary

### Auth
- `POST /api/auth/guest-qr-login` - Guest QR login
- `POST /api/auth/staff-login` - Staff login
- `POST /api/auth/logout` - Logout

### Requests
- `GET /api/requests` - List requests
- `POST /api/requests` - Create request
- `PUT /api/requests/:id/status` - Update status
- `PUT /api/requests/:id/assign` - Assign staff

### Chat
- `GET /api/requests/:id/messages` - Get messages
- `POST /api/requests/:id/messages` - Send message

### Staff
- `GET /api/staff` - List staff
- `PUT /api/staff/:id/status` - Update availability

### Notifications
- `POST /api/notifications/fcm-token` - Register token
- `GET /api/notifications/history` - Notification history

## Technology Stack

| Layer | Technologies |
|-------|--------------|
| Frontend (Web) | Next.js 16, React 19, Tailwind CSS, Recharts |
| Frontend (Mobile) | React Native, Expo, TypeScript |
| Backend | Express.js, Node.js, TypeScript |
| Real-time | Socket.io, Socket.io Client |
| Database | Firebase Realtime DB / Firestore |
| Auth | Firebase Auth / JWT |
| Push | Firebase Cloud Messaging (FCM) |
| Hosting | Vercel (Dashboard), Firebase Functions / Railway (API) |

## Performance Considerations

- Real-time status updates via WebSocket (not polling)
- Efficient database queries with indexing
- Request filtering at database level
- Socket.io room-based messaging (not broadcast)
- Message pagination for chat history
- Image compression before upload
- API response caching where appropriate

## Security Measures

- JWT token-based authentication
- Role-based access control (RBAC)
- CORS configured for specific origins
- Rate limiting on endpoints
- Input validation on all forms
- Parameterized database queries
- HTTPS enforced in production
- Secure token storage on mobile
- Firebase Rules for database access

## Testing Strategy

1. **Unit Tests**: Individual components and functions
2. **Integration Tests**: API endpoints and database
3. **E2E Tests**: Complete user flows
4. **Load Testing**: Real-time updates under load
5. **Mobile Testing**: Both iOS and Android
6. **Performance Testing**: Response times and latency

## Deployment

### Admin Dashboard
- Deploy to Vercel with GitHub integration
- Auto-deploy on push to main
- Environment variables in Vercel settings

### Backend API
- Option 1: Firebase Functions
- Option 2: Railway or Render
- Option 3: AWS EC2 / Heroku
- Consider Docker containerization

### Mobile Apps
- Build iOS: `eas build --platform ios`
- Build Android: `eas build --platform android`
- TestFlight for iOS, Google Play for Android

## Monitoring & Analytics

- Error tracking: Sentry or Bugsnag
- Analytics: Firebase Analytics or Mixpanel
- APM: New Relic or DataDog
- Logs: CloudWatch or Papertrail

## File Structure

```
v0-project/
├── app/
│   ├── page.tsx                    (Dashboard main page)
│   ├── layout.tsx                  (Layout with metadata)
│   └── globals.css                 (Theme + styles)
├── components/
│   ├── sidebar.tsx                 (Navigation)
│   ├── stats-overview.tsx          (Stats cards)
│   ├── request-card.tsx            (Request display)
│   └── analytics-chart.tsx         (Charts)
├── BACKEND_SETUP.md                (API documentation)
├── MOBILE_APPS_SETUP.md            (Mobile setup)
└── SYSTEM_OVERVIEW.md              (This file)
```

## Next Steps

1. ✅ Admin Dashboard complete
2. 👉 **Start Backend API** - Use BACKEND_SETUP.md as guide
3. Build Mobile Apps - Use MOBILE_APPS_SETUP.md as guide
4. Integrate all three systems
5. End-to-end testing
6. Deploy to production

## Support & Documentation

- Backend: See `BACKEND_SETUP.md`
- Mobile: See `MOBILE_APPS_SETUP.md`
- Dashboard: Review component comments in `/components`
- API: Swagger docs (implement in backend)

## Contact & Issues

For questions or issues:
1. Check relevant documentation file
2. Review code comments in components
3. Check error messages in browser/device logs
4. Test with API client (Postman)

---

**System Version**: 1.0.0
**Last Updated**: 2026-06-18
**Status**: Ready for Backend Development
