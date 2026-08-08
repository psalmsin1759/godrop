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
import { exportToCsv } from '@/lib/exportCsv'
import {
  Search, ChevronLeft, ChevronRight, Eye, MoreHorizontal,
  Download, Loader2, CheckCircle, XCircle, Clock, Ban,
} from 'lucide-react'

const STATUS_CONFIG: Record<VendorOrderStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: '#FBEDD7', text: '#E8930C', label: 'Pending' },
  ACCEPTED: { bg: '#FFEAE1', text: '#FF6A2C', label: 'Accepted' },
  PREPARING: { bg: '#F0EAFA', text: '#7A5AE0', label: 'Preparing' },
  READY_FOR_PICKUP: { bg: '#e0f2fe', text: '#06b6d4', label: 'Ready for Pickup' },
  PICKED_UP: { bg: '#FBEDD7', text: '#E8930C', label: 'Picked Up' },
  IN_TRANSIT: { bg: '#E7EEFF', text: '#1E5FFF', label: 'In Transit' },
  DELIVERED: { bg: '#DFF5EC', text: '#1DB980', label: 'Delivered' },
  CANCELLED: { bg: '#FFE3E1', text: '#FF3B30', label: 'Cancelled' },
  FAILED: { bg: '#EDF0F6', text: '#9AA1B4', label: 'Failed' },
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
  if (!s) return <span className="text-[11px] text-[#9AA1B4]">{status}</span>
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
    <div className="absolute right-0 top-8 z-50 w-56 bg-white rounded-lg border border-[#E7EAF1] shadow-lg p-3 space-y-2">
      <p className="text-xs font-semibold text-[#0D1426]">Reject order</p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (optional)…"
        className="w-full text-xs border border-[#E7EAF1] rounded p-2 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]"
      />
      <div className="flex gap-2">
        <button onClick={() => setShowReject(false)} className="flex-1 text-xs py-1.5 rounded border border-[#E7EAF1] text-[#525A72]">Cancel</button>
        <button
          disabled={loading}
          onClick={() => run(() => reject({ id: order.id, reason: reason || undefined }).unwrap())}
          className="flex-1 text-xs py-1.5 rounded text-white font-medium disabled:opacity-50"
          style={{ backgroundColor: '#FF3B30' }}
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Reject'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="absolute right-0 top-8 z-50 w-44 bg-white rounded-lg border border-[#E7EAF1] shadow-lg py-1">
      {order.status === 'PENDING' && (
        <>
          <button
            onClick={() => run(() => accept(order.id).unwrap())}
            disabled={loading}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#1DB980] hover:bg-[#F7F9FC]"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Accept
          </button>
          <button
            onClick={() => setShowReject(true)}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#FF3B30] hover:bg-[#F7F9FC]"
          >
            <XCircle className="w-3.5 h-3.5" /> Reject
          </button>
        </>
      )}
      {order.status === 'ACCEPTED' && (
        <button
          onClick={() => run(() => markPreparing(order.id).unwrap())}
          disabled={loading}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#7A5AE0] hover:bg-[#F7F9FC]"
        >
          <Clock className="w-3.5 h-3.5" /> Mark Preparing
        </button>
      )}
      {(order.status === 'ACCEPTED' || order.status === 'PREPARING') && (
        <button
          onClick={() => run(() => markReady(order.id).unwrap())}
          disabled={loading}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#06b6d4] hover:bg-[#F7F9FC]"
        >
          <CheckCircle className="w-3.5 h-3.5" /> Mark Ready
        </button>
      )}
      <button onClick={onClose} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#525A72] hover:bg-[#F7F9FC] border-t border-[#EDF0F6] mt-1">
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
          <div className="flex items-center gap-0.5 p-1 bg-[#EDF0F6] rounded overflow-x-auto">
            {statusTabs.map((s) => (
              <button
                key={s.value}
                onClick={() => { setStatusFilter(s.value); setPage(1) }}
                className="text-xs font-medium px-3 py-1.5 rounded transition-all whitespace-nowrap"
                style={statusFilter === s.value
                  ? { backgroundColor: '#fff', color: '#1E5FFF', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }
                  : { color: '#525A72' }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9AA1B4]" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] text-[#525A72] placeholder:text-[#9AA1B4] focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] w-48"
            />
          </div>
          <button
            type="button"
            onClick={() => exportToCsv('orders', filtered, [
              { header: 'Tracking', value: (o) => o.trackingCode },
              { header: 'Customer', value: (o) => o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : '' },
              { header: 'Type', value: (o) => o.type },
              { header: 'Amount', value: (o) => formatNaira(o.totalKobo) },
              { header: 'Status', value: (o) => o.status },
              { header: 'Payment', value: (o) => o.paymentStatus },
              { header: 'Time', value: (o) => formatDateTime(o.createdAt) },
            ])}
            className="flex items-center gap-1.5 text-xs text-[#525A72] bg-white border border-[#E7EAF1] rounded px-3 py-1.5 hover:bg-[#F7F9FC]"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-[#9AA1B4]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading orders…
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-xs text-[#FF3B30]">Failed to load orders.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#EDF0F6] bg-[#F7F9FC]">
                    {['Tracking', 'Customer', 'Type', 'Items', 'Amount', 'Status', 'Payment', 'Time', ''].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F9FC]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-xs text-[#9AA1B4]">No orders found.</td>
                    </tr>
                  ) : (
                    filtered.map((order) => (
                      <tr key={order.id} className="hover:bg-[#F7F9FC] transition-colors cursor-pointer" onClick={() => router.push(`/orders/${order.id}`)}>
                        <td className="px-4 py-2.5">
                          <span className="font-mono text-xs font-semibold text-[#1E5FFF]">{order.trackingCode}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          {order.customer ? (
                            <div>
                              <p className="text-xs font-medium text-[#0D1426]">{order.customer.firstName} {order.customer.lastName}</p>
                              <p className="text-[11px] text-[#9AA1B4] font-mono">{order.customer.phone}</p>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#9AA1B4]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-[11px] text-[#525A72] capitalize">{order.type.toLowerCase()}</span>
                        </td>
                        <td className="px-4 py-2.5 max-w-[140px]">
                          <span className="text-xs text-[#525A72] truncate block">
                            {order.items.slice(0, 2).map((i) => i.name).join(', ')}
                            {order.items.length > 2 && ` +${order.items.length - 2}`}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs font-semibold text-[#0D1426]">{formatNaira(order.totalKobo)}</span>
                        </td>
                        <td className="px-4 py-2.5"><StatusBadge status={order.status} /></td>
                        <td className="px-4 py-2.5">
                          <span className={`text-[11px] font-medium rounded-full px-2 py-0.5 ${order.paymentStatus === 'PAID' ? 'bg-[#DFF5EC] text-[#1DB980]' : 'bg-[#FBEDD7] text-[#E8930C]'}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-[11px] text-[#9AA1B4]">{formatDateTime(order.createdAt)}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1 relative" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => router.push(`/orders/${order.id}`)}
                              className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#E7EEFF]"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#1E5FFF]" />
                            </button>
                            {['PENDING', 'ACCEPTED', 'PREPARING'].includes(order.status) && (
                              <div className="relative">
                                <button
                                  onClick={() => setOpenMenu(openMenu === order.id ? null : order.id)}
                                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#EDF0F6]"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5 text-[#9AA1B4]" />
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
      <div className="bg-white rounded-xl border border-[#E7EAF1] shadow-xl p-5 w-80 space-y-3">
        <p className="text-sm font-semibold text-[#0D1426]">Cancel order</p>
        <p className="text-xs text-[#525A72]">
          Cancel <span className="font-mono font-semibold text-[#1E5FFF]">{order.trackingCode}</span>?
          {(order.paymentMethod === 'CARD' || order.paymentMethod === 'WALLET') && (
            <span className="block mt-1 text-[#E8930C]">A refund will be triggered.</span>
          )}
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)…"
          className="w-full text-xs border border-[#E7EAF1] rounded p-2 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 text-xs py-2 rounded border border-[#E7EAF1] text-[#525A72] hover:bg-[#F7F9FC]">
            Keep order
          </button>
          <button
            disabled={loading}
            onClick={handleCancel}
            className="flex-1 text-xs py-2 rounded text-white font-medium disabled:opacity-50"
            style={{ backgroundColor: '#FF3B30' }}
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
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#EDF0F6]">
      <p className="text-xs text-[#9AA1B4]">Showing {shown} of {total} orders</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="w-7 h-7 rounded flex items-center justify-center text-[#525A72] hover:bg-[#EDF0F6] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
          <button
            key={i}
            onClick={() => onPage(i + 1)}
            className="w-7 h-7 rounded text-xs"
            style={page === i + 1 ? { backgroundColor: '#1E5FFF', color: '#fff', fontWeight: 600 } : { color: '#525A72' }}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="w-7 h-7 rounded flex items-center justify-center text-[#525A72] hover:bg-[#EDF0F6] disabled:opacity-40 disabled:cursor-not-allowed"
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
          <div className="flex items-center gap-0.5 p-1 bg-[#EDF0F6] rounded overflow-x-auto">
            {statusTabs.map((s) => (
              <button
                key={s.value}
                onClick={() => { setStatusFilter(s.value); setPage(1) }}
                className="text-xs font-medium px-3 py-1.5 rounded transition-all whitespace-nowrap"
                style={statusFilter === s.value
                  ? { backgroundColor: '#fff', color: '#1E5FFF', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }
                  : { color: '#525A72' }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9AA1B4]" />
            <input
              type="text"
              placeholder="Search tracking, payment ref, customer…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-8 pr-3 py-1.5 text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] text-[#525A72] placeholder:text-[#9AA1B4] focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] w-52"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as OrderType | 'ALL'); setPage(1) }}
            className="text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] text-[#525A72] px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]"
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
            className="text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] text-[#525A72] px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]"
          />
          <span className="text-xs text-[#9AA1B4]">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); setPage(1) }}
            className="text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] text-[#525A72] px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]"
          />
          {(typeFilter !== 'ALL' || from || to) && (
            <button onClick={resetFilters} className="text-xs text-[#FF3B30] hover:underline">Clear</button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => exportToCsv('orders', orders, [
              { header: 'Tracking', value: (o) => o.trackingCode },
              { header: 'Customer', value: (o) => o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : '' },
              { header: 'Vendor', value: (o) => o.vendor?.name ?? '' },
              { header: 'Type', value: (o) => o.type },
              { header: 'Amount', value: (o) => formatNaira(o.totalKobo) },
              { header: 'Status', value: (o) => o.status },
              { header: 'Payment', value: (o) => o.paymentStatus },
              { header: 'Date', value: (o) => formatDateTime(o.createdAt) },
            ])}
            className="flex items-center gap-1.5 text-xs text-[#525A72] bg-white border border-[#E7EAF1] rounded px-3 py-1.5 hover:bg-[#F7F9FC]"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-[#9AA1B4]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading orders…
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-xs text-[#FF3B30]">Failed to load orders.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#EDF0F6] bg-[#F7F9FC]">
                    {['Tracking', 'Customer', 'Vendor', 'Type', 'Amount', 'Status', 'Payment', 'Date', ''].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F9FC]">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-xs text-[#9AA1B4]">No orders found.</td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#F7F9FC] transition-colors cursor-pointer" onClick={() => router.push(`/orders/${order.id}`)}>
                        <td className="px-4 py-2.5">
                          <span className="font-mono text-xs font-semibold text-[#1E5FFF]">{order.trackingCode}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          {order.customer ? (
                            <div>
                              <p className="text-xs font-medium text-[#0D1426]">{order.customer.firstName} {order.customer.lastName}</p>
                              <p className="text-[11px] text-[#9AA1B4] font-mono">{order.customer.phone}</p>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#9AA1B4]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          {order.vendor ? (
                            <div>
                              <p className="text-xs font-medium text-[#0D1426] truncate max-w-[120px]">{order.vendor.name}</p>
                              <p className="text-[11px] text-[#9AA1B4] capitalize">{order.vendor.type.toLowerCase()}</p>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#9AA1B4]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-[11px] text-[#525A72]">{ORDER_TYPE_LABELS[order.type]}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs font-semibold text-[#0D1426]">{formatNaira(order.totalKobo)}</span>
                        </td>
                        <td className="px-4 py-2.5"><StatusBadge status={order.status} /></td>
                        <td className="px-4 py-2.5">
                          <span className={`text-[11px] font-medium rounded-full px-2 py-0.5 ${order.paymentStatus === 'PAID' ? 'bg-[#DFF5EC] text-[#1DB980]' : 'bg-[#FBEDD7] text-[#E8930C]'}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-[11px] text-[#9AA1B4]">{formatDateTime(order.createdAt)}</span>
                        </td>
                        <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => router.push(`/orders/${order.id}`)}
                              className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#E7EEFF]"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#1E5FFF]" />
                            </button>
                            {!TERMINAL_STATUSES.includes(order.status) && (
                              <button
                                onClick={() => setCancelOrder(order)}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#FFE3E1]"
                                title="Force cancel"
                              >
                                <Ban className="w-3.5 h-3.5 text-[#FF3B30]" />
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
      <div>
        <h1 className="text-lg font-bold text-[#0D1426]">Orders</h1>
        <p className="text-xs text-[#9AA1B4] mt-0.5">
          {isVendor ? 'Manage your incoming and active orders' : 'Monitor and manage all platform orders'}
        </p>
      </div>
      {isVendor ? <VendorOrdersTable /> : <SystemOrdersTable />}
    </div>
  )
}
