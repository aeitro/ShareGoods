'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiRequest } from "@/lib/api-client"
import {
  PackagePlus,
  Truck,
  History,
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard/layout"

export default function NGODashboard() {
  const [stats, setStats] = useState({
    totalReceived: 0,
    activeRequests: 0,
    upcomingDrives: 0,
    matchedDonors: 0
  })
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userStr = localStorage.getItem('user')
        if (userStr) setUser(JSON.parse(userStr))

        const [invRes, driveRes] = await Promise.all([
            apiRequest<{ count: number }>('/ngo/inventory'),
            apiRequest<{ count: number }>('/ngo/drives')
        ])

        setStats({
          totalReceived: invRes.count || 0,
          activeRequests: 0,
          upcomingDrives: driveRes.count || 0,
          matchedDonors: 0
        })
      } catch (error) {
        console.error("Failed to fetch NGO stats", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <DashboardLayout user={user} role="NGO">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NGO Dashboard</h1>
          <p className="text-gray-600">Managing community impact through organized sharing.</p>
        </div>

        {user?.verificationStatus !== 'approved' && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-amber-900">Verification Pending</h3>
              <p className="text-sm text-amber-800">
                Your NGO profile is currently under review. Some features like drives and analytics will be available once you are verified.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Items Received</p>
                  <h3 className="text-2xl font-bold mt-1 text-gray-900">{stats.totalReceived}</h3>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <History className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                  <h3 className="text-2xl font-bold mt-1 text-gray-900">{stats.activeRequests}</h3>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <PackagePlus className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Drives</p>
                  <h3 className="text-2xl font-bold mt-1 text-gray-900">{stats.upcomingDrives}</h3>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Donors Impacted</p>
                  <h3 className="text-2xl font-bold mt-1 text-gray-900">{stats.matchedDonors}</h3>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-gray-50 bg-gray-50/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#4CAF50]" />
                Next Collection Drive
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center py-10 text-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                <Calendar className="w-12 h-12 text-gray-200 mb-4" />
                <p className="text-gray-600 font-medium">No upcoming drives scheduled</p>
                <Button variant="link" className="text-[#4CAF50] mt-2 font-bold" asChild>
                  <Link href="/dashboard/ngo/drives">Schedule a Drive</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-gray-50 bg-gray-50/30 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Supply Insights
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </CardHeader>
            <CardContent className="p-6">
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-[#4CAF50]"></div>
                      <span className="text-sm font-bold text-gray-700">Clothing Available</span>
                    </div>
                    <span className="text-sm font-black text-gray-900">12 Items</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-bold text-gray-700">Books Available</span>
                    </div>
                    <span className="text-sm font-black text-gray-900">8 Items</span>
                  </div>
                  <Button variant="outline" className="w-full mt-4 h-11 rounded-xl border-gray-200 text-gray-600 font-bold hover:bg-gray-50" asChild>
                    <Link href="/dashboard/ngo/analytics">View Full Report</Link>
                  </Button>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
