'use client'

import { useState, useEffect, useRef } from "react"
import { apiRequest } from "@/lib/api-client"
import { initSocket, getSocket } from "@/lib/socket"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, Send, MoreVertical, Phone, Video, 
  Image as ImageIcon, Paperclip, Smile,
  Check, CheckCheck, Clock, Shield, Info, ArrowLeft, Archive, Trash2, MessageSquare
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import DashboardLayout from "@/components/dashboard/layout"

interface Message {
  _id: string
  conversation: string
  sender: string
  content: string
  createdAt: string
  read: boolean
}

interface Conversation {
  _id: string
  participants: any[]
  item?: any
  lastMessage?: Message
  updatedAt: string
  status?: 'active' | 'archived'
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active')
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initialize = async () => {
      const userData = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (userData) {
        setUser(JSON.parse(userData))
      } else if (token) {
        // Fallback: Fetch user if missing from localStorage but we're logged in
        try {
          const res = await apiRequest<{ data: any }>('/profile/me')
          if (res.data) {
            const profileData = res.data;
            setUser(profileData)
            localStorage.setItem('user', JSON.stringify(profileData))
            if (profileData.role) localStorage.setItem('userRole', profileData.role)
          }
        } catch (err) {
          console.error("Failed to sync user data:", err)
        }
      }
      
      if (token) {
        initSocket(token)
        await fetchConversations()
      } else {
        setLoading(false)
      }
    }

    initialize()

    const socket = getSocket()
    if (socket) {
      socket.on('new_message', (message: Message) => {
        if (activeConversation?._id === message.conversation) {
          setMessages(prev => [...prev, message])
          markRead(message.conversation)
        }
        setConversations(prev => prev.map(conv => 
          conv._id === message.conversation 
            ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
            : conv
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()))
      })

      socket.on('user_typing_start', (data: any) => {
        if (activeConversation?._id === data.conversationId && data.userId !== user?.id) {
          setIsOtherTyping(true)
        }
      })

      socket.on('user_typing_stop', (data: any) => {
        if (activeConversation?._id === data.conversationId) {
          setIsOtherTyping(false)
        }
      })

      socket.on('messages_read', (data: any) => {
        if (activeConversation?._id === data.conversationId) {
          setMessages(prev => prev.map(msg => 
            msg.sender !== data.readerId ? { ...msg, read: true } : msg
          ))
        }
        setConversations(prev => prev.map(conv => 
          conv._id === data.conversationId 
            ? { ...conv, lastMessage: conv.lastMessage ? { ...conv.lastMessage, read: true } : conv.lastMessage }
            : conv
        ))
      })

      socket.on('online_users', (userIds: string[]) => {
        setOnlineUsers(new Set(userIds))
      })

      socket.on('user_status_change', (data: { userId: string, status: 'online' | 'offline' }) => {
        setOnlineUsers(prev => {
          const next = new Set(prev)
          if (data.status === 'online') next.add(data.userId)
          else next.delete(data.userId)
          return next
        })
      })
    }

    return () => {
      const socket = getSocket()
      if (socket) {
        socket.off('new_message')
        socket.off('user_typing_start')
        socket.off('user_typing_stop')
        socket.off('messages_read')
        socket.off('online_users')
        socket.off('user_status_change')
      }
    }
  }, [activeConversation?._id, user?.id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOtherTyping])

  const fetchConversations = async () => {
    try {
      const res = await apiRequest<{ data: Conversation[] }>('/chats')
      const enhancedData = res.data.map(c => ({ ...c, status: c.status || 'active' }))
      setConversations(enhancedData)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const fetchMessages = async (convId: string) => {
    try {
      const res = await apiRequest<{ data: Message[] }>(`/chats/${convId}/messages`)
      setMessages(res.data)
      const socket = getSocket()
      if (socket) socket.emit('join_conversation', convId)
      markRead(convId)
    } catch (err) {
      console.error(err)
    }
  }

  const markRead = async (convId: string) => {
    try {
      await apiRequest(`/chats/read/${convId}`, { method: 'PATCH' })
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const handleSelectConversation = (conv: Conversation) => {
    if (activeConversation) {
      const socket = getSocket()
      if (socket) socket.emit('leave_conversation', activeConversation._id)
    }
    setActiveConversation(conv)
    fetchMessages(conv._id)
    setIsOtherTyping(false)
  }

  const handleTyping = () => {
    if (!activeConversation) return
    const socket = getSocket()
    if (!socket) return
    socket.emit('typing_start', activeConversation._id)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', activeConversation._id)
    }, 3000)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation) return
    const socket = getSocket()
    if (socket) socket.emit('typing_stop', activeConversation._id)
    const messageContent = newMessage
    setNewMessage("")
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      conversation: activeConversation._id,
      sender: user?.id,
      content: messageContent,
      createdAt: new Date().toISOString(),
      read: false
    }
    setMessages(prev => [...prev, tempMessage])
    try {
      const res = await apiRequest<{ data: Message }>('/chats/send', {
        method: 'POST',
        body: { conversationId: activeConversation._id, content: messageContent }
      })
      setMessages(prev => prev.map(m => m._id === tempMessage._id ? res.data : m))
      setConversations(prev => prev.map(conv => 
        conv._id === activeConversation._id 
          ? { ...conv, lastMessage: res.data, updatedAt: res.data.createdAt }
          : conv
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()))
    } catch (err) {
      console.error(err)
      toast.error('Failed to send message')
      setMessages(prev => prev.filter(m => m._id !== tempMessage._id))
    }
  }

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find(p => p._id !== user?.id)
  }

  const filteredConversations = conversations.filter(c => (c.status || 'active') === activeTab)

  return (
    <DashboardLayout 
      user={user} 
      role={user?.role || (typeof window !== 'undefined' ? localStorage.getItem('userRole') : null) || 'INDIVIDUAL'}
    >
      <div className="h-[calc(100vh-140px)] flex bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-80 lg:w-96 border-r border-gray-100 flex flex-col bg-[#FDFDFD]">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Messages</h1>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-100">
                <Search className="w-5 h-5 text-gray-500" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'archived' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Archived
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input className="pl-9 bg-gray-50 border-none h-11 rounded-xl text-sm" placeholder="Search chats..." />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide px-3 pb-6">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="p-4 text-center text-gray-400 animate-pulse">Loading...</div>
              ) : filteredConversations.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 text-center text-gray-400">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Archive className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-sm font-bold">No {activeTab} chats</p>
                </motion.div>
              ) : (
                filteredConversations.map(conv => {
                  const other = getOtherParticipant(conv)
                  const isActive = activeConversation?._id === conv._id
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={conv._id} 
                      onClick={() => handleSelectConversation(conv)}
                      className={`p-4 mb-2 flex items-center gap-4 cursor-pointer rounded-2xl transition-all ${
                        isActive ? 'bg-green-50 shadow-sm' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="w-14 h-14 border-2 border-white shadow-sm rounded-2xl overflow-hidden">
                          <AvatarFallback className="bg-gray-100 text-[#4CAF50] font-black text-lg">
                            {other?.fullName?.[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                        {other?._id && onlineUsers.has(other._id) && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#4CAF50] border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={`font-black text-sm truncate ${isActive ? 'text-[#4CAF50]' : 'text-gray-900'}`}>
                            {other?.fullName || 'User'}
                          </h3>
                          <span className="text-[10px] font-bold text-gray-400">
                            {conv.updatedAt ? format(new Date(conv.updatedAt), 'HH:mm') : ''}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${conv.lastMessage?.read === false && !isActive ? 'font-black text-gray-900' : 'text-gray-500'}`}>
                          {conv.lastMessage?.content || 'New conversation'}
                        </p>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-12 h-12 border border-gray-100 rounded-2xl overflow-hidden">
                      <AvatarFallback className="bg-green-50 text-[#4CAF50] font-black">
                        {getOtherParticipant(activeConversation)?.fullName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {getOtherParticipant(activeConversation)?._id && onlineUsers.has(getOtherParticipant(activeConversation)._id) && (
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#4CAF50] border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 leading-none mb-1.5 flex items-center gap-2">
                      {getOtherParticipant(activeConversation)?.fullName}
                    </h2>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        getOtherParticipant(activeConversation)?._id && onlineUsers.has(getOtherParticipant(activeConversation)._id)
                          ? 'bg-[#4CAF50] animate-pulse'
                          : 'bg-gray-300'
                      }`} />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {getOtherParticipant(activeConversation)?._id && onlineUsers.has(getOtherParticipant(activeConversation)._id)
                          ? 'Active Now'
                          : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-[#4CAF50] hover:bg-green-50"><Video className="w-5 h-5"/></Button>
                  <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-[#4CAF50] hover:bg-green-50"><Info className="w-5 h-5"/></Button>
                  <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-5 h-5"/></Button>
                </div>
              </div>

              {/* Messages Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-[#FBFBFC]">
                {messages.map((msg, idx) => {
                  const isMine = msg.sender === user?.id
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: isMine ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={msg._id} 
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        <div className={`px-5 py-3 rounded-2xl text-sm shadow-sm leading-relaxed ${
                          isMine 
                            ? 'bg-[#4CAF50] text-white rounded-tr-none' 
                            : 'bg-white text-gray-700 rounded-tl-none border border-gray-100 shadow-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <div className="flex items-center gap-2 mt-2 px-1">
                          <span className="text-[10px] font-bold text-gray-400">
                            {format(new Date(msg.createdAt), 'HH:mm')}
                          </span>
                          {isMine && (
                            msg.read ? <CheckCheck className="w-3.5 h-3.5 text-[#4CAF50]" /> : <Check className="w-3.5 h-3.5 text-gray-300" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                {isOtherTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-100 px-5 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-[#4CAF50] rounded-full" />
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-[#4CAF50] rounded-full" />
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-[#4CAF50] rounded-full" />
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Typing</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-6 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:border-[#4CAF50]/30 focus-within:bg-white transition-all shadow-sm">
                  <div className="flex items-center px-2 border-r border-gray-200">
                    <Button type="button" variant="ghost" size="icon" className="text-gray-400 rounded-xl hover:text-[#4CAF50] hover:bg-white"><Paperclip className="w-5 h-5"/></Button>
                  </div>
                  <Input 
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value)
                      handleTyping()
                    }}
                    placeholder="Type your message..." 
                    className="bg-transparent border-none h-10 text-sm focus-visible:ring-0 px-2"
                  />
                  <div className="flex items-center gap-2 pr-2">
                    <Button type="button" variant="ghost" size="icon" className="text-gray-400 rounded-xl hover:text-[#4CAF50] hover:bg-white"><Smile className="w-5 h-5"/></Button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit" 
                      disabled={!newMessage.trim()}
                      className="bg-[#4CAF50] hover:bg-[#45a049] text-white rounded-xl p-2.5 shadow-lg shadow-green-100 disabled:opacity-50 transition-all flex items-center justify-center"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-[#FBFBFC]">
               <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 bg-white border border-gray-100 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-sm"
               >
                  <MessageSquare className="w-10 h-10 text-[#4CAF50]" />
               </motion.div>
               <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Your Conversations</h2>
               <p className="text-gray-500 max-w-sm leading-relaxed font-medium">Select a chat from the sidebar to start messaging donors, recipients or NGOs.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
