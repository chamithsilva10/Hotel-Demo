Hotel Management System - Setup & Deployment Guide
=================================================

Complete guide for setting up, deploying, and maintaining the hotel admin dashboard and staff mobile app.

Project Structure
================

```
hotel-management-system/
├── Admin Dashboard (Next.js 16)
│   ├── app/
│   │   ├── page.tsx (Dashboard)
│   │   ├── requests/ (Request management)
│   │   ├── staff/ (Staff management)
│   │   ├── scheduler/ (Task scheduling)
│   │   ├── messages/ (Communication)
│   │   ├── notifications/ (Alerts)
│   │   ├── settings/ (Configuration)
│   │   └── api/ (Backend endpoints)
│   ├── components/ (UI components)
│   ├── lib/ (Utilities & hooks)
│   └── public/ (Static assets)
│
└── Staff Mobile App (React Native/Expo)
    ├── app/
    │   ├── navigation/ (App navigation)
    │   ├── screens/ (UI screens)
    │   ├── services/ (API integration)
    │   └── context/ (State management)
    ├── App.tsx (Entry point)
    ├── app.json (Expo config)
    └── package.json
```

Prerequisites
=============

**For Admin Dashboard:**
- Node.js 18+
- npm or pnpm
- Git
- Modern web browser

**For Staff Mobile App:**
- Node.js 18+
- npm or pnpm
- Expo Go app (on device) or Xcode (iOS) / Android Studio (Android)
- iOS/Android device or emulator

Installation
============

**1. Admin Dashboard Setup:**

```bash
# Navigate to project root
cd hotel-management-system

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev

# App runs on http://localhost:3000
```

**2. Staff Mobile App Setup:**

```bash
# Navigate to mobile app directory
cd STAFF_MOBILE_APP

# Install dependencies
npm install
# or
pnpm install

# Start Expo dev server
npm start

# Scan QR code with Expo Go or run on emulator
npm run ios    # iOS simulator
npm run android # Android emulator
npm run web    # Web version
```

Environment Configuration
=========================

**Admin Dashboard (.env.local):**

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Database (if using)
DATABASE_URL=your_database_url

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key

# Optional: Firebase/Third-party services
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
```

**Staff Mobile App (.env):**

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SOCKET_URL=http://localhost:3001

# Firebase
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_SENDER_ID=your_sender_id
```

Directory Creation Guide
========================

Create these directories if they don't exist:

```bash
# Admin Dashboard directories
mkdir -p app/{requests,staff,scheduler,messages,notifications,settings,api}
mkdir -p components/{ui,modals}
mkdir -p lib
mkdir -p public/images

# Staff Mobile App directories
mkdir -p STAFF_MOBILE_APP/app/{screens,navigation,services,context,utils}
mkdir -p STAFF_MOBILE_APP/assets
```

Database Setup (Optional)
=========================

If integrating with a database:

**PostgreSQL/Neon:**

```sql
-- Requests table
CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  room_number VARCHAR(10) NOT NULL,
  guest_name VARCHAR(100),
  type VARCHAR(50),
  description TEXT,
  priority VARCHAR(20),
  status VARCHAR(20),
  assigned_to VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff table
CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(20) UNIQUE,
  name VARCHAR(100),
  department VARCHAR(50),
  position VARCHAR(50),
  contact VARCHAR(20),
  start_date DATE,
  status VARCHAR(20),
  role VARCHAR(20)
);

-- Assignments table
CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  room VARCHAR(10),
  service VARCHAR(50),
  staff_id INTEGER REFERENCES staff(id),
  time TIME,
  priority VARCHAR(20),
  status VARCHAR(20),
  date DATE,
  notes TEXT
);

-- Messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER,
  sender VARCHAR(100),
  type VARCHAR(20),
  text TEXT,
  timestamp TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE
);

-- Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20),
  title VARCHAR(200),
  message TEXT,
  icon VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

API Development
===============

**Running API Routes Locally:**

The API endpoints are in `/app/api/`:

- `/api/messages` - Message operations
- `/api/notifications` - Notification management
- `/api/scheduler` - Task scheduling

Test endpoints:

```bash
# Get all messages
curl http://localhost:3000/api/messages

# Send message
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": 1,
    "sender": "Admin",
    "text": "Hello",
    "type": "admin"
  }'

# Get notifications
curl http://localhost:3000/api/notifications

# Create notification
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type": "critical",
    "title": "Alert",
    "message": "Important message",
    "icon": "alert"
  }'
```

Development Workflow
====================

**1. Local Development:**

```bash
# Terminal 1 - Admin Dashboard
cd hotel-management-system
npm run dev

# Terminal 2 - Mobile App (optional)
cd STAFF_MOBILE_APP
npm start

# Browser: http://localhost:3000
# Mobile: Scan Expo QR code
```

**2. Making Changes:**

- Edit files in respective directories
- Hot reload enabled by default
- Check browser console for errors
- Mobile app hot reloads when you save

**3. Testing Features:**

Navigate through admin pages:
- Dashboard: http://localhost:3000
- Requests: http://localhost:3000/requests
- Staff: http://localhost:3000/staff
- Scheduler: http://localhost:3000/scheduler
- Messages: http://localhost:3000/messages
- Notifications: http://localhost:3000/notifications
- Settings: http://localhost:3000/settings

Production Build
================

**Admin Dashboard:**

```bash
# Create optimized production build
npm run build

# Start production server
npm run start

# Environment variables must be set in production
# Set NEXTAUTH_SECRET for security
```

**Staff Mobile App:**

```bash
# Build for iOS
eas build --platform ios --auto-submit

# Build for Android
eas build --platform android

# Build for Web
npm run web
# Then export for deployment
expo export:web
```

Deployment Options
===================

**Admin Dashboard - Vercel (Recommended):**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect GitHub for auto-deployment
# Set environment variables in Vercel dashboard
```

**Admin Dashboard - Docker:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t hotel-admin .
docker run -p 3000:3000 hotel-admin
```

**Staff Mobile App - EAS Hosting:**

```bash
# Create EAS account
npm install -g eas-cli
eas login

# Configure project
eas build:configure

# Build and submit to app stores
eas build --platform ios --auto-submit
eas build --platform android --auto-submit
```

Testing
=======

**Manual Testing Checklist:**

Admin Dashboard:
- [ ] Dashboard loads with data
- [ ] Can create new request
- [ ] Can update request status
- [ ] Can assign staff
- [ ] Messages send successfully
- [ ] Notifications display
- [ ] Scheduler drag-and-drop works
- [ ] Settings update saved

Staff Mobile App:
- [ ] Login with demo credentials (E001/1234)
- [ ] Task list displays
- [ ] Can accept task
- [ ] Can mark task complete
- [ ] Messages send to admin
- [ ] Notifications display
- [ ] Schedule shows shifts
- [ ] Profile page loads

**API Testing:**

```bash
# Using Postman, cURL, or similar

# Verify all endpoints return data
curl http://localhost:3000/api/messages
curl http://localhost:3000/api/notifications
curl http://localhost:3000/api/scheduler
```

Monitoring
==========

**Logs to Monitor:**

1. **Application Logs:**
   ```bash
   # Check console output in terminal
   # Look for errors and warnings
   ```

2. **Error Tracking (Production):**
   - Set up Sentry or similar
   - Monitor API errors
   - Track user errors

3. **Performance Monitoring:**
   - Monitor page load times
   - Track API response times
   - Monitor memory usage

Maintenance
===========

**Regular Tasks:**

- Weekly: Review error logs
- Monthly: Update dependencies
- Monthly: Back up database
- Quarterly: Security audit
- Quarterly: Performance optimization

**Dependency Updates:**

```bash
# Check for updates
npm outdated

# Update packages safely
npm update

# Major version updates (be careful)
npm install package@latest
```

**Database Maintenance:**

```sql
-- Backup database
pg_dump database_name > backup.sql

-- Restore backup
psql database_name < backup.sql

-- Clean up old data
DELETE FROM notifications WHERE created_at < NOW() - INTERVAL 90 days;
DELETE FROM messages WHERE timestamp < NOW() - INTERVAL 180 days;
```

Troubleshooting
===============

**Common Issues:**

1. **"Module not found"**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules
   npm install
   ```

2. **Port already in use**
   ```bash
   # Change port
   PORT=3001 npm run dev
   ```

3. **Mobile app won't connect to API**
   - Check API_URL environment variable
   - Verify backend is running
   - Check network connectivity
   - Review firewall settings

4. **Database connection error**
   - Verify DATABASE_URL
   - Check database is running
   - Verify credentials
   - Check network access

5. **Build failures**
   ```bash
   # Clear build cache
   npm run build -- --reset-cache
   ```

Security
========

**Important Security Practices:**

1. **Environment Variables:**
   - Never commit .env files
   - Use .env.example as template
   - Rotate secrets regularly

2. **API Security:**
   - Validate all inputs
   - Use HTTPS in production
   - Implement rate limiting
   - Use authentication tokens

3. **Database Security:**
   - Use strong passwords
   - Enable SSL connections
   - Regular backups
   - Access controls

4. **Authentication:**
   - Secure password hashing
   - Session management
   - 2FA for sensitive accounts
   - Regular security audits

Performance Optimization
=======================

**Admin Dashboard:**
- Code splitting for faster load
- Image optimization
- Caching strategies
- Database query optimization

**Mobile App:**
- Lazy loading screens
- Image caching
- Efficient state management
- Battery optimization

Getting Help
============

**Resources:**
- Next.js docs: https://nextjs.org/docs
- React Native docs: https://reactnative.dev
- Expo docs: https://docs.expo.dev
- MDN Web Docs: https://developer.mozilla.org

**Support Channels:**
1. Check documentation first
2. Review error logs
3. Search existing issues
4. Contact development team
5. Submit bug report

Version Control
===============

**Git Workflow:**

```bash
# Clone repository
git clone <repo-url>

# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request on GitHub/GitLab
```

**Commit Message Format:**
```
feat: Add new feature
fix: Fix bug in scheduler
docs: Update API documentation
style: Fix code formatting
refactor: Reorganize components
```

Next Steps
==========

1. Complete initial setup
2. Configure environment variables
3. Run development servers
4. Test core features
5. Deploy to staging
6. Perform UAT
7. Deploy to production
8. Set up monitoring
9. Train users
10. Plan ongoing maintenance

Conclusion
==========

This hotel management system is now ready for development and deployment. Follow this guide for smooth setup and maintenance. For issues or questions, refer to the documentation or contact the development team.
