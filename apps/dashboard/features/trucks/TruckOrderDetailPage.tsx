'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useGetAdminOrderQuery,
  useUpdateOrderStatusMutation,
} from './store/trucksApi'
import type { OrderStatus } from '@/types/api'
import { formatNaira, formatDateTime } from '@/lib/utils'
import {
  ArrowLeft, Loader2, Truck, MapPin, User, Phone,
  Clock, CheckCircle2, X, AlertCircle, Home, Users,
} from 'lucide-react'

// ─── Status config ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  PENDING:          { bg: '#FBEDD7', text: '#E8930C', label: 'Pending' },
  ACCEPTED:         { bg: '#FFEAE1', text: '#FF6A2C', label: 'Accepted' },
  PREPARING:        { bg: '#F0EAFA', text: '#7A5AE0', label: 'Preparing' },
  READY_FOR_PICKUP: { bg: '#e0f2fe', text: '#06b6d4', label: 'Ready' },
  PICKED_UP:        { bg: '#FBEDD7', text: '#E8930C', label: 'Picked Up' },
  IN_TRANSIT:       { bg: '#E7EEFF', text: '#1E5FFF', label: 'In Transit' },
  DELIVERED:        { bg: '#DFF5EC', text: '#1DB980', label: 'Delivered' },
  CANCELLED:        { bg: '#FFE3E1', text: '#FF3B30', label: 'Cancelled' },
  FAILED:           { bg: '#EDF0F6', text: '#9AA1B4', label: 'Failed' },
}

const TERMINAL_STATUSES: OrderStatus[] = ['DELIVERED', 'CANCELLED', 'FAILED']

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING',          label: 'Pending' },
  { value: 'ACCEPTED',         label: 'Accepted' },
  { value: 'IN_TRANSIT',       label: 'In Transit' },
  { value: 'DELIVERED',        label: 'Delivered' },
  { value: 'CANCELLED',        label: 'Cancelled' },
  { value: 'FAILED',           label: 'Failed' },
]

// ─── Status Update Modal ───────────────────────────────────────────────────

function StatusUpdateModal({
  orderId,
  currentStatus,
  onClose,
}: {
  orderId: string
  currentStatus: OrderStatus
  onClose: () => void
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [note, setNote] = useState('')
  const [update, { isLoading }] = useUpdateOrderStatusMutation()
  const [error, setError] = useState('')

  const available = STATUS_OPTIONS.filter((s) => s.value !== currentStatus)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await update({ id: orderId, status, ...(note.trim() ? { note: note.trim() } : {}) }).unwrap()
      onClose()
    } catch {
      setError('Failed to update status. The order may already be in a terminal state.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDF0F6]">
          <h2 className="text-sm font-bold text-[#0D1426]">Update Order Status</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#EDF0F6] transition-colors"
          >
            <X className="w-4 h-4 text-[#9AA1B4]" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-[#525A72] uppercase tracking-wide">
              New Status
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {available.map((s) => {
                const cfg = STATUS_CONFIG[s.value]
                const selected = status === s.value
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStatus(s.value)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all"
                    style={
                      selected
                        ? { backgroundColor: cfg.bg, borderColor: cfg.text, color: cfg.text }
                        : { borderColor: '#E7EAF1', color: '#525A72' }
                    }
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: selected ? cfg.text : '#DDE2EC' }}
                    />
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#525A72] uppercase tracking-wide">
              Note <span className="normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Driver picked up furniture — en route to Lekki"
              rows={2}
              className="mt-1 w-full text-xs border border-[#E7EAF1] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] bg-[#F7F9FC] resize-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#FFE3E1]">
              <AlertCircle className="w-3.5 h-3.5 text-[#FF3B30] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#FF3B30]">{error}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-xs py-2 rounded border border-[#E7EAF1] text-[#525A72] hover:bg-[#F7F9FC] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || status === currentStatus}
              className="flex-1 text-xs py-2 rounded text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
              style={{ backgroundColor: '#1E5FFF' }}
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Section card ──────────────────────────────────────────────────────────

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

// ─── Page ──────────────────────────────────────────────────────────────────

export default function TruckOrderDetailPage({ id }: { id: string }) {
  const router = useRouter()
  const { data: order, isLoading, isError } = useGetAdminOrderQuery(id)
  const [showStatusModal, setShowStatusModal] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-xs text-[#9AA1B4]">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading booking…
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertCircle className="w-8 h-8 text-[#FF3B30]" />
        <p className="text-sm font-medium text-[#0D1426]">Booking not found</p>
        <button
          onClick={() => router.back()}
          className="text-xs text-[#1E5FFF] hover:underline"
        >
          Go back
        </button>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[order.status]
  const isTerminal = TERMINAL_STATUSES.includes(order.status)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded flex items-center justify-center hover:bg-[#EDF0F6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#525A72]" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-[#0D1426] font-mono">{order.trackingCode}</h1>
            <span
              className="text-[11px] font-semibold rounded-full px-2.5 py-0.5"
              style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}
            >
              {statusCfg.label}
            </span>
          </div>
          <p className="text-xs text-[#9AA1B4] mt-0.5">
            Booked {formatDateTime(order.createdAt)}
            {order.scheduledAt && ` · Scheduled for ${formatDateTime(order.scheduledAt)}`}
          </p>
        </div>
        {!isTerminal && (
          <button
            onClick={() => setShowStatusModal(true)}
            className="btn-primary flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Update Status
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Truck details */}
          {order.apartmentType && (
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
                  <InfoRow
                    label="Est. Duration"
                    value={`${order.estimatedMinutes} min`}
                  />
                )}
              </div>
            </Section>
          )}

          {/* Route */}
          <Section title="Route">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#DFF5EC' }}>
                  <MapPin className="w-3.5 h-3.5 text-[#1DB980]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide">Pickup</p>
                  <p className="text-xs font-medium text-[#0D1426] mt-0.5">{order.pickupAddress || '—'}</p>
                </div>
              </div>

              {order.stops && order.stops.length > 0 && order.stops.map((stop, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#FBEDD7' }}>
                    <MapPin className="w-3.5 h-3.5 text-[#E8930C]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide">Stop {i + 1}</p>
                    <p className="text-xs font-medium text-[#0D1426] mt-0.5">{stop.address || `${stop.lat}, ${stop.lng}`}</p>
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#FFE3E1' }}>
                  <MapPin className="w-3.5 h-3.5 text-[#FF3B30]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide">Dropoff</p>
                  <p className="text-xs font-medium text-[#0D1426] mt-0.5">{order.dropoffAddress || '—'}</p>
                </div>
              </div>
            </div>
          </Section>

          {/* Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <Section title="Status Timeline">
              <div className="space-y-0">
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
                      <div className={`pb-4 ${isLast ? '' : ''}`}>
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

          {/* Notes */}
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
          </Section>

          {/* Rider */}
          {order.rider ? (
            <Section title="Assigned Driver">
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
            </Section>
          ) : (
            <Section title="Assigned Driver">
              <p className="text-xs text-[#9AA1B4]">No driver assigned yet.</p>
            </Section>
          )}

          {/* Payment */}
          <Section title="Payment">
            <div className="divide-y divide-[#F7F9FC]">
              <InfoRow label="Method" value={order.paymentMethod} />
              <InfoRow
                label="Payment Status"
                value={
                  <span
                    className="text-[11px] font-medium rounded-full px-2 py-0.5"
                    style={
                      order.paymentStatus === 'PAID'
                        ? { backgroundColor: '#DFF5EC', color: '#1DB980' }
                        : order.paymentStatus === 'REFUNDED'
                        ? { backgroundColor: '#E7EEFF', color: '#1E5FFF' }
                        : order.paymentStatus === 'FAILED'
                        ? { backgroundColor: '#FFE3E1', color: '#FF3B30' }
                        : { backgroundColor: '#FBEDD7', color: '#E8930C' }
                    }
                  >
                    {order.paymentStatus}
                  </span>
                }
              />
            </div>
          </Section>

          {/* Financials */}
          <Section title="Price Breakdown">
            <div className="divide-y divide-[#F7F9FC]">
              {order.subtotalKobo > 0 && (
                <InfoRow label="Subtotal" value={formatNaira(order.subtotalKobo)} />
              )}
              {order.deliveryFeeKobo > 0 && (
                <InfoRow label="Delivery Fee" value={formatNaira(order.deliveryFeeKobo)} />
              )}
              {order.serviceFeeKobo > 0 && (
                <InfoRow label="Service Fee" value={formatNaira(order.serviceFeeKobo)} />
              )}
              {order.discountKobo > 0 && (
                <InfoRow label="Discount" value={`-${formatNaira(order.discountKobo)}`} />
              )}
              <div className="flex items-center justify-between pt-2 mt-1">
                <span className="text-xs font-bold text-[#0D1426]">Total</span>
                <span className="text-sm font-bold text-[#1E5FFF]">{formatNaira(order.totalKobo)}</span>
              </div>
            </div>
          </Section>

          {/* Meta */}
          <Section title="Order Info">
            <div className="divide-y divide-[#F7F9FC]">
              <InfoRow label="Order ID" value={<span className="font-mono text-[11px]">{order.id.slice(0, 8)}…</span>} />
              <InfoRow label="Created" value={formatDateTime(order.createdAt)} />
              <InfoRow label="Updated" value={formatDateTime(order.updatedAt)} />
            </div>
          </Section>
        </div>
      </div>

      {showStatusModal && (
        <StatusUpdateModal
          orderId={order.id}
          currentStatus={order.status}
          onClose={() => setShowStatusModal(false)}
        />
      )}
    </div>
  )
}
