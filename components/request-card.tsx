'use client';

import { Clock, MapPin, AlertCircle, CheckCircle2, Hourglass } from 'lucide-react';

interface RequestCardProps {
  id: string;
  roomNumber: string;
  guestName: string;
  serviceType: string;
  description: string;
  priority: 'Critical' | 'Medium' | 'Low';
  status: 'pending' | 'accepted' | 'in-progress' | 'completed';
  createdAt: string;
  assignedStaff?: string;
}

const priorityConfig = {
  Critical: {
    badge: 'badge-critical',
    color: 'text-red-400',
    icon: '🔴',
  },
  Medium: {
    badge: 'badge-medium',
    color: 'text-amber-400',
    icon: '🟡',
  },
  Low: {
    badge: 'badge-low',
    color: 'text-emerald-400',
    icon: '🟢',
  },
};

const statusConfig = {
  pending: { label: 'Pending', icon: AlertCircle, bg: 'bg-slate-500/20' },
  accepted: { label: 'Accepted', icon: CheckCircle2, bg: 'bg-blue-500/20' },
  'in-progress': { label: 'In Progress', icon: Hourglass, bg: 'bg-amber-500/20' },
  completed: { label: 'Completed', icon: CheckCircle2, bg: 'bg-emerald-500/20' },
};

export function RequestCard({
  id,
  roomNumber,
  guestName,
  serviceType,
  description,
  priority,
  status,
  createdAt,
  assignedStaff,
}: RequestCardProps) {
  const config = priorityConfig[priority];
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`border rounded-lg p-4 transition-all hover:shadow-lg hover:border-opacity-100 ${
      priority === 'Critical' ? 'priority-critical' : 
      priority === 'Medium' ? 'priority-medium' : 
      'priority-low'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">{config.icon}</span>
          <div>
            <p className="font-semibold text-sm">{serviceType}</p>
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
              <MapPin size={14} />
              <span>Room {roomNumber}</span>
            </div>
          </div>
        </div>
        <span className={config.badge}>{priority}</span>
      </div>

      <p className="text-slate-300 text-sm mb-3 line-clamp-2">{description}</p>

      <div className="flex items-center gap-2 mb-3">
        <StatusIcon size={16} className={statusInfo.bg.replace('bg-', 'text-').replace('/20', '')} />
        <span className="text-xs font-medium">{statusInfo.label}</span>
      </div>

      <div className="space-y-2 mb-3 pb-3 border-t border-white/10">
        <div className="flex justify-between text-xs mt-3">
          <span className="text-slate-400">Guest:</span>
          <span className="font-medium">{guestName}</span>
        </div>
        {assignedStaff && (
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Assigned to:</span>
            <span className="font-medium">{assignedStaff}</span>
          </div>
        )}
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Created:</span>
          <span className="text-slate-300">{new Date(createdAt).toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-3 py-2 text-xs font-medium bg-blue-500 hover:bg-blue-600 rounded transition-colors">
          View Details
        </button>
        <button className="flex-1 px-3 py-2 text-xs font-medium bg-slate-700 hover:bg-slate-600 rounded transition-colors">
          Assign
        </button>
      </div>
    </div>
  );
}
