# Smart Hotel Service Scheduling - Mobile Apps Setup

## Technology Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript / JavaScript
- **Navigation**: React Navigation
- **State Management**: Redux Toolkit or Zustand
- **HTTP Client**: Axios with Interceptors
- **Real-time**: Socket.io client
- **Push Notifications**: Firebase Cloud Messaging (FCM) via Expo
- **Local Storage**: AsyncStorage
- **UI Components**: React Native Paper or custom components

## Project Structure

```
guest-app/                          staff-app/
├── src/                            ├── src/
│   ├── screens/                    │   ├── screens/
│   │   ├── QRLoginScreen.tsx       │   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx          │   │   ├── TaskDashboardScreen.tsx
│   │   ├── ServiceFormScreen.tsx   │   │   ├── TaskDetailScreen.tsx
│   │   ├── RequestTrackerScreen.tsx│   │   ├── ChatReplyScreen.tsx
│   │   ├── ChatbotScreen.tsx       │   │   ├── NotificationCenterScreen.tsx
│   │   └── NotificationHistoryScreen.tsx   │   └── ProfileScreen.tsx
│   ├── components/                 │   ├── components/
│   │   ├── QRScanner.tsx          │   │   ├── TaskCard.tsx
│   │   ├── ServiceForm.tsx        │   │   ├── PriorityBadge.tsx
│   │   ├── RequestStatus.tsx      │   │   ├── ChatReplyPanel.tsx
│   │   ├── ChatBubble.tsx         │   │   └── StatusIndicator.tsx
│   │   └── NotificationItem.tsx   │   ├── navigation/
│   ├── navigation/                │   │   └── RootNavigator.tsx
│   │   └── RootNavigator.tsx      │   ├── api/
│   ├── api/                        │   │   ├── client.ts
│   │   ├── client.ts             │   │   └── endpoints.ts
│   │   └── endpoints.ts          │   ├── utils/
│   ├── store/                     │   │   ├── socket.ts
│   │   └── requestSlice.ts       │   │   └── notifications.ts
│   ├── utils/                     │   ├── store/
│   │   ├── socket.ts            │   │   └── taskSlice.ts
│   │   └── notifications.ts     │   ├── types/
│   ├── types/                     │   │   └── index.ts
│   │   └── index.ts             └── package.json
│   └── App.tsx
└── package.json
```

## Guest App Features

### 1. QR Login Screen
- Scan QR code from hotel registration portal
- QR contains: room number + temporary auth code
- Success → navigate to home
- Error handling with retry

```typescript
// Pseudo-code
const handleQRScanned = async (data: string) => {
  const { roomNumber, authCode } = parseQRData(data);
  const token = await loginViaQR(authCode, roomNumber);
  storeToken(token);
  navigateTo('Home');
};
```

### 2. Home Screen (Quick Actions Grid)
- 6 quick action buttons:
  - Room Service (food delivery)
  - Housekeeping (cleaning, towels)
  - Maintenance (repairs, AC)
  - Concierge (reservations, info)
  - Messages (chat with staff)
  - My Requests (view all requests)
- Guest profile card (room, name, check-out date)
- Current active requests count

### 3. Service Request Form
- Service type selector (buttons/dropdown)
- Description text area (min 10 chars)
- Scheduled time picker (now or future)
- Priority selector: Critical / Medium / Low
- Estimated completion time display
- Photo upload option (optional)
- Submit button with loading state
- Success toast notification

### 4. Request Tracker Screen
- List of all guest's requests
- Status badges: pending | accepted | in-progress | completed
- Priority color coding
- Time elapsed / ETA
- Staff member assigned (when applicable)
- Real-time status updates (Socket.io)
- Pull-to-refresh
- Click to see details & chat

### 5. Chatbot Screen
- Quick option buttons (pre-defined messages)
  - "Where is my order?"
  - "I have a problem"
  - "Cancel request"
  - "Need immediate help"
  - "Thank you"
- Custom message input
- Priority tag selector for each message
- Chat history scrollable
- Auto-scroll to newest
- Unread message indicator
- Real-time message delivery

### 6. Notification History
- All notifications displayed chronologically
- Notification types filtered (by tap/swipe)
- Dismiss individual notifications
- Mark all as read
- Sound/vibration testing
- Notification settings link

## Staff App Features

### 1. Staff Login Screen
- Employee ID input
- Password input
- Department selector dropdown
- Biometric login option (future)
- Remember me checkbox
- Error handling

### 2. Task Dashboard Screen
- Requests sorted by priority: Critical (red) → Medium (yellow) → Low (green)
- For each task:
  - Room number (prominent)
  - Guest name
  - Service type icon
  - Request summary
  - Priority badge
  - Time since request
  - Assigned status indicator
- Filter/sort options
- Real-time updates via Socket.io
- Swipe to reveal action buttons (accept/decline)
- Tap to view details

### 3. Task Detail Screen
- Full request information
  - Room number & guest name
  - Service type & description
  - Priority (with unique sound indicator)
  - Guest notes
  - Photos (if any)
- Action buttons:
  - Accept task → status: "accepted"
  - Start work → status: "in-progress"
  - Complete → status: "completed" (with timestamp)
- Chat section (see below)
- Time tracker (optional)
- Status history log

### 4. Chat Reply Panel
- Show all messages in thread
- Distinguish guest vs staff messages
- Quick replies for common responses:
  - "On my way!"
  - "5 minutes away"
  - "Help is here, please open the door"
  - "Issue resolved"
  - "Need more information"
- Custom message input
- Priority tag for message
- Message delivery status (sent/read)
- Typing indicator

### 5. Notification Center
- All notifications listed
- Critical notifications at top with unique alert sound
- Medium notifications with standard sound + highlight
- Low notifications silent
- Tap to navigate to task
- Mark as read
- Clear all
- Notification preferences

### 6. Profile Screen
- Staff member name & ID
- Department
- Current task count
- Completed tasks today
- Average completion time
- Availability toggle (online/offline)
- Logout button

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm/pnpm
- Expo CLI: `npm install -g expo-cli`
- Android Studio or Xcode (for testing)
- Firebase project created

### Guest App Setup

```bash
# Create new Expo project
expo init HotelGuestApp
cd HotelGuestApp

# Install dependencies
pnpm add axios react-native-qrcode-scanner react-native-camera
pnpm add @react-navigation/native @react-navigation/bottom-tabs
pnpm add @react-native-async-storage/async-storage
pnpm add zustand
pnpm add firebase expo-notifications

# Setup environment
cp .env.example .env
# Add your API_URL and FIREBASE config

# Run on iOS/Android
expo start
# Press 'i' for iOS or 'a' for Android
```

### Staff App Setup

```bash
# Create new Expo project
expo init HotelStaffApp
cd HotelStaffApp

# Install dependencies
pnpm add axios react-native-gesture-handler react-native-reanimated
pnpm add @react-navigation/native @react-navigation/stack
pnpm add @react-navigation/bottom-tabs
pnpm add @react-native-async-storage/async-storage
pnpm add zustand
pnpm add firebase expo-notifications
pnpm add socket.io-client

# Setup environment
cp .env.example .env

# Run
expo start
```

## Key Implementation Details

### QR Code Scanning (Guest)

```typescript
import { CameraView, useCameraPermissions } from 'expo-camera';

const QRLoginScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();

  const handleQRScanned = async (data: string) => {
    try {
      const response = await api.post('/auth/guest-qr-login', { qrData: data });
      await AsyncStorage.setItem('guestToken', response.token);
      navigateTo('Home');
    } catch (error) {
      showError('Invalid QR code. Please try again.');
    }
  };

  return (
    <CameraView onBarCodeScanned={handleQRScanned}>
      {/* UI */}
    </CameraView>
  );
};
```

### Priority-Based Notifications (Staff)

```typescript
import * as Notifications from 'expo-notifications';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const priority = notification.request.content.data.priority;

    if (priority === 'Critical') {
      // Play unique alert sound
      await playSound('critical-alert.mp3');
      // Show banner notification
      // Vibrate pattern
      Vibration.vibrate([500, 200, 500]);
    } else if (priority === 'Medium') {
      // Standard sound
      await playSound('notification.mp3');
    }
    // Low = silent

    return {
      shouldShowAlert: true,
      shouldPlaySound: priority !== 'Low',
      shouldSetBadge: true,
    };
  },
});
```

### Socket.io Real-time Updates

```typescript
import io from 'socket.io-client';

const socket = io(API_URL, {
  auth: {
    token: getToken(),
  },
  transports: ['websocket'],
});

// Guest app: listen for status updates
socket.on('request:status-updated', (data) => {
  updateRequestStatus(data.requestId, data.newStatus);
  showNotification(`Request status: ${data.newStatus}`);
});

// Staff app: listen for task assignments
socket.on('task:assigned-to-me', (task) => {
  showCriticalAlert(`New ${task.priority} task in room ${task.roomNumber}`);
  addTaskToList(task);
});
```

### API Client with Auth

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const client = axios.create({
  baseURL: process.env.API_URL,
  timeout: 10000,
});

// Add token to all requests
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 - refresh or redirect to login
client.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      navigateTo('Login');
    }
    return Promise.reject(error);
  }
);
```

## Firebase FCM Setup for Expo

1. Generate Expo Push Token:
```typescript
const token = await Notifications.getExpoPushTokenAsync();
// Send to backend to store with user profile
```

2. Configure FCM:
- Upload google-services.json (Android)
- Configure iOS certificates
- Add to app.json Expo config

## Testing

### Guest App
- Test QR code scanning
- Submit service request
- Receive real-time updates
- Chat with staff
- Notification reception & sounds

### Staff App
- Staff login with credentials
- Accept/reject tasks
- Update task status
- Send reply messages
- Test priority notifications (critical = special alert)

## Performance Tips

- Use FlatList for lists (virtualization)
- Memoize components with React.memo
- Optimize Socket.io events (throttle/debounce)
- Cache API responses
- Lazy load images
- Use native modules for performance-critical features

## Error Handling

- Network errors with retry logic
- Authentication error → redirect to login
- Firebase errors → user-friendly messages
- Validation errors on forms → field-level feedback
- Timeout handling with user prompts

## Security

- All tokens stored in secure AsyncStorage
- SSL/TLS for all API calls
- Device ID verification
- Biometric authentication (optional)
- Clear tokens on logout
- No sensitive data in logs
