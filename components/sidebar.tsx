'use client';

import { useState } from 'react';
import { LayoutDashboard, ClipboardList, Users, MessageSquare, Bell, Settings, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Requests', href: '/requests', icon: ClipboardList },
  { name: 'Staff', href: '/staff', icon: Users },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-700/50 transform transition-transform duration-300 z-40 flex flex-col md:relative md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center font-bold">
              H
            </div>
            <div>
              <h1 className="font-bold text-sm">Hotel Admin</h1>
              <p className="text-xs text-slate-400">Service Scheduler</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-colors">
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
