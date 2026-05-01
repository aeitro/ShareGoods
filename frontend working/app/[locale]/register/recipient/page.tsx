"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Heart, Users, Building2, Eye, EyeOff, Upload, X } from "lucide-react"
import Link from "next/link"
import { showSuccessToast, showErrorToast } from "@/components/ui/toast-notification"

type RecipientType = "individual" | "ngo" | null

interface IndividualFormData {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  address: string
  idNumber: string
}

interface NGOFormData {
  ngoName: string
  contactPerson: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  regNumber: string
  address: string
  certificate: File | null
}

interface FormErrors {
  [key: string]: string | undefined
}

export default function RegisterRecipientPage() {
  const [recipientType, setRecipientType] = useState<RecipientType>(null)
  const [individualData, setIndividualData] = useState<IndividualFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    idNumber: "",
  })
  const [ngoData, setNGOData] = useState<NGOFormData>({
    ngoName: "",
    contactPerson: "",
    certificate: null,
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    regNumber: "",
    address: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateIndividualForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!individualData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (individualData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!individualData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(individualData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!individualData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\+?[\d\s\-$$$$]{10,}$/.test(individualData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number"
    }

    if (!individualData.password) {
      newErrors.password = "Password is required"
    } else if (individualData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(individualData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number"
    }

    if (!individualData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (individualData.password !== individualData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!individualData.address.trim()) {
      newErrors.address = "Address is required"
    } else if (individualData.address.trim().length < 10) {
      newErrors.address = "Please enter a complete address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateNGOForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!ngoData.ngoName.trim()) {
      newErrors.ngoName = "NGO name is required"
    } else if (ngoData.ngoName.trim().length < 2) {
      newErrors.ngoName = "NGO name must be at least 2 characters"
    }

    if (!ngoData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required"
    } else if (ngoData.contactPerson.trim().length < 2) {
      newErrors.contactPerson = "Contact person must be at least 2 characters"
    }

    if (!ngoData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ngoData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!ngoData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\+?[\d\s\-$$$$]{10,}$/.test(ngoData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number"
    }

    if (!ngoData.password) {
      newErrors.password = "Password is required"
    } else if (ngoData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(ngoData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number"
    }

    if (!ngoData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (ngoData.password !== ngoData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!ngoData.regNumber.trim()) {
      newErrors.regNumber = "Registration number is required"
    }

    if (!ngoData.address.trim()) {
      newErrors.address = "Address is required"
    } else if (ngoData.address.trim().length < 10) {
      newErrors.address = "Please enter a complete address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleIndividualInputChange = (field: keyof IndividualFormData, value: string) => {
    setIndividualData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        newErrors[field] = undefined
        return newErrors
      })
    }
  }

  const handleNGOInputChange = (field: keyof NGOFormData, value: string | File | null) => {
    setNGOData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        newErrors[field] = undefined
        return newErrors
      })
    }
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isValid = recipientType === "individual" ? validateIndividualForm() : validateNGOForm()

    if (!isValid) {
      return
    }

    setIsSubmitting(true)

    try {
      // Determine which API endpoint to use based on recipient type
      const endpoint = recipientType === "individual" 
        ? '/api/register/individual' 
        : '/api/register/ngo';
      
      // Prepare the request body based on recipient type
      const requestBody = recipientType === "individual" 
        ? {
            fullName: individualData.name,
            email: individualData.email,
            phone: individualData.phone,
            password: individualData.password,
            address: individualData.address
          }
        : {
            fullName: ngoData.ngoName,
            email: ngoData.email,
            phone: ngoData.phone,
            password: ngoData.password,
            address: ngoData.address,
            registrationNumber: ngoData.regNumber
          };
      
      // Call the backend API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        // Use toast notification instead of alert
        showSuccessToast({
          description: data.message || `${recipientType === "individual" ? "Individual" : "NGO"} account created successfully! Welcome to ShareGoods!`
        });
        
        // Redirect to login page
        window.location.href = '/login';
      } else {
        // Handle validation errors or other issues
        if (data.errors) {
          // Update form errors with server validation errors
          setErrors(data.errors);
        } else if (data.field) {
          // Handle specific field error (like duplicate email or invalid registration number)
          setErrors(prev => ({ ...prev, [data.field]: data.message }));
          
          // Special handling for NGO registration verification failure
          if (data.code === 'NGO_VERIFICATION_FAILED') {
            showErrorToast({
              title: 'Verification Failed',
              description: 'NGO registration number verification failed. Please ensure it starts with "NGO" and has at least 6 characters.'
            });
          } else {
            // Show toast for other field errors
            showErrorToast({
              description: data.message || "Registration failed. Please check the form and try again."
            });
          }
        } else {
          // General error message with toast
          showErrorToast({
            description: data.message || "Registration failed. Please try again."
          });
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      // Show error toast for unexpected errors
      showErrorToast({
        description: "Something went wrong. Please try again."
      });
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setRecipientType(null)
    setErrors({})
    setIndividualData({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      address: "",
      idNumber: "",
    })
    setNGOData({
      ngoName: "",
      contactPerson: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      regNumber: "",
      address: "",
      certificate: null,
    })
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
                Register as a <span className="text-[#4CAF50]">Recipient</span>
              </h1>

              <p className="text-sm text-gray-600">
                {!recipientType
                  ? "Choose your recipient type to get started"
                  : "Create your account to find essential items from generous community members"}
              </p>
            </div>

            {/* Recipient Type Selection */}
            {!recipientType && (
              <Card className="bg-white rounded-xl shadow-lg border-0 mb-4">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">I am registering as:</h2>

                  <div className="space-y-3">
                    <button
                      onClick={() => setRecipientType("individual")}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#4CAF50] hover:bg-green-50 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#4CAF50] bg-opacity-10 rounded-full flex items-center justify-center group-hover:bg-[#4CAF50] transition-colors">
                          <Users className="w-5 h-5 text-[#4CAF50] group-hover:text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Individual</h3>
                          <p className="text-sm text-gray-600">Personal account for individual needs</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setRecipientType("ngo")}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#4CAF50] hover:bg-green-50 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#4CAF50] bg-opacity-10 rounded-full flex items-center justify-center group-hover:bg-[#4CAF50] transition-colors">
                          <Building2 className="w-5 h-5 text-[#4CAF50] group-hover:text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">NGO / Organization</h3>
                          <p className="text-sm text-gray-600">Organization account for community support</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Registration Forms */}
            {recipientType && (
              <Card className="bg-white rounded-xl shadow-lg border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {recipientType === "individual" ? "Individual Registration" : "NGO Registration"}
                    </h2>
                    <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    {recipientType === "individual" ? (
                      <>
                        {/* Individual Form Fields */}
                        <div className="space-y-1">
                          <label htmlFor="name" className="block text-xs font-medium text-gray-700">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={individualData.name}
                            onChange={(e) => handleIndividualInputChange("name", e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                              errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                            }`}
                            placeholder="Enter your full name"
                          />
                          {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="email" className="block text-xs font-medium text-gray-700">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={individualData.email}
                            onChange={(e) => handleIndividualInputChange("email", e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                              errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                            }`}
                            placeholder="Enter your email address"
                          />
                          {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="phone" className="block text-xs font-medium text-gray-700">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            value={individualData.phone}
                            onChange={(e) => handleIndividualInputChange("phone", e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                              errors.phone ? "border-red-300 bg-red-50" : "border-gray-300"
                            }`}
                            placeholder="Enter your phone number"
                          />
                          {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="password" className="block text-xs font-medium text-gray-700">
                            Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              id="password"
                              value={individualData.password}
                              onChange={(e) => handleIndividualInputChange("password", e.target.value)}
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

                        <div className="space-y-1">
                          <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700">
                            Confirm Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              id="confirmPassword"
                              value={individualData.confirmPassword}
                              onChange={(e) => handleIndividualInputChange("confirmPassword", e.target.value)}
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

                        <div className="space-y-1">
                          <label htmlFor="address" className="block text-xs font-medium text-gray-700">
                            Address *
                          </label>
                          <textarea
                            id="address"
                            rows={2}
                            value={individualData.address}
                            onChange={(e) => handleIndividualInputChange("address", e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors resize-none ${
                              errors.address ? "border-red-300 bg-red-50" : "border-gray-300"
                            }`}
                            placeholder="Enter your complete address"
                          />
                          {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="idNumber" className="block text-xs font-medium text-gray-700">
                            ID Number (Optional)
                          </label>
                          <input
                            type="text"
                            id="idNumber"
                            value={individualData.idNumber}
                            onChange={(e) => handleIndividualInputChange("idNumber", e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                            placeholder="Enter your ID number (optional)"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* NGO Form Fields */}
                        <div className="space-y-1">
                          <label htmlFor="ngoName" className="block text-xs font-medium text-gray-700">
                            NGO Name *
                          </label>
                          <input
                            type="text"
                            id="ngoName"
                            value={ngoData.ngoName}
                            onChange={(e) => handleNGOInputChange("ngoName", e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                              errors.ngoName ? "border-red-300 bg-red-50" : "border-gray-300"
                            }`}
                            placeholder="Enter NGO name"
                          />
                          {errors.ngoName && <p className="text-xs text-red-600">{errors.ngoName}</p>}
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="contactPerson" className="block text-xs font-medium text-gray-700">
                            Contact Person *
                          </label>
                          <input
                            type="text"
                            id="contactPerson"
                            value={ngoData.contactPerson}
                            onChange={(e) => handleNGOInputChange("contactPerson", e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                              errors.contactPerson ? "border-red-300 bg-red-50" : "border-gray-300"
                            }`}
                            placeholder="Enter contact person name"
                          />
                          {errors.contactPerson && <p className="text-xs text-red-600">{errors.contactPerson}</p>}
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="email" className="block text-xs font-medium text-gray-700">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={ngoData.email}
                            onChange={(e) => handleNGOInputChange("email", e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                              errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                            }`}
                            placeholder="Enter email address"
                          />
                          {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="phone" className="block text-xs font-medium text-gray-700">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            value={ngoData.phone}
                            onChange={(e) => handleNGOInputChange("phone", e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                              errors.phone ? "border-red-300 bg-red-50" : "border-gray-300"
                            }`}
                            placeholder="Enter phone number"
                          />
                          {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="password" className="block text-xs font-medium text-gray-700">
                            Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              id="password"
                              value={ngoData.password}
                              onChange={(e) => handleNGOInputChange("password", e.target.value)}
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

                        <div className="space-y-1">
                          <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700">
                            Confirm Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              id="confirmPassword"
                              value={ngoData.confirmPassword}
                              onChange={(e) => handleNGOInputChange("confirmPassword", e.target.value)}
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

                        <div className="space-y-1">
                          <label htmlFor="regNumber" className="block text-xs font-medium text-gray-700">
                            Registration Number *
                          </label>
                          <input
                            type="text"
                            id="regNumber"
                            value={ngoData.regNumber}
                            onChange={(e) => handleNGOInputChange("regNumber", e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                              errors.regNumber ? "border-red-300 bg-red-50" : "border-gray-300"
                            }`}
                            placeholder="Enter registration number"
                          />
                          {errors.regNumber && <p className="text-xs text-red-600">{errors.regNumber}</p>}
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="address" className="block text-xs font-medium text-gray-700">
                            Address *
                          </label>
                          <textarea
                            id="address"
                            rows={2}
                            value={ngoData.address}
                            onChange={(e) => handleNGOInputChange("address", e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors resize-none ${
                              errors.address ? "border-red-300 bg-red-50" : "border-gray-300"
                            }`}
                            placeholder="Enter complete address"
                          />
                          {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
                        </div>


                      </>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting
                        ? "Creating Account..."
                        : `Create ${recipientType === "individual" ? "Individual" : "NGO"} Account`}
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
            )}

            {/* Terms Notice */}
            {recipientType && (
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
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
