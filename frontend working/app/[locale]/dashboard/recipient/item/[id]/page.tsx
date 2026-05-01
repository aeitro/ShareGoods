'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api-client"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  MapPin,
  Clock,
  MessageCircle,
  Package,
  Heart,
  ShieldCheck
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ItemDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string

  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [requestNote, setRequestNote] = useState("")
  const [isRequesting, setIsRequesting] = useState(false)
  const [requestError, setRequestError] = useState("")
  const [requestSuccess, setRequestSuccess] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const allItemsRes = await apiRequest<{ data: any[] }>(`/items`);
        const foundItem = allItemsRes.data.find(i => i._id === itemId);
        if (foundItem) {
          setItem(foundItem);
        } else {
          setRequestError("Item not found");
        }
      } catch (err) {
        setRequestError("Failed to load item details");
      } finally {
        setLoading(false)
      }
    }
    fetchItem()
  }, [itemId])

  const handleRequestItem = async () => {
    setIsRequesting(true)
    setRequestError("")
    try {
      await apiRequest('/matches/request', {
        method: 'POST',
        body: JSON.stringify({
          itemId: item._id,
          initialMessage: requestNote
        })
      })
      setRequestSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/recipient')
      }, 2000)
    } catch (err: any) {
      setRequestError(err.message || "Failed to request item. You may have already requested this.")
    } finally {
      setIsRequesting(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading item details...</div>
  }

  if (!item) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900">Item not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/recipient')}>
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
          <Link href="/dashboard/recipient" className="text-gray-500 hover:text-gray-900 transition-colors flex items-center">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative border border-gray-100">
              <Image
                src={item.images?.[0] || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            {item.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {item.images.slice(1).map((img: string, i: number) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative border border-gray-100">
                    <Image src={img} alt={`${item.name} ${i+2}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                  {item.category}
                </span>
                <span className="px-2 py-1 bg-[#A7D129]/10 text-[#7ba017] rounded-md text-xs font-medium">
                  {item.condition || "Good"} Condition
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.name}</h1>
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="py-6 border-y border-gray-100 space-y-4">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                <span>{item.location} (Exact address hidden until matched)</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-3 text-gray-400" />
                <span>Posted {new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Package className="w-5 h-5 mr-3 text-gray-400" />
                <span>Quantity: {item.quantity || 1}</span>
              </div>
            </div>

            {/* Donor Info */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {item.donor?.avatarUrl ? (
                  <Image src={item.donor.avatarUrl} alt="Donor" width={48} height={48} className="object-cover" />
                ) : (
                  <span className="text-xl text-gray-500 font-bold">{item.donor?.fullName?.charAt(0) || "A"}</span>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{item.donor?.fullName?.split(' ')[0]}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <ShieldCheck className="w-4 h-4 mr-1 text-[#A7D129]" />
                  Reputation: {item.donor?.reputationScore || 50}
                </div>
              </div>
            </div>

            {/* Request Form */}
            <Card className="border-0 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6">
                <h3 className="font-medium text-gray-900 mb-4">Request this item</h3>
                
                {requestSuccess ? (
                  <div className="bg-[#A7D129]/10 border border-[#A7D129]/20 rounded-lg p-4 text-center">
                    <Heart className="w-8 h-8 text-[#A7D129] mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Request Sent!</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      The donor has been notified. We'll let you know if they accept your request.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message to Donor (Optional)
                      </label>
                      <Textarea
                        placeholder="Hi! I could really use this because..."
                        value={requestNote}
                        onChange={(e) => setRequestNote(e.target.value)}
                        className="resize-none"
                        rows={3}
                      />
                    </div>
                    
                    {requestError && (
                      <p className="text-sm text-red-600">{requestError}</p>
                    )}

                    <Button 
                      className="w-full bg-[#A7D129] hover:bg-[#8eb822] text-gray-900 font-semibold"
                      onClick={handleRequestItem}
                      disabled={isRequesting}
                    >
                      {isRequesting ? "Sending Request..." : "Send Request"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
