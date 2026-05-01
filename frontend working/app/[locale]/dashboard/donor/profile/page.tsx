'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Heart, User, Mail, Phone, MapPin, Edit, Save, X, Eye, EyeOff, ShieldCheck, ShieldAlert, Star } from "lucide-react"
import Link from "next/link"
import { apiRequest } from "@/lib/api"

interface ProfileData {
  fullName: string
  email: string
  phone: string
  address: string
  bio: string
  joinDate: string
  totalDonations: number
  itemsDelivered: number
  peopleHelped: number
}

export default function DonorProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reputationScore, setReputationScore] = useState<number | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<string>("unverified")
  
  const [showVerification, setShowVerification] = useState(false)
  const [otp, setOtp] = useState("")
  
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    joinDate: "",
    totalDonations: 0,
    itemsDelivered: 0,
    peopleHelped: 0,
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiRequest<{ data: any }>('/profile/me');
        if (response.data) {
          const user = response.data.user;
          const stats = response.data.stats;
          
          setProfileData({
            fullName: user.fullName || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
            bio: user.bio || "",
            joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : "",
            totalDonations: stats?.totalDonations || 0,
            itemsDelivered: stats?.itemsDelivered || 0,
            peopleHelped: stats?.peopleHelped || 0,
          });
          setReputationScore(user.reputationScore);
          setVerificationStatus(user.verificationStatus);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

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

  const handleSave = async () => {
    try {
      await apiRequest('/profile/update', {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: profileData.fullName,
          phone: profileData.phone,
          address: profileData.address,
          bio: profileData.bio,
        })
      });
      setIsEditing(false)
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile.");
    }
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

  const handleVerify = async () => {
    if (otp === "123456") {
      try {
        await apiRequest('/profile/update', {
          method: 'PATCH',
          body: JSON.stringify({ verificationStatus: 'verified' })
        });
        setVerificationStatus('verified');
        setShowVerification(false);
        alert("Identity verified successfully!");
      } catch (error) {
        console.error("Failed to verify:", error);
        alert("Verification failed. Try again.");
      }
    } else {
      alert("Invalid OTP. Hint: use 123456");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link
                href="/dashboard/donor"
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
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Donor Profile</h1>
              <p className="text-gray-600">Manage your account information and donation preferences.</p>
            </div>
            {reputationScore !== null && (
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                reputationScore >= 80 ? 'bg-lime-100 text-lime-700' : 
                reputationScore < 50 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
              }`}>
                <Star className="w-4 h-4 mr-1" />
                Reputation: {reputationScore}
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <div className="lg:col-span-1">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${profileData.fullName}`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center justify-center gap-2">
                    {profileData.fullName}
                    {verificationStatus === 'verified' && <ShieldCheck className="w-5 h-5 text-blue-500" title="Verified" />}
                    {verificationStatus === 'pending' && <ShieldAlert className="w-5 h-5 text-amber-500" title="Verification Pending" />}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Donor since {profileData.joinDate}
                  </p>

                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#4CAF50]">{profileData.totalDonations}</p>
                      <p className="text-sm text-gray-600">Total Donations</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-gray-900">{profileData.itemsDelivered}</p>
                        <p className="text-xs text-gray-600">Items Delivered</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{profileData.peopleHelped}</p>
                        <p className="text-xs text-gray-600">People Helped</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{profileData.fullName}</span>
                        </div>
                      )}
                    </div>

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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      {isEditing ? (
                        <textarea
                          rows={3}
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors resize-none"
                          placeholder="Tell others about yourself and your motivation for donating..."
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.bio}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Identity Verification */}
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Identity Verification</h3>
                    {verificationStatus !== 'verified' && !showVerification && (
                      <Button
                        onClick={() => setShowVerification(true)}
                        variant="outline"
                        size="sm"
                        className="text-[#4CAF50] border-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
                      >
                        Verify Now
                      </Button>
                    )}
                  </div>

                  {verificationStatus === 'verified' ? (
                    <div className="flex items-center text-green-600">
                      <ShieldCheck className="w-5 h-5 mr-2" />
                      <span>Your identity is fully verified.</span>
                    </div>
                  ) : showVerification ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP (Hint: 123456)</label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                          placeholder="123456"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleVerify} className="bg-[#4CAF50] hover:bg-[#45a049] text-white">
                          Verify
                        </Button>
                        <Button
                          onClick={() => {
                            setShowVerification(false)
                            setOtp("")
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <ShieldAlert className="w-5 h-5 mr-2" />
                      <span>Your identity is not verified. Verifying helps build trust.</span>
                    </div>
                  )}
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
                      <p>Password was last changed on January 15, 2024</p>
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
