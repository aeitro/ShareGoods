'use client'

import { useState, useEffect } from "react"
import { Heart, Bell, LogOut, Menu, X, Building2 } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: any
  role: 'DONOR' | 'INDIVIDUAL' | 'NGO' | 'ADMIN'
}

export default function DashboardLayout({ children, user, role }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const navLinks = {
    DONOR: [
      { name: 'Dashboard', href: '/dashboard/donor' },
      { name: 'Donate Items', href: '/dashboard/donor/donate' },
      { name: 'My Listings', href: '/dashboard/donor/listings' },
      { name: 'Messages', href: '/dashboard/messages' },
      { name: 'Profile', href: '/dashboard/donor/profile' },
    ],
    INDIVIDUAL: [
      { name: 'Dashboard', href: '/dashboard/recipient' },
      { name: 'Browse Items', href: '/dashboard/recipient/browse' },
      { name: 'My Requests', href: '/dashboard/recipient/history' },
      { name: 'Messages', href: '/dashboard/messages' },
      { name: 'Profile', href: '/dashboard/recipient/profile' },
    ],
    NGO: [
      { name: 'Dashboard', href: '/dashboard/ngo' },
      { name: 'Bulk Requests', href: '/dashboard/ngo/requests/new' },
      { name: 'Inventory', href: '/dashboard/ngo/inventory' },
      { name: 'Drives', href: '/dashboard/ngo/drives' },
      { name: 'Analytics', href: '/dashboard/ngo/analytics' },
      { name: 'Messages', href: '/dashboard/messages' },
    ],
    ADMIN: [
      { name: 'Dashboard', href: '/dashboard/admin' },
      { name: 'Analytics', href: '/dashboard/admin/analytics' },
      { name: 'Users', href: '/dashboard/admin/users' },
      { name: 'Donations', href: '/dashboard/admin/donations' },
      { name: 'NGO Verification', href: '/dashboard/admin/ngos' },
      { name: 'Messages', href: '/dashboard/messages' },
      { name: 'Moderation', href: '/dashboard/admin/moderation' },
    ]
  }

  const currentLinks = navLinks[role] || []

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <header className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200' : 'bg-white border-b border-gray-200'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-[#4CAF50] to-[#45a049] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                ShareGoods
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {currentLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === link.href
                      ? 'text-[#4CAF50] bg-green-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <button className="p-2.5 text-gray-400 hover:text-[#4CAF50] hover:bg-green-50 rounded-full transition-all duration-200">
                <Bell className="w-5 h-5" />
              </button>
              
              <div className="h-8 w-px bg-gray-200 mx-2" />

              <div className="flex items-center space-x-3 pl-2">
                <div className="flex flex-col items-end mr-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {role === "NGO" ? user?.organizationName : user?.fullName}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                    {role}
                  </span>
                </div>
                
                <div className="relative group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 ${
                    role === 'NGO' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-[#4CAF50]'
                  }`}>
                    {role === "NGO" ? <Building2 className="w-5 h-5" /> : user?.fullName?.charAt(0) || 'U'}
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <nav className="container mx-auto px-4 py-6 space-y-2">
              {currentLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-[#4CAF50] bg-green-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-100">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-xl transition-colors"
                >
                  <span>Sign Out</span>
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2026 ShareGoods. Making community sharing easier for everyone.</p>
        </div>
      </footer>
    </div>
  )
}
