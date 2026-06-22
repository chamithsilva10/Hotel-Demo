'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Send, Search, Plus } from 'lucide-react'

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(0)
  const [messageText, setMessageText] = useState('')

  const conversations = [
    {
      id: 1,
      name: 'John Smith - Room 301',
      type: 'guest',
      lastMessage: 'When can someone check the AC?',
      timestamp: '2 min ago',
      unread: 2,
      avatar: 'JS'
    },
    {
      id: 2,
      name: 'Mike Johnson',
      type: 'staff',
      lastMessage: 'Task completed and marked in system',
      timestamp: '15 min ago',
      unread: 0,
      avatar: 'MJ'
    },
    {
      id: 3,
      name: 'Sarah Chen - Room 415',
      type: 'guest',
      lastMessage: 'Thank you for the extra towels',
      timestamp: '1 hour ago',
      unread: 0,
      avatar: 'SC'
    },
    {
      id: 4,
      name: 'Lisa Brown',
      type: 'staff',
      lastMessage: 'I will handle the maintenance request',
      timestamp: '3 hours ago',
      unread: 0,
      avatar: 'LB'
    }
  ]

  const currentConversation = conversations[selectedConversation]
  
  const messages = [
    { id: 1, sender: 'John Smith', type: 'guest', text: 'Hi, the air conditioning in my room is not working properly', time: '9:30 AM' },
    { id: 2, sender: 'Admin', type: 'admin', text: 'We understand. A technician will visit your room shortly', time: '9:35 AM' },
    { id: 3, sender: 'John Smith', type: 'guest', text: 'When can someone check the AC?', time: '9:45 AM' },
    { id: 4, sender: 'Admin', type: 'admin', text: 'Within the next 30 minutes. Is that okay?', time: '9:50 AM' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <div className="h-screen flex flex-col">
            {/* Header */}
            <div className="border-b border-slate-700 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Messages</h1>
                  <p className="text-slate-400 text-sm mt-1">Guest and staff conversations</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-medium transition-colors">
                  <Plus size={20} />
                  New Message
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-6 overflow-hidden p-6">
              {/* Conversations List */}
              <div className="w-full md:w-80 flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2">
                  {conversations.map((conv, idx) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(idx)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedConversation === idx
                          ? 'bg-blue-500/20 border border-blue-500/50'
                          : 'bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          conv.type === 'guest'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {conv.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-sm truncate">{conv.name}</p>
                            {conv.unread > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {conv.unread}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate">{conv.lastMessage}</p>
                          <p className="text-xs text-slate-500 mt-1">{conv.timestamp}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="hidden md:flex flex-1 flex-col bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
                {/* Chat Header */}
                <div className="border-b border-slate-700 p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentConversation.type === 'guest'
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {currentConversation.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{currentConversation.name}</p>
                    <p className="text-xs text-slate-400">{currentConversation.type === 'guest' ? 'Guest' : 'Staff Member'}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.type === 'admin'
                            ? 'bg-blue-500/20 text-blue-100'
                            : 'bg-slate-700/50 text-slate-200'
                        }`}
                      >
                        {msg.type !== 'admin' && <p className="text-xs font-semibold mb-1">{msg.sender}</p>}
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="border-t border-slate-700 p-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button className="bg-blue-500 hover:bg-blue-600 p-2 rounded-lg transition-colors">
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
