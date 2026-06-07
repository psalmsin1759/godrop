'use client'

import { mockVendors } from '@/lib/mock-data'
import { Store } from 'lucide-react'

const maxOrders = Math.max(...mockVendors.map((v) => v.ordersThisMonth))

const vendorColors = ['#1E5FFF', '#1DB980', '#FF6A2C', '#E8930C', '#FF3B30', '#7A5AE0']

export default function TopVendors() {
  const sorted = [...mockVendors].sort((a, b) => b.ordersThisMonth - a.ordersThisMonth)

  return (
    <div className="card animate-fade-in animate-delay-500" style={{ animationFillMode: 'both' }}>
      <div className="card-header">
        <h3 className="card-title">Top Vendors</h3>
        <a href="/vendors" className="text-xs text-[#1E5FFF] font-medium hover:underline">
          View all →
        </a>
      </div>

      <div className="divide-y divide-[#F7F9FC]">
        {sorted.map((vendor, i) => {
          const color = vendorColors[i % vendorColors.length]
          const pct = Math.round((vendor.ordersThisMonth / maxOrders) * 100)
          return (
            <div key={vendor.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#F7F9FC] transition-colors">
              {/* Icon */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}18` }}
              >
                <Store className="w-4 h-4" style={{ color }} />
              </div>

              {/* Name + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-[#0D1426] truncate">{vendor.name}</p>
                  <span className="text-xs font-semibold text-[#0D1426] ml-2 shrink-0">
                    {vendor.ordersThisMonth}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#EDF0F6] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
