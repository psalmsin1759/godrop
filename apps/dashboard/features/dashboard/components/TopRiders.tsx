'use client'

import { useGetRidersQuery } from '@/store/services/ridersApi'
import { Star, Loader2 } from 'lucide-react'

const riderColors = ['#3454d1', '#17c666', '#3dc7be', '#ffa21d', '#ea4d4d', '#6f42c1']

function CircleProgress({ pct, color }: { pct: number; color: string }) {
  const r = 16
  const circumference = 2 * Math.PI * r
  const dash = (pct / 100) * circumference
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0 -rotate-90">
      <circle cx="20" cy="20" r={r} fill="none" stroke="#f3f4f6" strokeWidth="3" />
      <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round" />
    </svg>
  )
}

export default function TopRiders() {
  const { data, isLoading } = useGetRidersQuery({ page: 1, limit: 6 })
  const riders = data?.data ?? []

  const sorted = [...riders].sort((a, b) => (b._count?.orders ?? 0) - (a._count?.orders ?? 0))
  const maxOrders = Math.max(...sorted.map((r) => r._count?.orders ?? 0), 1)

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Top Riders</h3>
        <a href="/riders" className="text-xs text-[#3454d1] font-medium hover:underline">View all →</a>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-4 h-4 animate-spin text-[#3454d1]" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-xs text-[#9ca3af]">No riders yet.</div>
      ) : (
        <div className="divide-y divide-[#f9fafb]">
          {sorted.map((rider, i) => {
            const color = riderColors[i % riderColors.length]
            const orders = rider._count?.orders ?? 0
            const pct = Math.round((orders / maxOrders) * 100)
            return (
              <div key={rider.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#fafafa] transition-colors">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: color }}>
                  {rider.firstName[0]}{rider.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#283c50] truncate">{rider.firstName} {rider.lastName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: rider.isAvailable ? '#17c666' : '#d1d5db' }} />
                    <span className="text-[11px] text-[#9ca3af]">{rider.isAvailable ? 'Online' : 'Offline'}</span>
                    {rider.rating != null && (
                      <>
                        <span className="text-[11px] text-[#9ca3af]">·</span>
                        <Star className="w-2.5 h-2.5 text-[#ffa21d]" fill="#ffa21d" />
                        <span className="text-[11px] text-[#9ca3af]">{rider.rating.toFixed(1)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="relative shrink-0">
                  <CircleProgress pct={pct} color={color} />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color }}>
                    {orders}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
