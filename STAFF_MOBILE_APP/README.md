Hotel Staff Mobile App
======================

React Native + Expo mobile app for hotel staff task management and real-time communication.

Quick Start
-----------

1. Install dependencies:
   npm install

2. Start the app:
   npm start

3. Run on device/emulator:
   - iOS: npm run ios
   - Android: npm run android
   - Web: npm run web

Demo Credentials
----------------

Employee ID: E001
PIN: 1234

Features
--------

**Task Dashboard**
- View all assigned tasks sorted by priority
- Real-time task status updates
- Statistics dashboard (total, in-progress, completed, critical)
- Filter tasks by status

**Task Details**
- Full task information
- Accept/Start/Complete workflow
- Add notes to tasks
- Contact guest button
- Real-time status synchronization

**Schedule**
- View daily shifts
- See shift times and roles
- Day off indicators

**Messages**
- Guest conversations
- Staff team messages
- Manager notifications
- Real-time message delivery

**Notifications**
- Critical task alerts with sound
- Task completion notifications
- Schedule change alerts
- Filtering by type

**Profile**
- View staff information
- Department and role
- Sign out functionality

Architecture
------------

```
STAFF_MOBILE_APP/
├── App.tsx                    # App entry point
├── app/
│   ├── navigation/
│   │   └── RootNavigator.tsx  # Navigation stack & tabs
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── TaskDashboardScreen.tsx
│   │   ├── TaskDetailScreen.tsx
│   │   ├── ScheduleScreen.tsx
│   │   ├── MessagesScreen.tsx
│   │   ├── NotificationsScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── context/               # State management
│   ├── services/              # API calls
│   └── utils/                 # Helpers
├── package.json
└── app.json
```

Tech Stack
----------

- **Framework**: React Native 0.73
- **Build**: Expo 50
- **Navigation**: React Navigation 6
- **State**: Zustand (recommended)
- **HTTP**: Axios
- **Notifications**: Expo Notifications + Firebase Cloud Messaging
- **Real-time**: Socket.io
- **Language**: TypeScript (ready)

API Integration
---------------

The app connects to the backend API for:
- Authentication (employee ID + PIN)
- Task fetching and updates
- Message sending/receiving
- Notification management
- Schedule information

Update the API base URL in services/:

```javascript
const API_BASE_URL = 'http://your-api-url:3000'
```

Authentication Flow
-------------------

1. User enters Employee ID + PIN
2. App sends login request to backend
3. Backend validates credentials
4. Returns authentication token
5. Token stored in device secure storage
6. Token used for subsequent API calls

Task Status Workflow
--------------------

pending → accepted → in-progress → completed

Staff can:
- View pending tasks
- Accept task (marks as accepted)
- Start work (marks as in-progress)
- Mark complete (final status)
- Add notes at any stage

Notification Types
------------------

**Critical (🔴)**
- Sound: Unique alert tone
- Display: Banner + badge
- Auto-dismiss: No

**Medium (🟡)**
- Sound: Standard tone
- Display: Highlight + badge
- Auto-dismiss: After 10s

**Low (🟢)**
- Sound: Silent
- Display: Badge only
- Auto-dismiss: After 5s

Real-time Updates
-----------------

Socket.io connections for:
- Task assignments
- Status changes
- Guest messages
- Notification delivery
- Presence (staff online/offline)

Events:
```
task:assigned
task:updated
message:received
notification:new
staff:online/offline
```

Deployment
----------

Build for Production:

**iOS:**
```
eas build --platform ios
```

**Android:**
```
eas build --platform android
```

**Web:**
```
expo export:web
```

Environment Variables
---------------------

Create `.env` file:

```
REACT_APP_API_URL=https://api.hotelservice.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_SOCKET_URL=https://socket.hotelservice.com
```

Security Considerations
-----------------------

- Credentials stored in secure storage
- API tokens encrypted
- HTTPS only for API calls
- Certificate pinning recommended
- 2FA support for sensitive operations
- Session timeout after 30 minutes inactivity

Testing
-------

Login with demo credentials:
- ID: E001
- PIN: 1234

This grants access to sample tasks and data for testing all features.

Troubleshooting
---------------

**App won't start:**
```
npm install
npx expo start -c
```

**API connection fails:**
- Check API_BASE_URL
- Verify backend is running
- Check network connectivity

**Notifications not working:**
- Enable permissions in app settings
- Verify Firebase configuration
- Check device notification settings

Support
-------

For issues or questions:
1. Check backend logs for errors
2. Enable debug logging in app
3. Review React Native documentation
4. Contact development team

Next Steps
----------

1. Connect to actual backend API
2. Implement state management with Zustand
3. Add push notification integration
4. Set up Firebase Cloud Messaging
5. Configure Socket.io for real-time updates
6. Add image picker for task photos
7. Implement offline sync capability
8. Add unit and integration tests
