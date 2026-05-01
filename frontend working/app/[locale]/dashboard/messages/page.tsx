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
  Check, CheckCheck, Clock
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

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
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (userData) setUser(JSON.parse(userData))
    
    if (token) {
      initSocket(token)
      fetchConversations()
    }

    const socket = getSocket()
    if (socket) {
      socket.on('new_message', (message: Message) => {
        if (activeConversation?._id === message.conversation) {
          setMessages(prev => [...prev, message])
          // Mark as read if we are in the chat
          markRead(message.conversation)
        }
        // Update conversation list last message
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
      setConversations(res.data)
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
      if (socket) {
        socket.emit('join_conversation', convId)
      }
      
      // Mark as read
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

    // Optimistic UI update
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
      if (!navigator.onLine) {
        // Queue message offline
        const { db } = await import('@/lib/db')
        await db.actions.add({
          type: 'SEND_MESSAGE',
          payload: {
            conversationId: activeConversation._id,
            content: messageContent
          },
          endpoint: '/chats/send',
          method: 'POST',
          createdAt: Date.now()
        })
        toast.success('Message queued offline')
        return
      }

      const res = await apiRequest<{ data: Message }>('/chats/send', {
        method: 'POST',
        body: {
          conversationId: activeConversation._id,
          content: messageContent
        }
      })
      
      // Replace temp message with real one
      setMessages(prev => prev.map(m => m._id === tempMessage._id ? res.data : m))
      
      // Update conversations list immediately
      setConversations(prev => prev.map(conv => 
        conv._id === activeConversation._id 
          ? { ...conv, lastMessage: res.data, updatedAt: res.data.createdAt }
          : conv
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()))
      
    } catch (err) {
      console.error(err)
      toast.error('Failed to send message')
      // Remove temp message on error if offline queuing failed
      setMessages(prev => prev.filter(m => m._id !== tempMessage._id))
    }
  }

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find(p => p._id !== user?.id)
  }

  return (
    <div className="h-[calc(100vh-120px)] flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-50">
          <h1 className="text-xl font-black text-gray-900 mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input className="pl-9 bg-gray-50 border-none h-10" placeholder="Search conversations..." />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400">Loading chats...</div>
          ) : conversations.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Smile className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm">No messages yet.</p>
            </div>
          ) : (
            conversations.map(conv => {
              const other = getOtherParticipant(conv)
              const isActive = activeConversation?._id === conv._id
              return (
                <div 
                  key={conv._id} 
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-l-4 ${
                    isActive ? 'bg-[#A7D129]/5 border-[#A7D129]' : 'hover:bg-gray-50 border-transparent'
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-gray-100 text-gray-600 font-bold">
                        {other?.fullName?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    {other?._id && onlineUsers.has(other._id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#A7D129] border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{other?.fullName || 'User'}</h3>
                      <span className="text-[10px] text-gray-400">
                        {conv.updatedAt ? format(new Date(conv.updatedAt), 'HH:mm') : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {conv.lastMessage?.content || 'Started a conversation'}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-gray-100">
                  <AvatarFallback className="bg-[#A7D129]/10 text-[#A7D129] font-bold">
                    {getOtherParticipant(activeConversation)?.fullName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-bold text-gray-900 leading-none mb-1">
                    {getOtherParticipant(activeConversation)?.fullName}
                  </h2>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      getOtherParticipant(activeConversation)?._id && onlineUsers.has(getOtherParticipant(activeConversation)._id)
                        ? 'bg-[#A7D129]'
                        : 'bg-gray-300'
                    }`} />
                    <span className="text-[10px] text-gray-400 font-medium">
                      {getOtherParticipant(activeConversation)?._id && onlineUsers.has(getOtherParticipant(activeConversation)._id)
                        ? 'Online'
                        : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#A7D129]"><Phone className="w-4 h-4"/></Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#A7D129]"><Video className="w-4 h-4"/></Button>
                <Button variant="ghost" size="icon" className="text-gray-400"><MoreVertical className="w-4 h-4"/></Button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              {messages.map((msg, idx) => {
                const isMine = msg.sender === user?.id
                return (
                  <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] group ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                        isMine 
                          ? 'bg-[#A7D129] text-gray-900 rounded-tr-none' 
                          : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                      }`}>
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-1">
                         <span className="text-[10px] text-gray-400">
                           {format(new Date(msg.createdAt), 'HH:mm')}
                         </span>
                         {isMine && (
                           msg.read ? <CheckCheck className="w-3 h-3 text-[#A7D129]" /> : <Check className="w-3 h-3 text-gray-300" />
                         )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {isOtherTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 px-4 py-2 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-[#A7D129] rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-[#A7D129] rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-[#A7D129] rounded-full animate-bounce" />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium italic">typing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" className="text-gray-400 shrink-0"><Paperclip className="w-5 h-5"/></Button>
                <Button type="button" variant="ghost" size="icon" className="text-gray-400 shrink-0"><ImageIcon className="w-5 h-5"/></Button>
                <div className="flex-1 relative">
                  <Input 
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value)
                      handleTyping()
                    }}
                    placeholder="Type a message..." 
                    className="bg-gray-50 border-none pr-10 focus-visible:ring-[#A7D129]"
                  />
                  <Smile className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 cursor-pointer hover:text-[#A7D129] transition-colors" />
                </div>
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="bg-[#A7D129] hover:bg-[#8eb322] text-gray-900 rounded-xl px-4 shadow-md shadow-[#A7D129]/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
             <div className="w-20 h-20 bg-[#A7D129]/10 rounded-full flex items-center justify-center mb-6">
                <Send className="w-10 h-10 text-[#A7D129]" />
             </div>
             <h2 className="text-2xl font-black text-gray-900 mb-2">Your Conversations</h2>
             <p className="text-gray-500 max-w-sm">Select a chat from the sidebar to start messaging donors, recipients or NGOs.</p>
          </div>
        )}
      </div>
    </div>
  )
}
