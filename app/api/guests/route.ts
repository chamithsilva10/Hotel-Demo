import { db } from '@/lib/db'
import { guests, activityLog } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const allGuests = await db
      .select()
      .from(guests)
      .orderBy(desc(guests.createdAt))

    return NextResponse.json(allGuests)
  } catch (error) {
    console.error('Failed to fetch guests:', error)
    return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, name, roomNumber, email, phone, checkInDate, checkOutDate } = body

    const [guest] = await db
      .insert(guests)
      .values({
        userId: userId || 'admin-guest',
        name,
        roomNumber,
        email,
        phone,
        checkInDate: checkInDate ? new Date(checkInDate) : new Date(),
        checkOutDate: checkOutDate ? new Date(checkOutDate) : null,
        status: 'active',
      })
      .returning()

    // Log activity
    await db.insert(activityLog).values({
      guestId: guest.id,
      action: 'Guest Created',
      details: `New guest ${name} in room ${roomNumber} added to system`,
    })

    return NextResponse.json(guest)
  } catch (error) {
    console.error('Failed to create guest:', error)
    return NextResponse.json({ error: 'Failed to create guest' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, name, roomNumber, email, phone, status, checkOutDate } = body

    const [updatedGuest] = await db
      .update(guests)
      .set({
        name,
        roomNumber,
        email,
        phone,
        status,
        checkOutDate: checkOutDate ? new Date(checkOutDate) : null,
        updatedAt: new Date(),
      })
      .where(eq(guests.id, id))
      .returning()

    // Log activity
    await db.insert(activityLog).values({
      guestId: id,
      action: 'Guest Updated',
      details: `Guest information updated`,
    })

    return NextResponse.json(updatedGuest)
  } catch (error) {
    console.error('Failed to update guest:', error)
    return NextResponse.json({ error: 'Failed to update guest' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await db.delete(guests).where(eq(guests.id, parseInt(id)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete guest:', error)
    return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 })
  }
}
