'use client'

import { Card, CardContent } from "@/components/ui/card"
import { 
  PieChart, Pie, Cell, 
  Tooltip, ResponsiveContainer 
} from "recharts"

const COLORS = ["#4CAF50", "#2196F3", "#9C27B0", "#FFC107", "#F44336"]

interface DonationTrendsProps {
  data: { name: string; value: number }[]
}

export default function DonationTrends({ data }: DonationTrendsProps) {
  if (data.length === 0) return (
    <Card className="bg-white border-0 shadow-sm">
      <CardContent className="p-6 flex flex-col items-center justify-center h-[300px] text-center">
        <p className="text-sm text-gray-500 font-medium">No donation data available yet.</p>
      </CardContent>
    </Card>
  )

  return (
    <Card className="bg-white border-0 shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900">Impact Analysis</h3>
          <span className="text-[10px] font-bold text-[#4CAF50] bg-green-50 px-2 py-1 rounded-md uppercase tracking-wider">Real-time</span>
        </div>
        
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  padding: '12px 16px'
                }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-6">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center space-x-3 group/item cursor-default">
              <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-gray-700 truncate group-hover/item:text-[#4CAF50] transition-colors">{entry.name}</p>
                <p className="text-[10px] text-gray-400 font-medium">{entry.value} Items</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
