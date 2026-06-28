'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Settings, Save, Plus, Trash2, Key, Users, Building2, Briefcase } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('hotel')
  const [hotelSettings, setHotelSettings] = useState({
    name: 'Grand Hotel Resort',
    city: 'San Francisco',
    rooms: 150,
    phone: '+1-555-0000',
    email: 'contact@grandhotel.com'
  })

  const [services, setServices] = useState([
    { id: 1, name: 'Housekeeping', icon: 'broom', enabled: true },
    { id: 2, name: 'Maintenance', icon: 'wrench', enabled: true },
    { id: 3, name: 'Room Service', icon: 'utensils', enabled: true },
    { id: 4, name: 'Concierge', icon: 'bell', enabled: true },
  ])

  const [departments, setDepartments] = useState([
    { id: 1, name: 'Housekeeping', manager: 'Mike Johnson', staff: 5 },
    { id: 2, name: 'Maintenance', manager: 'Lisa Brown', staff: 3 },
    { id: 3, name: 'Concierge', manager: 'Robert Lee', staff: 2 },
    { id: 4, name: 'Room Service', manager: 'Maria Garcia', staff: 4 },
  ])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-slate-400 mt-1">Manage hotel configuration and operations</p>
              </div>
              <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-medium transition-colors">
                <Save size={20} />
                Save Changes
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b border-slate-700 pb-4">
              {[
                { id: 'hotel', label: 'Hotel Info', icon: Building2 },
                { id: 'services', label: 'Services', icon: Briefcase },
                { id: 'departments', label: 'Departments', icon: Users },
                { id: 'security', label: 'Security', icon: Key },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Hotel Info Tab */}
            {activeTab === 'hotel' && (
              <div className="space-y-6">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Hotel Information</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Hotel Name', key: 'name' },
                      { label: 'City', key: 'city' },
                      { label: 'Total Rooms', key: 'rooms', type: 'number' },
                      { label: 'Phone', key: 'phone' },
                      { label: 'Email', key: 'email', type: 'email' },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium mb-2">{field.label}</label>
                        <input
                          type={field.type || 'text'}
                          value={hotelSettings[field.key as keyof typeof hotelSettings]}
                          onChange={(e) => setHotelSettings({
                            ...hotelSettings,
                            [field.key]: field.type === 'number' ? parseInt(e.target.value) : e.target.value
                          })}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Available Services</h3>
                    <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm transition-colors">
                      <Plus size={16} />
                      Add Service
                    </button>
                  </div>
                  <div className="space-y-3">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={service.enabled}
                            onChange={() => setServices(services.map(s =>
                              s.id === service.id ? { ...s, enabled: !s.enabled } : s
                            ))}
                            className="w-5 h-5 rounded accent-blue-500"
                          />
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-xs text-slate-400">Service type</p>
                          </div>
                        </div>
                        <button className="text-slate-500 hover:text-red-400 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Departments Tab */}
            {activeTab === 'departments' && (
              <div className="space-y-6">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Departments</h3>
                  <div className="space-y-3">
                    {departments.map((dept) => (
                      <div key={dept.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold">{dept.name}</p>
                            <p className="text-sm text-slate-400">Manager: {dept.manager}</p>
                          </div>
                          <button className="text-slate-500 hover:text-red-400 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Users size={16} />
                          {dept.staff} staff members
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors">
                    <Plus size={18} />
                    Add Department
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">API Key</label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value="••••••••••••••••••••••••"
                          readOnly
                          className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
                        />
                        <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                          Copy
                        </button>
                      </div>
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors font-medium">
                        Regenerate API Key
                      </button>
                    </div>
                    <div className="border-t border-slate-600 pt-4">
                      <h4 className="font-semibold mb-3">Two-Factor Authentication</h4>
                      <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <p className="text-sm">2FA enabled for admin accounts</p>
                        <input type="checkbox" checked readOnly className="w-5 h-5 rounded accent-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
