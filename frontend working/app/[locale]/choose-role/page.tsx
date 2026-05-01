import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Choose Your Role - ShareGoods",
  description: "Select whether you want to donate items or receive donations to continue your ShareGoods registration.",
}

export default function ChooseRolePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header with Back Button */}
      <header className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-2">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-[#4CAF50] transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-[#4CAF50] rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">ShareGoods</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Join ShareGoods as a <span className="text-[#4CAF50]">Donor</span> or{" "}
                <span className="text-[#4CAF50]">Recipient</span>
              </h1>

              <p className="text-sm text-gray-600 max-w-xl mx-auto">
                Select your role to continue registration and start making a difference in your community.
              </p>
            </div>

            {/* Role Selection Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Donor Card */}
              <Link href="/register/donor" className="group">
                <Card className="h-full bg-white rounded-xl shadow-lg border-2 border-transparent hover:border-[#4CAF50] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col">
                  <CardContent className="p-5 text-center flex flex-col flex-1">
                    <div className="w-12 h-12 bg-[#4CAF50] bg-opacity-10 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#4CAF50] transition-colors duration-300">
                      <Heart className="w-6 h-6 text-[#4CAF50] group-hover:text-white transition-colors duration-300" />
                    </div>

                    <div className="space-y-2 my-4 flex-1">
                      <h2 className="text-xl font-bold text-gray-900">Donor</h2>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Share your extra items with people in need and make a positive impact in your community.
                      </p>
                    </div>

                    <div className="mt-auto">
                      <div className="inline-flex items-center justify-center bg-[#4CAF50] text-white font-semibold px-4 py-2 text-sm rounded-lg group-hover:bg-[#45a049] transition-colors">
                        Get Started as Donor
                        <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Recipient Card */}
              <Link href="/register/recipient" className="group">
                <Card className="h-full bg-white rounded-xl shadow-lg border-2 border-transparent hover:border-[#4CAF50] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col">
                  <CardContent className="p-5 text-center flex flex-col flex-1">
                    <div className="w-12 h-12 bg-[#4CAF50] bg-opacity-10 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#4CAF50] transition-colors duration-300">
                      <Users className="w-6 h-6 text-[#4CAF50] group-hover:text-white transition-colors duration-300" />
                    </div>

                    <div className="space-y-2 my-4 flex-1">
                      <h2 className="text-xl font-bold text-gray-900">Recipient</h2>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Find essential items you need from generous community members who want to help.
                      </p>
                    </div>

                    <div className="mt-auto">
                      <div className="inline-flex items-center justify-center bg-[#4CAF50] text-white font-semibold px-4 py-2 text-sm rounded-lg group-hover:bg-[#45a049] transition-colors">
                        Get Started as Recipient
                        <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Additional Info */}
            <div className="text-center mt-4">
              <p className="text-gray-500 text-xs">
                Don't worry, you can always change your role later in your account settings.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-4">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500 text-xs">
            <p>&copy; {new Date().getFullYear()} ShareGoods. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
