'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  useGetVendorOrdersQuery,
  useAcceptVendorOrderMutation,
  useMarkPreparingVendorOrderMutation,
  useMarkReadyVendorOrderMutation,
  useRejectVendorOrderMutation,
} from '@/store/services/vendorOrdersApi'
import {
  useGetAdminOrdersQuery,
  useCancelAdminOrderMutation,
} from '@/store/services/adminOrdersApi'
import type { VendorOrder, VendorOrderStatus, AdminOrder, OrderStatus, OrderType } from '@/types/api'
import { formatNaira, formatDateTime } from '@/lib/utils'
import {
  Search, ChevronLeft, ChevronRight, Eye, MoreHorizontal,
  Download, Loader2, CheckCircle, XCircle, Clock, Ban,
} from 'lucide-react'

const STATUS_CONFIG: Record<VendorOrderStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: '#fff6e8', text: '#ffa21d', label: 'Pending' },
  ACCEPTED: { bg: '#e0f9f7', text: '#3dc7be', label: 'Accepted' },
  PREPARING: { bg: '#f3eeff', text: '#8b5cf6', label: 'Preparing' },
  READY_FOR_PICKUP: { bg: '#e0f2fe', text: '#06b6d4', label: 'Ready for Pickup' },
  PICKED_UP: { bg: '#fef3c7', text: '#f59e0b', label: 'Picked Up' },
  IN_TRANSIT: { bg: '#eef1fb', text: '#3454d1', label: 'In Transit' },
  DELIVERED: { bg: '#e8faf2', text: '#17c666', label: 'Delivered' },
  CANCELLED: { bg: '#fdf0f0', text: '#ea4d4d', label: 'Cancelled' },
  FAILED: { bg: '#f3f4f6', text: '#6b7280', label: 'Failed' },
}

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as VendorOrderStatus[]

const TERMINAL_STATUSES: OrderStatus[] = ['DELIVERED', 'CANCELLED', 'FAILED']

const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  FOOD: 'Food',
  GROCERY: 'Grocery',
  RETAIL: 'Retail',
  PHARMACY: 'Pharmacy',
  PARCEL: 'Parcel',
  TRUCK: 'Truck',
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CONFIG[status as VendorOrderStatus]
  if (!s) return <span className="text-[11px] text-[#9ca3af]">{status}</span>
  return (
    <span className="text-[11px] font-medium rounded-full px-2 py-0.5 whitespace-nowrap" style={{ backgroundColor: s.bg, color: s.text }}>
      {s.label}
    </span>
  )
}

// ─── Vendor Admin ──────────────────────────────────────────────────────────

function OrderActionsMenu({ order, onClose }: { order: VendorOrder; onClose: () => void }) {
  const [accept] = useAcceptVendorOrderMutation()
  const [markPreparing] = useMarkPreparingVendorOrderMutation()
  const [markReady] = useMarkReadyVendorOrderMutation()
  const [reject] = useRejectVendorOrderMutation()
  const [loading, setLoading] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason] = useState('')

  async function run(fn: () => Promise<unknown>) {
    setLoading(true)
    try { await fn(); onClose() } finally { setLoading(false) }
  }

  if (showReject) return (
    <div className="absolute right-0 top-8 z-50 w-56 bg-white rounded-lg border border-[#e5e7eb] shadow-lg p-3 space-y-2">
      <p className="text-xs font-semibold text-[#283c50]">Reject order</p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (optional)…"
        className="w-full text-xs border border-[#e5e7eb] rounded p-2 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-[#3454d1]"
      />
      <div className="flex gap-2">
        <button onClick={() => setShowReject(false)} className="flex-1 text-xs py-1.5 rounded border border-[#e5e7eb] text-[#6b7885]">Cancel</button>
        <button
          disabled={loading}
          onClick={() => run(() => reject({ id: order.id, reason: reason || undefined }).unwrap())}
          className="flex-1 text-xs py-1.5 rounded text-white font-medium disabled:opacity-50"
          style={{ backgroundColor: '#ea4d4d' }}
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Reject'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="absolute right-0 top-8 z-50 w-44 bg-white rounded-lg border border-[#e5e7eb] shadow-lg py-1">
      {order.status === 'PENDING' && (
        <>
          <button
            onClick={() => run(() => accept(order.id).unwrap())}
            disabled={loading}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#17c666] hover:bg-[#f9fafb]"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Accept
          </button>
          <button
            onClick={() => setShowReject(true)}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#ea4d4d] hover:bg-[#f9fafb]"
          >
            <XCircle className="w-3.5 h-3.5" /> Reject
          </button>
        </>
      )}
      {order.status === 'ACCEPTED' && (
        <button
          onClick={() => run(() => markPreparing(order.id).unwrap())}
          disabled={loading}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#8b5cf6] hover:bg-[#f9fafb]"
        >
          <Clock className="w-3.5 h-3.5" /> Mark Preparing
        </button>
      )}
      {(order.status === 'ACCEPTED' || order.status === 'PREPARING') && (
        <button
          onClick={() => run(() => markReady(order.id).unwrap())}
          disabled={loading}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#06b6d4] hover:bg-[#f9fafb]"
        >
          <CheckCircle className="w-3.5 h-3.5" /> Mark Ready
        </button>
      )}
      <button onClick={onClose} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#6b7885] hover:bg-[#f9fafb] border-t border-[#f3f4f6] mt-1">
        Close
      </button>
    </div>
  )
}

function VendorOrdersTable() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<VendorOrderStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const limit = 10

  const { data, isLoading, isError } = useGetVendorOrdersQuery(
    statusFilter === 'ALL' ? { page, limit } : { status: statusFilter, page, limit },
    { pollingInterval: 10000 }
  )

  const orders = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  const filtered = search
    ? orders.filter((o) =>
        o.trackingCode.toLowerCase().includes(search.toLowerCase()) ||
        `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(search.toLowerCase())
      )
    : orders

  const statusTabs = [
    { value: 'ALL' as const, label: 'All' },
    { value: 'PENDING' as const, label: 'Pending' },
    { value: 'ACCEPTED' as const, label: 'Accepted' },
    { value: 'PREPARING' as const, label: 'Preparing' },
    { value: 'READY_FOR_PICKUP' as const, label: 'Ready' },
    { value: 'DELIVERED' as const, label: 'Delivered' },
    { value: 'CANCELLED' as const, label: 'Cancelled' },
  ]

  return (
    <div className="space-y-4" onClick={() => setOpenMenu(null)}>
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-0.5 p-1 bg-[#f3f4f6] rounded overflow-x-auto">
            {statusTabs.map((s) => (
              <button
                key={s.value}
                onClick={() => { setStatusFilter(s.value); setPage(1) }}
                className="text-xs font-medium px-3 py-1.5 rounded transition-all whitespace-nowrap"
                style={statusFilter === s.value
                  ? { backgroundColor: '#fff', color: '#3454d1', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }
                  : { color: '#6b7885' }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#4b5563] placeholder:text-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#3454d1] w-48"
            />
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-[#9ca3af]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading orders…
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-xs text-[#ea4d4d]">Failed to load orders.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                    {['Tracking', 'Customer', 'Type', 'Items', 'Amount', 'Status', 'Payment', 'Time', ''].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f9fafb]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-xs text-[#9ca3af]">No orders found.</td>
                    </tr>
                  ) : (
                    filtered.map((order) => (
                      <tr key={order.id} className="hover:bg-[#fafafa] transition-colors cursor-pointer" onClick={() => router.push(`/orders/${order.id}`)}>
                        <td className="px-4 py-2.5">
                          <span className="font-mono text-xs font-semibold text-[#3454d1]">{order.trackingCode}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          {order.customer ? (
                            <div>
                              <p className="text-xs font-medium text-[#283c50]">{order.customer.firstName} {order.customer.lastName}</p>
                              <p className="text-[11px] text-[#9ca3af] font-mono">{order.customer.phone}</p>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#9ca3af]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-[11px] text-[#6b7885] capitalize">{order.type.toLowerCase()}</span>
                        </td>
                        <td className="px-4 py-2.5 max-w-[140px]">
                          <span className="text-xs text-[#4b5563] truncate block">
                            {order.items.slice(0, 2).map((i) => i.name).join(', ')}
                            {order.items.length > 2 && ` +${order.items.length - 2}`}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs font-semibold text-[#283c50]">{formatNaira(order.totalKobo)}</span>
                        </td>
                        <td className="px-4 py-2.5"><StatusBadge status={order.status} /></td>
                        <td className="px-4 py-2.5">
                          <span className={`text-[11px] font-medium rounded-full px-2 py-0.5 ${order.paymentStatus === 'PAID' ? 'bg-[#e8faf2] text-[#17c666]' : 'bg-[#fff6e8] text-[#ffa21d]'}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-[11px] text-[#9ca3af]">{formatDateTime(order.createdAt)}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1 relative" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => router.push(`/orders/${order.id}`)}
                              className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#eef1fb]"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#3454d1]" />
                            </button>
                            {['PENDING', 'ACCEPTED', 'PREPARING'].includes(order.status) && (
                              <div className="relative">
                                <button
                                  onClick={() => setOpenMenu(openMenu === order.id ? null : order.id)}
                                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#f3f4f6]"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5 text-[#9ca3af]" />
                                </button>
                                {openMenu === order.id && (
                                  <OrderActionsMenu order={order} onClose={() => setOpenMenu(null)} />
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <TablePagination page={page} totalPages={totalPages} total={total} shown={filtered.length} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  )
}

// ─── System Admin ──────────────────────────────────────────────────────────

function CancelOrderDialog({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  const [cancel] = useCancelAdminOrderMutation()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    setLoading(true)
    try { await cancel({ id: order.id, reason: reason || undefined }).unwrap(); onClose() }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-xl p-5 w-80 space-y-3">
        <p className="text-sm font-semibold text-[#283c50]">Cancel order</p>
        <p className="text-xs text-[#6b7885]">
          Cancel <span className="font-mono font-semibold text-[#3454d1]">{order.trackingCode}</span>?
          {(order.paymentMethod === 'CARD' || order.paymentMethod === 'WALLET') && (
            <span className="block mt-1 text-[#ffa21d]">A refund will be triggered.</span>
          )}
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)…"
          className="w-full text-xs border border-[#e5e7eb] rounded p-2 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-[#3454d1]"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 text-xs py-2 rounded border border-[#e5e7eb] text-[#6b7885] hover:bg-[#f9fafb]">
            Keep order
          </button>
          <button
            disabled={loading}
            onClick={handleCancel}
            className="flex-1 text-xs py-2 rounded text-white font-medium disabled:opacity-50"
            style={{ backgroundColor: '#ea4d4d' }}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Cancel order'}
          </button>
        </div>
      </div>
    </div>
  )
}

function TablePagination({ page, totalPages, total, shown, onPage }: {
  page: number; totalPages: number; total: number; shown: number; onPage: (p: number) => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#f3f4f6]">
      <p className="text-xs text-[#9ca3af]">Showing {shown} of {total} orders</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="w-7 h-7 rounded flex items-center justify-center text-[#6b7885] hover:bg-[#f3f4f6] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
          <button
            key={i}
            onClick={() => onPage(i + 1)}
            className="w-7 h-7 rounded text-xs"
            style={page === i + 1 ? { backgroundColor: '#3454d1', color: '#fff', fontWeight: 600 } : { color: '#6b7885' }}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="w-7 h-7 rounded flex items-center justify-center text-[#6b7885] hover:bg-[#f3f4f6] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

function SystemOrdersTable() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL')
  const [typeFilter, setTypeFilter] = useState<OrderType | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [cancelOrder, setCancelOrder] = useState<AdminOrder | null>(null)
  const limit = 20

  const queryParams = {
    ...(statusFilter !== 'ALL' && { status: statusFilter }),
    ...(typeFilter !== 'ALL' && { type: typeFilter }),
    ...(search && { search }),
    ...(from && { from }),
    ...(to && { to }),
    page,
    limit,
  }

  const { data, isLoading, isError } = useGetAdminOrdersQuery(queryParams, { pollingInterval: 15000 })

  const orders = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  const statusTabs = [
    { value: 'ALL' as const, label: 'All' },
    { value: 'PENDING' as const, label: 'Pending' },
    { value: 'ACCEPTED' as const, label: 'Accepted' },
    { value: 'PREPARING' as const, label: 'Preparing' },
    { value: 'IN_TRANSIT' as const, label: 'In Transit' },
    { value: 'DELIVERED' as const, label: 'Delivered' },
    { value: 'CANCELLED' as const, label: 'Cancelled' },
  ]

  function resetFilters() {
    setStatusFilter('ALL'); setTypeFilter('ALL'); setSearch(''); setFrom(''); setTo(''); setPage(1)
  }

  return (
    <div className="space-y-4">
      {cancelOrder && <CancelOrderDialog order={cancelOrder} onClose={() => setCancelOrder(null)} />}

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-0.5 p-1 bg-[#f3f4f6] rounded overflow-x-auto">
            {statusTabs.map((s) => (
              <button
                key={s.value}
                onClick={() => { setStatusFilter(s.value); setPage(1) }}
                className="text-xs font-medium px-3 py-1.5 rounded transition-all whitespace-nowrap"
                style={statusFilter === s.value
                  ? { backgroundColor: '#fff', color: '#3454d1', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }
                  : { color: '#6b7885' }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Search tracking, customer…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-8 pr-3 py-1.5 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#4b5563] placeholder:text-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#3454d1] w-52"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as OrderType | 'ALL'); setPage(1) }}
            className="text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#4b5563] px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#3454d1]"
          >
            <option value="ALL">All types</option>
            {(Object.keys(ORDER_TYPE_LABELS) as OrderType[]).map((t) => (
              <option key={t} value={t}>{ORDER_TYPE_LABELS[t]}</option>
            ))}
          </select>
          <input
            type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setPage(1) }}
            className="text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#4b5563] px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#3454d1]"
          />
          <span className="text-xs text-[#9ca3af]">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); setPage(1) }}
            className="text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#4b5563] px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#3454d1]"
          />
          {(typeFilter !== 'ALL' || from || to) && (
            <button onClick={resetFilters} className="text-xs text-[#ea4d4d] hover:underline">Clear</button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-[#9ca3af]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading orders…
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-xs text-[#ea4d4d]">Failed to load orders.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                    {['Tracking', 'Customer', 'Vendor', 'Type', 'Amount', 'Status', 'Payment', 'Date', ''].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f9fafb]">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-xs text-[#9ca3af]">No orders found.</td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#fafafa] transition-colors cursor-pointer" onClick={() => router.push(`/orders/${order.id}`)}>
                        <td className="px-4 py-2.5">
                          <span className="font-mono text-xs font-semibold text-[#3454d1]">{order.trackingCode}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          {order.customer ? (
                            <div>
                              <p className="text-xs font-medium text-[#283c50]">{order.customer.firstName} {order.customer.lastName}</p>
                              <p className="text-[11px] text-[#9ca3af] font-mono">{order.customer.phone}</p>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#9ca3af]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          {order.vendor ? (
                            <div>
                              <p className="text-xs font-medium text-[#283c50] truncate max-w-[120px]">{order.vendor.name}</p>
                              <p className="text-[11px] text-[#9ca3af] capitalize">{order.vendor.type.toLowerCase()}</p>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#9ca3af]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-[11px] text-[#6b7885]">{ORDER_TYPE_LABELS[order.type]}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs font-semibold text-[#283c50]">{formatNaira(order.totalKobo)}</span>
                        </td>
                        <td className="px-4 py-2.5"><StatusBadge status={order.status} /></td>
                        <td className="px-4 py-2.5">
                          <span className={`text-[11px] font-medium rounded-full px-2 py-0.5 ${order.paymentStatus === 'PAID' ? 'bg-[#e8faf2] text-[#17c666]' : 'bg-[#fff6e8] text-[#ffa21d]'}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-[11px] text-[#9ca3af]">{formatDateTime(order.createdAt)}</span>
                        </td>
                        <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => router.push(`/orders/${order.id}`)}
                              className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#eef1fb]"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#3454d1]" />
                            </button>
                            {!TERMINAL_STATUSES.includes(order.status) && (
                              <button
                                onClick={() => setCancelOrder(order)}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#fdf0f0]"
                                title="Force cancel"
                              >
                                <Ban className="w-3.5 h-3.5 text-[#ea4d4d]" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <TablePagination page={page} totalPages={totalPages} total={total} shown={orders.length} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { data: session } = useSession()
  const isVendor = session?.admin?.type === 'VENDOR'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#283c50]">Orders</h1>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            {isVendor ? 'Manage your incoming and active orders' : 'Monitor and manage all platform orders'}
          </p>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-[#6b7885] bg-white border border-[#e5e7eb] rounded px-3 py-1.5 hover:bg-[#f9fafb]">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>
      {isVendor ? <VendorOrdersTable /> : <SystemOrdersTable />}
    </div>
  )
}
