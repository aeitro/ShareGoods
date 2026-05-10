'use client'

import dynamic from "next/dynamic"
import { useTranslations } from 'next-intl'
import { Heart } from "lucide-react"
import { Link } from "@/navigation"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "./LanguageSwitcher"

// Dynamic imports for performance (sections below the fold)
const Hero = dynamic(() => import("./landing/Hero"), { 
  loading: () => <div className="h-[600px] animate-pulse bg-gray-50 rounded-3xl" />
})
const HowItWorks = dynamic(() => import("./landing/HowItWorks"))
const About = dynamic(() => import("./landing/About"))
const ImpactStats = dynamic(() => import("./landing/ImpactStats"))
const Testimonials = dynamic(() => import("./landing/Testimonials"))
const CTA = dynamic(() => import("./landing/CTA"))

export default function LandingPage() {
  const t = useTranslations('Index')

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-[#4CAF50] to-[#45a049] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">ShareGoods</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#home" className="text-sm font-semibold text-gray-600 hover:text-[#4CAF50] transition-colors">
                Home
              </Link>
              <Link href="#how-it-works" className="text-sm font-semibold text-gray-600 hover:text-[#4CAF50] transition-colors">
                How It Works
              </Link>
              <Link href="#about" className="text-sm font-semibold text-gray-600 hover:text-[#4CAF50] transition-colors">
                About
              </Link>
              <Link href="#testimonials" className="text-sm font-semibold text-gray-600 hover:text-[#4CAF50] transition-colors">
                Community
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" className="font-bold text-gray-600 hover:text-[#4CAF50]">
                  Login
                </Button>
              </Link>
              <Link href="/choose-role">
                <Button className="bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold px-6 rounded-xl shadow-lg shadow-green-100">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main>
        <Hero 
          title={t('title')} 
          description={t('description')} 
          getStartedText={t('getStarted')} 
        />
        <HowItWorks />
        <About />
        <ImpactStats />
        <Testimonials />
        <CTA />
      </main>

      {/* Modern Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2 md:col-span-1 space-y-6">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#4CAF50] rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">ShareGoods</span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                Empowering communities through sustainable sharing and local generosity since 2021.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-500 font-medium">
                <li><Link href="#" className="hover:text-[#4CAF50] transition-colors">Browse Items</Link></li>
                <li><Link href="#" className="hover:text-[#4CAF50] transition-colors">For Donors</Link></li>
                <li><Link href="#" className="hover:text-[#4CAF50] transition-colors">For Recipients</Link></li>
                <li><Link href="#" className="hover:text-[#4CAF50] transition-colors">For NGOs</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Company</h3>
              <ul className="space-y-2 text-sm text-gray-500 font-medium">
                <li><Link href="#" className="hover:text-[#4CAF50] transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-[#4CAF50] transition-colors">Our Impact</Link></li>
                <li><Link href="#" className="hover:text-[#4CAF50] transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-[#4CAF50] transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Social</h3>
              <div className="flex space-x-4">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-green-50 hover:border-[#4CAF50] hover:text-[#4CAF50] transition-all cursor-pointer">
                  <Heart className="w-5 h-5" />
                </div>
                {/* Add more social icons here */}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400 font-medium">
              &copy; {new Date().getFullYear()} ShareGoods. Built for the community.
            </p>
            <div className="flex space-x-6 text-xs text-gray-400 font-medium">
              <Link href="#" className="hover:text-gray-900">Privacy Policy</Link>
              <Link href="#" className="hover:text-gray-900">Terms of Service</Link>
              <Link href="#" className="hover:text-gray-900">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
