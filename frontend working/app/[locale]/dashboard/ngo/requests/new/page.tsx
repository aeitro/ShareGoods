'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { apiRequest } from "@/lib/api-client"
import { Plus, Trash2, Send, ChevronLeft, PackagePlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface RequestRow {
  id: string
  category: string
  subcategory: string
  conditionMin: string
  quantity: number
  isUrgent: boolean
}

export default function BulkRequestPage() {
  const router = useRouter()
  const [rows, setRows] = useState<RequestRow[]>([
    { id: '1', category: '', subcategory: '', conditionMin: 'Fair', quantity: 1, isUrgent: false }
  ])
  const [loading, setLoading] = useState(false)

  const categories = ["Clothing", "Shoes", "Books", "Toys", "Electronics", "Household Items", "Furniture"]
  const conditions = ["Good", "Fair", "Worn"]

  const addRow = () => {
    setRows([...rows, { 
      id: Math.random().toString(36).substr(2, 9), 
      category: '', 
      subcategory: '', 
      conditionMin: 'Fair', 
      quantity: 1, 
      isUrgent: false 
    }])
  }

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id))
    }
  }

  const updateRow = (id: string, field: keyof RequestRow, value: any) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Validate
      const invalid = rows.some(r => !r.category || r.quantity < 1)
      if (invalid) {
        alert("Please fill in all categories and quantities.")
        return
      }

      await apiRequest('/ngo/requests/bulk', {
        method: 'POST',
        body: rows.map(({ category, subcategory, conditionMin, quantity, isUrgent }) => ({
          category,
          subcategory,
          conditionMin,
          quantity,
          isUrgent
        }))
      })

      alert("Bulk requests submitted successfully!")
      router.push('/dashboard/ngo')
    } catch (error: any) {
      alert(error.message || "Failed to submit bulk requests")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/ngo">
                <ChevronLeft className="w-6 h-6" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Bulk Request</h1>
              <p className="text-gray-500 text-sm">Request multiple categories or items in one submission</p>
            </div>
          </div>
          <Button 
            className="bg-[#A7D129] hover:bg-[#8eb322] text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : <><Send className="w-4 h-4 mr-2" /> Submit All</>}
          </Button>
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              {rows.map((row, index) => (
                <div key={row.id} className="relative p-4 bg-white border border-gray-100 rounded-xl shadow-sm space-y-4 md:space-y-0 md:flex md:items-end md:gap-4 group">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Category</Label>
                    <Select 
                      value={row.category} 
                      onValueChange={(val) => updateRow(row.id, 'category', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Condition (Min)</Label>
                    <Select 
                      value={row.conditionMin} 
                      onValueChange={(val) => updateRow(row.id, 'conditionMin', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Min. Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map(cond => (
                          <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-24 space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Quantity</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      value={row.quantity} 
                      onChange={(e) => updateRow(row.id, 'quantity', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex flex-col items-center justify-center gap-2 pb-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Urgent</Label>
                    <Switch 
                      checked={row.isUrgent} 
                      onCheckedChange={(val) => updateRow(row.id, 'isUrgent', val)}
                    />
                  </div>

                  <div className="flex items-center justify-end md:pb-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length === 1}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-12 bg-[#A7D129] rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"></div>
                </div>
              ))}
            </div>

            <Button 
              variant="outline" 
              className="w-full border-dashed border-2 py-8 hover:bg-gray-50 border-gray-200 text-gray-500"
              onClick={addRow}
            >
              <Plus className="w-5 h-5 mr-2" /> Add Another Item
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#A7D129]/5 border-none p-4 flex items-start gap-4">
            <div className="w-10 h-10 bg-[#A7D129] rounded-lg flex items-center justify-center flex-shrink-0">
              <PackagePlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Direct Matching</h4>
              <p className="text-xs text-gray-600 mt-1">Bulk requests are automatically matched with available local donors.</p>
            </div>
          </Card>
          {/* Add more info cards if needed */}
        </div>
      </div>
    </div>
  )
}
