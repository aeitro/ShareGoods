'use client'

import { useState, useEffect } from "react"
import { apiRequest } from "@/lib/api-client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bookmark, BookmarkX, Package, Star, MapPin } from "lucide-react"
import Link from "next/link"

interface SavedItem {
  _id: string
  item: {
    _id: string
    name: string
    category: string
    condition: string
    images: string[]
    description: string
    location: string
    status: string
    donor: {
      fullName: string
      reputationScore: number
      avatarUrl: string
    }
  }
  createdAt: string
}

export default function SavedListingsPage() {
  const [saved, setSaved] = useState<SavedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiRequest<{ data: SavedItem[] }>('/saved-listings/my')
        setSaved(res.data)
      } catch (err) {
        console.error("Failed to load saved listings", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleUnsave = async (itemId: string) => {
    setRemoving(itemId)
    try {
      await apiRequest(`/saved-listings/${itemId}`, { method: 'DELETE' })
      setSaved(prev => prev.filter(s => s.item._id !== itemId))
    } catch (err) {
      alert("Failed to remove bookmark")
    } finally {
      setRemoving(null)
    }
  }

  const conditionColor = (c: string) => {
    if (c === 'Good') return 'bg-green-100 text-green-700'
    if (c === 'Fair') return 'bg-yellow-100 text-yellow-700'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-12">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard/recipient" className="text-gray-500 hover:text-gray-900 flex items-center">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Link>
          <h1 className="font-bold text-gray-900">Saved Items</h1>
          <span className="text-sm text-gray-400">{saved.length} saved</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-[#A7D129] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : saved.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-14 text-center">
              <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">No saved items yet</h3>
              <p className="text-gray-500 text-sm mb-6">Bookmark items from the browse feed to keep track of them here.</p>
              <Link href="/dashboard/recipient">
                <Button className="bg-[#A7D129] hover:bg-[#8eb822] text-gray-900">Browse Items</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {saved.map(({ _id, item, createdAt }) => (
              <Card key={_id} className="border-0 shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="relative h-44 bg-gray-100">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-10 h-10 text-gray-300" />
                    </div>
                  )}
                  {item.status !== 'available' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-white text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                        No longer available
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => handleUnsave(item._id)}
                    disabled={removing === item._id}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors"
                    title="Remove bookmark"
                  >
                    <BookmarkX className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 leading-tight">{item.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ml-2 flex-shrink-0 ${conditionColor(item.condition)}`}>
                      {item.condition}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                        {item.donor?.avatarUrl ? (
                          <img src={item.donor.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#A7D129]/30 flex items-center justify-center text-[10px] font-bold text-[#7ba017]">
                            {item.donor?.fullName?.[0]}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{item.donor?.fullName}</span>
                      <div className="flex items-center space-x-0.5">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-gray-500">{item.donor?.reputationScore?.toFixed(0)}</span>
                      </div>
                    </div>
                    {item.status === 'available' && (
                      <Link href={`/dashboard/recipient/item/${item._id}`}>
                        <Button size="sm" className="text-xs bg-[#A7D129] hover:bg-[#8eb822] text-gray-900">
                          Request
                        </Button>
                      </Link>
                    )}
                  </div>

                  <p className="text-xs text-gray-300 mt-2">Saved {new Date(createdAt).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
