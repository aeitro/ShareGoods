'use client'

import { useState, useEffect } from "react"
import { useRouter } from "@/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { apiRequest } from "@/lib/api-client"
import { Package, Clock, CheckCircle, ArrowLeft, MoreVertical, MessageSquare, Phone } from "lucide-react"
import Image from "next/image"
import { Link } from "@/navigation"
import DashboardLayout from "@/components/dashboard/layout"

export default function DonorRequestsPage() {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) setUser(JSON.parse(userStr))
  }, [])

  return (
    <DashboardLayout user={user} role="DONOR">
      <div className="min-h-screen bg-gray-50/50 pb-20">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/dashboard/donor" className="flex items-center space-x-2 text-gray-600 hover:text-[#4CAF50] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-bold">Back to Dashboard</span>
            </Link>
            <h1 className="text-lg font-bold text-slate-900">Manage Requests</h1>
            <div className="w-8" /> {/* Spacer */}
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Active Requests */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-2">Active Matches</h2>
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 transition-all hover:shadow-md">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Item Info */}
                    <div className="flex gap-4 flex-1">
                      <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={`https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100`} 
                          alt="Item" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 text-[10px] font-bold rounded-full border border-yellow-100">
                            PENDING HANDOVER
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900">Classic Denim Jacket</h3>
                        <p className="text-xs text-gray-500">Requested by <span className="text-slate-900 font-semibold">Sarah M.</span></p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:flex-col sm:justify-center border-t sm:border-t-0 pt-4 sm:pt-0 sm:pl-6 sm:border-l border-gray-100">
                      <Button className="flex-1 sm:w-32 bg-[#4CAF50] hover:bg-[#45a049] text-white text-xs font-bold rounded-xl h-9">
                        Confirm Handover
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="rounded-xl h-9 w-9 text-gray-600">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-xl h-9 w-9 text-gray-600">
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Past Requests */}
            <div className="space-y-4 pt-4">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-2">Completed</h2>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/60 rounded-2xl border border-gray-100 p-4 opacity-80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden grayscale">
                        <img 
                          src={`https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=60`} 
                          alt="Item" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Cotton Sweatshirt</h4>
                        <p className="text-[10px] text-gray-500">Picked up by James K. • Oct {15-i}, 2023</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[#4CAF50]">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-[10px] font-bold">DONE</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </DashboardLayout>
  )
}
