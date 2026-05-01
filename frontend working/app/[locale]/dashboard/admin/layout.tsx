'use client'

import { useState, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Package,
  Building2,
  Handshake,
  Bell,
  LogOut,
  Menu,
  X,
  TrendingUp,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarNav,
  SidebarNavItem,
  SidebarFooter,
} from '@/components/ui/sidebar'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const adminName = 'Admin User'

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard/admin',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: 'Analytics',
      href: '/dashboard/admin/analytics',
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      title: 'Users',
      href: '/dashboard/admin/users',
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: 'Donations',
      href: '/dashboard/admin/donations',
      icon: <Package className="w-5 h-5" />,
    },
    {
      title: 'NGO Verification',
      href: '/dashboard/admin/ngos',
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      title: 'Messages',
      href: '/dashboard/messages',
      icon: <MessageCircle className="w-5 h-5" />,
    },
    {
      title: 'Moderation',
      href: '/dashboard/admin/moderation',
      icon: <Bell className="w-5 h-5" />,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#A7D129] rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ShareGoods</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 p-2 rounded-lg ${pathname === item.href ? 'bg-[#A7D129]/10 text-[#A7D129]' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <SidebarProvider>
          <Sidebar className="hidden md:flex">
            <SidebarHeader className="p-4 border-b">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#4CAF50] rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">ShareGoods</span>
              </Link>
            </SidebarHeader>
            <SidebarNav className="p-2 flex-1">
              {navItems.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  href={item.href}
                  active={pathname === item.href}
                  className={`flex items-center space-x-3 p-2 rounded-lg ${pathname === item.href ? 'bg-[#4CAF50]/10 text-[#4CAF50]' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarNavItem>
              ))}
            </SidebarNav>
            <SidebarFooter className="p-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">{adminName}</span>
                </div>
                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </SidebarFooter>
          </Sidebar>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-8">
            <div className="container mx-auto">
              {children}
            </div>
          </main>
        </SidebarProvider>
      </div>
    </div>
  )
}