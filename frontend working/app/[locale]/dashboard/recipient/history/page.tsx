'use client'

import { useState, useEffect } from "react"
import { apiRequest } from "@/lib/api-client"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Clock, Package, CheckCircle } from "lucide-react"
import Link from "next/link"

interface HistoryItem {
  matchId: string
  item: {
    _id: string
    name: string
    category: string
    images: string[]
    description: string
    condition: string
  }
  donor: {
    fullName: string
    avatarUrl: string
    reputationScore: number
  }
  completedAt: string
  handoverMethod: string
}

export default function ReceivedHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiRequest<{ data: HistoryItem[] }>('/impact/received')
        setHistory(res.data)
      } catch (err) {
        console.error("Failed to load history", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const methodLabel = (method: string) => {
    const map: Record<string, string> = { pickup: '🏠 Pickup', dropoff: '📦 Drop-off', meetup: '🤝 Meetup' }
    return map[method] || method
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-12">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard/recipient" className="text-gray-500 hover:text-gray-900 flex items-center">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Link>
          <h1 className="font-bold text-gray-900">Items I've Received</h1>
          <span className="text-sm text-gray-400">{history.length} total</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-8 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-[#A7D129] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-14 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">No items received yet</h3>
              <p className="text-gray-500 text-sm">Items you receive through completed matches will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          history.map((h) => (
            <Card key={h.matchId} className="border-0 shadow-sm bg-white">
              <CardContent className="p-5">
                <div className="flex items-start space-x-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {h.item?.images?.[0] ? (
                      <img src={h.item.images[0]} alt={h.item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-7 h-7 text-gray-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 leading-tight">{h.item?.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{h.item?.category}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-[#A7D129] flex-shrink-0 ml-2" />
                    </div>

                    <div className="flex items-center flex-wrap gap-2 mt-2">
                      {/* Donor */}
                      <div className="flex items-center space-x-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#A7D129]/20 overflow-hidden flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-[#7ba017]">
                          {h.donor?.avatarUrl ? (
                            <img src={h.donor.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            h.donor?.fullName?.[0]
                          )}
                        </div>
                        <span className="text-xs text-gray-600">From {h.donor?.fullName}</span>
                      </div>

                      {/* Method */}
                      <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded">
                        {methodLabel(h.handoverMethod)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 mt-2 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Received {new Date(h.completedAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  )
}
