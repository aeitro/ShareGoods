"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Heart, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"

interface ForgotPasswordFormData {
  email: string
}

interface FormErrors {
  email?: string
  general?: string
}

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ForgotPasswordFormData, value: string) => {
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
    setErrors({})

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset link. Please try again.")
      }

      // Show success message
      setIsSubmitted(true)
    } catch (error: any) {
      console.error("Forgot password error:", error)
      setErrors({ general: error.message || "Failed to send reset link. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with Back Button */}
        <header className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-2">
            <Link
              href="/login"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-[#4CAF50] transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        </header>

        {/* Success Message */}
        <main className="py-6">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <Card className="bg-white rounded-xl shadow-lg border-0">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-[#4CAF50]" />
                  </div>

                  <h1 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h1>

                  <p className="text-sm text-gray-600 mb-4">
                    We've sent a password reset link to <strong>{formData.email}</strong>
                  </p>

                  <p className="text-xs text-gray-500 mb-6">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>

                  <div className="space-y-3">
                    <Link href="/login">
                      <Button className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white">Back to Login</Button>
                    </Link>

                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="w-full text-sm text-[#4CAF50] hover:text-[#45a049] font-medium"
                    >
                      Try different email
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-2">
          <Link
            href="/login"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-[#4CAF50] transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Header Section */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="w-10 h-10 bg-[#4CAF50] rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">ShareGoods</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>

              <p className="text-sm text-gray-600">
                No worries! Enter your email address and we'll send you a reset link.
              </p>
            </div>

            {/* Forgot Password Form */}
            <Card className="bg-white rounded-xl shadow-lg border-0">
              <CardContent className="p-6">
                {errors.general && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {errors.general}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`w-full pl-10 pr-3 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                          errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                        }`}
                        placeholder="Enter your email address"
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white py-3 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Sending Reset Link..." : "Send Reset Link"}
                  </Button>
                </form>

                {/* Back to Login Link */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Remember your password?{" "}
                    <Link href="/login" className="text-[#4CAF50] hover:text-[#45a049] font-medium transition-colors">
                      Back to Login
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
