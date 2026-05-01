'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Search, Trash2, Eye, Filter, CheckCircle, XCircle } from 'lucide-react'

interface Donation {
  id: string
  itemName: string
  category: string
  donorName: string
  donorEmail: string
  status: 'available' | 'matched' | 'picked-up' | 'delivered'
  donationType: 'free' | 'sell'
  price?: string
  location: string
  datePosted: string
}

export default function DonationsManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Mock data for donations
  const donations: Donation[] = [
    {
      id: '1',
      itemName: 'Winter Coat - Large',
      category: 'Clothing',
      donorName: 'Sarah Johnson',
      donorEmail: 'sarah.j@example.com',
      status: 'matched',
      donationType: 'free',
      location: 'Downtown, San Francisco',
      datePosted: '2024-01-15',
    },
    {
      id: '2',
      itemName: 'Children\'s Books Set',
      category: 'Books',
      donorName: 'Michael Chen',
      donorEmail: 'michael.c@example.com',
      status: 'available',
      donationType: 'sell',
      price: '15.99',
      location: 'Mission District, SF',
      datePosted: '2024-01-12',
    },
    {
      id: '3',
      itemName: 'Kitchen Appliances',
      category: 'Household',
      donorName: 'Jessica Williams',
      donorEmail: 'jessica.w@example.com',
      status: 'picked-up',
      donationType: 'sell',
      price: '45.00',
      location: 'Castro, San Francisco',
      datePosted: '2024-01-10',
    },
    {
      id: '4',
      itemName: 'Laptop - Used',
      category: 'Electronics',
      donorName: 'David Rodriguez',
      donorEmail: 'david.r@example.com',
      status: 'delivered',
      donationType: 'free',
      location: 'Noe Valley, SF',
      datePosted: '2024-01-08',
    },
    {
      id: '5',
      itemName: 'Baby Clothes Bundle',
      category: 'Clothing',
      donorName: 'Emily Taylor',
      donorEmail: 'emily.t@example.com',
      status: 'available',
      donationType: 'free',
      location: 'Richmond District, SF',
      datePosted: '2024-01-05',
    },
    {
      id: '6',
      itemName: 'Office Desk Chair',
      category: 'Furniture',
      donorName: 'James Wilson',
      donorEmail: 'james.w@example.com',
      status: 'matched',
      donationType: 'sell',
      price: '75.00',
      location: 'SOMA, San Francisco',
      datePosted: '2024-01-03',
    },
  ]

  // Get unique categories for filter
  const uniqueCategories = Array.from(new Set(donations.map((donation) => donation.category)))
  const categories = ['all', ...Array.from(uniqueCategories)]

  // Filter donations based on search term and filters
  const filteredDonations = donations.filter((donation) => {
    const matchesSearch = 
      donation.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.donorName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || donation.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || donation.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleDeleteDonation = (donation: Donation) => {
    setSelectedDonation(donation)
    setIsDeleteDialogOpen(true)
  }

  const handleViewDonation = (donation: Donation) => {
    setSelectedDonation(donation)
    setIsViewDialogOpen(true)
  }

  const confirmDeleteDonation = () => {
    // In a real application, this would call an API to delete the donation
    console.log(`Deleting donation: ${selectedDonation?.id}`)
    setIsDeleteDialogOpen(false)
    setSelectedDonation(null)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-blue-100 text-blue-800'
      case 'matched':
        return 'bg-yellow-100 text-yellow-800'
      case 'picked-up':
        return 'bg-green-100 text-green-800'
      case 'delivered':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available'
      case 'matched':
        return 'Matched'
      case 'picked-up':
        return 'Picked Up'
      case 'delivered':
        return 'Delivered'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Donations Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage all donations on the ShareGoods platform.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search donations..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="matched">Matched</SelectItem>
              <SelectItem value="picked-up">Picked Up</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Donations Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Donor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date Posted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDonations.length > 0 ? (
              filteredDonations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell className="font-medium">{donation.itemName}</TableCell>
                  <TableCell>{donation.category}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{donation.donorName}</span>
                      <span className="text-xs text-muted-foreground">{donation.donorEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeColor(donation.status)}`}>
                      {getStatusText(donation.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {donation.donationType === 'free' ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <span className="text-blue-600">${donation.price}</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={donation.location}>
                    {donation.location}
                  </TableCell>
                  <TableCell>{donation.datePosted}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleViewDonation(donation)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteDonation(donation)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No donations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Donation Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the donation "{selectedDonation?.itemName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteDonation}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Donation Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Donation Details</DialogTitle>
          </DialogHeader>
          {selectedDonation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Item Name</p>
                  <p className="text-sm">{selectedDonation.itemName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="text-sm">{selectedDonation.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Donor</p>
                  <p className="text-sm">{selectedDonation.donorName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{selectedDonation.donorEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeColor(selectedDonation.status)}`}>
                    {getStatusText(selectedDonation.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="text-sm">
                    {selectedDonation.donationType === 'free' ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <span className="text-blue-600">${selectedDonation.price}</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="text-sm">{selectedDonation.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date Posted</p>
                  <p className="text-sm">{selectedDonation.datePosted}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}