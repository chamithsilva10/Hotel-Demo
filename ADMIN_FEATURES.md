Hotel Admin Dashboard - Complete Feature Guide
==============================================

Comprehensive documentation for all admin dashboard features.

Dashboard (/)
=============

Main landing page with overview statistics and key metrics.

**Features:**
- Request overview (pending, in-progress, completed)
- Guest list with check-in/check-out dates
- Staff availability and schedules
- Quick action buttons
- Real-time activity feed
- Performance metrics

**Key Metrics:**
- Total active guests
- Pending requests
- Assigned staff
- Tasks in progress

Navigation Sidebar
-----------
Available sections:
- Dashboard - Overview and stats
- Requests - Guest service requests
- Staff - Team management
- Service Scheduler - Assign tasks
- Messages - Guest/staff communication
- Notifications - Alert management
- Settings - Configuration

Requests Page (/requests)
========================

Manage guest service requests with full CRUD operations.

**Request Statuses:**
- Pending: New request waiting assignment
- Assigned: Assigned to staff member
- In-Progress: Staff member is handling
- Completed: Task finished
- Canceled: Request canceled

**Priority Levels:**
- Critical: Urgent (red)
- High: Important (orange)
- Medium: Standard (yellow)
- Low: Non-urgent (green)

**Request Types:**
- Room Service
- Housekeeping
- Maintenance
- Concierge
- IT Support
- Laundry
- Other

**CRUD Operations:**

Create Request:
```
POST /api/requests
{
  "roomNumber": "301",
  "guestName": "John Smith",
  "type": "Housekeeping",
  "description": "Extra towels needed",
  "priority": "Medium",
  "guestName": "John Smith"
}
```

Read Requests:
```
GET /api/requests
GET /api/requests?status=pending
GET /api/requests?priority=critical
```

Update Request:
```
PUT /api/requests/{id}
{
  "status": "assigned",
  "assignedTo": "Mike Johnson",
  "priority": "High"
}
```

Delete Request:
```
DELETE /api/requests/{id}
```

Staff Page (/staff)
==================

Complete staff management system.

**Staff Information:**
- Name and ID
- Department
- Position/Role
- Contact information
- Start date
- Current status (Online/Offline)
- Active tasks count
- Performance ratings

**Staff Roles:**
- Manager: Full system access
- Supervisor: Department management
- Team Lead: Task assignment + monitoring
- Staff Member: Can accept and complete tasks
- Guest: Limited access (read-only requests)

**Staff Management:**

Add Staff:
- Employee ID (unique)
- Name
- Department
- Position
- Contact details
- Role assignment

Edit Staff:
- Update any staff information
- Change department or role
- Update contact info
- Modify availability

Delete Staff:
- Remove inactive staff
- Archive records

**Staff Actions:**
- Assign tasks
- View current tasks
- Send messages
- View schedule
- Monitor performance

**Performance Metrics:**
- Tasks completed
- Average completion time
- Customer ratings
- Attendance record
- Certifications

Service Scheduler (/scheduler)
=============================

Advanced task scheduling and staff assignment system.

**Key Features:**

1. Calendar View:
   - Day, Week, Month view
   - Drag-and-drop task assignment
   - Color-coded priorities
   - Time slot visualization

2. Task Assignment:
   - Select room/service needed
   - Choose staff member
   - Set priority level
   - Schedule time

3. Staff Shifts:
   - Daily shift overview
   - Department allocation
   - Task distribution
   - Workload balancing

4. Task Status Tracking:
   - Pending → Assigned → In-Progress → Completed
   - Real-time updates
   - Status change notifications

**API Endpoints:**

Get Assignments:
```
GET /api/scheduler?date=2024-12-15
GET /api/scheduler?staffId=1
GET /api/scheduler?type=shifts
```

Create Assignment:
```
POST /api/scheduler
{
  "room": "301",
  "service": "Room Service",
  "staff": "Mike Johnson",
  "time": "10:00 AM",
  "priority": "Critical",
  "date": "2024-12-15"
}
```

Update Assignment:
```
PUT /api/scheduler
{
  "assignmentId": 1,
  "status": "completed",
  "staff": "New Staff Name",
  "time": "11:00 AM"
}
```

Delete Assignment:
```
DELETE /api/scheduler?id=1
```

Messages Page (/messages)
=========================

Real-time communication with guests and staff.

**Message Types:**
- Guest-to-Admin: Guest service requests/questions
- Staff-to-Admin: Task updates and status changes
- Admin-to-Guest: Response to inquiries
- Admin-to-Staff: Task assignments and instructions

**Features:**

1. Conversation Management:
   - Separate channels for guests and staff
   - Message history
   - Search functionality
   - Archive conversations

2. Message Features:
   - Real-time delivery
   - Read receipts
   - Typing indicators
   - Message attachments

3. Notifications:
   - New message alerts
   - Unread message count
   - Priority indicators

**API Endpoints:**

Get Conversations:
```
GET /api/messages
```

Get Conversation Messages:
```
GET /api/messages?conversationId=1
```

Send Message:
```
POST /api/messages
{
  "conversationId": 1,
  "sender": "Admin",
  "text": "We'll send someone right away",
  "type": "admin"
}
```

Notifications Page (/notifications)
===================================

Alert and notification management system.

**Notification Types:**

1. **Critical Alerts (Red)**
   - Emergency maintenance needed
   - Urgent guest requests
   - Staff emergency
   - Sound: Yes (High priority tone)

2. **Task Updates (Blue)**
   - Task assigned
   - Task completed
   - Status changed
   - Sound: Yes (Standard tone)

3. **Message Alerts (Purple)**
   - New guest message
   - New staff message
   - Urgent communication
   - Sound: Yes

4. **Administrative (Green)**
   - Schedule changes
   - Staff status updates
   - System updates
   - Sound: No

**Features:**

1. Real-time Notifications:
   - Instant delivery
   - Sound alerts
   - Visual badges
   - Persistent history

2. Notification Preferences:
   - Per notification type
   - Sound settings
   - Display style
   - Auto-dismiss timing

3. Notification Management:
   - Mark as read
   - Archive
   - Delete
   - Filter by type

**API Endpoints:**

Get Notifications:
```
GET /api/notifications
GET /api/notifications?filter=critical
GET /api/notifications?unread=true
```

Create Notification:
```
POST /api/notifications
{
  "type": "critical",
  "title": "Emergency Request",
  "message": "Room 301 needs immediate assistance",
  "icon": "alert-circle"
}
```

Update Notification (Mark as Read):
```
PUT /api/notifications
{
  "notificationId": 1,
  "read": true
}
```

Delete Notification:
```
DELETE /api/notifications?id=1
```

Settings Page (/settings)
========================

Comprehensive system configuration.

**Tabs:**

1. **Hotel Info:**
   - Hotel name
   - City/Location
   - Total rooms
   - Phone number
   - Email address
   - Website URL
   - Check-in/Check-out times

2. **Services:**
   - Available service types
   - Enable/disable services
   - Service descriptions
   - Service icons
   - Pricing (optional)

   Default Services:
   - Housekeeping
   - Maintenance
   - Room Service
   - Concierge
   - IT Support
   - Laundry Service

3. **Departments:**
   - Department name
   - Manager assignment
   - Staff count
   - Budget allocation
   - Performance metrics

   Default Departments:
   - Housekeeping
   - Maintenance
   - Concierge
   - Room Service
   - Front Desk
   - Management

4. **Security:**
   - API key management
   - Two-factor authentication
   - Session timeout
   - Password policies
   - Access logs
   - IP whitelisting

**Key Settings:**
```
Hotel Configuration:
- Name: Grand Hotel Resort
- Rooms: 150
- Check-in: 3:00 PM
- Check-out: 11:00 AM
- Language: English
- Timezone: UTC-8

Security:
- 2FA: Enabled
- Session Timeout: 30 minutes
- Password Min Length: 8
- Session Encryption: AES-256
```

Data Integration
================

**Database Schema (Conceptual):**

Requests Table:
- id, roomNumber, guestName, type, description, priority, status, assignedTo, createdAt, updatedAt

Staff Table:
- id, employeeId, name, department, position, contact, startDate, status, role

Assignments Table:
- id, room, service, staffId, time, priority, status, date, notes

Messages Table:
- id, conversationId, sender, type, text, timestamp, read

Notifications Table:
- id, type, title, message, icon, read, timestamp

Search & Filters
================

**Available Filters:**

Requests:
- Status (All, Pending, Assigned, In-Progress, Completed, Canceled)
- Priority (All, Critical, High, Medium, Low)
- Room number
- Guest name
- Service type
- Date range

Scheduler:
- Staff member
- Date
- Service type
- Priority
- Status

Messages:
- Conversation type (Guest, Staff)
- Search by name
- Date range
- Unread only

Notifications:
- Type filter
- Read/Unread
- Date range
- Priority filter

Real-time Features
=================

**WebSocket Events (Production):**

```
TaskAssigned -> Notify admin & assigned staff
TaskUpdated -> Update all subscribers
MessageSent -> Deliver to recipient + notify
NotificationCreated -> Broadcast to subscribers
PresenceUpdate -> Track staff online/offline
```

**Integration Requirements:**
- WebSocket server for real-time updates
- Firebase Cloud Messaging for mobile push
- Email service for notifications
- SMS for critical alerts

Analytics & Reporting
====================

**Available Metrics:**
- Request response time
- Task completion rate
- Staff utilization
- Guest satisfaction scores
- Peak demand hours
- Service type distribution
- Staff performance ratings

Best Practices
=============

1. **Task Assignment:**
   - Balance workload across staff
   - Assign based on skill level
   - Prioritize critical requests
   - Estimate realistic timeframes

2. **Communication:**
   - Keep guests updated on status
   - Message staff clearly
   - Use templates for common responses
   - Document all communication

3. **Scheduling:**
   - Plan shifts in advance
   - Cover peak demand hours
   - Allocate backup staff
   - Account for breaks/overtime

4. **Notifications:**
   - Enable only necessary alerts
   - Use sound for critical only
   - Regular notification cleanup
   - Set clear dismissal times

Troubleshooting
===============

**Common Issues:**

1. Messages not sending:
   - Check internet connection
   - Verify recipient exists
   - Check message length
   - Review error logs

2. Notifications not appearing:
   - Check notification settings
   - Enable browser notifications
   - Verify notification permissions
   - Check browser console

3. Task assignment failed:
   - Verify staff member exists
   - Check staff availability
   - Ensure room number valid
   - Check for API errors

Support
=======

For issues:
1. Check the error message
2. Review system logs
3. Verify all required fields filled
4. Contact development team

Mobile App Staff Features
=========================

Staff members access these features via mobile app:
- Task Dashboard: View assigned tasks
- Task Details: Full task information
- Schedule: View shifts and availability
- Messages: Communicate with guests/admin
- Notifications: Receive alerts
- Profile: View staff information

Integration Points
================

**Admin Dashboard connects to:**
- Staff Mobile App (task assignment, status updates)
- Guest Communication System (messages, notifications)
- Scheduling System (shift management)
- Reporting/Analytics (performance metrics)
- Payment System (optional, for services)

Future Enhancements
==================

Potential additions:
- Image uploads with requests
- Video call support
- AI-powered task assignment
- Predictive maintenance alerts
- Guest satisfaction surveys
- Staff training modules
- Advanced analytics dashboard
- Multi-property management
