import { db } from '@/lib/db'
import { serviceRequests, activityLog } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const requests = await db
      .select()
      .from(serviceRequests)
      .orderBy(desc(serviceRequests.createdAt))

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Failed to fetch requests:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { guestId, type, description, priority, roomNumber, guestName, guestPhone } = body

    const [request] = await db
      .insert(serviceRequests)
      .values({
        guestId,
        type,
        description,
        priority: priority || 'Medium',
        roomNumber,
        guestName,
        guestPhone,
        status: 'pending',
      })
      .returning()

    // Log activity
    await db.insert(activityLog).values({
      guestId,
      requestId: request.id,
      action: 'Request Created',
      details: `New ${type} request created with ${priority} priority`,
    })

    return NextResponse.json(request)
  } catch (error) {
    console.error('Failed to create request:', error)
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, status, assignedStaffId, notes } = body

    const [updatedRequest] = await db
      .update(serviceRequests)
      .set({
        status,
        assignedStaffId,
        notes,
        updatedAt: new Date(),
        completedAt: status === 'completed' ? new Date() : null,
      })
      .where(eq(serviceRequests.id, id))
      .returning()

    // Log activity
    await db.insert(activityLog).values({
      requestId: id,
      action: `Status Changed to ${status}`,
      details: `Request status updated: ${status}`,
    })

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error('Failed to update request:', error)
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await db.delete(serviceRequests).where(eq(serviceRequests.id, parseInt(id)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete request:', error)
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 })
  }
}
