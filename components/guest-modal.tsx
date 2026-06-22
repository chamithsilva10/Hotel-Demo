'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createGuest, updateGuest, deleteGuest } from '@/lib/hooks'

interface GuestModalProps {
  guest: any | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function GuestModal({ guest, isOpen, onClose, onUpdate }: GuestModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    roomNumber: '',
    email: '',
    phone: '',
    checkInDate: '',
    checkOutDate: '',
    status: 'active',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (guest) {
      setFormData({
        name: guest.name || '',
        roomNumber: guest.roomNumber || '',
        email: guest.email || '',
        phone: guest.phone || '',
        checkInDate: guest.checkInDate?.split('T')[0] || '',
        checkOutDate: guest.checkOutDate?.split('T')[0] || '',
        status: guest.status || 'active',
      })
    } else {
      setFormData({
        name: '',
        roomNumber: '',
        email: '',
        phone: '',
        checkInDate: new Date().toISOString().split('T')[0],
        checkOutDate: '',
        status: 'active',
      })
    }
  }, [guest, isOpen])

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (guest) {
        await updateGuest(guest.id, formData)
      } else {
        await createGuest(formData)
      }
      onUpdate()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save guest')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!guest || !confirm('Are you sure you want to delete this guest?')) return
    setIsLoading(true)
    setError('')

    try {
      await deleteGuest(guest.id)
      onUpdate()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete guest')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold">{guest ? 'Edit Guest' : 'Add New Guest'}</h2>
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
              <label className="text-slate-400 text-sm block mb-2">Room Number *</label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm block mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm block mb-2">Check-in Date *</label>
              <input
                type="date"
                name="checkInDate"
                value={formData.checkInDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-2">Check-out Date</label>
              <input
                type="date"
                name="checkOutDate"
                value={formData.checkOutDate}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
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
              <option value="checked-out">Checked Out</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </form>

        {/* Actions */}
        <div className="p-6 border-t border-slate-700 bg-slate-700/30 flex gap-3 justify-end">
          {guest && (
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
            {isLoading ? 'Saving...' : guest ? 'Update Guest' : 'Create Guest'}
          </button>
        </div>
      </div>
    </div>
  )
}
