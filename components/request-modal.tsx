'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { updateRequest, deleteRequest } from '@/lib/hooks'

interface RequestModalProps {
  request: any
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
  staff: any[]
}

export function RequestModal({ request, isOpen, onClose, onUpdate, staff }: RequestModalProps) {
  const [status, setStatus] = useState(request?.status || 'pending')
  const [assignedStaffId, setAssignedStaffId] = useState(request?.assignedStaffId || '')
  const [notes, setNotes] = useState(request?.notes || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !request) return null

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true)
    setError('')
    try {
      await updateRequest(request.id, {
        status: newStatus,
        assignedStaffId: assignedStaffId || null,
        notes,
      })
      setStatus(newStatus)
      onUpdate()
    } catch (err) {
      setError('Failed to update request')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this request?')) return
    setIsLoading(true)
    setError('')
    try {
      await deleteRequest(request.id)
      onUpdate()
      onClose()
    } catch (err) {
      setError('Failed to delete request')
    } finally {
      setIsLoading(false)
    }
  }

  const priorityColor = {
    Critical: 'bg-red-500/20 border-red-500/50 text-red-300',
    Medium: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
    Low: 'bg-green-500/20 border-green-500/50 text-green-300',
  }

  const statusColor = {
    pending: 'bg-slate-500/20',
    accepted: 'bg-blue-500/20',
    'in-progress': 'bg-purple-500/20',
    completed: 'bg-green-500/20',
    declined: 'bg-red-500/20',
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
          <div>
            <h2 className="text-2xl font-bold">Request #{request.id}</h2>
            <p className="text-slate-400 text-sm mt-1">Room {request.roomNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-300">
              {error}
            </div>
          )}

          {/* Guest Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm">Guest Name</label>
              <p className="text-lg font-medium mt-1">{request.guestName}</p>
            </div>
            <div>
              <label className="text-slate-400 text-sm">Phone</label>
              <p className="text-lg font-medium mt-1">{request.guestPhone}</p>
            </div>
          </div>

          {/* Service Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm">Service Type</label>
              <p className="text-lg font-medium mt-1">{request.type}</p>
            </div>
            <div>
              <label className="text-slate-400 text-sm">Priority</label>
              <div className={`inline-block px-3 py-1 rounded mt-1 text-sm font-medium border ${priorityColor[request.priority as keyof typeof priorityColor]}`}>
                {request.priority}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-slate-400 text-sm">Description</label>
            <p className="text-slate-300 mt-2 bg-slate-700/30 p-3 rounded border border-slate-600">
              {request.description}
            </p>
          </div>

          {/* Status Update */}
          <div>
            <label className="text-slate-400 text-sm block mb-2">Update Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          {/* Assign Staff */}
          <div>
            <label className="text-slate-400 text-sm block mb-2">Assign Staff</label>
            <select
              value={assignedStaffId}
              onChange={(e) => setAssignedStaffId(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">Select Staff Member</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.department}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-slate-400 text-sm block mb-2">Admin Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500"
              rows={4}
              placeholder="Add admin notes..."
            />
          </div>

          {/* Timeline */}
          <div>
            <label className="text-slate-400 text-sm">Timeline</label>
            <div className="mt-2 space-y-2 text-sm">
              <p>Created: {new Date(request.createdAt).toLocaleString()}</p>
              <p>Updated: {new Date(request.updatedAt).toLocaleString()}</p>
              {request.completedAt && (
                <p>Completed: {new Date(request.completedAt).toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-700 bg-slate-700/30 flex gap-3 justify-end">
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded font-medium transition-colors disabled:opacity-50"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => handleStatusChange(status)}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
