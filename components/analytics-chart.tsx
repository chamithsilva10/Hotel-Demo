'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const requestData = [
  { time: '00:00', critical: 2, medium: 5, low: 8 },
  { time: '04:00', critical: 1, medium: 3, low: 6 },
  { time: '08:00', critical: 5, medium: 12, low: 18 },
  { time: '12:00', critical: 8, medium: 18, low: 25 },
  { time: '16:00', critical: 6, medium: 15, low: 22 },
  { time: '20:00', critical: 4, medium: 10, low: 16 },
  { time: '24:00', critical: 2, medium: 6, low: 10 },
];

const completionData = [
  { date: 'Mon', completed: 24, pending: 8 },
  { date: 'Tue', completed: 32, pending: 5 },
  { date: 'Wed', completed: 28, pending: 6 },
  { date: 'Thu', completed: 35, pending: 4 },
  { date: 'Fri', completed: 38, pending: 3 },
  { date: 'Sat', completed: 22, pending: 7 },
  { date: 'Sun', completed: 18, pending: 9 },
];

export function AnalyticsChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Requests by Priority */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Requests by Priority (24h)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={requestData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
            <XAxis dataKey="time" stroke="rgba(148, 163, 184, 0.5)" />
            <YAxis stroke="rgba(148, 163, 184, 0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(100, 116, 139, 0.5)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ color: '#cbd5e1' }} />
            <Line
              type="monotone"
              dataKey="critical"
              stroke="#dc2626"
              dot={false}
              strokeWidth={2}
              name="Critical"
            />
            <Line
              type="monotone"
              dataKey="medium"
              stroke="#f59e0b"
              dot={false}
              strokeWidth={2}
              name="Medium"
            />
            <Line
              type="monotone"
              dataKey="low"
              stroke="#10b981"
              dot={false}
              strokeWidth={2}
              name="Low"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Completion Rate */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Completion Rate (7 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={completionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
            <XAxis dataKey="date" stroke="rgba(148, 163, 184, 0.5)" />
            <YAxis stroke="rgba(148, 163, 184, 0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(100, 116, 139, 0.5)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ color: '#cbd5e1' }} />
            <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} name="Completed" />
            <Bar dataKey="pending" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
