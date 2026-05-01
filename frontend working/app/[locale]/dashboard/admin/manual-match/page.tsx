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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Package, User, Handshake, CheckCircle } from 'lucide-react'

interface Donation {
  id: string
  itemName: string
  category: string
  donorName: string
  status: 'available' | 'matched' | 'picked-up' | 'delivered'
  donationType: 'free' | 'sell'
  price?: string
  location: string
  datePosted: string
}

interface Recipient {
  id: string
  name: string
  email: string
  phone: string
  location: string
  needs: string[]
  status: 'active' | 'inactive'
  joinedDate: string
}

export default function ManualMatch() {
  const [donationSearchTerm, setDonationSearchTerm] = useState('')
  const [recipientSearchTerm, setRecipientSearchTerm] = useState('')
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [matchNote, setMatchNote] = useState('')
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)

  // Mock data for available donations
  const availableDonations: Donation[] = [
    {
      id: '1',
      itemName: 'Winter Coat - Large',
      category: 'Clothing',
      donorName: 'Sarah Johnson',
      status: 'available',
      donationType: 'free',
      location: 'Downtown, San Francisco',
      datePosted: '2024-01-15',
    },
    {
      id: '2',
      itemName: 'Children\'s Books Set',
      category: 'Books',
      donorName: 'Michael Chen',
      status: 'available',
      donationType: 'sell',
      price: '15.99',
      location: 'Mission District, SF',
      datePosted: '2024-01-12',
    },
    {
      id: '5',
      itemName: 'Baby Clothes Bundle',
      category: 'Clothing',
      donorName: 'Emily Taylor',
      status: 'available',
      donationType: 'free',
      location: 'Richmond District, SF',
      datePosted: '2024-01-05',
    },
  ]

  // Mock data for active recipients
  const activeRecipients: Recipient[] = [
    {
      id: '1',
      name: 'Maria Rodriguez',
      email: 'maria.r@example.com',
      phone: '(555) 123-4567',
      location: 'Mission District, SF',
      needs: ['Clothing', 'Household'],
      status: 'active',
      joinedDate: '2023-12-10',
    },
    {
      id: '2',
      name: 'James Wilson',
      email: 'j.wilson@example.com',
      phone: '(555) 987-6543',
      location: 'Castro, SF',
      needs: ['Books', 'Electronics'],
      status: 'active',
      joinedDate: '2023-11-05',
    },
    {
      id: '3',
      name: 'Aisha Patel',
      email: 'aisha.p@example.com',
      phone: '(555) 456-7890',
      location: 'Noe Valley, SF',
      needs: ['Clothing', 'Baby Items'],
      status: 'active',
      joinedDate: '2023-10-20',
    },
  ]

  // Filter donations based on search term
  const filteredDonations = availableDonations.filter((donation) =>
    donation.itemName.toLowerCase().includes(donationSearchTerm.toLowerCase()) ||
    donation.category.toLowerCase().includes(donationSearchTerm.toLowerCase())
  )

  // Filter recipients based on search term
  const filteredRecipients = activeRecipients.filter((recipient) =>
    recipient.name.toLowerCase().includes(recipientSearchTerm.toLowerCase()) ||
    recipient.needs.some(need => need.toLowerCase().includes(recipientSearchTerm.toLowerCase()))
  )

  const handleSelectDonation = (donation: Donation) => {
    setSelectedDonation(donation)
  }

  const handleSelectRecipient = (recipient: Recipient) => {
    setSelectedRecipient(recipient)
  }

  const handleCreateMatch = () => {
    // In a real application, this would call an API to create the match
    console.log(`Creating match between donation ${selectedDonation?.id} and recipient ${selectedRecipient?.id}`)
    console.log(`Match note: ${matchNote}`)
    setIsSuccessDialogOpen(true)
  }

  const handleCloseSuccessDialog = () => {
    setIsSuccessDialogOpen(false)
    // Reset form
    setSelectedDonation(null)
    setSelectedRecipient(null)
    setMatchNote('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manual Match</h1>
        <p className="text-muted-foreground mt-2">
          Manually match available donations with recipients.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Donations Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Available Donations</CardTitle>
            <CardDescription>
              Select a donation to match with a recipient
            </CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search donations..."
                className="pl-8"
                value={donationSearchTerm}
                onChange={(e) => setDonationSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonations.length > 0 ? (
                    filteredDonations.map((donation) => (
                      <TableRow key={donation.id} className={selectedDonation?.id === donation.id ? 'bg-primary/10' : ''}>
                        <TableCell className="font-medium">{donation.itemName}</TableCell>
                        <TableCell>{donation.category}</TableCell>
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
                        <TableCell>
                          <Button 
                            variant={selectedDonation?.id === donation.id ? "default" : "outline"} 
                            size="sm"
                            onClick={() => handleSelectDonation(donation)}
                          >
                            {selectedDonation?.id === donation.id ? 'Selected' : 'Select'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No donations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Active Recipients Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Active Recipients</CardTitle>
            <CardDescription>
              Select a recipient to match with a donation
            </CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search recipients..."
                className="pl-8"
                value={recipientSearchTerm}
                onChange={(e) => setRecipientSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Needs</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecipients.length > 0 ? (
                    filteredRecipients.map((recipient) => (
                      <TableRow key={recipient.id} className={selectedRecipient?.id === recipient.id ? 'bg-primary/10' : ''}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{recipient.name}</span>
                            <span className="text-xs text-muted-foreground">{recipient.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {recipient.needs.map((need, index) => (
                              <span 
                                key={index} 
                                className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                              >
                                {need}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate" title={recipient.location}>
                          {recipient.location}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant={selectedRecipient?.id === recipient.id ? "default" : "outline"} 
                            size="sm"
                            onClick={() => handleSelectRecipient(recipient)}
                          >
                            {selectedRecipient?.id === recipient.id ? 'Selected' : 'Select'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No recipients found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Match Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create Match</CardTitle>
          <CardDescription>
            Review and confirm the match between the selected donation and recipient
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selected Donation */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">Selected Donation</h3>
              </div>
              {selectedDonation ? (
                <div className="rounded-md border p-4">
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium">{selectedDonation.itemName}</p>
                      <p className="text-sm text-muted-foreground">{selectedDonation.category}</p>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">
                        {selectedDonation.donationType === 'free' ? 'Free' : `$${selectedDonation.price}`}
                      </span>
                      <span className="text-sm text-muted-foreground">{selectedDonation.location}</span>
                    </div>
                    <p className="text-sm">Donor: {selectedDonation.donorName}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-8 text-center">
                  <p className="text-muted-foreground">No donation selected</p>
                  <p className="text-sm text-muted-foreground mt-1">Please select a donation from the list above</p>
                </div>
              )}
            </div>

            {/* Selected Recipient */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">Selected Recipient</h3>
              </div>
              {selectedRecipient ? (
                <div className="rounded-md border p-4">
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium">{selectedRecipient.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedRecipient.email}</p>
                    </div>
                    <p className="text-sm">{selectedRecipient.phone}</p>
                    <p className="text-sm text-muted-foreground">{selectedRecipient.location}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedRecipient.needs.map((need, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                        >
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-8 text-center">
                  <p className="text-muted-foreground">No recipient selected</p>
                  <p className="text-sm text-muted-foreground mt-1">Please select a recipient from the list above</p>
                </div>
              )}
            </div>
          </div>

          {/* Match Note */}
          <div className="mt-6">
            <Label htmlFor="match-note">Match Note (Optional)</Label>
            <Textarea
              id="match-note"
              placeholder="Add any additional notes about this match..."
              className="mt-2"
              value={matchNote}
              onChange={(e) => setMatchNote(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            size="lg"
            disabled={!selectedDonation || !selectedRecipient}
            onClick={handleCreateMatch}
          >
            <Handshake className="mr-2 h-5 w-5" />
            Create Match
          </Button>
        </CardFooter>
      </Card>

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Match Created Successfully</DialogTitle>
            <DialogDescription>
              The donation has been successfully matched with the recipient.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCloseSuccessDialog}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}