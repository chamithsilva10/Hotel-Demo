import { NextRequest, NextResponse } from 'next/server'

// Mock data - in production, use a database
const notifications = [
  {
    id: 1,
    type: 'critical',
    title: 'Critical Request - Room 301',
    message: 'Air conditioning not working - assigned to Mike Johnson',
    timestamp: '5 min ago',
    read: false,
    icon: 'alert-circle',
  },
  {
    id: 2,
    type: 'completed',
    title: 'Task Completed',
    message: 'Housekeeping task in Room 415 marked as completed by Lisa Brown',
    timestamp: '12 min ago',
    read: false,
    icon: 'check-circle',
  },
  {
    id: 3,
    type: 'message',
    title: 'New Message',
    message: 'Guest in Room 502 sent a message',
    timestamp: '25 min ago',
    read: false,
    icon: 'message-square',
  },
  {
    id: 4,
    type: 'assignment',
    title: 'Staff Assignment',
    message: 'Robert Lee assigned to Room 201 concierge service',
    timestamp: '1 hour ago',
    read: true,
    icon: 'clock',
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const filter = searchParams.get('filter')
  const unreadOnly = searchParams.get('unread') === 'true'

  try {
    let filtered = notifications

    if (unreadOnly) {
      filtered = filtered.filter((n) => !n.read)
    }

    if (filter && filter !== 'all') {
      filtered = filtered.filter((n) => n.type === filter)
    }

    return NextResponse.json(filtered)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, message, icon } = body

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newNotification = {
      id: notifications.length + 1,
      type,
      title,
      message,
      timestamp: 'now',
      read: false,
      icon: icon || 'bell',
    }

    notifications.push(newNotification)

    // Broadcast to connected clients via WebSocket or Server-Sent Events
    // This would be implemented with a real-time service

    return NextResponse.json(newNotification, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationId, read } = body

    if (notificationId === undefined) {
      return NextResponse.json(
        { error: 'Missing notification ID' },
        { status: 400 }
      )
    }

    const notification = notifications.find((n) => n.id === notificationId)
    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    if (read !== undefined) {
      notification.read = read
    }

    return NextResponse.json(notification)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Missing notification ID' },
        { status: 400 }
      )
    }

    const index = notifications.findIndex((n) => n.id === parseInt(notificationId))
    if (index === -1) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    const deleted = notifications.splice(index, 1)
    return NextResponse.json(deleted[0])
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}
