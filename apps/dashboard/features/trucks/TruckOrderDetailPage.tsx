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
  PENDING:          { bg: '#fff6e8', text: '#ffa21d', label: 'Pending' },
  ACCEPTED:         { bg: '#e0f9f7', text: '#3dc7be', label: 'Accepted' },
  PREPARING:        { bg: '#f3eeff', text: '#8b5cf6', label: 'Preparing' },
  READY_FOR_PICKUP: { bg: '#e0f2fe', text: '#06b6d4', label: 'Ready' },
  PICKED_UP:        { bg: '#fef3c7', text: '#f59e0b', label: 'Picked Up' },
  IN_TRANSIT:       { bg: '#eef1fb', text: '#3454d1', label: 'In Transit' },
  DELIVERED:        { bg: '#e8faf2', text: '#17c666', label: 'Delivered' },
  CANCELLED:        { bg: '#fdf0f0', text: '#ea4d4d', label: 'Cancelled' },
  FAILED:           { bg: '#f3f4f6', text: '#6b7280', label: 'Failed' },
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
          <h2 className="text-sm font-bold text-[#283c50]">Update Order Status</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
          >
            <X className="w-4 h-4 text-[#9ca3af]" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-[#6b7885] uppercase tracking-wide">
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
                        : { borderColor: '#e5e7eb', color: '#6b7885' }
                    }
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: selected ? cfg.text : '#d1d5db' }}
                    />
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#6b7885] uppercase tracking-wide">
              Note <span className="normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Driver picked up furniture — en route to Lekki"
              rows={2}
              className="mt-1 w-full text-xs border border-[#e5e7eb] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#3454d1] bg-[#f9fafb] resize-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#fdf0f0]">
              <AlertCircle className="w-3.5 h-3.5 text-[#ea4d4d] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#ea4d4d]">{error}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-xs py-2 rounded border border-[#e5e7eb] text-[#6b7885] hover:bg-[#f9fafb] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || status === currentStatus}
              className="flex-1 text-xs py-2 rounded text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
              style={{ backgroundColor: '#3454d1' }}
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

// ─── Page ──────────────────────────────────────────────────────────────────

export default function TruckOrderDetailPage({ id }: { id: string }) {
  const router = useRouter()
  const { data: order, isLoading, isError } = useGetAdminOrderQuery(id)
  const [showStatusModal, setShowStatusModal] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-xs text-[#9ca3af]">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading booking…
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertCircle className="w-8 h-8 text-[#ea4d4d]" />
        <p className="text-sm font-medium text-[#283c50]">Booking not found</p>
        <button
          onClick={() => router.back()}
          className="text-xs text-[#3454d1] hover:underline"
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
          className="w-8 h-8 rounded flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#6b7885]" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-[#283c50] font-mono">{order.trackingCode}</h1>
            <span
              className="text-[11px] font-semibold rounded-full px-2.5 py-0.5"
              style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}
            >
              {statusCfg.label}
            </span>
          </div>
          <p className="text-xs text-[#9ca3af] mt-0.5">
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
                <div className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#e8faf2' }}>
                  <MapPin className="w-3.5 h-3.5 text-[#17c666]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">Pickup</p>
                  <p className="text-xs font-medium text-[#283c50] mt-0.5">{order.pickupAddress || '—'}</p>
                </div>
              </div>

              {order.stops && order.stops.length > 0 && order.stops.map((stop, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#fef3c7' }}>
                    <MapPin className="w-3.5 h-3.5 text-[#f59e0b]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">Stop {i + 1}</p>
                    <p className="text-xs font-medium text-[#283c50] mt-0.5">{stop.address || `${stop.lat}, ${stop.lng}`}</p>
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#fdf0f0' }}>
                  <MapPin className="w-3.5 h-3.5 text-[#ea4d4d]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">Dropoff</p>
                  <p className="text-xs font-medium text-[#283c50] mt-0.5">{order.dropoffAddress || '—'}</p>
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
                              ? { backgroundColor: '#3454d1', borderColor: '#3454d1' }
                              : { backgroundColor: '#fff', borderColor: '#d1d5db' }
                          }
                        />
                        {!isLast && <div className="w-px flex-1 bg-[#e5e7eb] mt-1 mb-1" />}
                      </div>
                      <div className={`pb-4 ${isLast ? '' : ''}`}>
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

          {/* Notes */}
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
          </Section>

          {/* Rider */}
          {order.rider ? (
            <Section title="Assigned Driver">
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
            </Section>
          ) : (
            <Section title="Assigned Driver">
              <p className="text-xs text-[#9ca3af]">No driver assigned yet.</p>
            </Section>
          )}

          {/* Payment */}
          <Section title="Payment">
            <div className="divide-y divide-[#f9fafb]">
              <InfoRow label="Method" value={order.paymentMethod} />
              <InfoRow
                label="Payment Status"
                value={
                  <span
                    className="text-[11px] font-medium rounded-full px-2 py-0.5"
                    style={
                      order.paymentStatus === 'PAID'
                        ? { backgroundColor: '#e8faf2', color: '#17c666' }
                        : order.paymentStatus === 'REFUNDED'
                        ? { backgroundColor: '#eef1fb', color: '#3454d1' }
                        : order.paymentStatus === 'FAILED'
                        ? { backgroundColor: '#fdf0f0', color: '#ea4d4d' }
                        : { backgroundColor: '#fff6e8', color: '#ffa21d' }
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
            <div className="divide-y divide-[#f9fafb]">
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
                <span className="text-xs font-bold text-[#283c50]">Total</span>
                <span className="text-sm font-bold text-[#3454d1]">{formatNaira(order.totalKobo)}</span>
              </div>
            </div>
          </Section>

          {/* Meta */}
          <Section title="Order Info">
            <div className="divide-y divide-[#f9fafb]">
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
