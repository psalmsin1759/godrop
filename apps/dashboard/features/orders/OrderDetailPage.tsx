'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  useGetAdminOrderQuery,
  useCancelAdminOrderMutation,
} from '@/store/services/adminOrdersApi'
import {
  useGetVendorOrderQuery,
  useAcceptVendorOrderMutation,
  useMarkPreparingVendorOrderMutation,
  useMarkReadyVendorOrderMutation,
  useRejectVendorOrderMutation,
} from '@/store/services/vendorOrdersApi'
import type { AdminOrder, OrderStatus } from '@/types/api'
import { formatNaira, formatDateTime } from '@/lib/utils'
import {
  ArrowLeft, Loader2, AlertCircle, Ban,
  User, Store, Truck, MapPin, Phone,
  CheckCircle, XCircle, Clock, Home, Users,
} from 'lucide-react'

const STATUS_CONFIG: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  PENDING:          { bg: '#fff6e8', text: '#ffa21d', label: 'Pending' },
  ACCEPTED:         { bg: '#e0f9f7', text: '#3dc7be', label: 'Accepted' },
  PREPARING:        { bg: '#f3eeff', text: '#8b5cf6', label: 'Preparing' },
  READY_FOR_PICKUP: { bg: '#e0f2fe', text: '#06b6d4', label: 'Ready for Pickup' },
  PICKED_UP:        { bg: '#fef3c7', text: '#f59e0b', label: 'Picked Up' },
  IN_TRANSIT:       { bg: '#eef1fb', text: '#3454d1', label: 'In Transit' },
  DELIVERED:        { bg: '#e8faf2', text: '#17c666', label: 'Delivered' },
  CANCELLED:        { bg: '#fdf0f0', text: '#ea4d4d', label: 'Cancelled' },
  FAILED:           { bg: '#f3f4f6', text: '#6b7280', label: 'Failed' },
}

const TERMINAL_STATUSES: OrderStatus[] = ['DELIVERED', 'CANCELLED', 'FAILED']

const ORDER_TYPE_LABELS: Record<string, string> = {
  FOOD: 'Food',
  GROCERY: 'Grocery',
  RETAIL: 'Retail',
  PHARMACY: 'Pharmacy',
  PARCEL: 'Parcel',
  TRUCK: 'Truck',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-[#f3f4f6]">
        <h3 className="text-xs font-semibold text-[#283c50]">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-[11px] font-medium text-[#9ca3af] shrink-0">{label}</span>
      <span className="text-xs font-medium text-[#283c50] text-right">{value}</span>
    </div>
  )
}

function PaymentStatusBadge({ status }: { status: string }) {
  const styles =
    status === 'PAID'     ? { backgroundColor: '#e8faf2', color: '#17c666' } :
    status === 'REFUNDED' ? { backgroundColor: '#eef1fb', color: '#3454d1' } :
    status === 'FAILED'   ? { backgroundColor: '#fdf0f0', color: '#ea4d4d' } :
                            { backgroundColor: '#fff6e8', color: '#ffa21d' }
  return (
    <span className="text-[11px] font-medium rounded-full px-2 py-0.5" style={styles}>
      {status}
    </span>
  )
}

function ItemsTable({ items }: { items: { name: string; quantity: number; unitPriceKobo: number; totalKobo: number; notes?: string }[] }) {
  if (items.length === 0) {
    return <div className="p-4 text-xs text-[#9ca3af]">No items</div>
  }
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-[#fafafa] border-b border-[#f3f4f6]">
          <th className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-2.5">Item</th>
          <th className="text-center text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-2.5">Qty</th>
          <th className="text-right text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-2.5">Unit Price</th>
          <th className="text-right text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-2.5">Total</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#f9fafb]">
        {items.map((item, i) => (
          <tr key={i}>
            <td className="px-4 py-2.5">
              <p className="text-xs font-medium text-[#283c50]">{item.name}</p>
              {item.notes && <p className="text-[11px] text-[#9ca3af]">{item.notes}</p>}
            </td>
            <td className="px-4 py-2.5 text-center text-xs text-[#6b7885]">{item.quantity}</td>
            <td className="px-4 py-2.5 text-right text-xs text-[#6b7885]">{formatNaira(item.unitPriceKobo)}</td>
            <td className="px-4 py-2.5 text-right text-xs font-semibold text-[#283c50]">{formatNaira(item.totalKobo)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function PriceBreakdown({ subtotalKobo, deliveryFeeKobo, serviceFeeKobo, discountKobo, totalKobo }: {
  subtotalKobo: number; deliveryFeeKobo: number; serviceFeeKobo: number; discountKobo: number; totalKobo: number
}) {
  return (
    <div className="divide-y divide-[#f9fafb]">
      {subtotalKobo > 0 && <InfoRow label="Subtotal" value={formatNaira(subtotalKobo)} />}
      {deliveryFeeKobo > 0 && <InfoRow label="Delivery Fee" value={formatNaira(deliveryFeeKobo)} />}
      {serviceFeeKobo > 0 && <InfoRow label="Service Fee" value={formatNaira(serviceFeeKobo)} />}
      {discountKobo > 0 && <InfoRow label="Discount" value={`-${formatNaira(discountKobo)}`} />}
      <div className="flex items-center justify-between pt-2 mt-1">
        <span className="text-xs font-bold text-[#283c50]">Total</span>
        <span className="text-sm font-bold text-[#3454d1]">{formatNaira(totalKobo)}</span>
      </div>
    </div>
  )
}

// ─── Cancel dialog (system admin) ─────────────────────────────────────────────

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

// ─── Reject dialog (vendor admin) ────────────────────────────────────────────

function RejectOrderDialog({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const [reject] = useRejectVendorOrderMutation()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleReject() {
    setLoading(true)
    try { await reject({ id: orderId, reason: reason || undefined }).unwrap(); onClose() }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-xl p-5 w-80 space-y-3">
        <p className="text-sm font-semibold text-[#283c50]">Reject order</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)…"
          className="w-full text-xs border border-[#e5e7eb] rounded p-2 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-[#3454d1]"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 text-xs py-2 rounded border border-[#e5e7eb] text-[#6b7885] hover:bg-[#f9fafb]">
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleReject}
            className="flex-1 text-xs py-2 rounded text-white font-medium disabled:opacity-50"
            style={{ backgroundColor: '#ea4d4d' }}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── System admin order detail ────────────────────────────────────────────────

function SystemOrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter()
  const { data: order, isLoading, isError } = useGetAdminOrderQuery(orderId)
  const [showCancel, setShowCancel] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-xs text-[#9ca3af]">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading order…
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertCircle className="w-8 h-8 text-[#ea4d4d]" />
        <p className="text-sm font-medium text-[#283c50]">Order not found</p>
        <button onClick={() => router.back()} className="text-xs text-[#3454d1] hover:underline">
          Go back
        </button>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[order.status]
  const isTerminal = TERMINAL_STATUSES.includes(order.status)

  return (
    <div className="space-y-5">
      {showCancel && <CancelOrderDialog order={order} onClose={() => setShowCancel(false)} />}

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#6b7885]" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-bold text-[#283c50] font-mono">{order.trackingCode}</h1>
            <span
              className="text-[11px] font-semibold rounded-full px-2.5 py-0.5"
              style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}
            >
              {statusCfg.label}
            </span>
            <span className="text-[11px] font-medium rounded-full px-2.5 py-0.5 bg-[#f3f4f6] text-[#6b7885]">
              {ORDER_TYPE_LABELS[order.type] ?? order.type}
            </span>
          </div>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            Placed {formatDateTime(order.createdAt)}
            {order.scheduledAt && ` · Scheduled for ${formatDateTime(order.scheduledAt)}`}
          </p>
        </div>
        {!isTerminal && (
          <button
            onClick={() => setShowCancel(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-[#ea4d4d] text-[#ea4d4d] hover:bg-[#fdf0f0] transition-colors font-medium"
          >
            <Ban className="w-3.5 h-3.5" /> Force Cancel
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-[#f3f4f6]">
              <h3 className="text-xs font-semibold text-[#283c50]">Order Items</h3>
            </div>
            <ItemsTable items={order.items} />
          </div>

          {/* Addresses */}
          {(order.pickupAddress || order.dropoffAddress) && (
            <Section title="Addresses">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#e8faf2' }}
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#17c666]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">Pickup</p>
                    <p className="text-xs font-medium text-[#283c50] mt-0.5">{order.pickupAddress || '—'}</p>
                  </div>
                </div>

                {order.stops && order.stops.length > 0 && order.stops.map((stop, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#fef3c7' }}
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#f59e0b]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">Stop {i + 1}</p>
                      <p className="text-xs font-medium text-[#283c50] mt-0.5">{stop.address || `${stop.lat}, ${stop.lng}`}</p>
                    </div>
                  </div>
                ))}

                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#fdf0f0' }}
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#ea4d4d]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">Dropoff</p>
                    <p className="text-xs font-medium text-[#283c50] mt-0.5">{order.dropoffAddress || '—'}</p>
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <Section title="Status Timeline">
              <div>
                {order.timeline.map((event, i) => {
                  const isLast = i === order.timeline.length - 1
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center shrink-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full border-2 mt-0.5 shrink-0"
                          style={
                            isLast
                              ? { backgroundColor: '#3454d1', borderColor: '#3454d1' }
                              : { backgroundColor: '#fff', borderColor: '#d1d5db' }
                          }
                        />
                        {!isLast && <div className="w-px flex-1 bg-[#e5e7eb] mt-1 mb-1" />}
                      </div>
                      <div className="pb-4">
                        <p className="text-xs font-semibold text-[#283c50]">
                          {STATUS_CONFIG[event.status as OrderStatus]?.label ?? event.status}
                        </p>
                        {event.description && (
                          <p className="text-[11px] text-[#6b7885] mt-0.5">{event.description}</p>
                        )}
                        <p className="text-[11px] text-[#9ca3af] mt-0.5">{formatDateTime(event.createdAt)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Section>
          )}

          {/* Truck-specific */}
          {order.type === 'TRUCK' && order.apartmentType && (
            <Section title="Move Details">
              <div className="divide-y divide-[#f9fafb]">
                <InfoRow
                  label="Apartment Type"
                  value={
                    <span className="flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-[#3454d1]" />
                      {order.apartmentType.name}
                    </span>
                  }
                />
                {order.numLoaders != null && order.numLoaders > 0 && (
                  <InfoRow
                    label="Loaders"
                    value={
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#6b7885]" />
                        {order.numLoaders} loader{order.numLoaders !== 1 ? 's' : ''}
                      </span>
                    }
                  />
                )}
                {order.estimatedMinutes && (
                  <InfoRow label="Est. Duration" value={`${order.estimatedMinutes} min`} />
                )}
              </div>
            </Section>
          )}

          {order.notes && (
            <Section title="Notes">
              <p className="text-xs text-[#6b7885]">{order.notes}</p>
            </Section>
          )}

          {order.cancellationReason && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#fdf0f0]">
              <AlertCircle className="w-4 h-4 text-[#ea4d4d] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[#ea4d4d]">Cancellation Reason</p>
                <p className="text-xs text-[#ea4d4d] mt-0.5">{order.cancellationReason}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Customer */}
          <Section title="Customer">
            {order.customer ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#eef1fb] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#3454d1]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#283c50]">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-[#9ca3af]" />
                    <span className="text-[11px] text-[#9ca3af]">{order.customer.phone}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#9ca3af]">No customer info</p>
            )}
          </Section>

          {/* Vendor */}
          {order.vendor && (
            <Section title="Vendor">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f3eeff] flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4 text-[#8b5cf6]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#283c50]">{order.vendor.name}</p>
                  <p className="text-[11px] text-[#9ca3af] capitalize">{order.vendor.type.toLowerCase()}</p>
                </div>
              </div>
            </Section>
          )}

          {/* Rider */}
          <Section title={order.type === 'TRUCK' ? 'Assigned Driver' : 'Assigned Rider'}>
            {order.rider ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#e8faf2] flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-[#17c666]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#283c50]">
                    {order.rider.firstName} {order.rider.lastName}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-[#9ca3af]" />
                    <span className="text-[11px] text-[#9ca3af]">{order.rider.phone}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#9ca3af]">No rider assigned yet.</p>
            )}
          </Section>

          {/* Payment */}
          <Section title="Payment">
            <div className="divide-y divide-[#f9fafb]">
              <InfoRow label="Method" value={order.paymentMethod} />
              <InfoRow label="Status" value={<PaymentStatusBadge status={order.paymentStatus} />} />
            </div>
          </Section>

          {/* Price breakdown */}
          <Section title="Price Breakdown">
            <PriceBreakdown
              subtotalKobo={order.subtotalKobo}
              deliveryFeeKobo={order.deliveryFeeKobo}
              serviceFeeKobo={order.serviceFeeKobo}
              discountKobo={order.discountKobo}
              totalKobo={order.totalKobo}
            />
          </Section>

          {/* Meta */}
          <Section title="Order Info">
            <div className="divide-y divide-[#f9fafb]">
              <InfoRow label="ID" value={<span className="font-mono text-[11px]">{order.id.slice(0, 8)}…</span>} />
              <InfoRow label="Type" value={ORDER_TYPE_LABELS[order.type] ?? order.type} />
              <InfoRow label="Created" value={formatDateTime(order.createdAt)} />
              <InfoRow label="Updated" value={formatDateTime(order.updatedAt)} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}

// ─── Vendor admin order detail ────────────────────────────────────────────────

function VendorOrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter()
  const { data: order, isLoading, isError } = useGetVendorOrderQuery(orderId)
  const [accept] = useAcceptVendorOrderMutation()
  const [markPreparing] = useMarkPreparingVendorOrderMutation()
  const [markReady] = useMarkReadyVendorOrderMutation()
  const [showReject, setShowReject] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  async function runAction(fn: () => Promise<unknown>) {
    setActionLoading(true)
    try { await fn() } finally { setActionLoading(false) }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-xs text-[#9ca3af]">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading order…
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertCircle className="w-8 h-8 text-[#ea4d4d]" />
        <p className="text-sm font-medium text-[#283c50]">Order not found</p>
        <button onClick={() => router.back()} className="text-xs text-[#3454d1] hover:underline">
          Go back
        </button>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[order.status as OrderStatus]

  return (
    <div className="space-y-5">
      {showReject && <RejectOrderDialog orderId={order.id} onClose={() => setShowReject(false)} />}

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#6b7885]" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-bold text-[#283c50] font-mono">{order.trackingCode}</h1>
            <span
              className="text-[11px] font-semibold rounded-full px-2.5 py-0.5"
              style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}
            >
              {statusCfg.label}
            </span>
            <span className="text-[11px] font-medium rounded-full px-2.5 py-0.5 bg-[#f3f4f6] text-[#6b7885]">
              {ORDER_TYPE_LABELS[order.type] ?? order.type}
            </span>
          </div>
          <p className="text-xs text-[#9ca3af] mt-0.5">Placed {formatDateTime(order.createdAt)}</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {order.status === 'PENDING' && (
            <>
              <button
                disabled={actionLoading}
                onClick={() => runAction(() => accept(order.id).unwrap())}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded text-white font-medium disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: '#17c666' }}
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                Accept
              </button>
              <button
                onClick={() => setShowReject(true)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-[#ea4d4d] text-[#ea4d4d] hover:bg-[#fdf0f0] font-medium"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </>
          )}
          {order.status === 'ACCEPTED' && (
            <button
              disabled={actionLoading}
              onClick={() => runAction(() => markPreparing(order.id).unwrap())}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded text-white font-medium disabled:opacity-50"
              style={{ backgroundColor: '#8b5cf6' }}
            >
              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
              Mark Preparing
            </button>
          )}
          {(order.status === 'ACCEPTED' || order.status === 'PREPARING') && (
            <button
              disabled={actionLoading}
              onClick={() => runAction(() => markReady(order.id).unwrap())}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded text-white font-medium disabled:opacity-50"
              style={{ backgroundColor: '#06b6d4' }}
            >
              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              Mark Ready
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-[#f3f4f6]">
              <h3 className="text-xs font-semibold text-[#283c50]">Order Items</h3>
            </div>
            <ItemsTable items={order.items} />
          </div>

          {order.notes && (
            <Section title="Notes">
              <p className="text-xs text-[#6b7885]">{order.notes}</p>
            </Section>
          )}
        </div>

        {/* Right */}
        <div className="space-y-5">
          <Section title="Customer">
            {order.customer ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#eef1fb] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#3454d1]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#283c50]">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-[#9ca3af]" />
                    <span className="text-[11px] text-[#9ca3af]">{order.customer.phone}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#9ca3af]">No customer info</p>
            )}
          </Section>

          <Section title="Payment">
            <div className="divide-y divide-[#f9fafb]">
              <InfoRow label="Method" value={order.paymentMethod} />
              <InfoRow label="Status" value={<PaymentStatusBadge status={order.paymentStatus} />} />
            </div>
          </Section>

          <Section title="Price Breakdown">
            <PriceBreakdown
              subtotalKobo={order.subtotalKobo}
              deliveryFeeKobo={order.deliveryFeeKobo}
              serviceFeeKobo={order.serviceFeeKobo}
              discountKobo={order.discountKobo}
              totalKobo={order.totalKobo}
            />
          </Section>

          <Section title="Order Info">
            <div className="divide-y divide-[#f9fafb]">
              <InfoRow label="ID" value={<span className="font-mono text-[11px]">{order.id.slice(0, 8)}…</span>} />
              <InfoRow label="Type" value={ORDER_TYPE_LABELS[order.type] ?? order.type} />
              <InfoRow label="Created" value={formatDateTime(order.createdAt)} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export default function OrderDetailPage({ orderId }: { orderId: string }) {
  const { data: session } = useSession()
  const isVendor = session?.admin?.type === 'VENDOR'

  if (isVendor) return <VendorOrderDetail orderId={orderId} />
  return <SystemOrderDetail orderId={orderId} />
}
