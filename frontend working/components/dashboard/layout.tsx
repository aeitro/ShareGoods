'use client'

import { useState, useEffect } from "react"
import { Heart, Bell, LogOut, Menu, X, Building2, LayoutDashboard, Search, History, MessageSquare, User, Package, Settings, HelpCircle, ChevronRight, Users, Plus } from "lucide-react"
import { Link, useRouter, usePathname } from "@/navigation"
import { motion, AnimatePresence } from "framer-motion"

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
      { name: 'Dashboard', href: '/dashboard/donor', icon: LayoutDashboard },
      { name: 'Donate New Item', href: '/dashboard/donor/add-item', icon: Plus },
      { name: 'Request Inbox', href: '/dashboard/donor/requests', icon: MessageSquare },
      { name: 'My Impact', href: '/dashboard/donor/impact', icon: Heart },
      { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
      { name: 'Profile', href: '/dashboard/donor/profile', icon: User },
    ],
    INDIVIDUAL: [
      { name: 'Dashboard', href: '/dashboard/recipient', icon: LayoutDashboard },
      { name: 'Browse Items', href: '/dashboard/recipient/browse', icon: Search },
      { name: 'My Requests', href: '/dashboard/recipient/history', icon: History },
      { name: 'Saved Items', href: '/dashboard/recipient/saved', icon: Heart },
      { name: 'Wishlist', href: '/dashboard/recipient/wishlist', icon: Package },
      { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
      { name: 'Profile', href: '/dashboard/recipient/profile', icon: User },
    ],
    NGO: [
      { name: 'Dashboard', href: '/dashboard/ngo', icon: LayoutDashboard },
      { name: 'Bulk Requests', href: '/dashboard/ngo/requests/new', icon: Package },
      { name: 'Inventory', href: '/dashboard/ngo/inventory', icon: Package },
      { name: 'Drives', href: '/dashboard/ngo/drives', icon: Users },
      { name: 'Analytics', href: '/dashboard/ngo/analytics', icon: Settings },
      { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
      { name: 'Profile', href: '/dashboard/ngo/profile', icon: User },
    ],
    ADMIN: [
      { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
      { name: 'Analytics', href: '/dashboard/admin/analytics', icon: Settings },
      { name: 'Users', href: '/dashboard/admin/users', icon: User },
      { name: 'Donations', href: '/dashboard/admin/donations', icon: Package },
      { name: 'NGO Verification', href: '/dashboard/admin/ngos', icon: Building2 },
      { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
      { name: 'Moderation', href: '/dashboard/admin/moderation', icon: HelpCircle },
    ]
  }

  const currentLinks = navLinks[role] || []

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 h-screen sticky top-0 overflow-y-auto scrollbar-hide">
        {/* Sidebar Logo */}
        <div className="p-8">
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-gradient-to-br from-[#4CAF50] to-[#45a049] rounded-xl flex items-center justify-center shadow-lg shadow-green-100"
            >
              <Heart className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-black text-gray-900 tracking-tight">
              ShareGoods
            </span>
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 space-y-1.5">
          {currentLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group ${
                  isActive
                    ? 'text-[#4CAF50] bg-green-50 shadow-sm shadow-green-50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isActive ? 'bg-white shadow-sm text-[#4CAF50]' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{link.name}</span>
                </div>
                {isActive && (
                  <motion.div layoutId="sidebar-active">
                    <ChevronRight className="w-4 h-4 text-[#4CAF50]" />
                  </motion.div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 mt-auto">
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-[#4CAF50] font-black text-sm">
                {role === "NGO" ? <Building2 className="w-5 h-5" /> : user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 truncate">
                  {role === "NGO" ? user?.organizationName : user?.fullName}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-[#4CAF50] font-black">
                  {role}
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all border border-red-100"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout Session</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100' : 'bg-transparent'
        }`}>
          <div className="px-4 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Mobile Menu Logo */}
              <Link href="/" className="lg:hidden flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#4CAF50] rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-gray-900 text-lg">ShareGoods</span>
              </Link>

              {/* Page Breadcrumb / Title (Optional) */}
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-gray-400">
                  Pages / <span className="text-gray-900">{currentLinks.find(l => l.href === pathname)?.name || 'Dashboard'}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 text-gray-400 hover:text-[#4CAF50] hover:bg-white bg-white/50 rounded-xl transition-all shadow-sm border border-gray-50"
                >
                  <Bell className="w-5 h-5" />
                </motion.button>
                
                <div className="lg:hidden">
                  <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                    className="p-2.5 bg-white text-gray-900 rounded-xl shadow-sm border border-gray-50"
                  >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="lg:hidden fixed inset-0 z-50 bg-white"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-6 border-b border-gray-50">
                    <span className="text-xl font-black text-gray-900">Menu</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-50 rounded-xl">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <nav className="flex-1 p-6 space-y-2">
                    {currentLinks.map((link, i) => {
                      const Icon = link.icon
                      return (
                        <motion.div
                          key={link.name}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Link
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center space-x-4 px-6 py-4 rounded-2xl text-lg font-bold transition-all ${
                              pathname === link.href
                                ? 'text-[#4CAF50] bg-green-50'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className="w-6 h-6" />
                            <span>{link.name}</span>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </nav>
                  <div className="p-6 border-t border-gray-50">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-6 py-4 bg-red-50 text-red-500 font-bold rounded-2xl transition-colors"
                    >
                      <span className="text-lg">Sign Out</span>
                      <LogOut className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {children}
            </motion.div>
          </div>

          {/* Footer */}
          <footer className="py-8 px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-8">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-[#4CAF50] rounded-lg flex items-center justify-center">
                  <Heart className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-900">ShareGoods</span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                © 2026 ShareGoods • Empowering Communities
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
