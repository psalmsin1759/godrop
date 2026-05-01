'use client'

import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { sparklineTotal } from '@/lib/mock-data'
import { formatNaira, formatNumber } from '@/lib/utils'
import { ArrowUpRight } from 'lucide-react'

const recentItems = [
  { id: 'GD-102847', label: 'Mama Cass Kitchen', amount: 450000, status: 'in_transit' },
  { id: 'GD-102846', label: 'FreshMart Grocery', amount: 780000, status: 'delivered' },
  { id: 'GD-102845', label: 'QuickSend Parcel', amount: 250000, status: 'pending' },
]

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  delivered: { bg: '#e8faf2', text: '#17c666', label: 'Delivered' },
  in_transit: { bg: '#eef1fb', text: '#3454d1', label: 'In Transit' },
  pending: { bg: '#fff6e8', text: '#ffa21d', label: 'Pending' },
}

export default function DeliverySummaryCard() {
  return (
    <div
      className="rounded-lg overflow-hidden animate-fade-in animate-delay-300 flex flex-col"
      style={{
        animationFillMode: 'both',
        background: 'linear-gradient(135deg, #3454d1 0%, #1e3aa8 100%)',
      }}
    >
      {/* Top section */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-white/70 text-xs font-medium">Total Deliveries</p>
            <p className="text-3xl font-bold text-white leading-none mt-1">
              {formatNumber(30549)}
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            <ArrowUpRight className="w-3 h-3" />
            <span>+12%</span>
          </div>
        </div>
        <p className="text-white/50 text-[11px]">All time deliveries</p>
      </div>

      {/* Sparkline */}
      <div className="px-0 -mb-1">
        <ResponsiveContainer width="100%" height={64}>
          <AreaChart data={sparklineTotal} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fff" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#fff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke="#fff"
              strokeWidth={1.5}
              fill="url(#totalGrad)"
              dot={false}
            />
            <Tooltip
              content={() => null}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent orders list */}
      <div className="bg-white flex-1">
        <div className="px-4 py-2 border-b border-[#f3f4f6]">
          <p className="text-[11px] font-semibold text-[#6b7885] uppercase tracking-wide">Recent Orders</p>
        </div>
        <div className="divide-y divide-[#f3f4f6]">
          {recentItems.map((item) => {
            const s = statusStyles[item.status] ?? statusStyles.pending
            return (
              <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#283c50] truncate">{item.label}</p>
                  <p className="text-[11px] text-[#9ca3af]">{item.id}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                  <p className="text-xs font-semibold text-[#283c50]">{formatNaira(item.amount)}</p>
                  <span
                    className="text-[10px] font-medium rounded-full px-1.5 py-0.5"
                    style={{ backgroundColor: s.bg, color: s.text }}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
