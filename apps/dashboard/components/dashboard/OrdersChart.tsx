'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { ordersChartData } from '@/lib/mock-data'
import { formatNumber } from '@/lib/utils'

const totalCompleted = ordersChartData.reduce((s, d) => s + d.completed, 0)
const totalCancelled = ordersChartData.reduce((s, d) => s + d.cancelled, 0)

interface CustomTooltipProps {
  active?: boolean
  payload?: { color: string; name: string; value: number }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-card-md p-3 text-xs">
      <p className="font-semibold text-[#283c50] mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-[#6b7885]">{p.name}:</span>
          <span className="font-semibold text-[#283c50]">{formatNumber(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function OrdersChart() {
  return (
    <div className="card animate-fade-in animate-delay-200" style={{ animationFillMode: 'both' }}>
      <div className="card-header">
        <h3 className="card-title">Orders Record</h3>
        <div className="flex items-center gap-4 text-xs text-[#6b7885]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#3454d1' }} />
            Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#ea4d4d' }} />
            Cancelled
          </span>
        </div>
      </div>

      <div className="p-4">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={ordersChartData} barGap={2} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(52,84,209,0.04)' }} />
            <Bar dataKey="completed" name="Completed" fill="#3454d1" radius={[3, 3, 0, 0]} />
            <Bar dataKey="cancelled" name="Cancelled" fill="#ea4d4d" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-[#f3f4f6]">
          <div>
            <p className="text-[11px] text-[#9ca3af]">Total Completed</p>
            <p className="text-sm font-bold text-[#283c50]">{formatNumber(totalCompleted)}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#9ca3af]">Total Cancelled</p>
            <p className="text-sm font-bold text-[#ea4d4d]">{formatNumber(totalCancelled)}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#9ca3af]">Success Rate</p>
            <p className="text-sm font-bold text-[#17c666]">
              {((totalCompleted / (totalCompleted + totalCancelled)) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
