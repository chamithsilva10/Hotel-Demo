'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Bell, AlertCircle, CheckCircle2, MessageSquare, Clock, Trash2, Settings } from 'lucide-react'

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all')
  const [notificationSettings, setNotificationSettings] = useState(false)

  const notifications = [
    {
      id: 1,
      type: 'critical',
      icon: AlertCircle,
      title: 'Critical Request - Room 301',
      message: 'Air conditioning not working - assigned to Mike Johnson',
      timestamp: '5 min ago',
      read: false
    },
    {
      id: 2,
      type: 'completed',
      icon: CheckCircle2,
      title: 'Task Completed',
      message: 'Housekeeping task in Room 415 marked as completed by Lisa Brown',
      timestamp: '12 min ago',
      read: false
    },
    {
      id: 3,
      type: 'message',
      icon: MessageSquare,
      title: 'New Message',
      message: 'Guest in Room 502 sent a message',
      timestamp: '25 min ago',
      read: false
    },
    {
      id: 4,
      type: 'assignment',
      icon: Clock,
      title: 'Staff Assignment',
      message: 'Robert Lee assigned to Room 201 concierge service',
      timestamp: '1 hour ago',
      read: true
    },
    {
      id: 5,
      type: 'critical',
      icon: AlertCircle,
      title: 'Urgent: Staff Shortage',
      message: 'Room Service staff unavailable for evening shift',
      timestamp: '3 hours ago',
      read: true
    },
    {
      id: 6,
      type: 'completed',
      icon: CheckCircle2,
      title: 'All Morning Tasks Completed',
      message: 'All priority maintenance tasks for morning shift completed',
      timestamp: '4 hours ago',
      read: true
    },
  ]

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter)

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Notifications</h1>
                <p className="text-slate-400 mt-1">{unreadCount} unread notifications</p>
              </div>
              <button
                onClick={() => setNotificationSettings(!notificationSettings)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Settings size={20} />
                Settings
              </button>
            </div>

            {/* Notification Settings Modal */}
            {notificationSettings && (
              <div className="mb-6 bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Critical Alerts', enabled: true, sound: true },
                    { label: 'Staff Messages', enabled: true, sound: true },
                    { label: 'Guest Messages', enabled: true, sound: false },
                    { label: 'Task Updates', enabled: true, sound: false },
                    { label: 'Scheduling Changes', enabled: true, sound: false },
                  ].map((setting, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{setting.label}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {setting.sound ? 'With sound' : 'Silent'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={setting.enabled}
                        readOnly
                        className="w-5 h-5 rounded accent-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['all', 'unread', 'critical', 'completed', 'message', 'assignment'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap capitalize ${
                    filter === f
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {filteredNotifications.map((notif) => {
                const Icon = notif.icon
                const bgColor =
                  notif.type === 'critical'
                    ? 'bg-red-500/10 border-red-500/30'
                    : notif.type === 'completed'
                    ? 'bg-green-500/10 border-green-500/30'
                    : notif.type === 'message'
                    ? 'bg-purple-500/10 border-purple-500/30'
                    : 'bg-blue-500/10 border-blue-500/30'

                const iconColor =
                  notif.type === 'critical'
                    ? 'text-red-400'
                    : notif.type === 'completed'
                    ? 'text-green-400'
                    : notif.type === 'message'
                    ? 'text-purple-400'
                    : 'text-blue-400'

                return (
                  <div
                    key={notif.id}
                    className={`${bgColor} border rounded-lg p-4 hover:opacity-80 transition-opacity ${
                      !notif.read ? 'ring-2 ring-blue-500/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${iconColor} mt-1`}>
                        <Icon size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold">{notif.title}</h3>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 mt-2"></span>
                          )}
                        </div>
                        <p className="text-sm text-slate-300 mb-2">{notif.message}</p>
                        <p className="text-xs text-slate-500">{notif.timestamp}</p>
                      </div>
                      <button className="text-slate-500 hover:text-slate-300 transition-colors mt-1">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <Bell size={48} className="mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400">No notifications found</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
