'use client'

import { Card, CardContent } from "@/components/ui/card"

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="bg-white border-0 shadow-sm animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function ListingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="bg-white border-0 shadow-sm animate-pulse">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-32 h-32 rounded-xl bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="flex justify-between">
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-16" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="flex space-x-4">
                  <div className="h-3 bg-gray-200 rounded w-12" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
                <div className="flex justify-between mt-auto">
                  <div className="h-6 bg-gray-200 rounded w-1/4" />
                  <div className="h-8 bg-gray-200 rounded w-24" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <Card className="bg-white border-0 shadow-sm animate-pulse">
      <CardContent className="p-6">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-6" />
        <div className="h-[200px] w-full rounded-full bg-gray-100 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-white" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-gray-200" />
              <div className="h-3 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
