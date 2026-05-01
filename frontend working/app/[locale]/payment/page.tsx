'use client'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CreditCard, Lock, CheckCircle, Smartphone, X, AlertCircle } from "lucide-react"

// Define Razorpay interface
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
    vpa?: string;
  };
  theme?: {
    color?: string;
  };
  handler?: (response: any) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface Window {
  Razorpay: new (options: RazorpayOptions) => {
    open: () => void;
  };
}

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isFailure, setIsFailure] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  
  // Extract item details from URL query parameters
  const itemId = searchParams.get('itemId') || ''
  const itemName = searchParams.get('itemName') || 'Item'
  const itemPrice = parseFloat(searchParams.get('price') || '50')
  
  const [formData, setFormData] = useState({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    email: "",
    upiId: "",
  })

  const [errors, setErrors] = useState({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    email: "",
    upiId: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = { ...errors }

    // Email validation for all payment methods
    if (!formData.email.trim()) {
      newErrors.email = "Email is required for receipt"
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
      isValid = false
    }
    
    if (paymentMethod === 'card') {
      // Card name validation
      if (!formData.cardName.trim()) {
        newErrors.cardName = "Cardholder name is required"
        isValid = false
      }

      // Card number validation
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = "Card number is required"
        isValid = false
      } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
        newErrors.cardNumber = "Please enter a valid 16-digit card number"
        isValid = false
      }

      // Expiry date validation
      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = "Expiry date is required"
        isValid = false
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = "Please use MM/YY format"
        isValid = false
      }

      // CVV validation
      if (!formData.cvv.trim()) {
        newErrors.cvv = "CVV is required"
        isValid = false
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = "CVV must be 3 or 4 digits"
        isValid = false
      }
    } else if (paymentMethod === 'upi') {
      // UPI ID validation
      if (!formData.upiId.trim()) {
        newErrors.upiId = "UPI ID is required"
        isValid = false
      } else if (!/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) {
        newErrors.upiId = "Please enter a valid UPI ID (e.g., yourname@upi)"
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => {
        setRazorpayLoaded(true)
      }
      document.body.appendChild(script)
    }
    
    loadRazorpayScript()
    
    return () => {
      // Cleanup if needed
      const razorpayScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
      if (razorpayScript) {
        razorpayScript.remove()
      }
    }
  }, [])

  const handleRazorpayPayment = () => {
    if (!razorpayLoaded) {
      alert('Razorpay is still loading. Please try again in a moment.')
      return
    }
    
    // Dummy order data - in a real app, this would come from your backend
    const options: RazorpayOptions = {
      key: 'rzp_test_YOUR_KEY_HERE', // Replace with your Razorpay key
      amount: itemPrice * 100, // Amount in paisa
      currency: 'INR',
      name: 'ShareGoods',
      description: `Payment for ${itemName}`,
      image: '/placeholder.svg', // Your logo
      prefill: {
        name: formData.cardName,
        email: formData.email,
        contact: '',
      },
      theme: {
        color: '#4CAF50',
      },
      handler: function(response: any) {
        // Handle successful payment
        setIsProcessing(false)
        setIsSuccess(true)
        
        // Redirect after showing success message
        setTimeout(() => {
          router.push('/dashboard/recipient')
        }, 3000)
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(false)
        },
      },
    }
    
    // For UPI, add UPI specific options
    if (paymentMethod === 'upi') {
      options.prefill = {
        ...options.prefill,
        vpa: formData.upiId, // Pre-fill UPI ID
      }
    }
    
    try {
      const razorpay = new (window as unknown as Window).Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Razorpay error:', error)
      setIsProcessing(false)
      setIsFailure(true)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      setIsProcessing(true)
      handleRazorpayPayment()
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value)
    setFormData({
      ...formData,
      cardNumber: formattedValue,
    })

    // Clear error when user types
    if (errors.cardNumber) {
      setErrors({
        ...errors,
        cardNumber: "",
      })
    }
  }

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target
    value = value.replace(/\D/g, "")
    
    if (value.length > 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4)
    }
    
    setFormData({
      ...formData,
      expiryDate: value,
    })

    // Clear error when user types
    if (errors.expiryDate) {
      setErrors({
        ...errors,
        expiryDate: "",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/dashboard/recipient/browse"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-[#4CAF50] transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Browse</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-[#4CAF50] rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Payment</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Purchase</h1>
            <p className="text-gray-600">Secure checkout for your ShareGoods marketplace item</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="md:col-span-2">
              {isSuccess ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="pt-6 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-[#4CAF50]" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Payment Successful!</h2>
                      <p className="text-gray-600">Thank you for your purchase. A receipt has been sent to your email.</p>
                      <p className="text-gray-600 text-sm">Transaction ID: RZP12345678901234</p>
                      <Button 
                        className="bg-[#4CAF50] hover:bg-[#45a049] text-white mt-2"
                        onClick={() => router.push('/dashboard/recipient')}
                      >
                        Go to Orders
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : isFailure ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="pt-6 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <X className="w-8 h-8 text-red-500" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Payment Failed</h2>
                      <p className="text-gray-600">Your payment could not be processed. Please try again.</p>
                      <Button 
                        className="bg-[#4CAF50] hover:bg-[#45a049] text-white mt-2"
                        onClick={() => {
                          setIsFailure(false)
                          setIsProcessing(false)
                        }}
                      >
                        Retry Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl">Payment Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit}>
                      {/* Payment Method Selection */}
                      <div className="mb-6">
                        <Label htmlFor="payment-method">Payment Method</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div
                            className={`border rounded-md p-4 flex items-center space-x-3 cursor-pointer transition-colors ${paymentMethod === "card" ? "border-[#4CAF50] bg-green-50" : "border-gray-200"}`}
                            onClick={() => setPaymentMethod("card")}
                          >
                            <CreditCard className={`w-5 h-5 ${paymentMethod === "card" ? "text-[#4CAF50]" : "text-gray-400"}`} />
                            <span className={`font-medium ${paymentMethod === "card" ? "text-[#4CAF50]" : "text-gray-600"}`}>Credit Card</span>
                          </div>
                          <div
                            className={`border rounded-md p-4 flex items-center space-x-3 cursor-pointer transition-colors ${paymentMethod === "upi" ? "border-[#4CAF50] bg-green-50" : "border-gray-200"}`}
                            onClick={() => setPaymentMethod("upi")}
                          >
                            <Smartphone className={`w-5 h-5 ${paymentMethod === "upi" ? "text-[#4CAF50]" : "text-gray-400"}`} />
                            <span className={`font-medium ${paymentMethod === "upi" ? "text-[#4CAF50]" : "text-gray-600"}`}>UPI</span>
                          </div>
                        </div>
                      </div>

                      {paymentMethod === "card" && (
                        <>
                          {/* Card Details */}
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <Label htmlFor="cardName">Cardholder Name</Label>
                                <Input
                                  id="cardName"
                                  name="cardName"
                                  placeholder="John Smith"
                                  value={formData.cardName}
                                  onChange={handleInputChange}
                                  className={errors.cardName ? "border-red-500" : ""}
                                />
                                {errors.cardName && (
                                  <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>
                                )}
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="cardNumber">Card Number</Label>
                              <Input
                                id="cardNumber"
                                name="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                value={formData.cardNumber}
                                onChange={handleCardNumberChange}
                                maxLength={19}
                                className={errors.cardNumber ? "border-red-500" : ""}
                              />
                              {errors.cardNumber && (
                                <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="expiryDate">Expiry Date</Label>
                                <Input
                                  id="expiryDate"
                                  name="expiryDate"
                                  placeholder="MM/YY"
                                  value={formData.expiryDate}
                                  onChange={handleExpiryDateChange}
                                  maxLength={5}
                                  className={errors.expiryDate ? "border-red-500" : ""}
                                />
                                {errors.expiryDate && (
                                  <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                                )}
                              </div>
                              <div>
                                <Label htmlFor="cvv">CVV</Label>
                                <Input
                                  id="cvv"
                                  name="cvv"
                                  type="password"
                                  placeholder="123"
                                  value={formData.cvv}
                                  onChange={handleInputChange}
                                  maxLength={4}
                                  className={errors.cvv ? "border-red-500" : ""}
                                />
                                {errors.cvv && (
                                  <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                                )}
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="email">Email for Receipt</Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={errors.email ? "border-red-500" : ""}
                              />
                              {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {paymentMethod === "upi" && (
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="upiId">UPI ID</Label>
                            <div className="flex space-x-2">
                              <Input
                                id="upiId"
                                name="upiId"
                                placeholder="yourname@upi"
                                value={formData.upiId}
                                onChange={handleInputChange}
                                className={errors.upiId ? "border-red-500 flex-1" : "flex-1"}
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                className="border-[#4CAF50] text-[#4CAF50] hover:bg-green-50"
                                onClick={() => alert('UPI verification would happen here')}
                              >
                                Verify
                              </Button>
                            </div>
                            {errors.upiId && (
                              <p className="text-red-500 text-sm mt-1">{errors.upiId}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="email">Email for Receipt</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="john@example.com"
                              value={formData.email}
                              onChange={handleInputChange}
                              className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && (
                              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                          </div>
                          
                          <div className="bg-blue-50 p-3 rounded-md mt-4">
                            <p className="text-sm text-gray-600">
                              When you click "Pay", you'll be directed to complete the payment using your UPI app.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-6">
                        <Button 
                          type="submit" 
                          className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white py-2 h-12"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </span>
                          ) : (
                            `Pay $${itemPrice.toFixed(2)}`
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-center border-t border-gray-100 pt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Lock className="w-3 h-3 mr-1" />
                      Secure payment processed with 256-bit encryption
                    </div>
                  </CardFooter>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-b border-gray-100 pb-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                          <Image 
                            src="/placeholder.svg" 
                            alt="Item" 
                            width={30} 
                            height={30} 
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{itemName}</h3>
                          <p className="text-sm text-gray-500">Item for purchase</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Item Price</span>
                        <span className="text-gray-900">${itemPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Processing Fee</span>
                        <span className="text-gray-900">$0.00</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">Total</span>
                        <span className="font-medium text-gray-900">${itemPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-sm text-gray-600">
                        Your purchase helps support the ShareGoods community marketplace.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}