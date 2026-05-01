'use client'

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { apiRequest } from "@/lib/api-client"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Bookmark,
  Package,
  Clock,
  Users,
  MapPin,
  Filter,
  Search,
  Eye,
  MessageCircle,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard/layout"
import { getStatusColor, getStatusText } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface AvailableItem {
  id: string
  name: string
  category: string
  condition: string
  image: string
  location: string
  donor: string
  datePosted: string
  description: string
  distance: string
  donorReputation: number
}

interface MyRequest {
  id: string
  itemName: string
  status: string
  requestDate: string
  donor?: string
  image: string
  category: string
}

export default function RecipientDashboard() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [availableItems, setAvailableItems] = useState<AvailableItem[]>([])
  const [myRequests, setMyRequests] = useState<MyRequest[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [savedItemIds, setSavedItemIds] = useState<Set<string>>(new Set())
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userStr = localStorage.getItem('user')
        if (userStr) setUser(JSON.parse(userStr))

        // Fetch my requests
        const requestsRes = await apiRequest<{ data: any[] }>('/matches')
        setMyRequests(requestsRes.data.map(m => ({
          id: m._id,
          itemName: m.item?.name || "Deleted Item",
          status: m.status,
          requestDate: m.createdAt,
          donor: m.donor?.fullName,
          image: m.item?.images?.[0] || "/placeholder.svg",
          category: m.item?.category || "N/A"
        })))

        // Fetch saved item IDs
        const savedRes = await apiRequest<{ data: any[] }>('/saved-listings/my')
        const ids = new Set(savedRes.data.map(s => s.item?._id).filter(Boolean))
        setSavedItemIds(ids)
      } catch (error) {
        console.error("Failed to fetch recipient data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => console.error("Geolocation error:", error)
      )
    }
  }, [])

  useEffect(() => {
    const fetchAvailableItems = async () => {
      try {
        const params = new URLSearchParams()
        params.append('status', 'available')
        if (selectedCategory !== 'all') params.append('category', selectedCategory)
        if (searchQuery) params.append('search', searchQuery)
        if (location) {
          params.append('lat', location.lat.toString())
          params.append('lng', location.lng.toString())
        }

        const itemsRes = await apiRequest<{ data: any[] }>(`/items?${params.toString()}`)
        setAvailableItems(itemsRes.data.map(item => ({
          id: item._id,
          name: item.name,
          category: item.category,
          condition: item.condition || "Good",
          image: item.images[0] || "/placeholder.svg",
          location: item.location?.address || item.location,
          donor: item.donor?.fullName || "Anonymous",
          datePosted: item.createdAt,
          description: item.description,
          distance: item.distance ? `${(item.distance / 1000).toFixed(1)} km` : "Nearby",
          donorReputation: item.donor?.reputationScore || 50
        })))
      } catch (error) {
        console.error("Failed to fetch items:", error)
      }
    }

    const delayDebounceFn = setTimeout(() => {
      fetchAvailableItems()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [selectedCategory, searchQuery, location])

  const stats = useMemo(() => ({
    itemsReceived: myRequests.filter(r => r.status === 'completed').length,
    pendingRequests: myRequests.filter(r => r.status === 'pending').length,
    donorsMatched: myRequests.filter(r => ['approved', 'matched', 'confirmed'].includes(r.status)).length,
  }), [myRequests])

  const categories = ["all", "Clothing", "Shoes", "Books", "Toys", "Electronics", "Household Items", "Furniture"]

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <DashboardLayout user={user} role={user?.role || "INDIVIDUAL"}>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, <span className="text-[#4CAF50]">{user?.role === "NGO" ? user?.organizationName : user?.fullName}</span>!
          </h1>
          <p className="text-gray-600">
            {user?.role === "NGO"
              ? "Manage your organization's donation requests and help your community."
              : "Find the items you need from generous donors in your community."}
          </p>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-[#4CAF50]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.itemsReceived}</p>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Items Received</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Pending Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.donorsMatched}</p>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Donors Matched</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Available Items Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900">Available Near You</h2>
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Search items..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#4CAF50]/20"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c === 'all' ? 'All' : c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {availableItems.map((item) => (
                <Card key={item.id} className="group bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <button className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 backdrop-blur-md text-gray-400 hover:text-[#A7D129] shadow-sm transition-colors">
                      <Bookmark className={`w-4 h-4 ${savedItemIds.has(item.id) ? "fill-current text-[#A7D129]" : ""}`} />
                    </button>
                    <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                      <Badge className="bg-white/90 backdrop-blur-md text-gray-900 hover:bg-white">{item.condition}</Badge>
                      <Badge className="bg-[#4CAF50] text-white border-0">{item.distance}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#4CAF50] transition-colors">{item.name}</h3>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{item.category}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10">{item.description}</p>
                    
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500">
                          {item.donor.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-gray-700">{item.donor}</span>
                      </div>
                      <Link href={`/dashboard/recipient/item/${item.id}`}>
                        <Button size="sm" className="bg-[#4CAF50] hover:bg-[#45a049] text-white rounded-xl">View Details</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {availableItems.length === 0 && (
              <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 text-lg">No items found</h3>
                <p className="text-gray-500 max-w-xs mx-auto">Try adjusting your filters or searching for something else.</p>
              </div>
            )}
          </div>

          {/* My Requests */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <div className="space-y-4">
              {myRequests.map((request) => (
                <Card key={request.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden border-l-4 border-l-[#4CAF50]">
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={request.image}
                          alt={request.itemName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-bold text-gray-900 text-sm truncate">{request.itemName}</h4>
                          <Badge className={getStatusColor(request.status)} variant="secondary">
                            {getStatusText(request.status)}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">{request.category}</p>
                        
                        {['approved', 'matched', 'confirmed'].includes(request.status) && (
                          <Button size="sm" className="w-full bg-[#A7D129] hover:bg-[#8eb822] text-gray-900 text-xs font-bold rounded-xl h-8" asChild>
                            <Link href={`/dashboard/shared/match/${request.id}`}>
                              <MessageCircle className="w-3 h-3 mr-1.5" />
                              Coordinate Pickup
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {myRequests.length === 0 && (
                <div className="p-8 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium">Your requests will appear here once you find something you need.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
