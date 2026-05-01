'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiRequest } from "@/lib/api-client"
import {
  ChevronLeft,
  History,
  Download,
  Search,
  Filter,
  User,
  Package,
  Calendar,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await apiRequest<{ data: any[] }>('/ngo/inventory')
        setInventory(res.data)
      } catch (error) {
        console.error("Failed to fetch inventory", error)
      } finally {
        setLoading(false)
      }
    }
    fetchInventory()
  }, [])

  const filteredInventory = inventory.filter(item => 
    item.item?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.donor?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
              <h1 className="text-2xl font-bold text-gray-900">Received Inventory</h1>
              <p className="text-gray-500 text-sm">Historical record of all items donated to your NGO</p>
            </div>
          </div>
          <Button variant="outline" className="border-gray-200">
            <Download className="w-4 h-4 mr-2" /> Export Log
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search by item name or donor..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Item Details</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Donor Information</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Received Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                   [1,2,3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8 h-12 bg-gray-50/50"></td>
                    </tr>
                   ))
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      No items found in your inventory record.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {record.item?.images?.[0] ? (
                              <img src={record.item.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-full h-full p-2 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{record.item?.name || "Deleted Item"}</p>
                            <p className="text-xs text-gray-500">{record.item?.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                             {record.donor?.fullName?.charAt(0)}
                           </div>
                           <div>
                             <p className="text-sm font-medium">{record.donor?.fullName}</p>
                             <p className="text-xs text-gray-500">{record.donor?.email}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(record.updatedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700">
                          Distributed
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="text-blue-500">
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
