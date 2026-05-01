'use client'

import { useState, useEffect } from 'react'
import { apiRequest } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Shield, CheckCircle, Ban, Users, Clock } from 'lucide-react'

interface Report {
  _id: string
  reporter: { fullName: string; email: string }
  targetType: 'Item' | 'User' | 'Match' | 'Message'
  targetId: any
  reason: string
  description: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: string
}

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const res = await apiRequest<{ data: Report[] }>('/admin/reports?status=pending')
      setReports(res.data)
    } catch (err) {
      console.error('Failed to fetch reports', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (id: string, status: 'resolved' | 'dismissed') => {
    setActionLoading(id)
    try {
      await apiRequest(`/admin/reports/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNote: 'Resolved by Admin' })
      })
      setReports(prev => prev.filter(r => r._id !== id))
    } finally {
      setActionLoading(null)
    }
  }

  const handleTakedown = async (itemId: string, reportId: string) => {
    setActionLoading(itemId)
    try {
      await apiRequest(`/admin/items/${itemId}/takedown`, { method: 'PATCH' })
      await handleResolve(reportId, 'resolved')
      alert('Content taken down successfully')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <div className="p-8 text-gray-500">Loading reports...</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Moderation Center</h1>
        <p className="text-gray-500">Manage community reports and flagged content</p>
      </div>

      {reports.length === 0 ? (
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-20 text-center">
            <Shield className="w-16 h-16 text-[#A7D129] mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-gray-900">Clean Slate</h3>
            <p className="text-gray-500">No pending reports at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {reports.map((report) => (
            <Card key={report._id} className="border-none shadow-md bg-white border-l-4 border-l-red-500 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        report.targetType === 'User' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {report.targetType} Flagged
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(report.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Reason: {report.reason.toUpperCase()}</h3>
                      <p className="text-gray-600 mt-1 italic leading-relaxed">
                        "{report.description || 'No additional description provided.'}"
                      </p>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="w-3 h-3" />
                         </div>
                         <span>Reported by: <span className="font-medium text-gray-900">{report.reporter?.fullName}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 w-full md:w-64">
                    {report.targetType === 'Item' && (
                      <Button 
                        variant="destructive" 
                        className="w-full font-bold shadow-lg shadow-red-100"
                        onClick={() => handleTakedown(report.targetId?._id || report.targetId, report._id)}
                        disabled={actionLoading === report._id}
                      >
                        <Ban className="w-4 h-4 mr-2" /> Take Down Item
                      </Button>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 hover:bg-gray-50"
                        onClick={() => handleResolve(report._id, 'dismissed')}
                        disabled={actionLoading === report._id}
                      >
                        Dismiss
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 text-[#A7D129] border-[#A7D129] hover:bg-[#A7D129]/10"
                        onClick={() => handleResolve(report._id, 'resolved')}
                        disabled={actionLoading === report._id}
                      >
                        Mark Resolved
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
