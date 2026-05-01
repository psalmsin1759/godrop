'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { categoryData } from '@/lib/mock-data'

interface CustomTooltipProps {
  active?: boolean
  payload?: { name: string; value: number; payload: { color: string } }[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-card-md px-3 py-2 text-xs">
      <span className="font-semibold text-[#283c50]">{item.name}: </span>
      <span style={{ color: item.payload.color }}>{item.value}%</span>
    </div>
  )
}

export default function CategoryDonut() {
  return (
    <div className="card animate-fade-in animate-delay-400" style={{ animationFillMode: 'both' }}>
      <div className="card-header">
        <h3 className="card-title">Order Categories</h3>
        <span className="text-[11px] text-[#9ca3af]">This month</span>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-center">
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Center label is handled with absolute */}
        <div className="space-y-2 mt-2">
          {categoryData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-[#4b5563]">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  />
                </div>
                <span className="text-xs font-semibold text-[#283c50] w-8 text-right">{item.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
