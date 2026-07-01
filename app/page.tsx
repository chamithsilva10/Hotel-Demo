'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { RequestModal } from '@/components/request-modal'
import { GuestModal } from '@/components/guest-modal'
import { StaffModal } from '@/components/staff-modal'
import { useRequests, useGuests, useStaff } from '@/lib/hooks'
import { connectHotelSocket, disconnectHotelSocket, onHotelEvent, offHotelEvent } from '@/lib/realtime'
import { Search, Plus, Users, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function Page() {
  const [activeTab, setActiveTab] = useState('requests')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [selectedGuest, setSelectedGuest] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false)
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false)

  const { requests, mutate: mutateRequests, isLoading: requestsLoading } = useRequests()
  const { guests, mutate: mutateGuests, isLoading: guestsLoading } = useGuests()
  const { staff, mutate: mutateStaff, isLoading: staffLoading } = useStaff()

  useEffect(() => {
    const socket = connectHotelSocket({ role: 'admin' })

    const syncRequests = () => {
      mutateRequests()
      mutateGuests()
      mutateStaff()
    }

    const syncMessages = () => {
      mutateRequests()
    }

    const syncNotifications = () => {
      mutateRequests()
      mutateStaff()
    }

    socket.on('connect', syncRequests)
    onHotelEvent('request:created', syncRequests)
    onHotelEvent('request:assigned', syncRequests)
    onHotelEvent('request:status-changed', syncRequests)
    onHotelEvent('chat:message-received', syncMessages)
    onHotelEvent('notification:new', syncNotifications)
    onHotelEvent('staff:status-changed', syncRequests)

    return () => {
      socket.off('connect', syncRequests)
      offHotelEvent('request:created', syncRequests)
      offHotelEvent('request:assigned', syncRequests)
      offHotelEvent('request:status-changed', syncRequests)
      offHotelEvent('chat:message-received', syncMessages)
      offHotelEvent('notification:new', syncNotifications)
      offHotelEvent('staff:status-changed', syncRequests)
      disconnectHotelSocket()
    }
  }, [mutateGuests, mutateRequests, mutateStaff])

  const handleRequestClick = (req: any) => {
    setSelectedRequest(req)
    setIsRequestModalOpen(true)
  }

  const handleGuestClick = (guest: any) => {
    setSelectedGuest(guest)
    setIsGuestModalOpen(true)
  }

  const handleStaffClick = (member: any) => {
    setSelectedStaff(member)
    setIsStaffModalOpen(true)
  }

  const filteredRequests = requests.filter((req: any) => {
    const matchesSearch =
      req.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.type?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPriority = filterPriority === 'all' || req.priority === filterPriority
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus

    return matchesSearch && matchesPriority && matchesStatus
  })

  const filteredGuests = guests.filter((g: any) =>
    g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredStaff = staff.filter((s: any) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    totalRequests: requests.length,
    criticalRequests: requests.filter((r: any) => r.priority === 'Critical').length,
    inProgressRequests: requests.filter((r: any) => r.status === 'in-progress').length,
    completedRequests: requests.filter((r: any) => r.status === 'completed').length,
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 md:ml-0">
          <div className="p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-slate-400 mt-1">Manage all hotel operations</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Total Requests</p>
                <p className="text-3xl font-bold mt-2">{stats.totalRequests}</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-300 text-sm">Critical</p>
                <p className="text-3xl font-bold mt-2">{stats.criticalRequests}</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/50 rounded-lg p-4">
                <p className="text-purple-300 text-sm">In Progress</p>
                <p className="text-3xl font-bold mt-2">{stats.inProgressRequests}</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
                <p className="text-green-300 text-sm">Completed</p>
                <p className="text-3xl font-bold mt-2">{stats.completedRequests}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-700">
              {['requests', 'guests', 'staff'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => {
                  if (activeTab === 'requests') {
                    setSelectedRequest(null)
                    setIsRequestModalOpen(true)
                  } else if (activeTab === 'guests') {
                    setSelectedGuest(null)
                    setIsGuestModalOpen(true)
                  } else {
                    setSelectedStaff(null)
                    setIsStaffModalOpen(true)
                  }
                }}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus size={20} />
                New
              </button>
            </div>

            {activeTab === 'requests' && (
              <div>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="Critical">Critical</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>

                {requestsLoading ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">Loading requests...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRequests.map((req: any) => (
                      <div
                        key={req.id}
                        onClick={() => handleRequestClick(req)}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 cursor-pointer hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">Room {req.roomNumber}</p>
                            <p className="text-sm text-slate-400">{req.type}</p>
                          </div>
                          <div
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              req.priority === 'Critical'
                                ? 'bg-red-500/20 text-red-300'
                                : req.priority === 'Medium'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-green-500/20 text-green-300'
                            }`}
                          >
                            {req.priority}
                          </div>
                        </div>
                        <p className="text-sm text-slate-300 mb-3">{req.guestName}</p>
                        <p className="text-xs text-slate-400 mb-3 line-clamp-2">{req.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={`px-2 py-1 rounded ${
                              req.status === 'completed'
                                ? 'bg-green-500/20 text-green-300'
                                : req.status === 'in-progress'
                                ? 'bg-purple-500/20 text-purple-300'
                                : req.status === 'pending'
                                ? 'bg-slate-500/20 text-slate-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}
                          >
                            {req.status}
                          </span>
                          <span className="text-slate-500">
                            {new Date(req.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!requestsLoading && filteredRequests.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-slate-400">No requests found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'guests' && (
              <div>
                {guestsLoading ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">Loading guests...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-slate-700">
                        <tr>
                          <th className="text-left px-4 py-3 text-slate-400 font-medium">Name</th>
                          <th className="text-left px-4 py-3 text-slate-400 font-medium">Room</th>
                          <th className="text-left px-4 py-3 text-slate-400 font-medium">Email</th>
                          <th className="text-left px-4 py-3 text-slate-400 font-medium">Phone</th>
                          <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                          <th className="text-left px-4 py-3 text-slate-400 font-medium">Check-out</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {filteredGuests.map((guest: any) => (
                          <tr
                            key={guest.id}
                            onClick={() => handleGuestClick(guest)}
                            className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                          >
                            <td className="px-4 py-3 font-medium">{guest.name}</td>
                            <td className="px-4 py-3 text-slate-400">{guest.roomNumber}</td>
                            <td className="px-4 py-3 text-slate-400">{guest.email}</td>
                            <td className="px-4 py-3 text-slate-400">{guest.phone}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  guest.status === 'active'
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'bg-slate-500/20 text-slate-300'
                                }`}
                              >
                                {guest.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-400">
                              {guest.checkOutDate
                                ? new Date(guest.checkOutDate).toLocaleDateString()
                                : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {!guestsLoading && filteredGuests.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-slate-400">No guests found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'staff' && (
              <div>
                {staffLoading ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">Loading staff...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStaff.map((member: any) => (
                      <div
                        key={member.id}
                        onClick={() => handleStaffClick(member)}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 cursor-pointer hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">{member.name}</p>
                            <p className="text-sm text-slate-400">{member.department}</p>
                          </div>
                          <div
                            className={`w-3 h-3 rounded-full ${
                              member.isAvailable ? 'bg-green-500' : 'bg-slate-500'
                            }`}
                          />
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{member.email}</p>
                        <p className="text-sm text-slate-400 mb-3">{member.phone}</p>
                        <div className="flex gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              member.status === 'active'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-slate-500/20 text-slate-300'
                            }`}
                          >
                            {member.status}
                          </span>
                          {member.role && (
                            <span className="px-2 py-1 rounded text-xs bg-slate-700/50 text-slate-300">
                              {member.role}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!staffLoading && filteredStaff.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-slate-400">No staff members found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <RequestModal
        request={selectedRequest}
        isOpen={isRequestModalOpen}
        onClose={() => {
          setIsRequestModalOpen(false)
          setSelectedRequest(null)
        }}
        onUpdate={() => mutateRequests()}
        staff={staff}
      />

      <GuestModal
        guest={selectedGuest}
        isOpen={isGuestModalOpen}
        onClose={() => {
          setIsGuestModalOpen(false)
          setSelectedGuest(null)
        }}
        onUpdate={() => mutateGuests()}
      />

      <StaffModal
        staffMember={selectedStaff}
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false)
          setSelectedStaff(null)
        }}
        onUpdate={() => mutateStaff()}
      />
    </div>
  )
}
