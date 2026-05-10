"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "@/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Heart, Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Link } from "@/navigation"
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"


interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

declare global {
  interface Window {
    google?: any
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (typeof value === "string" && errors[field as keyof FormErrors]) {
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please check your credentials.")
      }

      // Store auth token and user info in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('userRole', data.role)
      
      // Redirect based on user role
      if (data.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else if (data.role === 'DONOR') {
        router.push('/dashboard/donor')
      } else {
        router.push('/dashboard/recipient')
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setErrors({ general: error.message || "Login failed. Please check your credentials and try again." })
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
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-[#4CAF50] transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
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

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Login to <span className="text-[#4CAF50]">ShareGoods</span>
              </h1>

              <p className="text-sm text-gray-600">Welcome back! Please sign in to your account</p>
            </div>

            {/* Login Form */}
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

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className={`w-full pl-10 pr-12 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                          errors.password ? "border-red-300 bg-red-50" : "border-gray-300"
                        }`}
                        placeholder="Enter your password"
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

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="rememberMe"
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={(e) => handleInputChange("rememberMe", e.target.checked)}
                        className="h-4 w-4 text-[#4CAF50] focus:ring-[#4CAF50] border-gray-300 rounded"
                      />
                      <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-[#4CAF50] hover:text-[#45a049] font-medium transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white py-3 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Signing in..." : "Login"}
                  </Button>
                </form>

                {/* Divider */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="mt-6 space-y-3">
                  <GoogleSignInButton text="Login with Google" />
                </div>

                {/* Register Link */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      href="/choose-role"
                      className="text-[#4CAF50] hover:text-[#45a049] font-medium transition-colors"
                    >
                      Register
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Terms Notice */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our{" "}
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
