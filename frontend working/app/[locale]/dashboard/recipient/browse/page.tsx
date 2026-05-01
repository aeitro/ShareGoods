'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Heart,
  Search,
  MapPin,
  Eye,
  Star,
  Clock,
  Package,
  SlidersHorizontal,
  Grid3X3,
  List,
} from "lucide-react"
import { PurchaseFlow } from "@/components/ui/purchase-flow"
import { useCustomToast } from "@/hooks/use-custom-toast"
import Image from "next/image"
import Link from "next/link"

interface DonationItem {
  id: string
  name: string
  category: string
  condition: string
  image: string
  location: string
  donor: string
  datePosted: string
  description: string
  distance: string
  rating: number
  isUrgent?: boolean
  donationType?: "free" | "sell"
  price?: number
}

export default function BrowseItemsPage() {
  const router = useRouter()
  const { showSuccess } = useCustomToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedCondition, setSelectedCondition] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedItem, setSelectedItem] = useState<DonationItem | null>(null)
  const [isPurchaseFlowOpen, setIsPurchaseFlowOpen] = useState(false)

  const categories = [
    "all",
    "Clothing",
    "Shoes",
    "Books",
    "Toys",
    "Electronics",
    "Household Items",
    "Furniture",
    "Baby Items",
    "Sports Equipment",
  ]

  const conditions = ["all", "New", "Like New", "Good", "Fair"]

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "distance", label: "Closest First" },
    { value: "rating", label: "Highest Rated" },
  ]

  // Mock data - expanded list
  const allItems: DonationItem[] = [
    {
      id: "1",
      name: "Winter Coat - Large",
      category: "Clothing",
      condition: "Like New",
      image: "/placeholder.svg?height=200&width=200",
      location: "Downtown, San Francisco",
      donor: "Sarah Johnson",
      datePosted: "2024-01-15",
      description: "Warm winter coat, barely used, perfect for cold weather. Navy blue color, waterproof.",
      distance: "0.5 miles",
      rating: 4.8,
      isUrgent: true,
      donationType: "free"
    },
    {
      id: "2",
      name: "Children's Books Set",
      category: "Books",
      condition: "Good",
      image: "/placeholder.svg?height=200&width=200",
      location: "Mission District, SF",
      donor: "James Chen",
      datePosted: "2024-01-12",
      description: "Collection of educational children's books, ages 5-10. Includes picture books and early readers.",
      distance: "1.2 miles",
      rating: 4.9,
      donationType: "sell",
      price: 15
    },
    {
      id: "3",
      name: "Kitchen Appliances Set",
      category: "Household Items",
      condition: "Good",
      image: "/placeholder.svg?height=200&width=200",
      location: "Castro, San Francisco",
      donor: "Emily Davis",
      datePosted: "2024-01-10",
      description: "Blender, toaster, and coffee maker in good working condition. Perfect for new apartment.",
      distance: "2.1 miles",
      rating: 4.6,
      donationType: "sell",
      price: 45
    },
    {
      id: "4",
      name: "School Backpack",
      category: "Clothing",
      condition: "New",
      image: "/placeholder.svg?height=200&width=200",
      location: "Richmond, SF",
      donor: "Michael Brown",
      datePosted: "2024-01-08",
      description: "Brand new school backpack with multiple compartments. Perfect for students.",
      distance: "3.0 miles",
      rating: 5.0,
      donationType: "free"
    },
    {
      id: "5",
      name: "Baby Stroller",
      category: "Baby Items",
      condition: "Good",
      image: "/placeholder.svg?height=200&width=200",
      location: "Sunset District, SF",
      donor: "Lisa Wilson",
      datePosted: "2024-01-07",
      description: "Lightweight baby stroller, easy to fold and transport. Suitable for infants to toddlers.",
      distance: "2.8 miles",
      rating: 4.7,
      donationType: "sell",
      price: 30
    },
    {
      id: "6",
      name: "Dining Table Set",
      category: "Furniture",
      condition: "Fair",
      image: "/placeholder.svg?height=200&width=200",
      location: "SOMA, San Francisco",
      donor: "David Kim",
      datePosted: "2024-01-05",
      description: "Wooden dining table with 4 chairs. Shows some wear but still functional.",
      distance: "1.8 miles",
      rating: 4.3,
      donationType: "sell",
      price: 75
    },
    {
      id: "7",
      name: "Women's Professional Clothes",
      category: "Clothing",
      condition: "Like New",
      image: "/placeholder.svg?height=200&width=200",
      location: "Financial District, SF",
      donor: "Amanda Rodriguez",
      datePosted: "2024-01-04",
      description: "Business attire including blazers, pants, and blouses. Sizes 8-10.",
      distance: "1.5 miles",
      rating: 4.9,
      isUrgent: true,
      donationType: "free"
    },
    {
      id: "8",
      name: "Gaming Console",
      category: "Electronics",
      condition: "Good",
      image: "/placeholder.svg?height=200&width=200",
      location: "Haight-Ashbury, SF",
      donor: "Ryan Thompson",
      datePosted: "2024-01-03",
      description: "PlayStation 4 with controllers and games. Great for family entertainment.",
      distance: "2.5 miles",
      rating: 4.8,
      donationType: "sell",
      price: 120
    },
  ]

  // Filter and sort items
  const filteredItems = allItems
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.donor.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
      const matchesCondition = selectedCondition === "all" || item.condition === selectedCondition
      return matchesSearch && matchesCategory && matchesCondition
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
        case "oldest":
          return new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime()
        case "distance":
          return Number.parseFloat(a.distance) - Number.parseFloat(b.distance)
        case "rating":
          return b.rating - a.rating
        default:
          return 0
      }
    })

  const handleRequestItem = (item: DonationItem) => {
    setSelectedItem(item)
    setIsPurchaseFlowOpen(true)
  }
  
  const handlePurchaseFlowClose = () => {
    setIsPurchaseFlowOpen(false)
    setSelectedItem(null)
  }
  
  const handleRequestSuccess = (itemName: string) => {
    showSuccess(
      `Request sent!`, 
      `Your request for "${itemName}" has been sent to the donor.`
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Purchase Flow Modal */}
      {selectedItem && (
        <PurchaseFlow 
          isOpen={isPurchaseFlowOpen} 
          onClose={handlePurchaseFlowClose} 
          item={selectedItem} 
        />
      )}
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/recipient"
              className="flex items-center space-x-2 text-gray-600 hover:text-[#4CAF50] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Dashboard</span>
            </Link>
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-[#4CAF50] rounded-lg flex items-center justify-center">
                <Heart className="w-3 h-3 text-white" />
              </div>
              <span className="font-bold text-gray-900">ShareGoods</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse Available Items</h1>
          <p className="text-gray-600">Find items donated by generous community members near you.</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border-0 p-4 mb-6">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search items, descriptions, or donors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-[#4CAF50] text-white" : "bg-white text-gray-600"}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-[#4CAF50] text-white" : "bg-white text-gray-600"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                >
                  {conditions.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition === "all" ? "All Conditions" : condition}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                    setSelectedCondition("all")
                    setSortBy("newest")
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} found
          </p>
          <div className="text-sm text-gray-500">
            Sorted by {sortOptions.find((opt) => opt.value === sortBy)?.label}
          </div>
        </div>

        {/* Items Grid/List */}
        {filteredItems.length > 0 ? (
          <div
            className={
              viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"
            }
          >
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className={`bg-white border-0 shadow-sm hover:shadow-md transition-shadow ${
                  viewMode === "list" ? "flex" : ""
                }`}
              >
                <CardContent className={`p-4 ${viewMode === "list" ? "flex gap-4 w-full" : ""}`}>
                  {/* Item Image */}
                  <div
                    className={`bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 ${
                      viewMode === "grid" ? "aspect-square mb-3" : "w-32 h-32"
                    }`}
                  >
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={viewMode === "grid" ? 200 : 128}
                      height={viewMode === "grid" ? 200 : 128}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className={`${viewMode === "list" ? "flex-1" : ""}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.name}</h3>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {item.condition}
                          </span>
                          {item.isUrgent && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              Urgent
                            </span>
                          )}
                          {item.donationType === "free" ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              Free
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              ${item.price?.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mb-2">{item.category}</p>

                    <div className="flex items-center text-xs text-gray-600 mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      {item.distance} • {item.location}
                    </div>

                    <div className="flex items-center text-xs text-gray-600 mb-3">
                      <Star className="w-3 h-3 mr-1 text-yellow-500 fill-current" />
                      {item.rating} • by {item.donor}
                    </div>

                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <Clock className="w-3 h-3 mr-1" />
                      Posted {item.datePosted}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRequestItem(item)}
                        className="bg-[#4CAF50] hover:bg-[#45a049] text-white text-xs flex-1"
                      >
                        {item.donationType === "sell" ? "Buy Item" : "Request Item"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedCategory !== "all" || selectedCondition !== "all"
                  ? "Try adjusting your search criteria or filters to find more items."
                  : "Check back later for new donations from the community."}
              </p>
              {(searchQuery || selectedCategory !== "all" || selectedCondition !== "all") && (
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                    setSelectedCondition("all")
                  }}
                  className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
                >
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
