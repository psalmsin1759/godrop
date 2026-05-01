'use client'

import { mockOrders, type OrderStatus, type OrderCategory } from '@/lib/mock-data'
import { formatNaira, formatRelativeTime } from '@/lib/utils'
import { MoreHorizontal, Eye } from 'lucide-react'

const statusConfig: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  delivered: { bg: '#e8faf2', text: '#17c666', label: 'Delivered' },
  in_transit: { bg: '#eef1fb', text: '#3454d1', label: 'In Transit' },
  pending: { bg: '#fff6e8', text: '#ffa21d', label: 'Pending' },
  cancelled: { bg: '#fdf0f0', text: '#ea4d4d', label: 'Cancelled' },
}

const categoryConfig: Record<OrderCategory, { bg: string; text: string; label: string }> = {
  food: { bg: '#eef1fb', text: '#3454d1', label: 'Food' },
  grocery: { bg: '#e8faf2', text: '#17c666', label: 'Grocery' },
  parcel: { bg: '#e8f8f7', text: '#3dc7be', label: 'Parcel' },
  retail: { bg: '#fff6e8', text: '#ffa21d', label: 'Retail' },
  truck: { bg: '#fdf0f0', text: '#ea4d4d', label: 'Truck' },
}

export default function RecentOrdersTable() {
  return (
    <div className="card animate-fade-in animate-delay-400" style={{ animationFillMode: 'both' }}>
      <div className="card-header">
        <h3 className="card-title">Recent Orders</h3>
        <a href="/orders" className="text-xs text-[#3454d1] font-medium hover:underline">
          View all →
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f3f4f6]">
              {['Order ID', 'Customer', 'Category', 'Amount', 'Status', 'Time', ''].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-2.5"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f9fafb]">
            {mockOrders.map((order) => {
              const s = statusConfig[order.status]
              const c = categoryConfig[order.category]
              return (
                <tr key={order.id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-4 py-2.5">
                    <span className="text-xs font-mono font-semibold text-[#3454d1]">{order.id}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg, #3454d1, #3dc7be)' }}
                      >
                        {order.customerName.charAt(0)}
                      </div>
                      <span className="text-xs text-[#283c50] font-medium truncate max-w-[120px]">
                        {order.customerName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="text-[11px] font-medium rounded-full px-2 py-0.5"
                      style={{ backgroundColor: c.bg, color: c.text }}
                    >
                      {c.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs font-semibold text-[#283c50]">
                      {formatNaira(order.amountKobo)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="text-[11px] font-medium rounded-full px-2 py-0.5"
                      style={{ backgroundColor: s.bg, color: s.text }}
                    >
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[11px] text-[#9ca3af]">
                      {formatRelativeTime(order.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#eef1fb] transition-colors">
                        <Eye className="w-3.5 h-3.5 text-[#3454d1]" />
                      </button>
                      <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#f3f4f6] transition-colors">
                        <MoreHorizontal className="w-3.5 h-3.5 text-[#9ca3af]" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
