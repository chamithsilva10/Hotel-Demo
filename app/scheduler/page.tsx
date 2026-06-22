'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Calendar, Clock, Users, Plus } from 'lucide-react'

export default function SchedulerPage() {
  const [view, setView] = useState('week')

  const scheduledTasks = [
    {
      id: 1,
      room: '301',
      service: 'Room Service',
      staff: 'Mike Johnson',
      time: '10:00 AM',
      priority: 'Critical',
      status: 'assigned'
    },
    {
      id: 2,
      room: '415',
      service: 'Housekeeping',
      staff: 'Lisa Brown',
      time: '11:30 AM',
      priority: 'Medium',
      status: 'scheduled'
    },
    {
      id: 3,
      room: '502',
      service: 'Maintenance',
      staff: 'Robert Lee',
      time: '2:00 PM',
      priority: 'Low',
      status: 'scheduled'
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Service Scheduler</h1>
                <p className="text-slate-400 mt-1">Manage staff assignments and schedules</p>
              </div>
              <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-medium transition-colors">
                <Plus size={20} />
                New Assignment
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 mb-6 border-b border-slate-700 pb-4">
              {['day', 'week', 'month'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2 font-medium transition-colors capitalize ${
                    view === v
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {v} View
                </button>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Week Schedule</h2>
                
                {/* Time slots */}
                <div className="space-y-3">
                  {['8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'].map((time) => (
                    <div key={time} className="flex items-center gap-4">
                      <div className="w-20 text-sm text-slate-400 font-medium">{time}</div>
                      <div className="flex-1 h-16 bg-slate-700/30 rounded border border-slate-600/30 hover:border-slate-500/50 transition-colors cursor-pointer flex items-center px-4">
                        <span className="text-xs text-slate-500">Drag tasks here</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scheduled Tasks */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Today's Tasks</h3>
                <div className="space-y-3">
                  {scheduledTasks.map((task) => (
                    <div key={task.id} className="bg-slate-700/30 rounded-lg p-3 hover:bg-slate-700/50 transition-colors cursor-move">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm">Room {task.room}</p>
                          <p className="text-xs text-slate-400">{task.service}</p>
                        </div>
                        <div
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            task.priority === 'Critical'
                              ? 'bg-red-500/20 text-red-300'
                              : task.priority === 'Medium'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-green-500/20 text-green-300'
                          }`}
                        >
                          {task.priority}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{task.staff}</span>
                        <span className="text-slate-500">{task.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Staff Shifts */}
            <div className="mt-8 bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Staff Shifts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Mike Johnson', dept: 'Housekeeping', shift: '8 AM - 4 PM', tasks: 3 },
                  { name: 'Lisa Brown', dept: 'Maintenance', shift: '10 AM - 6 PM', tasks: 2 },
                  { name: 'Robert Lee', dept: 'Concierge', shift: '6 PM - 2 AM', tasks: 1 },
                  { name: 'Maria Garcia', dept: 'Room Service', shift: '11 AM - 7 PM', tasks: 4 },
                ].map((staff, idx) => (
                  <div key={idx} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                    <p className="font-semibold text-sm">{staff.name}</p>
                    <p className="text-xs text-slate-400 mb-3">{staff.dept}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-300 mb-2">
                      <Clock size={14} />
                      {staff.shift}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Users size={14} />
                      {staff.tasks} tasks
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
