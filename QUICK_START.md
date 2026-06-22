# Quick Start Guide - Hotel Service Scheduling System

## What's Ready

✅ **Admin Dashboard** - Running at http://localhost:3000
- Complete UI with real-time request tracking
- Priority-based color coding (Red/Yellow/Green)
- Staff management and analytics
- Request filtering and search

📋 **Documentation** - Complete system specifications
- Backend API specification (`BACKEND_SETUP.md`)
- Mobile app guidelines (`MOBILE_APPS_SETUP.md`)
- System overview (`SYSTEM_OVERVIEW.md`)
- Sample backend code (`BACKEND_SAMPLE_CODE.md`)

## Next: Build Backend API

### Quick Start (5 minutes)

```bash
# 1. Create new directory
mkdir hotel-service-api
cd hotel-service-api

# 2. Initialize Node.js project
npm init -y

# 3. Install Express + dependencies
npm install express cors dotenv firebase socket.io axios
npm install -D typescript ts-node @types/express @types/node

# 4. Create src/server.ts with sample code
# (Copy from BACKEND_SAMPLE_CODE.md)

# 5. Setup .env file
cat > .env << EOF
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-email@project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

SOCKET_CORS_ORIGIN=http://localhost:3000,http://localhost:19000
ADMIN_API_KEY=admin_key_here
EOF

# 6. Start development server
npm run dev
# API should be running on http://localhost:3001
```

### Detailed Backend Development

See `BACKEND_SETUP.md` sections:
1. Database Schema
2. Environment Variables
3. Key API Endpoints
4. Socket.io Events
5. Firebase Cloud Messaging

## Next: Build Guest Mobile App

### Quick Start (10 minutes)

```bash
# 1. Create Expo project
npx create-expo-app@latest HotelGuestApp
cd HotelGuestApp

# 2. Install dependencies
npm install axios react-native-camera react-native-qrcode-scanner
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install @react-native-async-storage/async-storage
npm install zustand firebase expo-notifications

# 3. Setup environment
cat > .env << EOF
EXPO_PUBLIC_API_URL=http://your-api.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EOF

# 4. Create .env.local (development)
cat > .env.local << EOF
EXPO_PUBLIC_API_URL=http://localhost:3001
EOF

# 5. Create screens (HomeScreen, QRLoginScreen, etc.)
# See MOBILE_APPS_SETUP.md for detailed component structure

# 6. Start development
npm start
# Scan QR code with Expo Go app
```

### Key Guest App Screens (Priority Order)

1. **QRLoginScreen** - Scan QR code to login
2. **HomeScreen** - 6 quick action buttons
3. **ServiceFormScreen** - Create request with priority
4. **RequestTrackerScreen** - Real-time status tracking
5. **ChatbotScreen** - Quick replies + custom messages
6. **NotificationHistoryScreen** - All notifications

## Next: Build Staff Mobile App

### Quick Start (10 minutes)

```bash
# 1. Create Expo project
npx create-expo-app@latest HotelStaffApp
cd HotelStaffApp

# 2. Install dependencies
npm install axios react-native-gesture-handler react-native-reanimated
npm install @react-navigation/native @react-navigation/stack
npm install @react-native-async-storage/async-storage
npm install zustand firebase expo-notifications socket.io-client

# 3. Setup environment (same as guest app)

# 4. Create screens (LoginScreen, TaskDashboard, etc.)
# See MOBILE_APPS_SETUP.md for component structure

# 5. Start development
npm start
```

### Key Staff App Screens (Priority Order)

1. **LoginScreen** - Employee ID + Department + Password
2. **TaskDashboardScreen** - Requests sorted by priority
3. **TaskDetailScreen** - Full task details + actions
4. **ChatReplyPanel** - Reply to guest messages
5. **NotificationCenterScreen** - Alerts with priority sounds
6. **ProfileScreen** - Staff info & statistics

## Integration Checklist

### Phase 1: Backend Development
- [ ] Express.js server running
- [ ] Firebase configured and connected
- [ ] REST API endpoints working
- [ ] Socket.io real-time events tested
- [ ] FCM push notifications working
- [ ] Authentication (JWT) implemented
- [ ] CORS configured for web/mobile
- [ ] Error handling and logging
- [ ] Database schema created
- [ ] Rate limiting configured

### Phase 2: Guest Mobile App
- [ ] QR code scanning working
- [ ] Login flow complete
- [ ] Home screen with quick actions
- [ ] Service request form
- [ ] Real-time status tracking (Socket.io)
- [ ] Chat with staff (quick options + custom)
- [ ] Push notifications receiving
- [ ] Request history display
- [ ] Notification history

### Phase 3: Staff Mobile App
- [ ] Staff login (Employee ID + Department)
- [ ] Task dashboard showing requests
- [ ] Priority sorting (Critical → Medium → Low)
- [ ] Task detail view
- [ ] Accept/Start/Complete actions
- [ ] Chat reply panel with quick responses
- [ ] Critical alert notifications (unique sound)
- [ ] Medium alerts (standard sound + highlight)
- [ ] Low alerts (silent)
- [ ] Availability toggle

### Phase 4: Admin Dashboard (Already Done!)
- [x] Real-time request tracking
- [x] Priority-based color coding
- [x] Stats overview
- [x] Request filtering
- [x] Staff management view
- [x] Analytics charts
- [x] Active staff status
- [x] Recent activity log

## Testing Workflow

### Backend Testing
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test guest QR login
curl -X POST http://localhost:3001/api/auth/guest-qr-login \
  -H "Content-Type: application/json" \
  -d '{"qrData":"...", "roomNumber":"301"}'

# Test create request
curl -X POST http://localhost:3001/api/requests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Room Service",
    "description": "Air conditioning not working",
    "priority": "Critical"
  }'
```

### Mobile Testing (Expo)
```bash
# Start Expo dev server
npm start

# iOS - Press 'i'
# Android - Press 'a'
# Web - Press 'w'

# Or scan QR code with Expo Go app
```

### Real-time Testing
```bash
# In one terminal - start API
npm run dev

# In another terminal - start admin dashboard
npm run dev

# In another terminal - start mobile app
npm start

# Test: Create request in mobile → See update in dashboard (real-time via Socket.io)
```

## Common Issues & Solutions

### Issue: API won't connect to Firebase
**Solution**: 
- Check `.env` file has correct Firebase credentials
- Verify `FIREBASE_PRIVATE_KEY` has `\n` properly escaped
- Check Firebase project is active and not deleted

### Issue: Socket.io connection failed
**Solution**:
- Verify API running on correct port (default 3001)
- Check CORS origin includes mobile app URL
- Ensure `socket.io-client` version matches server version

### Issue: QR scanner not working on device
**Solution**:
- Grant camera permissions in app
- Ensure good lighting for QR code
- Test with physical device (not simulator for QR)

### Issue: Push notifications not received
**Solution**:
- Verify FCM token registered in backend
- Check Firebase credentials correct
- Ensure notification permissions granted
- Test with Firebase Console first

### Issue: Real-time updates not working
**Solution**:
- Check Socket.io connection in browser console
- Verify token is valid
- Check Socket.io rooms are correct
- Review server logs for errors

## File Locations

### Admin Dashboard (Already in v0)
```
/vercel/share/v0-project/
├── app/page.tsx                    (Main dashboard)
├── components/sidebar.tsx
├── components/request-card.tsx
├── components/stats-overview.tsx
└── components/analytics-chart.tsx
```

### Documentation
```
/vercel/share/v0-project/
├── BACKEND_SETUP.md               (API spec)
├── MOBILE_APPS_SETUP.md           (Mobile spec)
├── SYSTEM_OVERVIEW.md             (Full overview)
├── BACKEND_SAMPLE_CODE.md         (Code samples)
└── QUICK_START.md                 (This file)
```

## Deployment Commands

### Admin Dashboard (Vercel)
```bash
cd /path/to/v0-project
git add .
git commit -m "Initial commit"
git push
# Visit vercel.com to connect repository
```

### Backend API (Railway or Firebase Functions)

**Railway:**
```bash
npm install -g railway
railway login
railway init
railway up
```

**Firebase Functions:**
```bash
firebase init functions
firebase deploy --only functions
```

### Mobile Apps (Expo)

**Build for iOS:**
```bash
eas build --platform ios
# Download and install with Xcode
```

**Build for Android:**
```bash
eas build --platform android
# Download APK and install on device
```

## Next Actions

1. **Backend Development** → See `BACKEND_SETUP.md`
2. **Guest App** → See `MOBILE_APPS_SETUP.md` (Guest section)
3. **Staff App** → See `MOBILE_APPS_SETUP.md` (Staff section)
4. **Integration Testing** → Use checklist above
5. **Deploy to Production** → Use deployment commands

## Support Resources

### Documentation Files
- `BACKEND_SETUP.md` - API specification and database schema
- `MOBILE_APPS_SETUP.md` - Mobile app components and setup
- `SYSTEM_OVERVIEW.md` - Complete system architecture
- `BACKEND_SAMPLE_CODE.md` - Runnable code examples

### External Resources
- Express.js: https://expressjs.com
- Socket.io: https://socket.io
- Firebase: https://firebase.google.com
- React Native: https://reactnative.dev
- Expo: https://expo.dev

## Key Metrics to Track

**Performance:**
- API response time < 200ms
- Socket.io latency < 100ms
- Mobile app startup < 3s

**Quality:**
- 95%+ uptime
- < 1% error rate
- 99% push delivery

**User Experience:**
- Critical alerts within 2s
- Status updates live < 1s
- Chat messages real-time

---

**Ready to build?** Start with Backend Setup using `BACKEND_SAMPLE_CODE.md`
