'use client'

import { upcomingDeliveries, type OrderCategory } from '@/lib/mock-data'
import { Clock } from 'lucide-react'

const categoryColors: Record<OrderCategory, string> = {
  food: '#1E5FFF',
  grocery: '#1DB980',
  parcel: '#FF6A2C',
  retail: '#E8930C',
  truck: '#FF3B30',
}

export default function UpcomingDeliveries() {
  return (
    <div className="card animate-fade-in animate-delay-500" style={{ animationFillMode: 'both' }}>
      <div className="card-header">
        <h3 className="card-title">Upcoming Deliveries</h3>
        <span className="text-[11px] text-[#9AA1B4] flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Today
        </span>
      </div>

      <div className="divide-y divide-[#F7F9FC]">
        {upcomingDeliveries.map((item) => {
          const color = categoryColors[item.category]
          return (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#F7F9FC] transition-colors">
              {/* Rider avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: color }}
              >
                {item.riderInitials}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#0D1426] truncate">{item.summary}</p>
                <p className="text-[11px] text-[#9AA1B4]">{item.riderName}</p>
              </div>

              {/* Time */}
              <div className="shrink-0 text-right">
                <span
                  className="text-[11px] font-semibold rounded-full px-2 py-0.5"
                  style={{ backgroundColor: `${color}18`, color }}
                >
                  {item.time}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-4 pb-3 pt-2">
        <a
          href="/orders"
          className="block text-center text-xs font-medium text-[#1E5FFF] hover:underline"
        >
          View full schedule →
        </a>
      </div>
    </div>
  )
}
