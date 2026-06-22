'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createStaff, updateStaff, deleteStaff } from '@/lib/hooks'

interface StaffModalProps {
  staffMember: any | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function StaffModal({ staffMember, isOpen, onClose, onUpdate }: StaffModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Housekeeping',
    role: '',
    phone: '',
    status: 'active',
    isAvailable: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (staffMember) {
      setFormData({
        name: staffMember.name || '',
        email: staffMember.email || '',
        department: staffMember.department || 'Housekeeping',
        role: staffMember.role || '',
        phone: staffMember.phone || '',
        status: staffMember.status || 'active',
        isAvailable: staffMember.isAvailable ?? true,
      })
    } else {
      setFormData({
        name: '',
        email: '',
        department: 'Housekeeping',
        role: '',
        phone: '',
        status: 'active',
        isAvailable: true,
      })
    }
  }, [staffMember, isOpen])

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (staffMember) {
        await updateStaff(staffMember.id, formData)
      } else {
        await createStaff(formData)
      }
      onUpdate()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save staff')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!staffMember || !confirm('Are you sure you want to delete this staff member?')) return
    setIsLoading(true)
    setError('')

    try {
      await deleteStaff(staffMember.id)
      onUpdate()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete staff')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold">{staffMember ? 'Edit Staff Member' : 'Add New Staff'}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm block mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm block mb-2">Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Housekeeping">Housekeeping</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Concierge">Concierge</option>
                <option value="Front Desk">Front Desk</option>
                <option value="Security">Security</option>
                <option value="Room Service">Room Service</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-2">Role</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g., Manager, Supervisor"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm block mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="available"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="available" className="text-slate-300">
              Available for assignments
            </label>
          </div>
        </form>

        {/* Actions */}
        <div className="p-6 border-t border-slate-700 bg-slate-700/30 flex gap-3 justify-end">
          {staffMember && (
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded font-medium transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : staffMember ? 'Update Staff' : 'Create Staff'}
          </button>
        </div>
      </div>
    </div>
  )
}
