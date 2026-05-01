'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiRequest } from "@/lib/api-client"
import {
  ChevronLeft,
  BarChart3,
  TrendingUp,
  Download,
  AlertCircle,
  PieChart as PieChartIcon,
  Layers,
} from "lucide-react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export default function AnalyticsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [aiForecast, setAiForecast] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiRequest<{ data: any[] }>('/ngo/analytics/demand-gap')
        setData(res.data)
        
        // Trigger AI Forecast
        generateForecast(res.data)
      } catch (error) {
        console.error("Failed to fetch analytics", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  const generateForecast = async (stats: any[]) => {
    setAiLoading(true)
    try {
      const res = await apiRequest<{ data: any }>('/ai/ngo/forecast', {
        method: 'POST',
        body: { supplyDemandData: stats }
      })
      setAiForecast(res.data)
    } catch (error) {
      console.error("AI Forecast failed", error)
    } finally {
      setAiLoading(false)
    }
  }

  const COLORS = ['#A7D129', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ... (Previous header code remains same) ... */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/ngo">
                <ChevronLeft className="w-6 h-6" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
              <p className="text-gray-500 text-sm">Real-time insights into donation supply and NGO demand</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
                variant="outline" 
                className="border-[#A7D129] text-[#A7D129]"
                onClick={() => generateForecast(data)}
                disabled={aiLoading}
            >
              <TrendingUp className="w-4 h-4 mr-2" /> 
              {aiLoading ? "Thinking..." : "Refresh AI Forecast"}
            </Button>
            <Button className="bg-[#A7D129] hover:bg-[#8eb322] text-white">
                <Download className="w-4 h-4 mr-2" /> Download Report
            </Button>
          </div>
        </div>

        {/* AI Insight Section */}
        {aiForecast && (
            <Card className="border-none shadow-md bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <TrendingUp className="w-32 h-32" />
                </div>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#A7D129] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">G</span>
                        </div>
                        <CardTitle className="text-lg">Gemma Intelligence Forecast</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 relative z-10">
                    <p className="text-gray-300 italic leading-relaxed text-lg">
                        "{aiForecast.forecast}"
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                        {aiForecast.recommendations.map((rec: string, i: number) => (
                            <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                <p className="text-sm font-medium text-[#A7D129] mb-1">Rec {i+1}</p>
                                <p className="text-xs text-gray-400">{rec}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Insight Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#A7D129]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Top Need</p>
                    <h3 className="text-lg font-bold">Clothing</h3>
                  </div>
                </div>
              </CardContent>
           </Card>
           <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Layers className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Supply</p>
                    <h3 className="text-lg font-bold">124 Items</h3>
                  </div>
                </div>
              </CardContent>
           </Card>
           <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Demand Gap</p>
                    <h3 className="text-lg font-bold">+18% vs Last Week</h3>
                  </div>
                </div>
              </CardContent>
           </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <Card className="border-none shadow-sm h-[450px]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#A7D129]" />
                  Supply vs Demand by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full pb-16">
                 {loading ? (
                    <div className="w-full h-full bg-gray-50 rounded-xl animate-pulse"></div>
                 ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                        <Tooltip 
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                          cursor={{fill: '#f9fafb'}}
                        />
                        <Legend iconType="circle" />
                        <Bar dataKey="supply" fill="#A7D129" radius={[4, 4, 0, 0]} name="Available Items" />
                        <Bar dataKey="demand" fill="#3B82F6" radius={[4, 4, 0, 0]} name="NGO Requests" />
                      </BarChart>
                    </ResponsiveContainer>
                 )}
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm h-[450px]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-blue-500" />
                  Demand Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full pb-16">
                 {loading ? (
                    <div className="w-full h-full bg-gray-50 rounded-xl animate-pulse"></div>
                 ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="demand"
                          nameKey="category"
                        >
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" />
                      </PieChart>
                    </ResponsiveContainer>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
