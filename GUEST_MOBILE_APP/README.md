# Hotel Guest Mobile App

A complete React Native mobile application for hotel guests to request services, track requests, chat with staff, and receive real-time notifications.

## 📱 Features

### 🔐 Authentication
- **QR Code Login**: Fast and secure login using QR codes provided at hotel check-in
- **Automatic Session Management**: Token-based authentication with secure storage
- **Biometric Support Ready**: Architecture prepared for fingerprint/face ID

### 🏠 Home & Services
- **Guest Dashboard**: Personalized welcome screen with room information
- **Quick Action Buttons**: 6 service categories for easy access
  - Room Service (Food & Beverages)
  - Housekeeping (Cleaning & Supplies)
  - Maintenance (Repairs & Technical)
  - Concierge (Information & Booking)
  - Spa & Wellness
  - Other (Custom Requests)
- **Guest Profile Card**: Room number, check-in/out dates display

### 📝 Service Requests
- **Smart Request Form**: 
  - Service type selection with icons
  - Detailed description input (min 10 characters)
  - Priority levels: Critical, Medium, Low
  - Form validation and error handling
- **Real-time Status Tracking**: Live updates on request progress
- **Request History**: View all past and current requests
- **Status Indicators**: Color-coded badges (Pending, Accepted, In Progress, Completed)

### 💬 Live Chat
- **Real-time Messaging**: Instant communication with staff via Socket.io
- **Quick Replies**: Pre-defined message templates
- **Message Threading**: Organized by service request
- **Read Receipts**: Track message delivery status
- **Typing Indicators**: See when staff is responding

### 🔔 Notifications
- **Push Notifications**: Firebase Cloud Messaging integration
- **Priority-based Alerts**:
  - Critical: Alert sound + vibration
  - Medium: Standard notification
  - Low: Silent badge update
- **Notification Center**: View all notifications with timestamps
- **Unread Count**: Badge counter on tab icon
- **Deep Linking**: Tap notification to view related request

### 👤 Profile & Settings
- **Guest Information**: View room details and stay dates
- **App Settings**: Language, theme, notifications
- **Support Access**: Help, FAQ, and contact options
- **Secure Logout**: Clear all data and disconnect

## 🛠️ Technology Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React Native 0.73 |
| **Platform** | Expo 50 |
| **Language** | TypeScript 5.3 |
| **Navigation** | React Navigation 6 |
| **State Management** | Zustand 4.4 |
| **HTTP Client** | Axios 1.6 |
| **Real-time** | Socket.io Client 4.5 |
| **Notifications** | Expo Notifications |
| **Camera** | Expo Camera (QR scanning) |
| **Storage** | AsyncStorage |
| **UI Icons** | Expo Vector Icons (Ionicons) |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: 16.x or higher ([Download](https://nodejs.org/))
- **npm** or **pnpm**: Package manager
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go App**: Install on your physical device
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### For iOS Development (Optional)
- **macOS**: Required for iOS builds
- **Xcode**: Latest version from App Store
- **iOS Simulator**: Included with Xcode

### For Android Development (Optional)
- **Android Studio**: For Android emulator
- **Android SDK**: Installed via Android Studio

## 🚀 Installation

### 1. Clone or Navigate to Project

```bash
cd /Users/chamithshaminda/Downloads/hotel-system-design-main/GUEST_MOBILE_APP
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using pnpm (recommended):
```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# API Configuration
API_URL=http://YOUR_BACKEND_IP:3001
SOCKET_URL=http://YOUR_BACKEND_IP:3001

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Important**: 
- Replace `YOUR_BACKEND_IP` with your computer's IP address (not localhost)
- Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Use the same network for both mobile device and backend server

## 🎬 Running the App

### Development Mode

Start the Expo development server:

```bash
npm start
# or
pnpm start
# or
expo start
```

This will open the Expo Developer Tools in your browser.

### Run on Physical Device (Recommended)

1. Install **Expo Go** app on your phone
2. Scan the QR code displayed in terminal/browser
3. App will load on your device

### Run on iOS Simulator (macOS only)

```bash
npm run ios
# or
pnpm ios
```

### Run on Android Emulator

```bash
npm run android
# or
pnpm android
```

### Run on Web (Limited functionality)

```bash
npm run web
# or
pnpm web
```

**Note**: Camera and some native features won't work on web.

## 📂 Project Structure

```
GUEST_MOBILE_APP/
├── App.tsx                          # Root component with providers
├── app.json                         # Expo configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── .env.example                     # Environment template
│
├── app/
│   ├── navigation/
│   │   └── RootNavigator.tsx       # Navigation setup
│   │
│   ├── screens/
│   │   ├── QRLoginScreen.tsx       # QR code authentication
│   │   ├── HomeScreen.tsx          # Dashboard with services
│   │   ├── ServiceRequestScreen.tsx # Create new request
│   │   ├── RequestTrackerScreen.tsx # View all requests
│   │   ├── ChatScreen.tsx          # Real-time chat
│   │   ├── NotificationsScreen.tsx # Notification center
│   │   └── ProfileScreen.tsx       # User profile
│   │
│   ├── store/
│   │   ├── guestStore.ts           # Guest state management
│   │   ├── requestStore.ts         # Requests state
│   │   └── notificationStore.ts    # Notifications state
│   │
│   ├── utils/
│   │   ├── api.ts                  # API client with interceptors
│   │   ├── socket.ts               # Socket.io service
│   │   └── notifications.ts        # Push notification handlers
│   │
│   └── types/
│       └── index.ts                # TypeScript type definitions
│
└── assets/                          # Images, icons, fonts
```

## 🔧 Configuration

### Camera Permissions

The app requires camera access for QR code scanning. Permissions are configured in `app.json`:

```json
{
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "This app needs camera access to scan QR codes for login."
    }
  },
  "android": {
    "permissions": ["CAMERA"]
  }
}
```

### Push Notifications

Configure Firebase Cloud Messaging:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Add iOS and Android apps to your Firebase project
3. Download configuration files:
   - `google-services.json` for Android
   - `GoogleService-Info.plist` for iOS
4. Place them in the project root
5. Update `.env` with Firebase credentials

### API Integration

The app expects the following API endpoints:

**Authentication:**
- `POST /api/auth/guest-qr-login` - QR code login

**Requests:**
- `GET /api/requests` - Get all requests
- `POST /api/requests` - Create new request
- `GET /api/requests/:id` - Get request details
- `PUT /api/requests/:id/status` - Update status

**Messages:**
- `GET /api/requests/:id/messages` - Get messages
- `POST /api/requests/:id/messages` - Send message

**Notifications:**
- `POST /api/notifications/fcm-token` - Register push token
- `GET /api/notifications/history` - Get notifications

**Socket.io Events:**
- `request:status-changed` - Request status update
- `request:assigned` - Staff assigned to request
- `chat:message-received` - New chat message
- `notification:new` - New notification

## 🧪 Testing

### Test QR Login

Generate a test QR code with JSON data:
```json
{
  "roomNumber": "301",
  "authToken": "test-token-12345",
  "guestId": "guest-001"
}
```

Use an online QR code generator to create a scannable code.

### Mock Data Testing

For testing without backend, modify API responses:

```typescript
// In app/utils/api.ts
export const apiClient = {
  loginWithQR: async (qrData: string) => {
    // Return mock data
    return {
      success: true,
      data: {
        token: 'mock-token',
        guest: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          roomNumber: '301',
          checkIn: '2024-01-01',
          checkOut: '2024-01-05',
        }
      }
    };
  },
  // ... other mock methods
};
```

## 🐛 Troubleshooting

### Common Issues

**1. "Unable to resolve module" errors**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
# or
pnpm install

# Clear Expo cache
expo start -c
```

**2. Camera not working**
- Check permissions in Settings > App Name > Camera
- Ensure you're testing on a physical device (camera doesn't work in simulator)
- Restart the app after granting permissions

**3. Cannot connect to backend**
- Ensure backend server is running
- Check that mobile device and computer are on the same network
- Use IP address, not "localhost" in `.env`
- Check firewall settings

**4. Push notifications not received**
- Verify Firebase configuration
- Test on physical device (notifications don't work in simulator/emulator)
- Check notification permissions in device settings
- Ensure FCM token is registered with backend

**5. Socket.io connection fails**
- Check backend Socket.io server is running
- Verify SOCKET_URL in `.env`
- Check CORS settings on backend
- Monitor console logs for connection errors

## 📱 Building for Production

### iOS Build (requires macOS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure iOS build
eas build:configure

# Create iOS build
eas build --platform ios
```

### Android Build

```bash
# Create Android build
eas build --platform android
```

### Submit to App Stores

```bash
# Submit to Apple App Store
eas submit --platform ios

# Submit to Google Play Store
eas submit --platform android
```

## 🔐 Security Best Practices

- ✅ Tokens stored in secure AsyncStorage
- ✅ HTTPS enforced in production
- ✅ Input validation on all forms
- ✅ JWT token authentication
- ✅ Auto-logout on token expiration
- ✅ No sensitive data in logs

## 📊 Performance Optimization

- ✅ FlatList virtualization for long lists
- ✅ React.memo for expensive components
- ✅ Socket.io reconnection handling
- ✅ Image lazy loading
- ✅ Debounced search inputs
- ✅ AsyncStorage for offline data

## 🎨 Customization

### Change Theme Colors

Edit styles in screen files:

```typescript
const styles = StyleSheet.create({
  primary: '#3b82f6',  // Change primary color
  // ... other styles
});
```

### Add New Service Type

1. Update `ServiceType` in `app/types/index.ts`
2. Add service button in `HomeScreen.tsx`
3. Add icon mapping in `RequestTrackerScreen.tsx`

### Modify Quick Replies

Edit `ChatScreen.tsx`:

```typescript
const quickReplies = [
  'Your custom reply',
  'Another reply',
  // Add more...
];
```

## 📚 Documentation

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)

## 🤝 Integration with Other Apps

This Guest Mobile App works alongside:

1. **Admin Web Dashboard** (`/app`) - Next.js web interface for hotel managers
2. **Staff Mobile App** (`/STAFF_MOBILE_APP`) - React Native app for hotel staff

All three applications connect to the same backend API and share real-time updates via Socket.io.

## 📄 License

This project is part of the Hotel Management System.

## 👥 Support

For issues or questions:

1. Check this README thoroughly
2. Review console logs for errors
3. Verify backend API is running
4. Check network connectivity
5. Ensure all environment variables are set correctly

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Start the app with `npm start`
4. ✅ Test QR login functionality
5. ✅ Create a test service request
6. ✅ Test real-time chat
7. ✅ Configure push notifications
8. ✅ Build for production

---

**Version**: 1.0.0  
**Last Updated**: June 2024  
**Platform**: iOS & Android  
**Framework**: React Native (Expo)

**Happy Coding! 🚀**
