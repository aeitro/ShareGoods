'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { apiRequest } from "@/lib/api-client"
import {
  ArrowLeft,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertTriangle
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function DonorRequestsPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await apiRequest<{ data: any[] }>('/matches')
        // Filter to only pending requests for the donor
        const pending = res.data.filter(m => m.status === 'pending')
        setMatches(pending)
      } catch (err) {
        console.error("Failed to load requests", err)
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
  }, [])

  const handleAction = async (matchId: string, status: 'confirmed' | 'declined') => {
    try {
      await apiRequest(`/matches/${matchId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
      
      // Remove from list
      setMatches(prev => prev.filter(m => m._id !== matchId))
      
      if (status === 'confirmed') {
        // Redirect to shared coordination view
        router.push(`/dashboard/shared/match/${matchId}`)
      }
    } catch (err) {
      alert(`Failed to ${status} request.`)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-12">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
          <Link href="/dashboard/donor" className="text-gray-500 hover:text-gray-900 transition-colors flex items-center">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Inbox</h1>
          <p className="text-gray-600">Review and respond to incoming requests for your items.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading requests...</div>
        ) : matches.length === 0 ? (
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
              <p className="text-gray-500">
                You don't have any new requests to review at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {matches.map((match) => (
              <Card key={match._id} className="bg-white border-0 shadow-sm overflow-hidden">
                <div className="p-6 flex flex-col md:flex-row gap-6">
                  {/* Item Image */}
                  <div className="w-full md:w-48 h-48 bg-gray-100 rounded-xl flex-shrink-0 relative overflow-hidden">
                    <Image
                      src={match.item?.images?.[0] || "/placeholder.svg"}
                      alt={match.item?.name || "Item"}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium mb-2 inline-block">
                            {match.item?.category}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900">{match.item?.name}</h3>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(match.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {match.isUrgent && (
                        <div className="flex items-center space-x-2 mb-4 bg-amber-50 text-amber-700 px-3 py-2 rounded-lg border border-amber-100 animate-pulse">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">High Urgency Request</span>
                        </div>
                      )}
                      
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {match.recipient?.fullName?.charAt(0) || "R"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {match.recipient?.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Reputation: {match.recipient?.reputationScore || 50}
                            </p>
                          </div>
                        </div>
                        {match.initialMessage ? (
                          <p className="text-sm text-gray-600 italic">"{match.initialMessage}"</p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No message provided.</p>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <Button
                        className="flex-1 bg-[#A7D129] hover:bg-[#8eb822] text-gray-900"
                        onClick={() => handleAction(match._id, 'confirmed')}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept & Schedule
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        onClick={() => handleAction(match._id, 'declined')}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
