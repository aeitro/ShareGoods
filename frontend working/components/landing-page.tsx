import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, Package, Star, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from "./LanguageSwitcher"

export default function LandingPage() {
  const t = useTranslations('Index')

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-[#4CAF50] rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">ShareGoods</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="#home" className="text-sm text-gray-700 hover:text-[#4CAF50] transition-colors">
                Home
              </Link>
              <Link href="#how-it-works" className="text-sm text-gray-700 hover:text-[#4CAF50] transition-colors">
                How It Works
              </Link>
              <Link href="#about" className="text-sm text-gray-700 hover:text-[#4CAF50] transition-colors">
                About
              </Link>
              <Link href="#testimonials" className="text-sm text-gray-700 hover:text-[#4CAF50] transition-colors">
                Testimonials
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Login
                </Button>
              </Link>
              <Link href="/choose-role">
                <Button size="sm" className="bg-[#4CAF50] hover:bg-[#45a049] text-white">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  {t('title')}
                </h1>
                <p className="text-base text-gray-600 leading-relaxed">
                  {t('description')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/choose-role">
                  <Button className="bg-[#4CAF50] hover:bg-[#45a049] text-white px-6 py-2 rounded-lg">
                    {t('getStarted')}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <Image
                src="/placeholder.jpg"
                alt="People sharing and donating items"
                width={500}
                height={400}
                className="rounded-xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">How It Works</h2>
            <p className="text-sm text-gray-600 max-w-xl mx-auto">
              Sharing your items and helping others is simple with our three-step process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-5 bg-white rounded-xl shadow-lg border-0">
              <CardContent className="space-y-3">
                <div className="w-12 h-12 bg-[#4CAF50] rounded-full flex items-center justify-center mx-auto">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">1. List Your Items</h3>
                <p className="text-sm text-gray-600">
                  Upload photos and descriptions of clothes, shoes, or essentials you want to donate
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-5 bg-white rounded-xl shadow-lg border-0">
              <CardContent className="space-y-3">
                <div className="w-12 h-12 bg-[#4CAF50] rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">2. Connect with Recipients</h3>
                <p className="text-sm text-gray-600">
                  We match your donations with people in need in your local community
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-5 bg-white rounded-xl shadow-lg border-0">
              <CardContent className="space-y-3">
                <div className="w-12 h-12 bg-[#4CAF50] rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">3. Make an Impact</h3>
                <p className="text-sm text-gray-600">
                  Arrange pickup or delivery and see the positive impact of your generosity
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="relative">
              <Image
                src="/placeholder.jpg"
                alt="Community members helping each other"
                width={400}
                height={300}
                className="rounded-xl shadow-xl"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Building Stronger Communities Through Sharing
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  ShareGoods was founded on the belief that everyone deserves access to basic necessities. We connect
                  generous donors with individuals and families in need, creating a network of support that strengthens
                  our communities.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Our platform makes it easy to give and receive help, fostering connections that go beyond material
                  donations to build lasting relationships and mutual support.
                </p>
              </div>

              <Button className="bg-[#4CAF50] hover:bg-[#45a049] text-white px-5 py-2 rounded-lg">
                Learn More About Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-8 bg-[#4CAF50]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">25K+</div>
              <div className="text-sm text-green-100">Items Donated</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">12K+</div>
              <div className="text-sm text-green-100">People Helped</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">150+</div>
              <div className="text-sm text-green-100">Cities</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">98%</div>
              <div className="text-sm text-green-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">What Our Community Says</h2>
            <p className="text-sm text-gray-600 max-w-xl mx-auto">
              Real stories from donors and recipients who have experienced the power of sharing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-5 bg-white rounded-xl shadow-lg border-0">
              <CardContent className="space-y-3">
                <div className="flex text-[#4CAF50]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 italic">
                  "ShareGoods helped me find winter coats for my children when we were going through a tough time. The
                  kindness of strangers restored my faith in humanity."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Maria Rodriguez</div>
                    <div className="text-xs text-gray-500">Recipient</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-5 bg-white rounded-xl shadow-lg border-0">
              <CardContent className="space-y-3">
                <div className="flex text-[#4CAF50]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 italic">
                  "I love how easy it is to donate items I no longer need. Knowing they're going directly to families in
                  my community makes it so much more meaningful."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">James Chen</div>
                    <div className="text-xs text-gray-500">Donor</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-5 bg-white rounded-xl shadow-lg border-0">
              <CardContent className="space-y-3">
                <div className="flex text-[#4CAF50]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 italic">
                  "The platform connected me with a local family who needed professional clothes for job interviews. It
                  felt amazing to help someone get back on their feet."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Sarah Johnson</div>
                    <div className="text-xs text-gray-500">Donor</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-8 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to Make a Difference?</h2>
            <p className="text-sm text-gray-300">
              Join thousands of community members who are already sharing and caring. Start your journey of giving
              today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/choose-role">
                <Button className="bg-[#4CAF50] hover:bg-[#45a049] text-white px-6 py-2 rounded-lg">
                  Start Donating
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* About */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-[#4CAF50] rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">ShareGoods</span>
              </div>
              <p className="text-sm text-gray-600">Connecting communities through the power of sharing and caring.</p>
              <div className="flex space-x-3">
                <Facebook className="w-4 h-4 text-gray-400 hover:text-[#4CAF50] cursor-pointer" />
                <Twitter className="w-4 h-4 text-gray-400 hover:text-[#4CAF50] cursor-pointer" />
                <Instagram className="w-4 h-4 text-gray-400 hover:text-[#4CAF50] cursor-pointer" />
              </div>
            </div>

            {/* About Links */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">About</h3>
              <div className="space-y-2">
                <Link href="#" className="block text-sm text-gray-600 hover:text-[#4CAF50]">
                  Our Story
                </Link>
                <Link href="#" className="block text-sm text-gray-600 hover:text-[#4CAF50]">
                  How It Works
                </Link>
                <Link href="#" className="block text-sm text-gray-600 hover:text-[#4CAF50]">
                  Impact
                </Link>
                <Link href="#" className="block text-sm text-gray-600 hover:text-[#4CAF50]">
                  Blog
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Contact</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="w-3 h-3" />
                  <span>hello@sharegoods.com</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-3 h-3" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-3 h-3" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>

            {/* Legal */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
              <div className="space-y-2">
                <Link href="#" className="block text-sm text-gray-600 hover:text-[#4CAF50]">
                  Terms of Service
                </Link>
                <Link href="#" className="block text-sm text-gray-600 hover:text-[#4CAF50]">
                  Privacy Policy
                </Link>
                <Link href="#" className="block text-sm text-gray-600 hover:text-[#4CAF50]">
                  Cookie Policy
                </Link>
                <Link href="#" className="block text-sm text-gray-600 hover:text-[#4CAF50]">
                  Support
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-6 pt-4 text-center text-gray-600">
            <p className="text-xs">&copy; {new Date().getFullYear()} ShareGoods. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
