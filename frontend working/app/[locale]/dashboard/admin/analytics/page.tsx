'use client'

import { useState, useEffect } from 'react'
import { apiRequest } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts'
import { TrendingUp, Users, Package, CheckCircle, Globe, Map as MapIcon } from 'lucide-react'

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await apiRequest<{ data: any }>('/admin/stats')
      setStats(res.data)
    } catch (err) {
      console.error('Failed to fetch stats', err)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#A7D129', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  const matchData = [
    { name: 'Pending', value: stats?.pendingMatches || 0 },
    { name: 'Successful', value: stats?.successfulMatches || 0 },
  ];

  if (loading) return <div className="p-8">Loading platform data...</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Platform Intelligence</h1>
        <p className="text-gray-500">Global health metrics and ecosystem growth</p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md bg-gradient-to-br from-[#A7D129] to-[#8eb322] text-white">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-wider">Ecosystem Strength</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-black">{stats?.totalUsers}</div>
                <p className="text-xs mt-1 opacity-70">Total registered participants</p>
                <div className="mt-4 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-2/3"></div>
                </div>
            </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">Active Inventory</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-black text-gray-900">{stats?.activeListings}</div>
                <p className="text-xs mt-1 text-[#A7D129] font-medium">+12% from last week</p>
            </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">Match Success</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-black text-gray-900">{stats?.matchSuccessRate}%</div>
                <p className="text-xs mt-1 text-blue-500 font-medium">Efficiency Peak</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Breakdown */}
        <Card className="border-none shadow-sm bg-white">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#A7D129]" />
                    User Composition
                </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                        { name: 'Donors', count: stats?.totalDonors },
                        { name: 'Individuals', count: stats?.totalRecipients },
                        { name: 'NGOs', count: stats?.totalNGOs }
                    ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip 
                            cursor={{fill: '#f9fafb'}}
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                        />
                        <Bar dataKey="count" fill="#A7D129" radius={[6, 6, 0, 0]} barSize={60} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        {/* Heatmap Visualization (Mock Grid) */}
        <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-lg flex items-center gap-2">
                    <MapIcon className="w-5 h-5 text-blue-500" />
                    Donation Density Heatmap
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="aspect-video bg-gray-100 relative group overflow-hidden">
                    <div className="absolute inset-0 grid grid-cols-10 grid-rows-6">
                        {Array.from({ length: 60 }).map((_, i) => (
                            <div 
                                key={i} 
                                className="border border-white/20 transition-all duration-700" 
                                style={{
                                    backgroundColor: Math.random() > 0.7 ? `rgba(167, 209, 41, ${Math.random()})` : 'transparent'
                                }}
                            />
                        ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-transparent transition-colors">
                        <div className="px-4 py-2 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-gray-900 shadow-xl border border-white">
                           LIVE GEOGRAPHIC FEED ACTIVE
                        </div>
                    </div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-3 h-3 rounded-full bg-[#A7D129]"></div>
                        High Activity Zones
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></div>
                        Emerging Clusters
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="border-none shadow-sm bg-white col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle className="text-lg">Growth Velocity</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                        { name: 'Mon', value: 400 },
                        { name: 'Tue', value: 300 },
                        { name: 'Wed', value: 600 },
                        { name: 'Thu', value: 800 },
                        { name: 'Fri', value: 500 },
                        { name: 'Sat', value: 900 },
                        { name: 'Sun', value: 1100 },
                    ]}>
                        <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#A7D129" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#A7D129" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#A7D129" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
         </Card>

         <Card className="border-none shadow-sm bg-white">
            <CardHeader>
                <CardTitle className="text-lg">Match Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={matchData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {matchData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 text-xs font-medium text-gray-500">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#A7D129]"></div> Pending</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div> Successful</div>
                </div>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}
