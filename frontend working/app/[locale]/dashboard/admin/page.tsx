'use client'

import { useState, useEffect } from "react"
import { apiRequest } from "@/lib/api-client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users, Package, CheckCircle, Clock, TrendingUp,
  AlertTriangle, Building2, Activity, RefreshCw
} from "lucide-react"
import Link from 'next/link'
import DashboardLayout from "@/components/dashboard/layout"

interface Stats {
  totalUsers: number
  totalDonors: number
  totalRecipients: number
  totalNGOs: number
  pendingNGOs: number
  totalDonations: number
  activeListings: number
  pendingMatches: number
  successfulMatches: number
  matchSuccessRate: number
  suspendedUsers: number
}

interface UserRecord {
  _id: string
  fullName: string
  email: string
  createdAt: string
}

interface ReportRecord {
  _id: string
  targetType: string
  reason: string
  createdAt: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [ngoQueue, setNgoQueue] = useState<UserRecord[]>([])
  const [reports, setReports] = useState<ReportRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => { 
    const userStr = localStorage.getItem('user')
    if (userStr) setUser(JSON.parse(userStr))
    fetchAll() 
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [statsRes, ngoRes, reportsRes] = await Promise.all([
        apiRequest<{ data: Stats }>('/admin/stats'),
        apiRequest<{ data: UserRecord[] }>('/admin/ngo-queue'),
        apiRequest<{ data: ReportRecord[] }>('/admin/reports?status=pending')
      ])
      setStats(statsRes.data)
      setNgoQueue(ngoRes.data)
      setReports(reportsRes.data)
    } catch (err) {
      console.error("Failed to load admin data", err)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveNGO = async (id: string) => {
    try {
      await apiRequest(`/admin/ngo/${id}/approve`, { method: 'POST' })
      setNgoQueue(prev => prev.filter(n => n._id !== id))
    } catch (err) { console.error(err) }
  }

  if (loading && !stats) return <div className="min-h-screen flex items-center justify-center">Loading Admin Panel...</div>

  return (
    <DashboardLayout user={user} role="ADMIN">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Overview</h1>
            <p className="text-gray-500">Real-time status of the ShareGoods ecosystem</p>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" onClick={fetchAll} disabled={loading} className="rounded-xl border-gray-200 bg-white">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Sync Data
             </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Participants</h3>
                <div className="text-4xl font-black text-gray-900 mt-1">{stats?.totalUsers || 0}</div>
              </div>
              <div className="h-1.5 w-full bg-gray-100">
                <div className="h-full bg-blue-500 w-[65%]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-[#4CAF50]/10 rounded-xl text-[#4CAF50]">
                    <Package className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Live Donations</h3>
                <div className="text-4xl font-black text-gray-900 mt-1">{stats?.activeListings || 0}</div>
              </div>
              <div className="h-1.5 w-full bg-gray-100">
                <div className="h-full bg-[#4CAF50] w-[45%]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Success Rate</h3>
                <div className="text-4xl font-black text-gray-900 mt-1">{stats?.matchSuccessRate || 0}%</div>
              </div>
              <div className="h-1.5 w-full bg-gray-100">
                <div className="h-full bg-purple-500 w-[82%]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-orange-50 rounded-xl text-orange-600">
                    <Building2 className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">NGO Queue</h3>
                <div className="text-4xl font-black text-gray-900 mt-1">{ngoQueue.length}</div>
              </div>
              <div className="h-1.5 w-full bg-gray-100">
                <div className="h-full bg-orange-500 w-[20%]" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending NGOs */}
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-500" />
                  Pending Applications
                </h3>
                <Link href="/dashboard/admin/ngos">
                  <Button variant="ghost" size="sm" className="text-[#4CAF50] font-bold">View All</Button>
                </Link>
              </div>
              {ngoQueue.length === 0 ? (
                <div className="py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                  <CheckCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">All applications processed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ngoQueue.slice(0, 3).map((ngo) => (
                    <div key={ngo._id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-gray-100 font-black text-gray-300">
                          {ngo.fullName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{ngo.fullName}</div>
                          <div className="text-xs text-gray-500">{ngo.email}</div>
                        </div>
                      </div>
                      <Button size="sm" className="bg-[#4CAF50] hover:bg-[#45a049] text-white rounded-xl h-9 px-4 shadow-sm" onClick={() => handleApproveNGO(ngo._id)}>
                         Approve
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  System Moderation
                </h3>
                <Link href="/dashboard/admin/moderation">
                  <Button variant="ghost" size="sm" className="text-[#4CAF50] font-bold">View All</Button>
                </Link>
              </div>
              {reports.length === 0 ? (
                <div className="py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                  <Activity className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">System is healthy. No active reports.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.slice(0, 3).map((report) => (
                    <div key={report._id} className="p-5 border-l-4 border-l-red-500 bg-red-50/20 rounded-r-2xl border border-gray-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">{report.targetType} Flagged</div>
                          <div className="text-sm font-bold text-gray-900">{report.reason}</div>
                          <div className="text-[10px] text-gray-400 mt-2">{new Date(report.createdAt).toLocaleString()}</div>
                        </div>
                        <Badge variant="outline" className="text-gray-400 border-gray-200 bg-white">Action Required</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
