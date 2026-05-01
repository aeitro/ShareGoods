'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Heart,
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Building2,
  FileText,
} from "lucide-react"
import Link from "next/link"

interface ProfileData {
  name: string
  email: string
  phone: string
  address: string
  bio: string
  joinDate: string
  itemsReceived: number
  pendingRequests: number
  donorsMatched: number
  // NGO specific fields
  organizationName?: string
  registrationNumber?: string
  contactPerson?: string
  organizationType?: string
}

// Mock user type - change this to see different profile types
const userType: "individual" | "ngo" = "individual" // Change to "ngo" to see NGO profile

export default function RecipientProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    name: userType === "ngo" ? "Maria Rodriguez" : "Maria Rodriguez",
    email: userType === "ngo" ? "contact@communityhelpCenter.org" : "maria.rodriguez@email.com",
    phone: "(555) 123-4567",
    address: "456 Community Street, San Francisco, CA 94103",
    bio:
      userType === "ngo"
        ? "Community Help Center has been serving the San Francisco area for over 10 years, providing essential items and support to families in need."
        : "Single mother of two looking for support during difficult times. Grateful for the kindness of the ShareGoods community.",
    joinDate: "2023-08-20",
    itemsReceived: 8,
    pendingRequests: 3,
    donorsMatched: 5,
    // NGO specific data
    organizationName: "Community Help Center",
    registrationNumber: "NGO-2023-SF-001",
    contactPerson: "Maria Rodriguez",
    organizationType: "Community Support",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const handleSave = () => {
    // In real app, this would make an API call
    setIsEditing(false)
    alert("Profile updated successfully!")
  }

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!")
      return
    }
    // In real app, this would make an API call
    alert("Password changed successfully!")
    setShowChangePassword(false)
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {userType === "ngo" ? "Organization" : "Recipient"} Profile
            </h1>
            <p className="text-gray-600">
              {userType === "ngo"
                ? "Manage your organization's information and request preferences."
                : "Manage your account information and request preferences."}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <div className="lg:col-span-1">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  {userType === "ngo" ? (
                    <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-blue-600" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                  )}

                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {userType === "ngo" ? profileData.organizationName : profileData.name}
                  </h2>
                  {userType === "ngo" && (
                    <p className="text-sm text-gray-600 mb-2">Contact: {profileData.contactPerson}</p>
                  )}
                  <p className="text-gray-600 mb-4">
                    {userType === "ngo" ? "Organization" : "Member"} since{" "}
                    {profileData.joinDate}
                  </p>

                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#4CAF50]">{profileData.itemsReceived}</p>
                      <p className="text-sm text-gray-600">Items Received</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-gray-900">{profileData.pendingRequests}</p>
                        <p className="text-xs text-gray-600">Pending Requests</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{profileData.donorsMatched}</p>
                        <p className="text-xs text-gray-600">Donors Matched</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal/Organization Information */}
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {userType === "ngo" ? "Organization Information" : "Personal Information"}
                    </h3>
                    {!isEditing ? (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        size="sm"
                        className="text-[#4CAF50] border-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={handleSave} size="sm" className="bg-[#4CAF50] hover:bg-[#45a049] text-white">
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {userType === "ngo" ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={profileData.organizationName || ""}
                              onChange={(e) => setProfileData({ ...profileData, organizationName: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                            />
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900">{profileData.organizationName}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={profileData.registrationNumber || ""}
                              onChange={(e) => setProfileData({ ...profileData, registrationNumber: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                            />
                          ) : (
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900">{profileData.registrationNumber}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={profileData.contactPerson || ""}
                              onChange={(e) => setProfileData({ ...profileData, contactPerson: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                            />
                          ) : (
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900">{profileData.contactPerson}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Organization Type</label>
                          {isEditing ? (
                            <select
                              value={profileData.organizationType || ""}
                              onChange={(e) => setProfileData({ ...profileData, organizationType: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                            >
                              <option value="">Select type</option>
                              <option value="Community Support">Community Support</option>
                              <option value="Food Bank">Food Bank</option>
                              <option value="Homeless Shelter">Homeless Shelter</option>
                              <option value="Youth Center">Youth Center</option>
                              <option value="Senior Center">Senior Center</option>
                              <option value="Religious Organization">Religious Organization</option>
                              <option value="Other">Other</option>
                            </select>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900">{profileData.organizationType}</span>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">{profileData.name}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{profileData.email}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{profileData.phone}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={profileData.address}
                          onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors resize-none"
                        />
                      ) : (
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <span className="text-gray-900">{profileData.address}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {userType === "ngo" ? "Organization Description" : "Bio"}
                      </label>
                      {isEditing ? (
                        <textarea
                          rows={3}
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors resize-none"
                          placeholder={
                            userType === "ngo"
                              ? "Describe your organization's mission and the communities you serve..."
                              : "Tell others about yourself and your current situation..."
                          }
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.bio}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                    {!showChangePassword && (
                      <Button
                        onClick={() => setShowChangePassword(true)}
                        variant="outline"
                        size="sm"
                        className="text-[#4CAF50] border-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
                      >
                        Change Password
                      </Button>
                    )}
                  </div>

                  {showChangePassword ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handlePasswordChange} className="bg-[#4CAF50] hover:bg-[#45a049] text-white">
                          Update Password
                        </Button>
                        <Button
                          onClick={() => {
                            setShowChangePassword(false)
                            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-600">
                      <p>Password was last changed on August 20, 2023</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
