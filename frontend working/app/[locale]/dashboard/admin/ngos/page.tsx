'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, CheckCircle, XCircle, Eye, Building2, MapPin, Mail, Phone } from 'lucide-react'

interface NGO {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  registrationNumber: string
  description: string
  status: 'pending' | 'approved' | 'rejected'
  dateSubmitted: string
  documents: string[]
  logo?: string
}

export default function NGOApproval() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedNGO, setSelectedNGO] = useState<NGO | null>(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const [ngos, setNgos] = useState<NGO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNGOs()
  }, [])

  const fetchNGOs = async () => {
    setLoading(true)
    try {
      const res = await apiRequest<{ data: any[] }>('/admin/ngo-queue')
      // Map backend fields to frontend interface
      const mappedNGOs: NGO[] = res.data.map(n => ({
        id: n._id,
        name: n.fullName,
        email: n.email,
        phone: n.phoneNumber || 'N/A',
        address: n.address || 'N/A',
        city: n.city || 'N/A',
        state: n.state || 'N/A',
        country: n.country || 'N/A',
        registrationNumber: n.registrationNumber || 'PENDING',
        description: n.description || 'No description provided.',
        status: n.ngoVerificationStatus,
        dateSubmitted: new Date(n.createdAt).toLocaleDateString(),
        documents: n.ngoDocuments || []
      }))
      setNgos(mappedNGOs)
    } catch (err) {
      console.error('Failed to fetch NGOs', err)
    } finally {
      setLoading(false)
    }
  }

  const confirmApproveNGO = async () => {
    if (!selectedNGO) return
    try {
      await apiRequest(`/admin/ngo/${selectedNGO.id}/approve`, { method: 'POST' })
      setNgos(prev => prev.filter(n => n.id !== selectedNGO.id))
      setIsApproveDialogOpen(false)
      setSelectedNGO(null)
    } catch (err) {
      console.error('Approval failed', err)
    }
  }

  const confirmRejectNGO = async () => {
    if (!selectedNGO || !rejectionReason) return
    try {
      await apiRequest(`/admin/ngo/${selectedNGO.id}/reject`, { 
        method: 'POST', 
        body: JSON.stringify({ reason: rejectionReason }) 
      })
      setNgos(prev => prev.filter(n => n.id !== selectedNGO.id))
      setIsRejectDialogOpen(false)
      setSelectedNGO(null)
      setRejectionReason('')
    } catch (err) {
      console.error('Rejection failed', err)
    }
  }

  const filteredNGOs = ngos.filter((ngo) => {
    const matchesSearch = 
      ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ngo.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || ngo.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleApproveNGO = (ngo: NGO) => {
    setSelectedNGO(ngo)
    setIsApproveDialogOpen(true)
  }

  const handleRejectNGO = (ngo: NGO) => {
    setSelectedNGO(ngo)
    setIsRejectDialogOpen(true)
  }

  const handleViewNGO = (ngo: NGO) => {
    setSelectedNGO(ngo)
    setIsViewDialogOpen(true)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">NGO Approval</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage NGO verification requests.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search NGOs..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* NGO Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">All NGOs</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNGOs.map((ngo) => (
              <NGOCard 
                key={ngo.id} 
                ngo={ngo} 
                onApprove={handleApproveNGO} 
                onReject={handleRejectNGO} 
                onView={handleViewNGO} 
              />
            ))}
            {filteredNGOs.length === 0 && (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No NGOs found matching your criteria.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNGOs.filter(ngo => ngo.status === 'pending').map((ngo) => (
              <NGOCard 
                key={ngo.id} 
                ngo={ngo} 
                onApprove={handleApproveNGO} 
                onReject={handleRejectNGO} 
                onView={handleViewNGO} 
              />
            ))}
            {filteredNGOs.filter(ngo => ngo.status === 'pending').length === 0 && (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No pending NGO applications found.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNGOs.filter(ngo => ngo.status === 'approved').map((ngo) => (
              <NGOCard 
                key={ngo.id} 
                ngo={ngo} 
                onApprove={handleApproveNGO} 
                onReject={handleRejectNGO} 
                onView={handleViewNGO} 
              />
            ))}
            {filteredNGOs.filter(ngo => ngo.status === 'approved').length === 0 && (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No approved NGOs found.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Approve Confirmation Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm NGO Approval</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve {selectedNGO?.name}? This will grant them access to the platform as a verified NGO.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={confirmApproveNGO}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm NGO Rejection</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedNGO?.name}. This will be sent to the NGO.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Reason for rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmRejectNGO}
              disabled={!rejectionReason.trim()}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View NGO Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>NGO Details</DialogTitle>
          </DialogHeader>
          {selectedNGO && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {selectedNGO.logo ? (
                    <img src={selectedNGO.logo} alt={selectedNGO.name} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-8 w-8 text-gray-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedNGO.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedNGO.registrationNumber}</p>
                </div>
                <div className="ml-auto">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeColor(selectedNGO.status)}`}>
                    {selectedNGO.status.charAt(0).toUpperCase() + selectedNGO.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedNGO.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedNGO.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{`${selectedNGO.address}, ${selectedNGO.city}, ${selectedNGO.state}, ${selectedNGO.country}`}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Submitted Documents</h4>
                  <ul className="space-y-1">
                    {selectedNGO.documents.map((doc, index) => (
                      <li key={index} className="text-sm">
                        <Button variant="link" className="p-0 h-auto">
                          {doc}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                <p className="text-sm">{selectedNGO.description}</p>
              </div>
              
              <div className="pt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Application Timeline</h4>
                <p className="text-sm">Submitted on: {selectedNGO.dateSubmitted}</p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            {selectedNGO?.status === 'pending' && (
              <>
                <Button variant="outline" className="flex-1" onClick={() => {
                  setIsViewDialogOpen(false)
                  handleRejectNGO(selectedNGO)
                }}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button className="flex-1" onClick={() => {
                  setIsViewDialogOpen(false)
                  handleApproveNGO(selectedNGO)
                }}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
            {selectedNGO?.status !== 'pending' && (
              <Button onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface NGOCardProps {
  ngo: NGO
  onApprove: (ngo: NGO) => void
  onReject: (ngo: NGO) => void
  onView: (ngo: NGO) => void
}

function NGOCard({ ngo, onApprove, onReject, onView }: NGOCardProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle>{ngo.name}</CardTitle>
            <CardDescription>{ngo.city}, {ngo.state}</CardDescription>
          </div>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeColor(ngo.status)}`}>
            {ngo.status.charAt(0).toUpperCase() + ngo.status.slice(1)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{ngo.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{ngo.phone}</span>
          </div>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">Submitted: {ngo.dateSubmitted}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 pt-0">
        <div className="w-full flex justify-between">
          <Button variant="ghost" size="sm" onClick={() => onView(ngo)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </div>
        {ngo.status === 'pending' && (
          <div className="w-full flex justify-end space-x-2">
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => onReject(ngo)}>
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button size="sm" onClick={() => onApprove(ngo)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}