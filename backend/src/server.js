const http = require('http')
const crypto = require('crypto')
const { parse } = require('url')
const { Server } = require('socket.io')
const { pool, initDatabase } = require('./db')

const PORT = Number(process.env.PORT || 3001)
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret'
const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7
const CORS_ORIGINS = (process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000,http://localhost:19000,http://localhost:8081')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function base64UrlEncodeString(value) {
  return Buffer.from(value).toString('base64url')
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function signToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + JWT_EXPIRES_IN_SECONDS,
  }
  const encodedHeader = base64UrlEncode(header)
  const encodedPayload = base64UrlEncode(tokenPayload)
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url')

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

function verifyToken(token) {
  if (!token) {
    return null
  }

  const [encodedHeader, encodedPayload, signature] = token.split('.')
  if (!encodedHeader || !encodedPayload || !signature) {
    return null
  }

  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url')

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload))
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    return null
  }

  return payload
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${derived}`
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = String(storedHash).split(':')
  if (!salt || !hash) {
    return false
  }

  const derived = crypto.scryptSync(password, salt, 64).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'))
}

async function readJson(req) {
  return await new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString('utf8')
    })
    req.on('end', () => {
      if (!body) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })
  res.end(JSON.stringify(payload))
}

function success(res, data, message = 'OK') {
  sendJson(res, 200, { success: true, data, message })
}

function created(res, data, message = 'Created') {
  sendJson(res, 201, { success: true, data, message })
}

function sendError(res, statusCode, errorName, message) {
  sendJson(res, statusCode, { success: false, error: errorName, message })
}

function toIso(value) {
  return value ? new Date(value).toISOString() : null
}

function mapGuest(row) {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    phone: row.phone,
    roomNumber: row.room_number,
    checkIn: toIso(row.check_in),
    checkOut: toIso(row.check_out),
    fcmToken: row.fcm_token,
    status: row.status,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  }
}

function mapStaff(row) {
  return {
    id: String(row.id),
    employeeId: row.employee_id,
    name: row.name,
    department: row.department,
    position: row.position,
    email: row.email,
    phone: row.phone,
    fcmToken: row.fcm_token,
    isOnDuty: row.is_on_duty,
    currentTaskCount: row.current_task_count,
    role: row.role,
    status: row.status,
    startDate: row.start_date ? new Date(row.start_date).toISOString().slice(0, 10) : null,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  }
}

function mapRequest(row) {
  return {
    id: String(row.id),
    guestId: row.guest_id ? String(row.guest_id) : null,
    roomNumber: row.room_number,
    guestName: row.guest_name,
    guestPhone: row.guest_phone,
    type: row.type,
    description: row.description,
    priority: row.priority,
    status: row.status,
    assignedStaffId: row.assigned_to ? String(row.assigned_to) : null,
    notes: row.notes,
    estimatedTime: row.estimated_time,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
    completedAt: toIso(row.completed_at),
  }
}

function mapAssignment(row) {
  return {
    id: String(row.id),
    requestId: row.request_id ? String(row.request_id) : null,
    staffId: row.staff_id ? String(row.staff_id) : null,
    room: row.room,
    service: row.service,
    scheduledTime: row.scheduled_time,
    scheduledDate: row.scheduled_date ? new Date(row.scheduled_date).toISOString().slice(0, 10) : null,
    priority: row.priority,
    status: row.status,
    notes: row.notes,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  }
}

function mapMessage(row) {
  return {
    id: String(row.id),
    requestId: row.request_id ? String(row.request_id) : null,
    conversationId: row.conversation_id ? String(row.conversation_id) : null,
    senderRole: row.sender_role,
    senderId: row.sender_id ? String(row.sender_id) : null,
    senderName: row.sender_name,
    message: row.text,
    text: row.text,
    priority: row.priority,
    isQuickOption: row.is_quick_option,
    read: row.is_read,
    timestamp: toIso(row.timestamp),
  }
}

function mapNotification(row) {
  return {
    id: String(row.id),
    recipientType: row.recipient_type,
    recipientId: row.recipient_id ? String(row.recipient_id) : null,
    type: row.type,
    title: row.title,
    message: row.message,
    icon: row.icon,
    priority: row.priority,
    read: row.is_read,
    createdAt: toIso(row.created_at),
    timestamp: toIso(row.created_at),
  }
}

function mapActivity(row) {
  return {
    id: String(row.id),
    actorType: row.actor_type,
    actorId: row.actor_id ? String(row.actor_id) : null,
    guestId: row.guest_id ? String(row.guest_id) : null,
    requestId: row.request_id ? String(row.request_id) : null,
    staffId: row.staff_id ? String(row.staff_id) : null,
    action: row.action,
    details: row.details,
    createdAt: toIso(row.created_at),
  }
}

function departmentForService(type) {
  const normalized = String(type || '').toLowerCase()
  if (normalized.includes('house')) return 'Housekeeping'
  if (normalized.includes('maint')) return 'Maintenance'
  if (normalized.includes('concierge')) return 'Concierge'
  if (normalized.includes('room')) return 'Room Service'
  if (normalized.includes('laundry')) return 'Laundry'
  if (normalized.includes('it')) return 'IT Support'
  return 'Front Desk'
}

async function logActivity(details) {
  await pool.query(
    `INSERT INTO activity_log (actor_type, actor_id, guest_id, request_id, staff_id, action, details)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      details.actorType || null,
      details.actorId || null,
      details.guestId || null,
      details.requestId || null,
      details.staffId || null,
      details.action,
      details.details || null,
    ],
  )
}

async function createNotification(payload) {
  const result = await pool.query(
    `INSERT INTO notifications (recipient_type, recipient_id, type, title, message, icon, priority, is_read)
     VALUES ($1, $2, $3, $4, $5, $6, $7, false)
     RETURNING *`,
    [
      payload.recipientType || null,
      payload.recipientId || null,
      payload.type,
      payload.title,
      payload.message,
      payload.icon || 'bell',
      payload.priority || 'Medium',
    ],
  )

  return mapNotification(result.rows[0])
}

async function getGuestByRoom(roomNumber) {
  const result = await pool.query('SELECT * FROM guests WHERE room_number = $1 LIMIT 1', [roomNumber])
  return result.rows[0] || null
}

async function getGuestById(guestId) {
  const result = await pool.query('SELECT * FROM guests WHERE id = $1 LIMIT 1', [guestId])
  return result.rows[0] || null
}

async function getStaffById(staffId) {
  const result = await pool.query('SELECT * FROM staff WHERE id = $1 LIMIT 1', [staffId])
  return result.rows[0] || null
}

async function getStaffByEmployeeId(employeeId, department) {
  const result = await pool.query('SELECT * FROM staff WHERE employee_id = $1 AND department = $2 LIMIT 1', [employeeId, department])
  return result.rows[0] || null
}

function getAuthFromRequest(req) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) {
    return null
  }

  return verifyToken(header.slice('Bearer '.length).trim())
}

function toInt(value) {
  const parsed = Number.parseInt(String(value), 10)
  return Number.isFinite(parsed) ? parsed : null
}

async function listRequests(filters = {}) {
  const params = []
  const where = []

  if (filters.status) {
    params.push(filters.status)
    where.push(`status = $${params.length}`)
  }

  if (filters.priority) {
    params.push(filters.priority)
    where.push(`priority = $${params.length}`)
  }

  if (filters.roomNumber) {
    params.push(filters.roomNumber)
    where.push(`room_number ILIKE $${params.length}`)
  }

  if (filters.guestName) {
    params.push(`%${filters.guestName}%`)
    where.push(`guest_name ILIKE $${params.length}`)
  }

  if (filters.type) {
    params.push(filters.type)
    where.push(`type = $${params.length}`)
  }

  const sql = `SELECT * FROM service_requests${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC`
  const result = await pool.query(sql, params)
  return result.rows.map(mapRequest)
}

async function getRequestById(requestId) {
  const result = await pool.query('SELECT * FROM service_requests WHERE id = $1 LIMIT 1', [requestId])
  return result.rows[0] || null
}

async function requestWithRelations(requestId) {
  const request = await getRequestById(requestId)
  if (!request) {
    return null
  }

  const guest = request.guest_id ? await getGuestById(request.guest_id) : null
  const staff = request.assigned_to ? await getStaffById(request.assigned_to) : null

  return {
    ...mapRequest(request),
    guest: guest ? mapGuest(guest) : null,
    staff: staff ? mapStaff(staff) : null,
  }
}

async function seedIfNeeded() {
  const guestCount = await pool.query('SELECT COUNT(*)::int AS count FROM guests')
  if (guestCount.rows[0].count === 0) {
    await pool.query(
      `INSERT INTO guests (name, email, phone, room_number, check_in, check_out, status)
       VALUES
         ($1, $2, $3, $4, $5, $6, $7),
         ($8, $9, $10, $11, $12, $13, $14)`,
      [
        'John Smith', 'john.smith@example.com', '+1-555-0101', '301', '2026-06-28T12:00:00Z', '2026-07-02T11:00:00Z', 'active',
        'Sarah Chen', 'sarah.chen@example.com', '+1-555-0102', '415', '2026-06-29T12:00:00Z', '2026-07-03T11:00:00Z', 'active',
      ],
    )
  }

  const staffCount = await pool.query('SELECT COUNT(*)::int AS count FROM staff')
  if (staffCount.rows[0].count === 0) {
    const passwordHash = hashPassword('1234')
    const supervisorHash = hashPassword('1234')
    await pool.query(
      `INSERT INTO staff (employee_id, name, department, position, email, phone, password_hash, is_on_duty, current_task_count, role, start_date, status)
       VALUES
         ($1, $2, $3, $4, $5, $6, $7, true, 2, $8, $9, $10),
         ($11, $12, $13, $14, $15, $16, $17, true, 1, $18, $19, $20)`,
      [
        'E001', 'Mike Johnson', 'Housekeeping', 'Team Lead', 'mike@hotelstaff.com', '+1-555-0201', passwordHash, 'supervisor', '2025-01-12', 'active',
        'E002', 'Lisa Brown', 'Maintenance', 'Manager', 'lisa@hotelstaff.com', '+1-555-0202', supervisorHash, 'manager', '2024-11-20', 'active',
      ],
    )
  }

  const requestCount = await pool.query('SELECT COUNT(*)::int AS count FROM service_requests')
  if (requestCount.rows[0].count === 0) {
    const guestResult = await pool.query('SELECT id, room_number, name, phone FROM guests ORDER BY id ASC LIMIT 2')
    const [guestA, guestB] = guestResult.rows
    const requestInsert = await pool.query(
      `INSERT INTO service_requests (guest_id, room_number, guest_name, guest_phone, type, description, priority, status, assigned_to, estimated_time, notes)
       VALUES
         ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11),
         ($12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22),
         ($23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33)`,
      [
        guestA.id, guestA.room_number, guestA.name, guestA.phone, 'Room Service', 'Air conditioning not working', 'Critical', 'pending', null, 30, 'Needs urgent attention',
        guestA.id, guestA.room_number, guestA.name, guestA.phone, 'Housekeeping', 'Extra towels and sheets needed', 'Medium', 'accepted', 1, 15, 'Guest requested before dinner',
        guestB.id, guestB.room_number, guestB.name, guestB.phone, 'Maintenance', 'Bathroom sink dripping', 'Low', 'in-progress', 2, 45, 'Check pipe seal',
      ],
    )

    const [requestA, requestB, requestC] = requestInsert.rows
    await pool.query(
      `INSERT INTO chat_messages (request_id, conversation_id, sender_role, sender_id, sender_name, text, priority, is_quick_option, is_read)
       VALUES
         ($1, $2, $3, $4, $5, $6, $7, false, true),
         ($8, $9, $10, $11, $12, $13, $14, false, true),
         ($15, $16, $17, $18, $19, $20, $21, false, false)`,
      [
        requestA.id, requestA.id, 'guest', guestA.id, guestA.name, 'Hi, the AC is not working in my room.', 'Critical',
        requestA.id, requestA.id, 'staff', 1, 'Mike Johnson', 'A technician will be with you shortly.', 'Medium',
        requestB.id, requestB.id, 'guest', guestA.id, guestA.name, 'Thank you for the towels!', 'Low',
      ],
    )

    await pool.query(
      `INSERT INTO notifications (recipient_type, recipient_id, type, title, message, icon, priority, is_read)
       VALUES
         ('staff', 1, 'critical', 'Critical Request - Room 301', 'Air conditioning not working - assigned to Mike Johnson', 'alert-circle', 'Critical', false),
         ('guest', $1, 'request-accepted', 'Request Accepted', 'Housekeeping will arrive shortly', 'check-circle', 'Medium', false)`,
      [guestA.id],
    )
  }
}

function getQueryParam(req, key) {
  const { query } = parse(req.url, true)
  const value = query[key]
  return Array.isArray(value) ? value[0] : value || ''
}

function departmentFromRequest(requestRow) {
  return departmentForService(requestRow.type)
}

function emitRequestStatusChanged(io, requestRow) {
  const payload = mapRequest(requestRow)
  io.emit('request:status-changed', {
    requestId: payload.id,
    status: payload.status,
    updatedAt: payload.updatedAt,
  })

  if (payload.assignedStaffId) {
    io.to(`staff-${payload.assignedStaffId}`).emit('request:assigned', {
      requestId: payload.id,
      staffId: payload.assignedStaffId,
      staffName: requestRow.assigned_staff_name || null,
    })
  }

  if (requestRow.guest_id) {
    io.to(`guest-${requestRow.guest_id}`).emit('request:status-changed', {
      requestId: payload.id,
      status: payload.status,
      updatedAt: payload.updatedAt,
    })
  }
}

function emitRequestCreated(io, requestRow) {
  const payload = mapRequest(requestRow)
  io.emit('request:created', payload)

  const department = departmentFromRequest(requestRow)
  io.to(`department-${department}`).emit('request:created', payload)
}

async function assignRequest(io, requestId, staffId) {
  const request = await getRequestById(requestId)
  if (!request) {
    return null
  }

  const staff = await getStaffById(staffId)
  if (!staff) {
    return null
  }

  const result = await pool.query(
    `UPDATE service_requests
     SET assigned_to = $1,
         status = CASE WHEN status = 'completed' THEN status ELSE 'accepted' END,
         updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [staffId, requestId],
  )

  const updated = result.rows[0]
  await pool.query(
    `INSERT INTO assignments (request_id, staff_id, room, service, priority, status, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [requestId, staffId, request.room_number, request.type, request.priority, 'accepted', request.notes || null],
  )

  await pool.query('UPDATE staff SET current_task_count = COALESCE(current_task_count, 0) + 1, updated_at = NOW() WHERE id = $1', [staffId])
  await logActivity({
    actorType: 'admin',
    action: 'Request Assigned',
    requestId,
    staffId,
    details: `Assigned request #${requestId} to ${staff.name}`,
  })

  return { updated, staff }
}

async function updateRequestStatus(io, requestId, status) {
  const request = await getRequestById(requestId)
  if (!request) {
    return null
  }

  const completedAt = status === 'completed' ? new Date() : null
  const result = await pool.query(
    `UPDATE service_requests
     SET status = $1,
         completed_at = $2,
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [status, completedAt, requestId],
  )

  const updated = result.rows[0]
  await logActivity({
    actorType: 'system',
    action: `Request Status Updated`,
    requestId,
    details: `Request ${requestId} changed to ${status}`,
  })

  emitRequestStatusChanged(io, updated)
  return updated
}

async function createRequest(io, payload, actor = {}) {
  const guestId = payload.guestId ? Number(payload.guestId) : null
  const guest = guestId ? await getGuestById(guestId) : payload.roomNumber ? await getGuestByRoom(payload.roomNumber) : null

  const roomNumber = payload.roomNumber || (guest ? guest.room_number : null)
  if (!roomNumber) {
    throw new Error('roomNumber is required')
  }

  const result = await pool.query(
    `INSERT INTO service_requests (
      guest_id, room_number, guest_name, guest_phone, type, description, priority, status, assigned_to, estimated_time, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9, $10)
    RETURNING *`,
    [
      guest ? guest.id : guestId,
      roomNumber,
      payload.guestName || (guest ? guest.name : null),
      payload.guestPhone || (guest ? guest.phone : null),
      payload.type,
      payload.description || null,
      payload.priority || 'Medium',
      payload.assignedStaffId ? Number(payload.assignedStaffId) : null,
      payload.estimatedTime || null,
      payload.notes || null,
    ],
  )

  const request = result.rows[0]
  await logActivity({
    actorType: actor.role || 'guest',
    actorId: actor.userId || guest?.id || null,
    guestId: request.guest_id,
    requestId: request.id,
    action: 'Request Created',
    details: `New ${request.type} request created with ${request.priority} priority`,
  })

  emitRequestCreated(io, request)

  const department = departmentForService(request.type)
  if (request.priority === 'Critical' || request.priority === 'High') {
    await createNotification({
      recipientType: 'staff',
      recipientId: null,
      type: 'critical',
      title: `New ${request.priority} Request`,
      message: `${request.room_number} needs ${request.type.toLowerCase()}`,
      icon: 'alert-circle',
      priority: request.priority,
    })
    io.to(`department-${department}`).emit('notification:new', {
      id: String(request.id),
      type: 'critical',
      title: `New ${request.priority} Request`,
      message: `${request.room_number} needs ${request.type.toLowerCase()}`,
      priority: request.priority,
    })
  }

  return request
}

async function handleAuthRoutes(req, res, pathname, body) {
  if (req.method === 'POST' && pathname === '/api/auth/guest-qr-login') {
    const parsed = typeof body.qrData === 'string' ? safeParseJson(body.qrData) : body.qrData || {}
    const roomNumber = body.roomNumber || parsed.roomNumber

    if (!roomNumber) {
      sendError(res, 400, 'ValidationError', 'roomNumber is required')
      return true
    }

    const existing = await getGuestByRoom(roomNumber)
    let guest = existing

    if (!guest) {
      const insert = await pool.query(
        `INSERT INTO guests (name, email, phone, room_number, check_in, check_out, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'active') RETURNING *`,
        [
          parsed.name || body.name || `Guest ${roomNumber}`,
          parsed.email || body.email || null,
          parsed.phone || body.phone || null,
          roomNumber,
          body.checkIn || null,
          body.checkOut || null,
        ],
      )
      guest = insert.rows[0]
    }

    const token = signToken({ userId: String(guest.id), role: 'guest', roomNumber: guest.room_number })
    created(res, { token, guest: mapGuest(guest) }, 'Guest logged in')
    return true
  }

  if (req.method === 'POST' && pathname === '/api/auth/staff-login') {
    const { employeeId, department, password } = body
    if (!employeeId || !department || !password) {
      sendError(res, 400, 'ValidationError', 'employeeId, department and password are required')
      return true
    }

    const staff = await getStaffByEmployeeId(employeeId, department)
    if (!staff || !verifyPassword(password, staff.password_hash)) {
      sendError(res, 401, 'AuthenticationError', 'Invalid staff credentials')
      return true
    }

    const token = signToken({ userId: String(staff.id), role: 'staff', department: staff.department, employeeId: staff.employee_id })
    created(res, { token, staff: mapStaff(staff) }, 'Staff logged in')
    return true
  }

  if (req.method === 'POST' && pathname === '/api/auth/register-guest') {
    const { name, email, phone, roomNumber, checkIn, checkOut } = body
    if (!name || !roomNumber) {
      sendError(res, 400, 'ValidationError', 'name and roomNumber are required')
      return true
    }

    const result = await pool.query(
      `INSERT INTO guests (name, email, phone, room_number, check_in, check_out, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active') RETURNING *`,
      [name, email || null, phone || null, roomNumber, checkIn || null, checkOut || null],
    )

    const guest = result.rows[0]
    const token = signToken({ userId: String(guest.id), role: 'guest', roomNumber: guest.room_number })
    created(res, { token, guest: mapGuest(guest) }, 'Guest registered')
    return true
  }

  if (req.method === 'POST' && pathname === '/api/auth/logout') {
    success(res, { loggedOut: true }, 'Logged out')
    return true
  }

  return false
}

function safeParseJson(value) {
  try {
    return JSON.parse(value)
  } catch (error) {
    return {}
  }
}

async function handleRequestRoutes(io, req, res, pathname, body, auth) {
  if (req.method === 'GET' && pathname === '/api/requests') {
    const data = await listRequests({
      status: getQueryParam(req, 'status') || undefined,
      priority: getQueryParam(req, 'priority') || undefined,
      roomNumber: getQueryParam(req, 'roomNumber') || undefined,
      guestName: getQueryParam(req, 'guestName') || undefined,
      type: getQueryParam(req, 'type') || undefined,
    })
    success(res, data)
    return true
  }

  if (req.method === 'POST' && pathname === '/api/requests') {
    try {
      const request = await createRequest(io, body, auth || {})
      created(res, mapRequest(request), 'Request created')
    } catch (error) {
      error(res, 400, 'ValidationError', error.message || 'Failed to create request')
    }
    return true
  }

  const requestMatch = pathname.match(/^\/api\/requests\/(\d+)$/)
  const statusMatch = pathname.match(/^\/api\/requests\/(\d+)\/status$/)
  const assignMatch = pathname.match(/^\/api\/requests\/(\d+)\/assign$/)
  const messagesMatch = pathname.match(/^\/api\/requests\/(\d+)\/messages$/)
  const quickReplyMatch = pathname.match(/^\/api\/requests\/(\d+)\/quick-reply$/)

  if (requestMatch && req.method === 'GET') {
    const request = await requestWithRelations(requestMatch[1])
    if (!request) {
      sendError(res, 404, 'NotFoundError', 'Request not found')
      return true
    }
    success(res, request)
    return true
  }

  if (requestMatch && req.method === 'PUT') {
    const requestId = requestMatch[1]
    const result = await pool.query(
      `UPDATE service_requests
       SET room_number = COALESCE($1, room_number),
           guest_name = COALESCE($2, guest_name),
           guest_phone = COALESCE($3, guest_phone),
           type = COALESCE($4, type),
           description = COALESCE($5, description),
           priority = COALESCE($6, priority),
           status = COALESCE($7, status),
           assigned_to = COALESCE($8, assigned_to),
           notes = COALESCE($9, notes),
           estimated_time = COALESCE($10, estimated_time),
           updated_at = NOW(),
           completed_at = CASE WHEN $7 = 'completed' THEN NOW() ELSE completed_at END
       WHERE id = $11
       RETURNING *`,
      [
        body.roomNumber || null,
        body.guestName || null,
        body.guestPhone || null,
        body.type || null,
        body.description || null,
        body.priority || null,
        body.status || null,
        body.assignedStaffId ? Number(body.assignedStaffId) : null,
        body.notes || null,
        body.estimatedTime || null,
        requestId,
      ],
    )

    if (!result.rows[0]) {
      sendError(res, 404, 'NotFoundError', 'Request not found')
      return true
    }

    emitRequestStatusChanged(io, result.rows[0])
    success(res, mapRequest(result.rows[0]), 'Request updated')
    return true
  }

  if (statusMatch && req.method === 'PUT') {
    const updated = await updateRequestStatus(io, statusMatch[1], body.status)
    if (!updated) {
      sendError(res, 404, 'NotFoundError', 'Request not found')
      return true
    }
    success(res, mapRequest(updated), 'Request status updated')
    return true
  }

  if (assignMatch && req.method === 'PUT') {
    const result = await assignRequest(io, assignMatch[1], Number(body.staffId))
    if (!result) {
      sendError(res, 404, 'NotFoundError', 'Request or staff not found')
      return true
    }

    io.emit('request:assigned', {
      requestId: assignMatch[1],
      staffId: String(body.staffId),
      staffName: result.staff.name,
    })
    success(res, mapRequest(result.updated), 'Request assigned')
    return true
  }

  if (requestMatch && req.method === 'DELETE') {
    await pool.query('DELETE FROM service_requests WHERE id = $1', [requestMatch[1]])
    success(res, { deleted: true }, 'Request deleted')
    return true
  }

  if (messagesMatch && req.method === 'GET') {
    const requestId = messagesMatch[1]
    const result = await pool.query(
      'SELECT * FROM chat_messages WHERE request_id = $1 ORDER BY timestamp ASC',
      [requestId],
    )
    success(res, result.rows.map(mapMessage))
    return true
  }

  if (messagesMatch && req.method === 'POST') {
    const requestId = Number(messagesMatch[1])
    const request = await getRequestById(requestId)
    if (!request) {
      sendError(res, 404, 'NotFoundError', 'Request not found')
      return true
    }

    const message = body.message || body.text
    if (!message) {
      sendError(res, 400, 'ValidationError', 'message is required')
      return true
    }

    const senderRole = body.senderRole || body.type || auth?.role || 'system'
    const senderId = body.senderId || auth?.userId || null
    const senderName = body.senderName || body.sender || senderRole
    const result = await pool.query(
      `INSERT INTO chat_messages (request_id, conversation_id, sender_role, sender_id, sender_name, text, priority, is_quick_option, is_read)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
       RETURNING *`,
      [requestId, body.conversationId || requestId, senderRole, senderId ? Number(senderId) : null, senderName, message, body.priority || request.priority, body.isQuickOption || false],
    )

    const saved = result.rows[0]
    io.emit('chat:message-received', mapMessage(saved))
    if (request.guest_id) {
      io.to(`guest-${request.guest_id}`).emit('chat:message-received', mapMessage(saved))
    }
    if (request.assigned_to) {
      io.to(`staff-${request.assigned_to}`).emit('chat:message-received', mapMessage(saved))
    }

    await logActivity({
      actorType: senderRole,
      actorId: senderId,
      guestId: request.guest_id,
      requestId,
      staffId: request.assigned_to,
      action: 'Message Sent',
      details: message,
    })

    await createNotification({
      recipientType: senderRole === 'guest' ? 'staff' : 'guest',
      recipientId: senderRole === 'guest' ? request.assigned_to : request.guest_id,
      type: 'message',
      title: 'New Message',
      message,
      icon: 'message-square',
      priority: body.priority || request.priority,
    })

    created(res, mapMessage(saved), 'Message sent')
    return true
  }

  if (quickReplyMatch && req.method === 'POST') {
    const requestId = Number(quickReplyMatch[1])
    const request = await getRequestById(requestId)
    if (!request) {
      sendError(res, 404, 'NotFoundError', 'Request not found')
      return true
    }

    const result = await pool.query(
      `INSERT INTO chat_messages (request_id, conversation_id, sender_role, sender_id, sender_name, text, priority, is_quick_option, is_read)
       VALUES ($1, $2, 'staff', $3, $4, $5, $6, true, false)
       RETURNING *`,
      [requestId, requestId, auth?.userId ? Number(auth.userId) : null, body.senderName || 'Staff', body.optionText || body.text || 'Quick reply', request.priority],
    )

    io.emit('chat:message-received', mapMessage(result.rows[0]))
    created(res, mapMessage(result.rows[0]), 'Quick reply sent')
    return true
  }

  return false
}

async function handleGuestRoutes(req, res, pathname, body) {
  if (req.method === 'GET' && pathname === '/api/guests') {
    const result = await pool.query('SELECT * FROM guests ORDER BY created_at DESC')
    success(res, result.rows.map(mapGuest))
    return true
  }

  if (req.method === 'POST' && pathname === '/api/guests') {
    const result = await pool.query(
      `INSERT INTO guests (name, email, phone, room_number, check_in, check_out, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [body.name, body.email || null, body.phone || null, body.roomNumber, body.checkIn || null, body.checkOut || null, body.status || 'active'],
    )
    created(res, mapGuest(result.rows[0]), 'Guest created')
    return true
  }

  if (req.method === 'PATCH' && pathname === '/api/guests') {
    if (!body.id) {
      sendError(res, 400, 'ValidationError', 'id is required')
      return true
    }

    const result = await pool.query(
      `UPDATE guests
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           room_number = COALESCE($4, room_number),
           check_in = COALESCE($5, check_in),
           check_out = COALESCE($6, check_out),
           status = COALESCE($7, status),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [body.name || null, body.email || null, body.phone || null, body.roomNumber || null, body.checkIn || null, body.checkOut || null, body.status || null, body.id],
    )

    if (!result.rows[0]) {
      sendError(res, 404, 'NotFoundError', 'Guest not found')
      return true
    }

    success(res, mapGuest(result.rows[0]), 'Guest updated')
    return true
  }

  if (req.method === 'DELETE' && pathname === '/api/guests') {
    const id = getQueryParam(req, 'id')
    if (!id) {
      sendError(res, 400, 'ValidationError', 'id is required')
      return true
    }

    await pool.query('DELETE FROM guests WHERE id = $1', [id])
    success(res, { deleted: true }, 'Guest deleted')
    return true
  }

  return false
}

async function handleStaffRoutes(req, res, pathname, body) {
  if (req.method === 'GET' && pathname === '/api/staff') {
    const result = await pool.query('SELECT * FROM staff ORDER BY created_at DESC')
    success(res, result.rows.map(mapStaff))
    return true
  }

  if (req.method === 'POST' && pathname === '/api/staff') {
    if (!body.employeeId) {
      sendError(res, 400, 'ValidationError', 'employeeId is required')
      return true
    }

    const passwordHash = body.password ? hashPassword(body.password) : hashPassword('1234')
    const result = await pool.query(
      `INSERT INTO staff (
        employee_id, name, department, position, email, phone, password_hash, is_on_duty, current_task_count, role, start_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        body.employeeId,
        body.name,
        body.department,
        body.position || body.role || null,
        body.email || null,
        body.phone || null,
        passwordHash,
        body.isOnDuty ?? body.isAvailable ?? false,
        body.currentTaskCount || 0,
        body.role || 'staff',
        body.startDate || null,
        body.status || 'active',
      ],
    )

    created(res, mapStaff(result.rows[0]), 'Staff created')
    return true
  }

  if (req.method === 'PATCH' && pathname === '/api/staff') {
    if (!body.id) {
      sendError(res, 400, 'ValidationError', 'id is required')
      return true
    }

    const result = await pool.query(
      `UPDATE staff
       SET employee_id = COALESCE($1, employee_id),
           name = COALESCE($2, name),
           department = COALESCE($3, department),
           position = COALESCE($4, position),
           email = COALESCE($5, email),
           phone = COALESCE($6, phone),
           password_hash = COALESCE($7, password_hash),
           fcm_token = COALESCE($8, fcm_token),
           is_on_duty = COALESCE($9, is_on_duty),
           current_task_count = COALESCE($10, current_task_count),
           role = COALESCE($11, role),
           start_date = COALESCE($12, start_date),
           status = COALESCE($13, status),
           updated_at = NOW()
       WHERE id = $14
       RETURNING *`,
      [
        body.employeeId || null,
        body.name || null,
        body.department || null,
        body.position || body.role || null,
        body.email || null,
        body.phone || null,
        body.password ? hashPassword(body.password) : null,
        body.fcmToken || body.fcm_token || null,
        typeof body.isOnDuty === 'boolean' ? body.isOnDuty : typeof body.isAvailable === 'boolean' ? body.isAvailable : null,
        body.currentTaskCount || null,
        body.role || null,
        body.startDate || null,
        body.status || null,
        body.id,
      ],
    )

    if (!result.rows[0]) {
      sendError(res, 404, 'NotFoundError', 'Staff not found')
      return true
    }

    success(res, mapStaff(result.rows[0]), 'Staff updated')
    return true
  }

  if (req.method === 'DELETE' && pathname === '/api/staff') {
    const id = getQueryParam(req, 'id')
    if (!id) {
      sendError(res, 400, 'ValidationError', 'id is required')
      return true
    }

    await pool.query('DELETE FROM staff WHERE id = $1', [id])
    success(res, { deleted: true }, 'Staff deleted')
    return true
  }

  const statusMatch = pathname.match(/^\/api\/staff\/(\d+)\/status$/)
  const tasksMatch = pathname.match(/^\/api\/staff\/(\d+)\/tasks$/)

  if (statusMatch && req.method === 'PUT') {
    const result = await pool.query(
      `UPDATE staff SET is_on_duty = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [Boolean(body.isOnDuty), statusMatch[1]],
    )

    if (!result.rows[0]) {
      sendError(res, 404, 'NotFoundError', 'Staff not found')
      return true
    }

    req.io.emit('staff:status-changed', {
      staffId: String(statusMatch[1]),
      isOnDuty: Boolean(body.isOnDuty),
    })
    success(res, mapStaff(result.rows[0]), 'Staff status updated')
    return true
  }

  if (tasksMatch && req.method === 'GET') {
    const result = await pool.query('SELECT * FROM service_requests WHERE assigned_to = $1 ORDER BY created_at DESC', [tasksMatch[1]])
    success(res, result.rows.map(mapRequest))
    return true
  }

  return false
}

async function handleMessageRoutes(req, res, pathname, body, auth) {
  if (req.method === 'GET' && pathname === '/api/messages') {
    const conversationId = getQueryParam(req, 'conversationId')
    if (conversationId) {
      const result = await pool.query('SELECT * FROM chat_messages WHERE conversation_id = $1 ORDER BY timestamp ASC', [conversationId])
      success(res, result.rows.map(mapMessage))
      return true
    }

    const result = await pool.query(
      `SELECT DISTINCT ON (COALESCE(conversation_id, request_id)) *
       FROM chat_messages
       ORDER BY COALESCE(conversation_id, request_id), timestamp DESC`,
    )

    success(res, result.rows.map((row) => ({
      id: String(row.conversation_id || row.request_id || row.id),
      conversationId: row.conversation_id ? String(row.conversation_id) : row.request_id ? String(row.request_id) : String(row.id),
      requestId: row.request_id ? String(row.request_id) : null,
      lastMessage: row.text,
      senderRole: row.sender_role,
      timestamp: toIso(row.timestamp),
      unread: row.is_read ? 0 : 1,
      name: row.sender_name || `Conversation ${row.conversation_id || row.request_id || row.id}`,
      avatar: (row.sender_name || 'C').slice(0, 2).toUpperCase(),
    })))
    return true
  }

  if (req.method === 'GET' && pathname.startsWith('/api/messages/')) {
    const requestId = pathname.split('/').pop()
    const result = await pool.query('SELECT * FROM chat_messages WHERE request_id = $1 ORDER BY timestamp ASC', [requestId])
    success(res, result.rows.map(mapMessage))
    return true
  }

  if (req.method === 'POST' && pathname === '/api/messages') {
    const conversationId = body.conversationId
    if (!conversationId || !body.text || !body.sender) {
      sendError(res, 400, 'ValidationError', 'conversationId, sender, and text are required')
      return true
    }

    const result = await pool.query(
      `INSERT INTO chat_messages (request_id, conversation_id, sender_role, sender_id, sender_name, text, priority, is_quick_option, is_read)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, false)
       RETURNING *`,
      [body.requestId || null, conversationId, body.type || 'admin', body.senderId || null, body.sender, body.text, body.priority || null],
    )

    req.io.emit('chat:message-received', mapMessage(result.rows[0]))
    created(res, mapMessage(result.rows[0]), 'Message sent')
    return true
  }

  return false
}

async function handleNotificationRoutes(req, res, pathname, body) {
  if (req.method === 'GET' && pathname === '/api/notifications') {
    const filter = getQueryParam(req, 'filter')
    const unreadOnly = getQueryParam(req, 'unread') === 'true'
    const params = []
    const where = []

    if (filter && filter !== 'all') {
      params.push(filter)
      where.push(`type = $${params.length}`)
    }

    if (unreadOnly) {
      where.push('is_read = false')
    }

    const sql = `SELECT * FROM notifications${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC`
    const result = await pool.query(sql, params)
    success(res, result.rows.map(mapNotification))
    return true
  }

  if (req.method === 'GET' && pathname === '/api/notifications/history') {
    const result = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC')
    success(res, result.rows.map(mapNotification))
    return true
  }

  if (req.method === 'POST' && pathname === '/api/notifications') {
    if (!body.type || !body.title || !body.message) {
      sendError(res, 400, 'ValidationError', 'type, title and message are required')
      return true
    }

    const notification = await createNotification(body)
    req.io.emit('notification:new', notification)
    created(res, notification, 'Notification created')
    return true
  }

  if (req.method === 'PUT' && pathname === '/api/notifications') {
    if (body.notificationId === undefined) {
      sendError(res, 400, 'ValidationError', 'notificationId is required')
      return true
    }

    const result = await pool.query(
      `UPDATE notifications SET is_read = COALESCE($1, is_read) WHERE id = $2 RETURNING *`,
      [typeof body.read === 'boolean' ? body.read : null, body.notificationId],
    )

    if (!result.rows[0]) {
      sendError(res, 404, 'NotFoundError', 'Notification not found')
      return true
    }

    success(res, mapNotification(result.rows[0]), 'Notification updated')
    return true
  }

  if (req.method === 'DELETE' && pathname === '/api/notifications') {
    const id = getQueryParam(req, 'id')
    if (!id) {
      sendError(res, 400, 'ValidationError', 'id is required')
      return true
    }

    await pool.query('DELETE FROM notifications WHERE id = $1', [id])
    success(res, { deleted: true }, 'Notification deleted')
    return true
  }

  if (req.method === 'POST' && pathname === '/api/notifications/fcm-token') {
    const { token, userType, userId } = body
    if (!token || !userType || !userId) {
      sendError(res, 400, 'ValidationError', 'token, userType and userId are required')
      return true
    }

    if (userType === 'guest') {
      await pool.query('UPDATE guests SET fcm_token = $1, updated_at = NOW() WHERE id = $2', [token, userId])
    } else if (userType === 'staff') {
      await pool.query('UPDATE staff SET fcm_token = $1, updated_at = NOW() WHERE id = $2', [token, userId])
    }

    success(res, { saved: true }, 'FCM token saved')
    return true
  }

  return false
}

async function handleSchedulerRoutes(req, res, pathname, body) {
  if (req.method === 'GET' && pathname === '/api/scheduler') {
    const params = []
    const where = []
    const date = getQueryParam(req, 'date')
    const staffId = getQueryParam(req, 'staffId')
    const type = getQueryParam(req, 'type')

    if (date) {
      params.push(date)
      where.push(`scheduled_date = $${params.length}::date`)
    }

    if (staffId) {
      params.push(staffId)
      where.push(`staff_id = $${params.length}`)
    }

    if (type === 'shifts') {
      where.push('scheduled_date IS NOT NULL')
    }

    const sql = `SELECT * FROM assignments${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY scheduled_date ASC, scheduled_time ASC, created_at DESC`
    const result = await pool.query(sql, params)
    success(res, result.rows.map(mapAssignment))
    return true
  }

  if (req.method === 'POST' && pathname === '/api/scheduler') {
    const result = await pool.query(
      `INSERT INTO assignments (request_id, staff_id, room, service, scheduled_time, scheduled_date, priority, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [body.requestId || null, body.staffId || null, body.room, body.service, body.time || null, body.date || null, body.priority || 'Medium', body.status || 'pending', body.notes || null],
    )
    created(res, mapAssignment(result.rows[0]), 'Assignment created')
    return true
  }

  if (req.method === 'PUT' && pathname === '/api/scheduler') {
    if (!body.assignmentId) {
      sendError(res, 400, 'ValidationError', 'assignmentId is required')
      return true
    }

    const result = await pool.query(
      `UPDATE assignments
       SET status = COALESCE($1, status),
           staff_id = COALESCE($2, staff_id),
           scheduled_time = COALESCE($3, scheduled_time),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [body.status || null, body.staffId || null, body.time || null, body.assignmentId],
    )

    if (!result.rows[0]) {
      sendError(res, 404, 'NotFoundError', 'Assignment not found')
      return true
    }

    success(res, mapAssignment(result.rows[0]), 'Assignment updated')
    return true
  }

  if (req.method === 'DELETE' && pathname === '/api/scheduler') {
    const id = getQueryParam(req, 'id')
    if (!id) {
      sendError(res, 400, 'ValidationError', 'id is required')
      return true
    }

    await pool.query('DELETE FROM assignments WHERE id = $1', [id])
    success(res, { deleted: true }, 'Assignment deleted')
    return true
  }

  return false
}

async function handleHealth(req, res, pathname) {
  if (req.method === 'GET' && pathname === '/health') {
    success(res, { status: 'ok' }, 'Healthy')
    return true
  }

  return false
}

async function routeRequest(io, req, res, pathname, body) {
  if (await handleHealth(req, res, pathname)) return

  if (await handleAuthRoutes(req, res, pathname, body)) return
  if (await handleRequestRoutes(io, req, res, pathname, body, getAuthFromRequest(req))) return
  if (await handleGuestRoutes(req, res, pathname, body)) return
  if (await handleStaffRoutes(req, res, pathname, body)) return
  if (await handleMessageRoutes(req, res, pathname, body, getAuthFromRequest(req))) return
  if (await handleNotificationRoutes(req, res, pathname, body)) return
  if (await handleSchedulerRoutes(req, res, pathname, body)) return

  sendError(res, 404, 'NotFoundError', `Route not found: ${pathname}`)
}

async function main() {
  await initDatabase()
  await seedIfNeeded()

  const server = http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      sendJson(res, 204, {})
      return
    }

    try {
      const { pathname } = parse(req.url, true)
      const body = req.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? await readJson(req) : {}
      req.io = io
      await routeRequest(io, req, res, pathname, body)
    } catch (error) {
      console.error('Request handling error:', error)
      error(res, 500, 'ServerError', error.message || 'Unexpected server error')
    }
  })

  const io = new Server(server, {
    cors: {
      origin: CORS_ORIGINS,
      credentials: true,
    },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    const payload = verifyToken(token)

    socket.data.user = payload || {
      userId: socket.handshake.auth?.userId || null,
      role: socket.handshake.auth?.role || 'guest',
      department: socket.handshake.auth?.department || null,
    }

    next()
  })

  io.on('connection', (socket) => {
    const user = socket.data.user || {}
    const role = user.role || socket.handshake.auth?.role || 'guest'
    const userId = user.userId || socket.handshake.auth?.userId || null
    const department = user.department || socket.handshake.auth?.department || null

    socket.join(`${role}-all`)
    if (userId) {
      socket.join(`${role}-${userId}`)
    }
    if (department) {
      socket.join(`department-${department}`)
    }
    socket.join('admin-dashboard')

    socket.on('request:create', async (payload) => {
      try {
        await createRequest(io, payload, user)
      } catch (error) {
        socket.emit('error', { message: error.message || 'Failed to create request' })
      }
    })

    socket.on('request:update', async (payload) => {
      try {
        if (!payload?.requestId) return
        const result = await pool.query(
          `UPDATE service_requests
           SET room_number = COALESCE($1, room_number),
               guest_name = COALESCE($2, guest_name),
               guest_phone = COALESCE($3, guest_phone),
               type = COALESCE($4, type),
               description = COALESCE($5, description),
               priority = COALESCE($6, priority),
               notes = COALESCE($7, notes),
               updated_at = NOW()
           WHERE id = $8
           RETURNING *`,
          [payload.roomNumber || null, payload.guestName || null, payload.guestPhone || null, payload.type || null, payload.description || null, payload.priority || null, payload.notes || null, payload.requestId],
        )
        if (result.rows[0]) {
          emitRequestStatusChanged(io, result.rows[0])
        }
      } catch (error) {
        socket.emit('error', { message: error.message || 'Failed to update request' })
      }
    })

    socket.on('request:assign', async (payload) => {
      try {
        if (!payload?.requestId || !payload?.staffId) return
        const result = await assignRequest(io, Number(payload.requestId), Number(payload.staffId))
        if (result?.updated) {
          io.emit('request:assigned', {
            requestId: String(payload.requestId),
            staffId: String(payload.staffId),
            staffName: result.staff.name,
          })
        }
      } catch (error) {
        socket.emit('error', { message: error.message || 'Failed to assign request' })
      }
    })

    socket.on('chat:send', async (payload) => {
      try {
        if (!payload?.requestId || !payload?.message) return
        const request = await getRequestById(Number(payload.requestId))
        if (!request) return

        const result = await pool.query(
          `INSERT INTO chat_messages (request_id, conversation_id, sender_role, sender_id, sender_name, text, priority, is_quick_option, is_read)
           VALUES ($1, $2, $3, $4, $5, $6, $7, false, false)
           RETURNING *`,
          [payload.requestId, payload.requestId, payload.senderRole || role || 'guest', userId ? Number(userId) : null, payload.senderName || payload.senderRole || 'system', payload.message, payload.priority || request.priority],
        )
        const saved = mapMessage(result.rows[0])
        io.emit('chat:message-received', saved)
        if (request.guest_id) io.to(`guest-${request.guest_id}`).emit('chat:message-received', saved)
        if (request.assigned_to) io.to(`staff-${request.assigned_to}`).emit('chat:message-received', saved)
      } catch (error) {
        socket.emit('error', { message: error.message || 'Failed to send message' })
      }
    })

    socket.on('staff:set-available', async (payload) => {
      try {
        if (!userId) return
        const result = await pool.query('UPDATE staff SET is_on_duty = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [Boolean(payload?.isOnDuty), userId])
        if (result.rows[0]) {
          io.emit('staff:status-changed', { staffId: String(userId), isOnDuty: Boolean(payload?.isOnDuty) })
        }
      } catch (error) {
        socket.emit('error', { message: error.message || 'Failed to update staff availability' })
      }
    })

    socket.on('staff:claim-task', async (payload) => {
      try {
        if (!userId || !payload?.requestId) return
        const result = await assignRequest(io, Number(payload.requestId), Number(userId))
        if (result?.updated) {
          io.emit('request:assigned', { requestId: String(payload.requestId), staffId: String(userId), staffName: result.staff.name })
        }
      } catch (error) {
        socket.emit('error', { message: error.message || 'Failed to claim task' })
      }
    })
  })

  server.listen(PORT, () => {
    console.log(`Hotel backend listening on http://localhost:${PORT}`)
  })
}

main().catch((error) => {
  console.error('Failed to start backend:', error)
  process.exit(1)
})
