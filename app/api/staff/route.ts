import { db } from '@/lib/db'
import { staff, activityLog } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const allStaff = await db
      .select()
      .from(staff)
      .orderBy(desc(staff.createdAt))

    return NextResponse.json(allStaff)
  } catch (error) {
    console.error('Failed to fetch staff:', error)
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, name, email, department, role, phone } = body

    const [staffMember] = await db
      .insert(staff)
      .values({
        userId,
        name,
        email,
        department,
        role,
        phone,
        status: 'active',
        isAvailable: true,
      })
      .returning()

    // Log activity
    await db.insert(activityLog).values({
      staffId: staffMember.id,
      action: 'Staff Member Created',
      details: `New staff member ${name} (${department}) added to system`,
    })

    return NextResponse.json(staffMember)
  } catch (error) {
    console.error('Failed to create staff:', error)
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, name, email, department, role, phone, status, isAvailable } = body

    const [updatedStaff] = await db
      .update(staff)
      .set({
        name,
        email,
        department,
        role,
        phone,
        status,
        isAvailable,
        updatedAt: new Date(),
      })
      .where(eq(staff.id, id))
      .returning()

    // Log activity
    await db.insert(activityLog).values({
      staffId: id,
      action: 'Staff Member Updated',
      details: `Staff member information updated`,
    })

    return NextResponse.json(updatedStaff)
  } catch (error) {
    console.error('Failed to update staff:', error)
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await db.delete(staff).where(eq(staff.id, parseInt(id)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete staff:', error)
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 })
  }
}
