'use client'

import { useState, useEffect } from "react"
import { apiRequest } from "@/lib/api-client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Heart, Plus, Trash2, Bell, BellOff, Tag } from "lucide-react"
import Link from "next/link"

const CATEGORIES = [
  "Clothing", "Electronics", "Furniture", "Books", "Toys",
  "Kitchen", "Sports", "Medical", "School Supplies", "Food", "Other"
]
const CONDITIONS = ["any", "Good", "Fair", "Worn"]

interface WishlistEntry {
  _id: string
  category: string
  subcategory: string | null
  conditionMin: string
  maxDistanceKm: number
  alertEnabled: boolean
  note: string
  createdAt: string
}

export default function WishlistPage() {
  const [entries, setEntries] = useState<WishlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [category, setCategory] = useState(CATEGORIES[0])
  const [subcategory, setSubcategory] = useState("")
  const [conditionMin, setConditionMin] = useState("any")
  const [maxDistanceKm, setMaxDistanceKm] = useState(25)
  const [note, setNote] = useState("")

  useEffect(() => { fetchWishlist() }, [])

  const fetchWishlist = async () => {
    setLoading(true)
    try {
      const res = await apiRequest<{ data: WishlistEntry[] }>('/wishlist/my')
      setEntries(res.data)
    } catch (err) {
      console.error("Failed to load wishlist", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    try {
      await apiRequest('/wishlist', {
        method: 'POST',
        body: JSON.stringify({ category, subcategory: subcategory || null, conditionMin, maxDistanceKm, note })
      })
      setShowForm(false)
      setSubcategory("")
      setNote("")
      fetchWishlist()
    } catch (err: any) {
      setError(err.message || "Failed to add entry")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiRequest(`/wishlist/${id}`, { method: 'DELETE' })
      setEntries(prev => prev.filter(e => e._id !== id))
    } catch (err) {
      alert("Failed to remove entry")
    }
  }

  const handleToggleAlert = async (id: string) => {
    try {
      const res = await apiRequest<{ data: WishlistEntry }>(`/wishlist/${id}/alert`, { method: 'PATCH' })
      setEntries(prev => prev.map(e => e._id === id ? res.data : e))
    } catch (err) {
      alert("Failed to toggle alert")
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-12">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard/recipient" className="text-gray-500 hover:text-gray-900 flex items-center">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Link>
          <h1 className="font-bold text-gray-900">My Wishlist</h1>
          <Button
            size="sm"
            className="bg-[#A7D129] hover:bg-[#8eb822] text-gray-900"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-8 space-y-6">
        {/* Explainer */}
        <div className="bg-[#A7D129]/10 border border-[#A7D129]/20 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Heart className="w-5 h-5 text-[#A7D129] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              Add categories of items you need. We'll notify you when a matching donation becomes available near you.
            </p>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <Card className="border-0 shadow-sm bg-white border-t-4 border-t-[#A7D129]">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Add Wishlist Entry</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      required
                    >
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory (optional)</label>
                    <Input
                      placeholder="e.g. Winter Jackets"
                      value={subcategory}
                      onChange={e => setSubcategory(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min. Condition</label>
                    <select
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      value={conditionMin}
                      onChange={e => setConditionMin(e.target.value)}
                    >
                      {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Distance (km)</label>
                    <Input
                      type="number"
                      min={1}
                      max={200}
                      value={maxDistanceKm}
                      onChange={e => setMaxDistanceKm(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                  <Textarea
                    placeholder="Any specific details about what you need..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    maxLength={200}
                    rows={2}
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    className="flex-1 bg-[#A7D129] hover:bg-[#8eb822] text-gray-900"
                    disabled={submitting}
                  >
                    {submitting ? "Adding..." : "Add to Wishlist"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Entries */}
        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading wishlist...</p>
        ) : entries.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-12 text-center">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 text-sm">Add items you're looking for and we'll alert you when they become available.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => (
              <Card key={entry._id} className="border-0 shadow-sm bg-white">
                <CardContent className="p-5 flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-[#A7D129]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Tag className="w-5 h-5 text-[#A7D129]" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="font-bold text-gray-900">{entry.category}</h3>
                        {entry.subcategory && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {entry.subcategory}
                          </span>
                        )}
                        {entry.conditionMin !== 'any' && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                            Min: {entry.conditionMin}
                          </span>
                        )}
                        <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded">
                          ≤ {entry.maxDistanceKm} km
                        </span>
                      </div>
                      {entry.note && (
                        <p className="text-sm text-gray-500 mt-1 italic">"{entry.note}"</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Added {new Date(entry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleAlert(entry._id)}
                      className={`p-2 rounded-lg transition-colors ${entry.alertEnabled ? 'text-[#A7D129] bg-[#A7D129]/10' : 'text-gray-400 hover:bg-gray-100'}`}
                      title={entry.alertEnabled ? 'Alerts on — click to mute' : 'Alerts off — click to enable'}
                    >
                      {entry.alertEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
