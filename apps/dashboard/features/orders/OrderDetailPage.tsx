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
  useCancelVendorOrderMutation,
} from '@/store/services/vendorOrdersApi'
import type { AdminOrder, OrderStatus } from '@/types/api'
import { formatNaira, formatDateTime } from '@/lib/utils'
import {
  ArrowLeft, Loader2, AlertCircle, Ban,
  User, Store, Truck, MapPin, Phone,
  CheckCircle, XCircle, Clock, Home, Users,
} from 'lucide-react'

const STATUS_CONFIG: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  PENDING:          { bg: '#FBEDD7', text: '#E8930C', label: 'Pending' },
  ACCEPTED:         { bg: '#FFEAE1', text: '#FF6A2C', label: 'Accepted' },
  PREPARING:        { bg: '#F0EAFA', text: '#7A5AE0', label: 'Preparing' },
  READY_FOR_PICKUP: { bg: '#e0f2fe', text: '#06b6d4', label: 'Ready for Pickup' },
  PICKED_UP:        { bg: '#FBEDD7', text: '#E8930C', label: 'Picked Up' },
  IN_TRANSIT:       { bg: '#E7EEFF', text: '#1E5FFF', label: 'In Transit' },
  DELIVERED:        { bg: '#DFF5EC', text: '#1DB980', label: 'Delivered' },
  CANCELLED:        { bg: '#FFE3E1', text: '#FF3B30', label: 'Cancelled' },
  FAILED:           { bg: '#EDF0F6', text: '#9AA1B4', label: 'Failed' },
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
      <div className="px-4 py-3 border-b border-[#EDF0F6]">
        <h3 className="text-xs font-semibold text-[#0D1426]">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-[11px] font-medium text-[#9AA1B4] shrink-0">{label}</span>
      <span className="text-xs font-medium text-[#0D1426] text-right">{value}</span>
    </div>
  )
}

function PaymentStatusBadge({ status }: { status: string }) {
  const styles =
    status === 'PAID'     ? { backgroundColor: '#DFF5EC', color: '#1DB980' } :
    status === 'REFUNDED' ? { backgroundColor: '#E7EEFF', color: '#1E5FFF' } :
    status === 'FAILED'   ? { backgroundColor: '#FFE3E1', color: '#FF3B30' } :
                            { backgroundColor: '#FBEDD7', color: '#E8930C' }
  return (
    <span className="text-[11px] font-medium rounded-full px-2 py-0.5" style={styles}>
      {status}
    </span>
  )
}

function ItemsTable({ items }: { items: { name: string; quantity: number; unitPriceKobo: number; totalKobo: number; notes?: string }[] }) {
  if (items.length === 0) {
    return <div className="p-4 text-xs text-[#9AA1B4]">No items</div>
  }
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-[#F7F9FC] border-b border-[#EDF0F6]">
          <th className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-2.5">Item</th>
          <th className="text-center text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-2.5">Qty</th>
          <th className="text-right text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-2.5">Unit Price</th>
          <th className="text-right text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-2.5">Total</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#F7F9FC]">
        {items.map((item, i) => (
          <tr key={i}>
            <td className="px-4 py-2.5">
              <p className="text-xs font-medium text-[#0D1426]">{item.name}</p>
              {item.notes && <p className="text-[11px] text-[#9AA1B4]">{item.notes}</p>}
            </td>
            <td className="px-4 py-2.5 text-center text-xs text-[#525A72]">{item.quantity}</td>
            <td className="px-4 py-2.5 text-right text-xs text-[#525A72]">{formatNaira(item.unitPriceKobo)}</td>
            <td className="px-4 py-2.5 text-right text-xs font-semibold text-[#0D1426]">{formatNaira(item.totalKobo)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function PriceBreakdown({ subtotalKobo, deliveryFeeKobo, serviceFeeKobo, discountKobo, totalKobo, hideServiceFee = false }: {
  subtotalKobo: number; deliveryFeeKobo: number; serviceFeeKobo: number; discountKobo: number; totalKobo: number; hideServiceFee?: boolean
}) {
  return (
    <div className="divide-y divide-[#F7F9FC]">
      {subtotalKobo > 0 && <InfoRow label="Subtotal" value={formatNaira(subtotalKobo)} />}
      {deliveryFeeKobo > 0 && <InfoRow label="Delivery Fee" value={formatNaira(deliveryFeeKobo)} />}
      {!hideServiceFee && serviceFeeKobo > 0 && <InfoRow label="Service Fee" value={formatNaira(serviceFeeKobo)} />}
      {discountKobo > 0 && <InfoRow label="Discount" value={`-${formatNaira(discountKobo)}`} />}
      <div className="flex items-center justify-between pt-2 mt-1">
        <span className="text-xs font-bold text-[#0D1426]">Total</span>
        <span className="text-sm font-bold text-[#1E5FFF]">{formatNaira(totalKobo)}</span>
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
      <div className="bg-white rounded-xl border border-[#E7EAF1] shadow-xl p-5 w-80 space-y-3">
        <p className="text-sm font-semibold text-[#0D1426]">Reject order</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)…"
          className="w-full text-xs border border-[#E7EAF1] rounded p-2 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 text-xs py-2 rounded border border-[#E7EAF1] text-[#525A72] hover:bg-[#F7F9FC]">
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleReject}
            className="flex-1 text-xs py-2 rounded text-white font-medium disabled:opacity-50"
            style={{ backgroundColor: '#FF3B30' }}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

function VendorCancelOrderDialog({ orderId, isPaid, onClose }: { orderId: string; isPaid: boolean; onClose: () => void }) {
  const [cancel] = useCancelVendorOrderMutation()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    setLoading(true)
    try { await cancel({ id: orderId, reason: reason || undefined }).unwrap(); onClose() }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl border border-[#E7EAF1] shadow-xl p-5 w-80 space-y-3">
        <p className="text-sm font-semibold text-[#0D1426]">Cancel order</p>
        {isPaid && (
          <div className="text-xs bg-[#FBEDD7] border border-[#F6D9A8] text-[#8A5A0A] rounded px-3 py-2">
            ⚠️ This order was paid. The full amount will be refunded to the customer&apos;s wallet automatically.
          </div>
        )}
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for cancellation (optional)…"
          className="w-full text-xs border border-[#E7EAF1] rounded p-2 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-[#FF3B30]"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 text-xs py-2 rounded border border-[#E7EAF1] text-[#525A72] hover:bg-[#F7F9FC]">
            Go Back
          </button>
          <button
            disabled={loading}
            onClick={handleCancel}
            className="flex-1 text-xs py-2 rounded text-white font-medium disabled:opacity-50"
            style={{ backgroundColor: '#FF3B30' }}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Cancel Order'}
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
      <div className="flex items-center justify-center py-24 gap-2 text-xs text-[#9AA1B4]">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading order…
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertCircle className="w-8 h-8 text-[#FF3B30]" />
        <p className="text-sm font-medium text-[#0D1426]">Order not found</p>
        <button onClick={() => router.back()} className="text-xs text-[#1E5FFF] hover:underline">
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
          className="w-8 h-8 rounded flex items-center justify-center hover:bg-[#EDF0F6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#525A72]" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-bold text-[#0D1426] font-mono">{order.trackingCode}</h1>
            <span
              className="text-[11px] font-semibold rounded-full px-2.5 py-0.5"
              style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}
            >
              {statusCfg.label}
            </span>
            <span className="text-[11px] font-medium rounded-full px-2.5 py-0.5 bg-[#EDF0F6] text-[#525A72]">
              {ORDER_TYPE_LABELS[order.type] ?? order.type}
            </span>
          </div>
          <p className="text-xs text-[#9AA1B4] mt-0.5">
            Placed {formatDateTime(order.createdAt)}
            {order.scheduledAt && ` · Scheduled for ${formatDateTime(order.scheduledAt)}`}
          </p>
        </div>
        {!isTerminal && (
          <button
            onClick={() => setShowCancel(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-[#FF3B30] text-[#FF3B30] hover:bg-[#FFE3E1] transition-colors font-medium"
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
            <div className="px-4 py-3 border-b border-[#EDF0F6]">
              <h3 className="text-xs font-semibold text-[#0D1426]">Order Items</h3>
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
                    style={{ backgroundColor: '#DFF5EC' }}
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#1DB980]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide">Pickup</p>
                    <p className="text-xs font-medium text-[#0D1426] mt-0.5">{order.pickupAddress || '—'}</p>
                  </div>
                </div>

                {order.stops && order.stops.length > 0 && order.stops.map((stop, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#FBEDD7' }}
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#E8930C]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide">Stop {i + 1}</p>
                      <p className="text-xs font-medium text-[#0D1426] mt-0.5">{stop.address || `${stop.lat}, ${stop.lng}`}</p>
                    </div>
                  </div>
                ))}

                {/* For multi-parcel orders the per-parcel destinations are shown in the
                    "Parcels" section below; only show a single dropoff line otherwise. */}
                {!(order.dropoffs && order.dropoffs.length > 1) && (
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#FFE3E1' }}
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#FF3B30]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide">Dropoff</p>
                      <p className="text-xs font-medium text-[#0D1426] mt-0.5">{order.dropoffAddress || '—'}</p>
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Parcels (multi-drop-off) */}
          {order.dropoffs && order.dropoffs.length > 1 && (
            <Section title={`Parcels (${order.dropoffs.length})`}>
              <div className="space-y-3">
                {order.dropoffs.map((p) => {
                  const sc = STATUS_CONFIG[p.status as OrderStatus]
                  return (
                    <div
                      key={p.id}
                      className="rounded-lg border border-[#EDF0F6] p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#E7EEFF] text-[10px] font-bold text-[#1E5FFF]">
                            {p.sequence}
                          </span>
                          <span className="text-xs font-semibold text-[#0D1426]">{p.recipientName}</span>
                        </div>
                        {sc && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: sc.bg, color: sc.text }}
                          >
                            {sc.label}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#FF3B30] mt-0.5 shrink-0" />
                        <p className="text-[11px] text-[#525A72]">{p.address}</p>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                        <InfoRow label="Phone" value={p.recipientPhone} />
                        <InfoRow label="Fee" value={formatNaira(p.deliveryFeeKobo)} />
                        {p.packageDescription && <InfoRow label="Description" value={p.packageDescription} />}
                        {p.weightKg != null && <InfoRow label="Weight" value={`${p.weightKg} kg`} />}
                        {p.earningKobo != null && <InfoRow label="Rider earned" value={formatNaira(p.earningKobo)} />}
                        {p.failureReason && <InfoRow label="Failure" value={p.failureReason} />}
                      </div>
                    </div>
                  )
                })}
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
                              ? { backgroundColor: '#1E5FFF', borderColor: '#1E5FFF' }
                              : { backgroundColor: '#fff', borderColor: '#DDE2EC' }
                          }
                        />
                        {!isLast && <div className="w-px flex-1 bg-[#E7EAF1] mt-1 mb-1" />}
                      </div>
                      <div className="pb-4">
                        <p className="text-xs font-semibold text-[#0D1426]">
                          {STATUS_CONFIG[event.status as OrderStatus]?.label ?? event.status}
                        </p>
                        {event.description && (
                          <p className="text-[11px] text-[#525A72] mt-0.5">{event.description}</p>
                        )}
                        <p className="text-[11px] text-[#9AA1B4] mt-0.5">{formatDateTime(event.createdAt)}</p>
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
              <div className="divide-y divide-[#F7F9FC]">
                <InfoRow
                  label="Apartment Type"
                  value={
                    <span className="flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-[#1E5FFF]" />
                      {order.apartmentType.name}
                    </span>
                  }
                />
                {order.numLoaders != null && order.numLoaders > 0 && (
                  <InfoRow
                    label="Loaders"
                    value={
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#525A72]" />
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
              <p className="text-xs text-[#525A72]">{order.notes}</p>
            </Section>
          )}

          {order.cancellationReason && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FFE3E1]">
              <AlertCircle className="w-4 h-4 text-[#FF3B30] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[#FF3B30]">Cancellation Reason</p>
                <p className="text-xs text-[#FF3B30] mt-0.5">{order.cancellationReason}</p>
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
                <div className="w-9 h-9 rounded-full bg-[#E7EEFF] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#1E5FFF]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0D1426]">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-[#9AA1B4]" />
                    <span className="text-[11px] text-[#9AA1B4]">{order.customer.phone}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#9AA1B4]">No customer info</p>
            )}
          </Section>

          {/* Vendor */}
          {order.vendor && (
            <Section title="Vendor">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#F0EAFA] flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4 text-[#7A5AE0]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0D1426]">{order.vendor.name}</p>
                  <p className="text-[11px] text-[#9AA1B4] capitalize">{order.vendor.type.toLowerCase()}</p>
                </div>
              </div>
            </Section>
          )}

          {/* Rider */}
          <Section title={order.type === 'TRUCK' ? 'Assigned Driver' : 'Assigned Rider'}>
            {order.rider ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#DFF5EC] flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-[#1DB980]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0D1426]">
                    {order.rider.firstName} {order.rider.lastName}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-[#9AA1B4]" />
                    <span className="text-[11px] text-[#9AA1B4]">{order.rider.phone}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#9AA1B4]">No rider assigned yet.</p>
            )}
          </Section>

          {/* Payment */}
          <Section title="Payment">
            <div className="divide-y divide-[#F7F9FC]">
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
            <div className="divide-y divide-[#F7F9FC]">
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
  const [cancelOrder] = useCancelVendorOrderMutation()
  const [showReject, setShowReject] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  async function runAction(fn: () => Promise<unknown>) {
    setActionLoading(true)
    try { await fn() } finally { setActionLoading(false) }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-xs text-[#9AA1B4]">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading order…
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertCircle className="w-8 h-8 text-[#FF3B30]" />
        <p className="text-sm font-medium text-[#0D1426]">Order not found</p>
        <button onClick={() => router.back()} className="text-xs text-[#1E5FFF] hover:underline">
          Go back
        </button>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[order.status as OrderStatus]

  return (
    <div className="space-y-5">
      {showReject && <RejectOrderDialog orderId={order.id} onClose={() => setShowReject(false)} />}
      {showCancel && (
        <VendorCancelOrderDialog
          orderId={order.id}
          isPaid={order.paymentStatus === 'PAID'}
          onClose={() => setShowCancel(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded flex items-center justify-center hover:bg-[#EDF0F6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#525A72]" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-bold text-[#0D1426] font-mono">{order.trackingCode}</h1>
            <span
              className="text-[11px] font-semibold rounded-full px-2.5 py-0.5"
              style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}
            >
              {statusCfg.label}
            </span>
            <span className="text-[11px] font-medium rounded-full px-2.5 py-0.5 bg-[#EDF0F6] text-[#525A72]">
              {ORDER_TYPE_LABELS[order.type] ?? order.type}
            </span>
          </div>
          <p className="text-xs text-[#9AA1B4] mt-0.5">Placed {formatDateTime(order.createdAt)}</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {order.status === 'PENDING' && (
            <>
              <button
                disabled={actionLoading}
                onClick={() => runAction(() => accept(order.id).unwrap())}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded text-white font-medium disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: '#1DB980' }}
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                Accept
              </button>
              <button
                onClick={() => setShowReject(true)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-[#FF3B30] text-[#FF3B30] hover:bg-[#FFE3E1] font-medium"
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
              style={{ backgroundColor: '#7A5AE0' }}
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
          {!['DELIVERED', 'CANCELLED', 'FAILED'].includes(order.status) && (
            <button
              onClick={() => setShowCancel(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-[#FF3B30] text-[#FF3B30] hover:bg-[#FFE3E1] font-medium"
            >
              <Ban className="w-3.5 h-3.5" /> Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-[#EDF0F6]">
              <h3 className="text-xs font-semibold text-[#0D1426]">Order Items</h3>
            </div>
            <ItemsTable items={order.items} />
          </div>

          {order.notes && (
            <Section title="Notes">
              <p className="text-xs text-[#525A72]">{order.notes}</p>
            </Section>
          )}
        </div>

        {/* Right */}
        <div className="space-y-5">
          <Section title="Customer">
            {order.customer ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E7EEFF] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#1E5FFF]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0D1426]">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-[#9AA1B4]" />
                    <span className="text-[11px] text-[#9AA1B4]">{order.customer.phone}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#9AA1B4]">No customer info</p>
            )}
          </Section>

          <Section title="Payment">
            <div className="divide-y divide-[#F7F9FC]">
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
              hideServiceFee
            />
          </Section>

          <Section title="Order Info">
            <div className="divide-y divide-[#F7F9FC]">
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
