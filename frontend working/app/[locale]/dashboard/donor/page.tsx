'use client'

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Package,
  Truck,
  Users,
  Eye,
  Search,
  Leaf,
} from "lucide-react"
import Image from "next/image"
import { Link } from "@/navigation"
import { apiRequest } from "@/lib/api-client"
import DashboardLayout from "@/components/dashboard/layout"
import { getStatusColor, getStatusText } from "@/lib/utils"
import { StatsSkeleton, ListingSkeleton, ChartSkeleton } from "@/components/dashboard/DashboardSkeleton"

// Dynamic import for the chart component to optimize bundle size
const DonationTrends = dynamic(() => import("@/components/dashboard/DonationTrends"), {
  loading: () => <ChartSkeleton />,
  ssr: false
})

interface Listing {
  id: string
  name: string
  status: string
  donatedTo?: string
  date: string
  image: string
  category: string
  views: number
}

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
        if (userStr) {
          setUser(JSON.parse(userStr))
        } else {
          // Fallback: Sync user if missing from localStorage
          try {
            const profileRes = await apiRequest<{ data: any }>('/profile/me')
            if (profileRes.data) {
              const profileData = profileRes.data;
              setUser(profileData)
              localStorage.setItem('user', JSON.stringify(profileData))
              if (profileData.role) localStorage.setItem('userRole', profileData.role)
            }
          } catch (err) {
            console.error("Failed to sync user data in dashboard:", err)
          }
        }

        const res = await apiRequest<{ data: any[] }>('/items/my-items')
        setListings(res.data.map(item => ({
          id: item.id,
          name: item.name,
          status: item.status,
          donatedTo: item.matches?.[0]?.recipient?.full_name,
          date: item.created_at,
          image: item.item_images?.[0]?.image_path || "/placeholder.svg",
          category: item.category,
          views: item.view_count || 0,
          donationType: 'free'
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
    totalDonations: listings.length,
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
            <Link href="/dashboard/donor/add-item">
              <Button className="bg-[#4CAF50] hover:bg-[#45a049] text-white px-8 h-12 rounded-xl shadow-lg shadow-green-200 transition-all duration-200 hover:scale-105 active:scale-95">
                <Plus className="w-5 h-5 mr-2" />
                Donate New Item
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            Array(4).fill(0).map((_, i) => <StatsSkeleton key={i} />)
          ) : (
            <>
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
            </>
          )}
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
                    className="pl-10 h-10 rounded-lg border-gray-200 focus:ring-[#4CAF50] transition-shadow"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden sm:block">
                  <TabsList className="bg-gray-100/80">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="grid gap-4">
              {loading ? (
                Array(3).fill(0).map((_, i) => <ListingSkeleton key={i} />)
              ) : (
                <>
                  {filteredListings.map((listing) => (
                    <Card key={listing.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200 group rounded-2xl overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="w-full sm:w-32 h-32 relative rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                            <Image
                              src={listing.image}
                              alt={listing.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-bold text-gray-900 truncate group-hover:text-[#4CAF50] transition-colors">{listing.name}</h3>
                              <Badge className={`${getStatusColor(listing.status)} rounded-full px-3 py-0.5`}>
                                {getStatusText(listing.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mb-2 font-medium">{listing.category}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-400 font-bold uppercase tracking-wider">
                              <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md"><Eye className="w-3 h-3 mr-1" /> {listing.views}</span>
                              <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md"><Plus className="w-3 h-3 mr-1" /> {new Date(listing.date).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                              {listing.donatedTo && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center">
                                    <Users className="w-3.5 h-3.5 text-[#4CAF50]" />
                                  </div>
                                  <span className="text-xs text-gray-600 font-medium">Matched with <span className="text-gray-900 font-bold">{listing.donatedTo}</span></span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2 ml-auto">
                                <Button variant="ghost" size="sm" className="h-9 rounded-xl font-bold text-gray-500 hover:bg-gray-50">Manage</Button>
                                <Button size="sm" className="h-9 rounded-xl bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold shadow-lg shadow-green-50 transition-all hover:-translate-y-0.5">View Match</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredListings.length === 0 && (
                    <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-bold text-lg">No listings found</p>
                      <p className="text-gray-400 text-sm mb-6">Try adjusting your search or filters.</p>
                      <Button variant="outline" onClick={() => {setActiveTab('all'); setSearchQuery('')}} className="text-[#4CAF50] border-green-100 hover:bg-green-50 rounded-xl font-bold">
                        Clear all filters
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {loading ? (
              <ChartSkeleton />
            ) : (
              <DonationTrends data={chartData} />
            )}

            <Card className="bg-[#4CAF50] text-white border-0 shadow-xl shadow-green-100 overflow-hidden relative group">
              <CardContent className="p-6 relative z-10">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <Leaf className="w-12 h-12 text-white/20 absolute -right-2 -bottom-2 rotate-12 group-hover:rotate-45 transition-transform duration-500" />
                <h3 className="font-bold text-xl mb-2">Sustainable Donor</h3>
                <p className="text-white/80 text-sm mb-6 leading-relaxed">You've saved <strong>{stats.co2Saved}kg</strong> of CO₂ from entering the atmosphere. That's equivalent to planting <strong>{Math.floor(stats.co2Saved / 2)}</strong> trees!</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span>Silver Rank</span>
                    <span>35kg to Gold</span>
                  </div>
                  <div className="bg-white/20 h-2.5 w-full rounded-full overflow-hidden p-0.5 backdrop-blur-sm">
                    <div className="bg-white h-full w-[65%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm p-6 rounded-3xl">
              <h3 className="font-bold text-gray-900 mb-4">Quick Tips</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-blue-600">01</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">Clear photos increase match rates by <span className="text-[#4CAF50] font-bold">45%</span>.</p>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-purple-600">02</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">Detailed descriptions help recipients find exactly what they need.</p>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
