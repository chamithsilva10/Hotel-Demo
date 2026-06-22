import { NextRequest, NextResponse } from 'next/server'

// Mock data - in production, use a database
const assignments = [
  {
    id: 1,
    room: '301',
    service: 'Room Service',
    staff: 'Mike Johnson',
    time: '10:00 AM',
    priority: 'Critical',
    status: 'assigned',
    date: '2024-12-15',
  },
  {
    id: 2,
    room: '415',
    service: 'Housekeeping',
    staff: 'Lisa Brown',
    time: '11:30 AM',
    priority: 'Medium',
    status: 'scheduled',
    date: '2024-12-15',
  },
  {
    id: 3,
    room: '502',
    service: 'Maintenance',
    staff: 'Robert Lee',
    time: '2:00 PM',
    priority: 'Low',
    status: 'scheduled',
    date: '2024-12-15',
  },
]

const staffShifts = [
  {
    id: 1,
    name: 'Mike Johnson',
    department: 'Housekeeping',
    shift: '8 AM - 4 PM',
    date: '2024-12-15',
    tasks: 3,
  },
  {
    id: 2,
    name: 'Lisa Brown',
    department: 'Maintenance',
    shift: '10 AM - 6 PM',
    date: '2024-12-15',
    tasks: 2,
  },
  {
    id: 3,
    name: 'Robert Lee',
    department: 'Concierge',
    shift: '6 PM - 2 AM',
    date: '2024-12-15',
    tasks: 1,
  },
  {
    id: 4,
    name: 'Maria Garcia',
    department: 'Room Service',
    shift: '11 AM - 7 PM',
    date: '2024-12-15',
    tasks: 4,
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const date = searchParams.get('date')
  const staffId = searchParams.get('staffId')

  try {
    if (type === 'shifts') {
      let shifts = staffShifts

      if (date) {
        shifts = shifts.filter((s) => s.date === date)
      }

      return NextResponse.json(shifts)
    }

    if (staffId) {
      const staffAssignments = assignments.filter((a) => {
        const staff = staffShifts.find((s) => s.id === parseInt(staffId))
        return a.staff === staff?.name
      })
      return NextResponse.json(staffAssignments)
    }

    let filtered = assignments

    if (date) {
      filtered = filtered.filter((a) => a.date === date)
    }

    return NextResponse.json(filtered)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { room, service, staff, time, priority, date } = body

    if (!room || !service || !staff || !time || !priority) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newAssignment = {
      id: assignments.length + 1,
      room,
      service,
      staff,
      time,
      priority,
      status: 'scheduled',
      date: date || new Date().toISOString().split('T')[0],
    }

    assignments.push(newAssignment)

    // Notify staff member via notification system
    // Send push notification to staff mobile app

    return NextResponse.json(newAssignment, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { assignmentId, status, staff, time } = body

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Missing assignment ID' },
        { status: 400 }
      )
    }

    const assignment = assignments.find((a) => a.id === assignmentId)
    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    if (status) assignment.status = status
    if (staff) assignment.staff = staff
    if (time) assignment.time = time

    return NextResponse.json(assignment)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update assignment' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('id')

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Missing assignment ID' },
        { status: 400 }
      )
    }

    const index = assignments.findIndex((a) => a.id === parseInt(assignmentId))
    if (index === -1) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    const deleted = assignments.splice(index, 1)
    return NextResponse.json(deleted[0])
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete assignment' },
      { status: 500 }
    )
  }
}
