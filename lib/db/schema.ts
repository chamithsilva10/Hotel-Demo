import { pgTable, text, integer, varchar, timestamp, boolean, serial } from 'drizzle-orm/pg-core'

// Better Auth Tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: boolean('emailVerified'),
  image: text('image'),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt'),
  token: text('token').unique(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId'),
  providerId: text('providerId'),
  userId: text('userId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier'),
  value: text('value'),
  expiresAt: timestamp('expiresAt'),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
})

// Hotel Service Tables
export const guests = pgTable('guests', {
  id: serial('id').primaryKey(),
  userId: text('userid').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  roomNumber: varchar('roomnumber', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  checkInDate: timestamp('checkindate').defaultNow(),
  checkOutDate: timestamp('checkoutdate'),
  status: varchar('status', { length: 50 }).default('active'),
  createdAt: timestamp('createdat').defaultNow(),
  updatedAt: timestamp('updatedat').defaultNow(),
})

export const serviceRequests = pgTable('servicerequests', {
  id: serial('id').primaryKey(),
  guestId: integer('guestid').notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  description: text('description'),
  priority: varchar('priority', { length: 50 }).default('Medium'),
  status: varchar('status', { length: 50 }).default('pending'),
  assignedStaffId: integer('assignedstaffid'),
  roomNumber: varchar('roomnumber', { length: 50 }),
  guestName: varchar('guestname', { length: 255 }),
  guestPhone: varchar('guestphone', { length: 20 }),
  notes: text('notes'),
  createdAt: timestamp('createdat').defaultNow(),
  updatedAt: timestamp('updatedat').defaultNow(),
  completedAt: timestamp('completedat'),
})

export const staff = pgTable('staff', {
  id: serial('id').primaryKey(),
  userId: text('userid').unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique(),
  department: varchar('department', { length: 100 }).notNull(),
  role: varchar('role', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  status: varchar('status', { length: 50 }).default('active'),
  isAvailable: boolean('isavailable').default(true),
  createdAt: timestamp('createdat').defaultNow(),
  updatedAt: timestamp('updatedat').defaultNow(),
})

export const chatMessages = pgTable('chatmessages', {
  id: serial('id').primaryKey(),
  guestId: integer('guestid').notNull(),
  staffId: integer('staffid'),
  message: text('message').notNull(),
  priority: varchar('priority', { length: 50 }),
  senderRole: varchar('senderrole', { length: 50 }).notNull(),
  senderName: varchar('sendername', { length: 255 }),
  isRead: boolean('isread').default(false),
  createdAt: timestamp('createdat').defaultNow(),
})

export const activityLog = pgTable('activitylog', {
  id: serial('id').primaryKey(),
  guestId: integer('guestid'),
  requestId: integer('requestid'),
  staffId: integer('staffid'),
  action: varchar('action', { length: 255 }).notNull(),
  details: text('details'),
  createdAt: timestamp('createdat').defaultNow(),
})
