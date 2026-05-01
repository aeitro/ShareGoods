'use client'

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Heart, Plus, X, FileText, Building2 } from "lucide-react"
import Link from "next/link"

interface BulkRequestItem {
  id: string
  category: string
  itemName: string
  quantity: number
  priority: "low" | "medium" | "high"
  description: string
}

export default function BulkRequestPage() {
  const [requestItems, setRequestItems] = useState<BulkRequestItem[]>([
    {
      id: "1",
      category: "",
      itemName: "",
      quantity: 1,
      priority: "medium",
      description: "",
    },
  ])

  const [formData, setFormData] = useState({
    organizationName: "Community Help Center",
    contactPerson: "Maria Rodriguez",
    email: "maria@communityhelpCenter.org",
    phone: "(555) 123-4567",
    urgency: "medium",
    deliveryDate: "",
    notes: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    "Clothing",
    "Shoes",
    "Books",
    "Toys",
    "Electronics",
    "Household Items",
    "Furniture",
    "Food Items",
    "Medical Supplies",
    "School Supplies",
    "Baby Items",
    "Sports Equipment",
  ]

  const addRequestItem = () => {
    const newItem: BulkRequestItem = {
      id: Date.now().toString(),
      category: "",
      itemName: "",
      quantity: 1,
      priority: "medium",
      description: "",
    }
    setRequestItems([...requestItems, newItem])
  }

  const removeRequestItem = (id: string) => {
    if (requestItems.length > 1) {
      setRequestItems(requestItems.filter((item) => item.id !== id))
    }
  }

  const updateRequestItem = (id: string, field: keyof BulkRequestItem, value: string | number) => {
    setRequestItems(requestItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    alert("Bulk request submitted successfully! We'll review your request and match you with available donors.")
    setIsSubmitting(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/recipient"
              className="flex items-center space-x-2 text-gray-600 hover:text-[#4CAF50] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Dashboard</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-[#4CAF50] rounded-lg flex items-center justify-center">
                <Heart className="w-3 h-3 text-white" />
              </div>
              <span className="font-bold text-gray-900">ShareGoods</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bulk Request</h1>
                <p className="text-gray-600">Request multiple items for your organization</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">NGO Bulk Request</h3>
                  <p className="text-sm text-blue-800">
                    As a registered NGO, you can request multiple items at once to help your community. Our system will
                    match your requests with available donors and notify you of matches.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Organization Information */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name *</label>
                    <input
                      type="text"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Request Details */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Request Details</h2>
                  <Button type="button" onClick={addRequestItem} className="bg-[#4CAF50] hover:bg-[#45a049] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {requestItems.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900">Item #{index + 1}</h3>
                        {requestItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRequestItem(item.id)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                          <select
                            value={item.category}
                            onChange={(e) => updateRequestItem(item.id, "category", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                            required
                          >
                            <option value="">Select category</option>
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) => updateRequestItem(item.id, "itemName", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                            placeholder="e.g., Winter Coats"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateRequestItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                          <select
                            value={item.priority}
                            onChange={(e) => updateRequestItem(item.id, "priority", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => updateRequestItem(item.id, "description", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors resize-none"
                          placeholder="Specific requirements, sizes, conditions, etc."
                        />
                      </div>

                      <div className="mt-2 flex items-center">
                        <span className="text-sm text-gray-600 mr-2">Priority:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}
                        >
                          {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Request Urgency</label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                    >
                      <option value="low">Low - Within 2 weeks</option>
                      <option value="medium">Medium - Within 1 week</option>
                      <option value="high">High - Within 3 days</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Delivery Date</label>
                    <input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors resize-none"
                    placeholder="Any additional information about your organization's needs, pickup/delivery preferences, etc."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Link href="/dashboard/recipient" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#4CAF50] hover:bg-[#45a049] text-white"
              >
                {isSubmitting ? "Submitting Request..." : "Submit Bulk Request"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
