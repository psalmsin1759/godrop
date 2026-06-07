'use client'

import { mockOrders, type OrderStatus, type OrderCategory } from '@/lib/mock-data'
import { formatNaira, formatRelativeTime } from '@/lib/utils'
import { MoreHorizontal, Eye } from 'lucide-react'

const statusConfig: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  delivered: { bg: '#DFF5EC', text: '#1DB980', label: 'Delivered' },
  in_transit: { bg: '#E7EEFF', text: '#1E5FFF', label: 'In Transit' },
  pending: { bg: '#FBEDD7', text: '#E8930C', label: 'Pending' },
  cancelled: { bg: '#FFE3E1', text: '#FF3B30', label: 'Cancelled' },
}

const categoryConfig: Record<OrderCategory, { bg: string; text: string; label: string }> = {
  food: { bg: '#E7EEFF', text: '#1E5FFF', label: 'Food' },
  grocery: { bg: '#DFF5EC', text: '#1DB980', label: 'Grocery' },
  parcel: { bg: '#FFEAE1', text: '#FF6A2C', label: 'Parcel' },
  retail: { bg: '#FBEDD7', text: '#E8930C', label: 'Retail' },
  truck: { bg: '#FFE3E1', text: '#FF3B30', label: 'Truck' },
}

export default function RecentOrdersTable() {
  return (
    <div className="card animate-fade-in animate-delay-400" style={{ animationFillMode: 'both' }}>
      <div className="card-header">
        <h3 className="card-title">Recent Orders</h3>
        <a href="/orders" className="text-xs text-[#1E5FFF] font-medium hover:underline">
          View all →
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#EDF0F6]">
              {['Order ID', 'Customer', 'Category', 'Amount', 'Status', 'Time', ''].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-2.5"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F7F9FC]">
            {mockOrders.map((order) => {
              const s = statusConfig[order.status]
              const c = categoryConfig[order.category]
              return (
                <tr key={order.id} className="hover:bg-[#F7F9FC] transition-colors">
                  <td className="px-4 py-2.5">
                    <span className="text-xs font-mono font-semibold text-[#1E5FFF]">{order.id}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg, #1E5FFF, #FF6A2C)' }}
                      >
                        {order.customerName.charAt(0)}
                      </div>
                      <span className="text-xs text-[#0D1426] font-medium truncate max-w-[120px]">
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
                    <span className="text-xs font-semibold text-[#0D1426]">
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
                    <span className="text-[11px] text-[#9AA1B4]">
                      {formatRelativeTime(order.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#E7EEFF] transition-colors">
                        <Eye className="w-3.5 h-3.5 text-[#1E5FFF]" />
                      </button>
                      <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#EDF0F6] transition-colors">
                        <MoreHorizontal className="w-3.5 h-3.5 text-[#9AA1B4]" />
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
