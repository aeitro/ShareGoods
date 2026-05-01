'use client'

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { apiRequest } from "@/lib/api-client"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Send,
  CheckCircle,
  PackageCheck,
  ShieldCheck,
  MessageSquare,
  AlertTriangle
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function MatchCoordinationPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params.id as string

  const [match, setMatch] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Chat state
  const [conversation, setConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scheduling state
  const [handoverDate, setHandoverDate] = useState("")
  const [handoverTime, setHandoverTime] = useState("")
  const [handoverLocation, setHandoverLocation] = useState("")
  const [handoverMethod, setHandoverMethod] = useState("pickup")
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false)

  // Polling interval
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) setCurrentUser(JSON.parse(userStr))

    fetchMatchData()
    const interval = setInterval(fetchMatchData, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [matchId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchMatchData = async () => {
    try {
      // 1. Fetch match details directly
      const matchRes = await apiRequest<{ data: any }>(`/matches/${matchId}`)
      const currentMatch = matchRes.data

      setMatch(currentMatch)

      // Initialize schedule state if not already set
      if (!handoverDate && currentMatch.handoverAt) {
        const d = new Date(currentMatch.handoverAt)
        setHandoverDate(d.toISOString().split('T')[0])
        setHandoverTime(d.toTimeString().slice(0, 5))
      }
      if (!handoverLocation && currentMatch.handoverLocation) {
        setHandoverLocation(currentMatch.handoverLocation)
      }
      if (currentMatch.handoverMethod) {
        setHandoverMethod(currentMatch.handoverMethod)
      }

      // 2. Determine partner for conversation
      const userStr = localStorage.getItem('user')
      const me = userStr ? JSON.parse(userStr) : null
      const partnerId =
        currentMatch.donor._id === me?.id
          ? currentMatch.recipient._id
          : currentMatch.donor._id

      // 3. Start or get conversation
      const convRes = await apiRequest<{ data: any }>('/chats/start', {
        method: 'POST',
        body: JSON.stringify({
          participantId: partnerId,
          itemId: currentMatch.item._id
        })
      })
      setConversation(convRes.data)

      // 4. Fetch messages
      if (convRes.data?._id) {
        const msgRes = await apiRequest<{ data: any[] }>(`/chats/messages/${convRes.data._id}`)
        setMessages(msgRes.data)
      }
    } catch (err) {
      console.error('Failed to load match data', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversation) return

    try {
      const res = await apiRequest('/chats/message', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: conversation._id,
          content: newMessage
        })
      })
      
      setMessages([...messages, res.data])
      setNewMessage("")
    } catch (err) {
      console.error("Failed to send message", err)
    }
  }

  const handleUpdateSchedule = async () => {
    setIsUpdatingSchedule(true)
    try {
      let datetime = null
      if (handoverDate && handoverTime) {
        datetime = new Date(`${handoverDate}T${handoverTime}`)
      }
      
      const res = await apiRequest(`/matches/${matchId}/schedule`, {
        method: 'PATCH',
        body: JSON.stringify({
          handoverAt: datetime,
          handoverLocation,
          handoverMethod
        })
      })
      
      setMatch(res.data)
      alert("Schedule proposed!")
    } catch (err) {
      alert("Failed to update schedule")
    } finally {
      setIsUpdatingSchedule(false)
    }
  }

  const handleConfirmHandover = async () => {
    try {
      const res = await apiRequest(`/matches/${matchId}/confirm-handover`, {
        method: 'POST'
      })
      
      setMatch(res.data)
      
      if (res.data.status === 'completed') {
        alert("Handover completed successfully! 🎉")
      } else {
        alert("Confirmation sent. Waiting for the other party.")
      }
    } catch (err) {
      alert("Failed to confirm handover")
    }
  }

  const handleToggleUrgency = async () => {
    try {
      const res = await apiRequest<{ data: any }>(`/matches/${matchId}/urgency`, {
        method: 'PATCH'
      })
      setMatch(res.data)
    } catch (err) {
      alert("Failed to update urgency status")
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading coordination space...</div>
  if (!match) return <div className="min-h-screen flex items-center justify-center">Match not found.</div>

  const isDonor = match.donor._id === currentUser?.id
  const partner = isDonor ? match.recipient : match.donor
  const myConfirmation = isDonor ? match.donorConfirmedHandover : match.recipientConfirmedHandover
  const partnerConfirmation = isDonor ? match.recipientConfirmedHandover : match.donorConfirmedHandover

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-12">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={isDonor ? "/dashboard/donor" : "/dashboard/recipient"} className="text-gray-500 hover:text-gray-900 transition-colors flex items-center">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              match.status === 'completed' ? 'bg-green-100 text-green-800' :
              match.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {match.status.toUpperCase()}
            </span>
            {match.isUrgent && (
              <span className="flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold animate-pulse">
                <AlertTriangle className="w-3 h-3 mr-1" />
                URGENT
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Logistics & Item Details */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Partner Info */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Coordinating With
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                    {partner?.avatarUrl ? (
                      <Image src={partner.avatarUrl} alt="Partner" width={48} height={48} className="object-cover" />
                    ) : (
                      <span className="text-xl text-gray-500 font-bold">{partner?.fullName?.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{partner?.fullName}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <ShieldCheck className="w-4 h-4 mr-1 text-[#A7D129]" />
                      Reputation: {partner?.reputationScore || 50}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Handover Logistics */}
            <Card className="border-0 shadow-sm border-t-4 border-t-[#A7D129]">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Pickup Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                    <select 
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      value={handoverMethod}
                      onChange={(e) => setHandoverMethod(e.target.value)}
                      disabled={match.status === 'completed' || myConfirmation}
                    >
                      <option value="pickup">Recipient Pick-up</option>
                      <option value="dropoff">Donor Drop-off</option>
                      <option value="meetup">Public Meetup</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <Input 
                        type="date" 
                        value={handoverDate} 
                        onChange={(e) => setHandoverDate(e.target.value)}
                        disabled={match.status === 'completed' || myConfirmation}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <Input 
                        type="time" 
                        value={handoverTime} 
                        onChange={(e) => setHandoverTime(e.target.value)}
                        disabled={match.status === 'completed' || myConfirmation}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <Textarea 
                      placeholder="e.g. Starbucks at Main St." 
                      value={handoverLocation}
                      onChange={(e) => setHandoverLocation(e.target.value)}
                      disabled={match.status === 'completed' || myConfirmation}
                      rows={2}
                    />
                  </div>
                  
                  {match.status !== 'completed' && !myConfirmation && (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={handleUpdateSchedule}
                      disabled={isUpdatingSchedule}
                    >
                      Propose / Update Time
                    </Button>
                  )}
                </div>

                <hr className="my-6 border-gray-100" />

                {/* Urgency Toggle (Recipient Only) */}
                {!isDonor && match.status !== 'completed' && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className={`w-4 h-4 ${match.isUrgent ? 'text-amber-600' : 'text-gray-400'}`} />
                        <div>
                          <Label htmlFor="urgency-toggle" className="text-sm font-bold text-gray-900">Mark as Urgent</Label>
                          <p className="text-[10px] text-gray-500">Alert donor of immediate need</p>
                        </div>
                      </div>
                      <Switch 
                        id="urgency-toggle"
                        checked={match.isUrgent}
                        onCheckedChange={handleToggleUrgency}
                      />
                    </div>
                  </div>
                )}

                {/* Handover Confirmation Block */}
                <div>
                  <h3 className="text-md font-bold text-gray-900 mb-4">Finalize Handover</h3>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    {myConfirmation ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 text-yellow-500" />}
                    <span className="text-sm text-gray-700">You confirmed</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    {partnerConfirmation ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 text-yellow-500" />}
                    <span className="text-sm text-gray-700">{partner?.fullName.split(' ')[0]} confirmed</span>
                  </div>

                  {match.status !== 'completed' ? (
                    <Button 
                      className="w-full bg-[#A7D129] hover:bg-[#8eb822] text-gray-900 font-semibold"
                      onClick={handleConfirmHandover}
                      disabled={myConfirmation}
                    >
                      <PackageCheck className="w-4 h-4 mr-2" />
                      {myConfirmation ? "Waiting for Partner..." : "Confirm Item Received/Given"}
                    </Button>
                  ) : (
                    <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200 text-green-800 text-sm font-medium">
                      Handover Complete! 🎉
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
          </div>

          {/* Right Column: Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm h-[600px] flex flex-col bg-white">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50 rounded-t-xl">
                <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden relative mr-3 border border-gray-300">
                  <Image src={match.item?.images?.[0] || "/placeholder.svg"} alt="item" fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{match.item?.name}</h3>
                  <p className="text-xs text-gray-500">In-transit coordination chat</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                    <p>Send a message to coordinate pickup.</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.sender === currentUser?.id
                    return (
                      <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isMe ? 'bg-[#A7D129] text-gray-900 rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <span className="text-[10px] opacity-70 block mt-1 text-right">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-50 border-gray-200"
                  />
                  <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white px-3">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>

        </div>
      </main>
    </div>
  )
}
