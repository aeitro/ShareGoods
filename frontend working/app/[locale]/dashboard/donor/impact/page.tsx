'use client'

import { useState, useEffect } from "react"
import { apiRequest } from "@/lib/api-client"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, TrendingUp, Users, Package, ArrowLeft, Leaf, Sparkles } from "lucide-react"
import { Link } from "@/navigation"
import DashboardLayout from "@/components/dashboard/layout"

export default function DonorImpactPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) setUser(JSON.parse(userStr))
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user} role="DONOR">
      <div className="min-h-screen bg-gray-50/50 pb-20">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/dashboard/donor" className="flex items-center space-x-2 text-gray-600 hover:text-[#4CAF50] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-bold">Back to Dashboard</span>
            </Link>
            <h1 className="text-lg font-bold text-slate-900">Your Impact</h1>
            <div className="w-8" /> {/* Spacer */}
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Hero Impact */}
          <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 md:p-12 text-white mb-8">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_#4CAF50_0%,_transparent_60%)]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-[#4CAF50] font-bold mb-4 uppercase text-xs tracking-widest">
                <Sparkles className="w-4 h-4" />
                Community Champion
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4">
                You've helped<br />
                <span className="text-[#4CAF50]">12 individuals</span>
              </h1>
              <p className="text-gray-300 text-lg max-w-xl">
                Every item you share diverts waste from landfills and puts something useful into the hands of someone who needs it.
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">12</div>
              <div className="text-sm text-gray-500">Lives Touched</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-[#4CAF50]/10 rounded-xl flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-[#4CAF50]" />
              </div>
              <div className="text-2xl font-bold text-slate-900">28</div>
              <div className="text-sm text-gray-500">Items Shared</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">842 kg</div>
              <div className="text-sm text-gray-500">CO2 Saved</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">450</div>
              <div className="text-sm text-gray-500">Karma Points</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Contributions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h2 className="font-bold text-slate-900">Recent Contributions</h2>
              </div>
              <div className="p-0">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100" 
                        alt="Item" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm text-slate-900">Winter Jacket {i}</div>
                      <div className="text-xs text-gray-500">Matched on Oct {10 + i}, 2023</div>
                    </div>
                    <div className="px-3 py-1 bg-green-50 text-[#4CAF50] text-[10px] font-bold rounded-full">
                      COMPLETED
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact Highlights */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#4CAF50] to-[#45a049] p-6 rounded-2xl text-white shadow-lg shadow-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold">Community Growth</h2>
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-4">
                  Your donations have helped 8 families in your local area stay warm this winter. You're part of a growing movement of radical kindness.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1 rounded-full">
                  <span>+15% impact this month</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-slate-900 mb-4">Sustainability Milestone</h3>
                <div className="flex items-end gap-2 mb-2">
                  <div className="text-3xl font-bold text-[#4CAF50]">842</div>
                  <div className="text-sm text-gray-500 mb-1">kg CO2 saved</div>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#4CAF50] h-full w-[75%]" />
                </div>
                <p className="text-xs text-gray-500 mt-2">By sharing instead of discarding, you've saved significant environmental resources.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  )
}
