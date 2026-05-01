'use client'

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Heart,
  Plus,
  Package,
  Truck,
  Users,
  MapPin,
  Trash2,
  MessageCircle,
  Eye,
  Search,
  Filter,
  Leaf,
  ChevronDown,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { apiRequest } from "@/lib/api-client"
import DashboardLayout from "@/components/dashboard/layout"
import { getStatusColor, getStatusText } from "@/lib/utils"
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts"

interface Listing {
  id: string
  name: string
  status: string
  donatedTo?: string
  date: string
  image: string
  category: string
  views: number
  donationType: 'free' | 'sell'
}

const COLORS = ["#4CAF50", "#2196F3", "#9C27B0", "#FFC107", "#F44336"]

export default function DonorDashboard() {
  const [activeTab, setActiveTab] = useState("all")
  const [listings, setListings] = useState<Listing[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userStr = localStorage.getItem('user')
        if (userStr) setUser(JSON.parse(userStr))

        const res = await apiRequest<{ data: any[] }>('/items/my-items')
        setListings(res.data.map(item => ({
          id: item._id,
          name: item.name,
          status: item.status,
          donatedTo: item.matchedWith?.fullName,
          date: item.createdAt,
          image: item.images[0] || "/placeholder.svg",
          category: item.category,
          views: item.viewCount || 0,
          donationType: item.donationType || 'free'
        })))
      } catch (error) {
        console.error("Failed to fetch donor data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const stats = useMemo(() => ({
    totalDonations: listings.filter(l => l.donationType === 'free').length,
    totalSales: listings.filter(l => l.donationType === 'sell').length,
    peopleHelped: listings.filter(l => l.status === 'completed').length,
    co2Saved: listings.filter(l => l.status === 'completed').length * 5,
  }), [listings])

  const chartData = useMemo(() => {
    const categories: Record<string, number> = {}
    listings.forEach(l => {
      categories[l.category] = (categories[l.category] || 0) + 1
    })
    return Object.entries(categories).map(([name, value]) => ({ name, value }))
  }, [listings])

  const filteredListings = listings.filter((listing) => {
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "active" && listing.status === "available") ||
      (activeTab === "completed" && listing.status === "completed")
    
    const matchesSearch = 
      listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.category.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesTab && matchesSearch
  })

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading your dashboard...</p>
      </div>
    </div>
  )

  return (
    <DashboardLayout user={user} role="DONOR">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Hello, <span className="text-[#4CAF50]">{user?.fullName}</span>!
              </h1>
              <p className="text-gray-600">Your kindness is making a real difference in the community.</p>
            </div>
            <Link href="/dashboard/donor/donate">
              <Button className="bg-[#4CAF50] hover:bg-[#45a049] text-white px-8 h-12 rounded-xl shadow-lg shadow-green-200 transition-all duration-200 hover:scale-105">
                <Plus className="w-5 h-5 mr-2" />
                Donate New Item
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#4CAF50]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Donations</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalDonations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sales</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalSales}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Impacted</p>
                  <p className="text-xl font-bold text-gray-900">{stats.peopleHelped}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">CO₂ Saved</p>
                  <p className="text-xl font-bold text-gray-900">{stats.co2Saved} kg</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900">Your Listings</h2>
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Search your items..." 
                    className="pl-10 h-10 rounded-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden sm:block">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-32 h-32 relative rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={listing.image}
                          alt={listing.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-bold text-gray-900 truncate">{listing.name}</h3>
                          <Badge className={getStatusColor(listing.status)}>
                            {getStatusText(listing.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{listing.category}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center"><Eye className="w-3 h-3 mr-1" /> {listing.views} views</span>
                          <span className="flex items-center"><Plus className="w-3 h-3 mr-1" /> {new Date(listing.date).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          {listing.donatedTo && (
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                <Users className="w-3 h-3 text-[#4CAF50]" />
                              </div>
                              <span className="text-xs text-gray-600">Matched with {listing.donatedTo}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 ml-auto">
                            <Button variant="outline" size="sm" className="h-8 rounded-lg">Manage</Button>
                            <Button size="sm" className="h-8 rounded-lg bg-[#4CAF50] hover:bg-[#45a049] text-white">View Match</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredListings.length === 0 && (
                <div className="py-20 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No listings found matching your criteria.</p>
                  <Button variant="link" onClick={() => {setActiveTab('all'); setSearchQuery('')}} className="text-[#4CAF50]">
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-white border-0 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-6">Impact Analysis</h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {chartData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-xs text-gray-600 truncate">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#4CAF50] text-white border-0 shadow-lg shadow-green-100 overflow-hidden relative">
              <CardContent className="p-6 relative z-10">
                <Leaf className="w-12 h-12 text-white/20 absolute -right-2 -bottom-2 rotate-12" />
                <h3 className="font-bold text-lg mb-2">Sustainable Donor</h3>
                <p className="text-white/80 text-sm mb-4">You've saved {stats.co2Saved}kg of CO₂ from entering the atmosphere by donating items instead of discarding them.</p>
                <div className="bg-white/20 h-2 w-full rounded-full overflow-hidden">
                  <div className="bg-white h-full w-[65%]" />
                </div>
                <p className="text-[10px] mt-2 font-bold uppercase tracking-wider">Silver Badge • 35kg to Gold</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
