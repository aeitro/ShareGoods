import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Donor Dashboard | ShareGoods",
  description: "Track, filter, and visualize your donations and sales with our donor dashboard.",
}

export default function DonorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}