import { NextRequest, NextResponse } from 'next/server'

// Mock data - in production, use a database
const conversations = [
  {
    id: 1,
    name: 'John Smith - Room 301',
    type: 'guest',
    lastMessage: 'When can someone check the AC?',
    timestamp: '2 min ago',
    unread: 2,
    avatar: 'JS',
  },
  {
    id: 2,
    name: 'Mike Johnson',
    type: 'staff',
    lastMessage: 'Task completed and marked in system',
    timestamp: '15 min ago',
    unread: 0,
    avatar: 'MJ',
  },
  {
    id: 3,
    name: 'Sarah Chen - Room 415',
    type: 'guest',
    lastMessage: 'Thank you for the extra towels',
    timestamp: '1 hour ago',
    unread: 0,
    avatar: 'SC',
  },
]

const messages = [
  {
    id: 1,
    conversationId: 1,
    sender: 'John Smith',
    type: 'guest',
    text: 'Hi, the air conditioning in my room is not working properly',
    time: '9:30 AM',
  },
  {
    id: 2,
    conversationId: 1,
    sender: 'Admin',
    type: 'admin',
    text: 'We understand. A technician will visit your room shortly',
    time: '9:35 AM',
  },
  {
    id: 3,
    conversationId: 1,
    sender: 'John Smith',
    type: 'guest',
    text: 'When can someone check the AC?',
    time: '9:45 AM',
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get('conversationId')

  try {
    if (conversationId) {
      // Get messages for a specific conversation
      const conversationMessages = messages.filter(
        (msg) => msg.conversationId === parseInt(conversationId)
      )
      return NextResponse.json(conversationMessages)
    }

    // Get all conversations
    return NextResponse.json(conversations)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, sender, text, type } = body

    if (!conversationId || !sender || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In production, save to database
    const newMessage = {
      id: messages.length + 1,
      conversationId,
      sender,
      type: type || 'admin',
      text,
      time: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    messages.push(newMessage)

    // Update conversation's last message
    const conversation = conversations.find((c) => c.id === conversationId)
    if (conversation) {
      conversation.lastMessage = text
      conversation.timestamp = 'now'
    }

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
