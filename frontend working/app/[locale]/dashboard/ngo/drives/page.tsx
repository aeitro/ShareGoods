'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiRequest } from "@/lib/api-client"
import {
  ChevronLeft,
  Truck,
  Plus,
  MapPin,
  Calendar,
  Users,
  MoreVertical,
  Clock,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function DrivesPage() {
  const [drives, setDrives] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    address: '',
    pincode: '',
    capacity: 50,
    longitude: 0,
    latitude: 0
  })

  useEffect(() => {
    fetchDrives()
  }, [])

  const fetchDrives = async () => {
    try {
      const res = await apiRequest<{ data: any[] }>('/ngo/drives')
      setDrives(res.data)
    } catch (error) {
      console.error("Failed to fetch drives", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiRequest('/ngo/drives', {
        method: 'POST',
        body: formData
      })
      setIsCreateOpen(false)
      fetchDrives()
    } catch (error) {
      alert("Failed to create drive")
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/ngo">
                <ChevronLeft className="w-6 h-6" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Collection Drives</h1>
              <p className="text-gray-500 text-sm">Organize community drop-off events and manage RSVPs</p>
            </div>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#A7D129] hover:bg-[#8eb322] text-white">
                <Plus className="w-4 h-4 mr-2" /> Schedule Drive
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>New Collection Drive</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Drive Title</Label>
                  <Input 
                    placeholder="e.g., Winter Clothing Collection" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="What should donors bring? Where exactly to meet?"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label>Date</Label>
                      <Input 
                        type="datetime-local" 
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        required
                      />
                   </div>
                   <div className="space-y-2">
                      <Label>Capacity (RSVPs)</Label>
                      <Input 
                        type="number" 
                        value={formData.capacity}
                        onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                        required
                      />
                   </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input 
                    placeholder="Full street address" 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input 
                    placeholder="6-digit pincode" 
                    value={formData.pincode}
                    onChange={e => setFormData({...formData, pincode: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-[#A7D129] hover:bg-[#8eb322]">Create Drive</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-xl animate-pulse"></div>)}
          </div>
        ) : drives.length === 0 ? (
          <Card className="border-dashed border-2 bg-transparent">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <Truck className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-gray-700">No Drives Scheduled</h3>
              <p className="text-gray-500 max-w-xs mt-2">Start your first community collection drive to gather donations in bulk.</p>
              <Button variant="outline" className="mt-6" onClick={() => setIsCreateOpen(true)}>
                Schedule Your First Drive
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drives.map(drive => (
              <Card key={drive._id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
                <div className="h-2 bg-[#A7D129]"></div>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg line-clamp-1">{drive.title}</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-bold uppercase">
                        {drive.status}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(drive.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{drive.description}</p>
                  
                  <div className="space-y-2 pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-[#A7D129]" />
                      <span className="line-clamp-1">{drive.address}</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-gray-900">0 / {drive.capacity}</span>
                        <span className="text-gray-500">RSVPs</span>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                         <Link href={`/dashboard/ngo/drives/${drive._id}`}>Manage RSVPs</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
