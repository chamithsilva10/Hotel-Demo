'use client';

import { AlertCircle, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

interface StatsOverviewProps {
  totalRequests: number;
  criticalRequests: number;
  inProgressRequests: number;
  completedToday: number;
  averageResponseTime: string;
}

export function StatsOverview({
  totalRequests,
  criticalRequests,
  inProgressRequests,
  completedToday,
  averageResponseTime,
}: StatsOverviewProps) {
  const stats = [
    {
      label: 'Total Requests',
      value: totalRequests.toString(),
      icon: ClipboardList,
      color: 'from-blue-500/20 to-blue-600/10',
      textColor: 'text-blue-300',
    },
    {
      label: 'Critical',
      value: criticalRequests.toString(),
      icon: AlertCircle,
      color: 'from-red-500/20 to-red-600/10',
      textColor: 'text-red-300',
    },
    {
      label: 'In Progress',
      value: inProgressRequests.toString(),
      icon: Clock,
      color: 'from-amber-500/20 to-amber-600/10',
      textColor: 'text-amber-300',
    },
    {
      label: 'Completed Today',
      value: completedToday.toString(),
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-emerald-600/10',
      textColor: 'text-emerald-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`bg-gradient-to-br ${stat.color} border border-slate-700/50 rounded-lg p-5 hover:border-slate-600 transition-colors`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
              <Icon size={24} className={`${stat.textColor} opacity-60`} />
            </div>
          </div>
        );
      })}

      <div className="lg:col-span-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">Avg Response Time</p>
            <p className="text-2xl font-bold text-slate-200 mt-2">{averageResponseTime}</p>
          </div>
          <TrendingUp size={28} className="text-slate-400 opacity-60" />
        </div>
      </div>
    </div>
  );
}

function ClipboardList(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 9h6" />
      <path d="M9 13h6" />
      <path d="M9 17h3" />
    </svg>
  );
}
