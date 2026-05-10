"use client"

import { useState, useEffect } from "react"
import { useRouter } from "@/navigation"
import { createBrowserClient } from "@supabase/auth-helpers-nextjs"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Home, Phone, ShieldCheck, User, Users, Building2, ArrowRight, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

type Step = "role" | "details" | "success"
type Role = "DONOR" | "INDIVIDUAL" | "NGO"

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [step, setStep] = useState<Step>("role")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  const [formData, setFormData] = useState({
    role: "INDIVIDUAL" as Role,
    phone: "",
    address: "",
    registrationNumber: "",
  })

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)

      const queryRole = new URLSearchParams(window.location.search).get('role') as Role

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      
      if (profile) {
        setProfile(profile)
        const currentRole = queryRole || (profile.role as Role) || "INDIVIDUAL"
        
        setFormData({
          role: currentRole,
          phone: profile.phone || "",
          address: profile.address || "",
          registrationNumber: profile.registration_number || "",
        })
        
        // If onboarding is already done, redirect to dashboard
        if (profile.phone && profile.address && profile.role) {
          if (profile.role === "DONOR") {
            router.push("/dashboard/donor")
          } else if (profile.role === "NGO") {
            router.push("/dashboard/recipient") // NGOs go to recipient dashboard in current structure
          } else {
            router.push("/dashboard/recipient")
          }
          return
        }

        // If role is provided in URL, skip the role selection step
        if (queryRole) {
          setStep("details")
        }
      }
      setIsLoading(false)
    }

    checkUser()
  }, [supabase, router])

  const handleUpdateProfile = async () => {
    if (!formData.phone || !formData.address) {
      toast.error("Please fill in all required fields")
      return
    }

    if (formData.role === "NGO" && !formData.registrationNumber) {
      toast.error("NGO Registration Number is required")
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          role: formData.role,
          phone: formData.phone,
          address: formData.address,
          registration_number: formData.role === "NGO" ? formData.registrationNumber : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      // Also update auth metadata for sync
      await supabase.auth.updateUser({
        data: {
          role: formData.role,
          phone: formData.phone,
          address: formData.address,
        }
      })

      setStep("success")
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFinish = () => {
    // Sync to localStorage for components that use it
    const localUser = {
      id: user?.id,
      email: user?.email,
      fullName: user?.user_metadata?.full_name || profile?.full_name || user?.email?.split('@')[0],
      role: formData.role
    }
    localStorage.setItem('user', JSON.stringify(localUser))
    localStorage.setItem('userRole', formData.role)

    if (formData.role === "DONOR") {
      router.push("/dashboard/donor")
    } else if (formData.role === "NGO") {
      router.push("/dashboard/ngo")
    } else {
      router.push("/dashboard/recipient")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Setting up your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 py-4 px-6 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#4CAF50] rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ShareGoods</span>
          </div>
          <div className="flex items-center space-x-4 text-sm font-medium text-gray-500">
            <span className={step === "role" ? "text-[#4CAF50]" : ""}>Role</span>
            <div className="w-8 h-[2px] bg-gray-200"></div>
            <span className={step === "details" ? "text-[#4CAF50]" : ""}>Details</span>
            <div className="w-8 h-[2px] bg-gray-200"></div>
            <span className={step === "success" ? "text-[#4CAF50]" : ""}>Done</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {step === "role" && (
            <motion.div
              key="role"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl w-full"
            >
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">How do you want to use ShareGoods?</h1>
                <p className="text-gray-600">Choose the role that best describes your intent on the platform.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { id: "DONOR", title: "Donor", desc: "I want to donate extra items to my community.", icon: Heart },
                  { id: "INDIVIDUAL", title: "Recipient", desc: "I am looking for items to help myself or family.", icon: User },
                  { id: "NGO", title: "NGO / Organization", desc: "I represent an organization helping many people.", icon: Building2 },
                ].map((r) => (
                  <Card
                    key={r.id}
                    onClick={() => setFormData({ ...formData, role: r.id as Role })}
                    className={`cursor-pointer transition-all duration-300 border-2 hover:shadow-xl ${
                      formData.role === r.id ? "border-[#4CAF50] bg-green-50/30 ring-4 ring-green-50" : "border-transparent"
                    }`}
                  >
                    <CardContent className="p-8 text-center space-y-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto transition-colors ${
                        formData.role === r.id ? "bg-[#4CAF50] text-white" : "bg-gray-100 text-gray-400"
                      }`}>
                        <r.icon className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-900">{r.title}</h3>
                        <p className="text-sm text-gray-600">{r.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-12 flex justify-center">
                <Button
                  onClick={() => setStep("details")}
                  className="bg-[#4CAF50] hover:bg-[#45a049] text-white px-10 py-6 text-lg font-bold rounded-xl shadow-lg shadow-green-200"
                >
                  Continue to Details
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-lg w-full"
            >
              <Card className="shadow-2xl border-0 overflow-hidden">
                <div className="bg-[#4CAF50] p-6 text-white text-center">
                  <h2 className="text-2xl font-bold mb-1">Complete Your Profile</h2>
                  <p className="text-green-50 text-sm opacity-90">We need a few more details to get you started</p>
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-[#4CAF50]" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="py-6 rounded-xl border-gray-200 focus:ring-[#4CAF50]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center">
                        <Home className="w-4 h-4 mr-2 text-[#4CAF50]" />
                        Full Address
                      </Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your street address, city, state, and zip"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="min-h-[100px] rounded-xl border-gray-200 focus:ring-[#4CAF50] resize-none"
                      />
                    </div>

                    {formData.role === "NGO" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-2"
                      >
                        <Label htmlFor="reg" className="text-sm font-semibold text-gray-700 flex items-center">
                          <ShieldCheck className="w-4 h-4 mr-2 text-[#4CAF50]" />
                          NGO Registration Number
                        </Label>
                        <Input
                          id="reg"
                          placeholder="Registration #"
                          value={formData.registrationNumber}
                          onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                          className="py-6 rounded-xl border-gray-200 focus:ring-[#4CAF50]"
                        />
                        <p className="text-[10px] text-gray-400 italic">This will be verified by our team.</p>
                      </motion.div>
                    )}
                  </div>

                  <div className="pt-4 flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep("role")}
                      className="flex-1 py-6 rounded-xl border-gray-200 hover:bg-gray-50"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={isSubmitting}
                      className="flex-[2] bg-[#4CAF50] hover:bg-[#45a049] text-white py-6 rounded-xl shadow-lg shadow-green-100"
                    >
                      {isSubmitting ? "Saving..." : "Finish Onboarding"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8 max-w-md w-full"
            >
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10, stiffness: 100 }}
                  className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-16 h-16 text-[#4CAF50]" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-green-200 rounded-full -z-10 blur-xl"
                ></motion.div>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">Welcome to ShareGoods!</h2>
                <p className="text-gray-600">
                  Your profile has been successfully set up. You can now start using the platform based on your chosen role.
                </p>
              </div>

              <Button
                onClick={handleFinish}
                className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white py-6 text-lg font-bold rounded-xl shadow-xl shadow-green-100"
              >
                Go to My Dashboard
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-8 text-center text-gray-400 text-xs">
        <p>© {new Date().getFullYear()} ShareGoods Community Donation Platform</p>
      </footer>
    </div>
  )
}
