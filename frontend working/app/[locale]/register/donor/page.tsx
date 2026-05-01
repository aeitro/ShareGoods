"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Heart, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

interface FormData {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  address: string
}

interface FormErrors {
  fullName?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
  address?: string
}

export default function RegisterDonorPage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters"
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\+?[\d\s\-$$$$]{10,}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number"
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Please enter a complete address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Call the backend API
      const response = await fetch('/api/register/donor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          address: formData.address
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Use toast notification instead of alert
        import('@/components/ui/toast-notification').then(({ showSuccessToast }) => {
          showSuccessToast({
            description: data.message || "Account created successfully! Welcome to ShareGoods!"
          })
        })
        
        // Redirect to login page
        window.location.href = '/login'
      } else {
        // Handle validation errors or other issues
        if (data.errors) {
          // Update form errors with server validation errors
          setErrors(data.errors)
        } else if (data.field) {
          // Handle specific field error (like duplicate email)
          setErrors(prev => ({ ...prev, [data.field]: data.message }))
          
          // Show toast for the error
          import('@/components/ui/toast-notification').then(({ showErrorToast }) => {
            showErrorToast({
              description: data.message || "Registration failed. Please check the form and try again."
            })
          })
        } else {
          // General error message with toast
          import('@/components/ui/toast-notification').then(({ showErrorToast }) => {
            showErrorToast({
              description: data.message || "Registration failed. Please try again."
            })
          })
        }
      }
    } catch (error) {
      console.error("Registration error:", error)
      
      // Show error toast for unexpected errors
      import('@/components/ui/toast-notification').then(({ showErrorToast }) => {
        showErrorToast({
          description: "Something went wrong. Please try again."
        })
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-2">
          <Link
            href="/choose-role"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-[#4CAF50] transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Role Selection</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-3">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Header Section */}
            <div className="text-center mb-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-[#4CAF50] rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">ShareGoods</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                Register as a <span className="text-[#4CAF50]">Donor</span>
              </h1>

              <p className="text-sm text-gray-600">Create your account to start sharing items with people in need</p>
            </div>

            {/* Registration Form */}
            <Card className="bg-white rounded-xl shadow-lg border-0">
              <CardContent className="p-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label htmlFor="fullName" className="block text-xs font-medium text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                        errors.fullName ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && <p className="text-xs text-red-600">{errors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label htmlFor="email" className="block text-xs font-medium text-gray-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                        errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label htmlFor="phone" className="block text-xs font-medium text-gray-700">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                        errors.phone ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label htmlFor="password" className="block text-xs font-medium text-gray-700">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className={`w-full px-3 py-2 pr-10 text-sm border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                          errors.password ? "border-red-300 bg-red-50" : "border-gray-300"
                        }`}
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className={`w-full px-3 py-2 pr-10 text-sm border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                          errors.confirmPassword ? "border-red-300 bg-red-50" : "border-gray-300"
                        }`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword}</p>}
                  </div>

                  {/* Address */}
                  <div className="space-y-1">
                    <label htmlFor="address" className="block text-xs font-medium text-gray-700">
                      Address *
                    </label>
                    <textarea
                      id="address"
                      rows={2}
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors resize-none ${
                        errors.address ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="Enter your complete address"
                    />
                    {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Creating Account..." : "Create Donor Account"}
                  </Button>
                </form>

                {/* Login Link */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[#4CAF50] hover:text-[#45a049] font-medium transition-colors">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Terms Notice */}
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-[#4CAF50] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#4CAF50] hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
