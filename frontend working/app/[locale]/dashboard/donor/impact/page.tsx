'use client'

import { useState, useEffect } from "react"
import { apiRequest } from "@/lib/api-client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Award, Leaf, Package, Users, Zap, Star, TrendingUp, Download } from "lucide-react"
import Link from "next/link"

interface ImpactData {
  totalItems: number
  individualsHelped: number
  ngosServed: number
  co2Saved: number
  kgDiverted: number
  categoryBreakdown: Record<string, number>
  karmaScore: number
  badges: string[]
}

interface KarmaData {
  karmaScore: number
  handoverCount: number
  badges: Array<{ id: string; label: string; icon: string; description: string; earned: boolean }>
  nextBadge: { id: string; label: string; icon: string; description: string } | null
  recentEvents: Array<{ eventType: string; points: number; note: string; createdAt: string }>
}

export default function ImpactPage() {
  const [impact, setImpact] = useState<ImpactData | null>(null)
  const [karma, setKarma] = useState<KarmaData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [impactRes, karmaRes] = await Promise.all([
          apiRequest<{ data: ImpactData }>('/impact/my'),
          apiRequest<{ data: KarmaData }>('/karma/my')
        ])
        setImpact(impactRes.data)
        setKarma(karmaRes.data)
      } catch (err) {
        console.error("Failed to load impact data", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#A7D129] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your impact...</p>
        </div>
      </div>
    )
  }

  const categories = impact ? Object.entries(impact.categoryBreakdown) : []

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard/donor" className="text-gray-500 hover:text-gray-900 flex items-center">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Dashboard
          </Link>
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-[#A7D129]" />
            <span className="font-bold text-gray-900">{karma?.karmaScore ?? 0} Karma Points</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-10 space-y-10">

        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_#A7D129_0%,_transparent_60%)]" />
          <div className="relative z-10">
            <p className="text-[#A7D129] font-medium mb-2 uppercase text-sm tracking-widest">Your Impact Story</p>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              You've helped<br />
              <span className="text-[#A7D129]">{impact?.individualsHelped ?? 0 + (impact?.ngosServed ?? 0)} people</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-xl">
              Every item you donate diverts waste from landfills and puts something useful into the hands of someone who needs it.
            </p>
          </div>
        </div>

        {/* Stat Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Package, label: "Items Donated", value: impact?.totalItems ?? 0, color: "text-[#A7D129]", bg: "bg-[#A7D129]/10" },
            { icon: Users, label: "People Helped", value: (impact?.individualsHelped ?? 0) + (impact?.ngosServed ?? 0), color: "text-blue-500", bg: "bg-blue-50" },
            { icon: Leaf, label: "CO₂ Saved (kg)", value: impact?.co2Saved ?? 0, color: "text-green-500", bg: "bg-green-50" },
            { icon: Zap, label: "Karma Points", value: karma?.karmaScore ?? 0, color: "text-yellow-500", bg: "bg-yellow-50" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <Card key={label} className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Badges */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {karma?.badges.map((badge) => (
              <Card
                key={badge.id}
                className={`border-0 shadow-sm transition-all ${badge.earned ? 'bg-white' : 'bg-gray-50 opacity-50'}`}
              >
                <CardContent className="p-6 text-center">
                  <div className={`text-4xl mb-3 ${!badge.earned ? 'grayscale' : ''}`}>{badge.icon}</div>
                  <h3 className={`font-bold text-sm mb-1 ${badge.earned ? 'text-gray-900' : 'text-gray-400'}`}>
                    {badge.label}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{badge.description}</p>
                  {badge.earned && (
                    <span className="mt-2 inline-block px-2 py-0.5 bg-[#A7D129]/20 text-[#7ba017] rounded-full text-[10px] font-medium">
                      Earned ✓
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Next Badge Progress */}
          {karma?.nextBadge && (
            <Card className="border-0 shadow-sm bg-white mt-4">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="text-3xl grayscale">{karma.nextBadge.icon}</div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Next Badge</p>
                  <h3 className="font-bold text-gray-900">{karma.nextBadge.label}</h3>
                  <p className="text-sm text-gray-600">{karma.nextBadge.description}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Category Breakdown */}
        {categories.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What You've Donated</h2>
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6 space-y-4">
                {categories.sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
                  const maxVal = Math.max(...categories.map(c => c[1]))
                  const pct = Math.round((count / maxVal) * 100)
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{cat}</span>
                        <span className="text-gray-500">{count} item{count > 1 ? 's' : ''}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#A7D129] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Karma Events */}
        {karma?.recentEvents && karma.recentEvents.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Karma Activity</h2>
            <div className="space-y-2">
              {karma.recentEvents.map((event, i) => (
                <Card key={i} className="border-0 shadow-sm bg-white">
                  <CardContent className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{event.note}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(event.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="text-[#A7D129] font-bold text-sm">+{event.points} pts</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
