'use client'

import { useState } from 'react'
import {
  useGetDisputesQuery,
  useGetDisputeQuery,
  useAddDisputeMessageMutation,
  useAssignDisputeMutation,
  useResolveDisputeMutation,
} from '@/store/services/disputesApi'
import { formatAmount } from '@/lib/utils'
import type {
  Dispute,
  DisputeCategory,
  DisputeRaisedByType,
  DisputeResolutionType,
  DisputeStatus,
} from '@/types/api'
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquareWarning,
  Send,
  UserCheck,
  Lock,
} from 'lucide-react'

function formatNaira(kobo: number) {
  return formatAmount(kobo / 100)
}

const statusConfig: Record<DisputeStatus, { label: string; bg: string; text: string }> = {
  OPEN: { label: 'Open', bg: '#FFE3E1', text: '#FF3B30' },
  UNDER_REVIEW: { label: 'Under review', bg: '#E7EEFF', text: '#1E5FFF' },
  AWAITING_RESPONSE: { label: 'Awaiting response', bg: '#FBEDD7', text: '#E8930C' },
  ESCALATED: { label: 'Escalated', bg: '#FFE3E1', text: '#FF3B30' },
  RESOLVED: { label: 'Resolved', bg: '#DFF5EC', text: '#1DB980' },
  REJECTED: { label: 'Rejected', bg: '#EDF0F6', text: '#525A72' },
}

const categoryLabels: Record<DisputeCategory, string> = {
  WRONG_ITEM: 'Wrong item',
  MISSING_ITEMS: 'Missing items',
  DAMAGED_ITEM: 'Damaged item',
  FOOD_QUALITY: 'Food quality',
  LATE_DELIVERY: 'Late delivery',
  NEVER_ARRIVED: 'Never arrived',
  RIDER_BEHAVIOR: 'Rider behavior',
  VENDOR_BEHAVIOR: 'Vendor behavior',
  CUSTOMER_BEHAVIOR: 'Customer behavior',
  PAYMENT_ISSUE: 'Payment issue',
  OTHER: 'Other',
}

// Auto-triage: a starting suggestion for the resolution panel based on the
// dispute's category, so common cases need less admin judgment. Always
// editable — this only pre-fills the form, it never auto-resolves anything.
const resolutionSuggestions: Partial<Record<DisputeCategory, { type: DisputeResolutionType; fullRefund?: boolean }>> = {
  NEVER_ARRIVED: { type: 'REFUND_CUSTOMER', fullRefund: true },
  WRONG_ITEM: { type: 'REFUND_CUSTOMER', fullRefund: true },
  DAMAGED_ITEM: { type: 'REFUND_CUSTOMER', fullRefund: true },
  MISSING_ITEMS: { type: 'REFUND_CUSTOMER' },
  FOOD_QUALITY: { type: 'REFUND_CUSTOMER' },
  LATE_DELIVERY: { type: 'NO_ACTION' },
  RIDER_BEHAVIOR: { type: 'NO_ACTION' },
  VENDOR_BEHAVIOR: { type: 'NO_ACTION' },
  CUSTOMER_BEHAVIOR: { type: 'NO_ACTION' },
  PAYMENT_ISSUE: { type: 'NO_ACTION' },
}

const raisedByLabels: Record<DisputeRaisedByType, string> = {
  CUSTOMER: 'Customer',
  VENDOR: 'Vendor',
  RIDER: 'Rider',
}

function raiserName(d: Dispute) {
  if (d.raisedByType === 'CUSTOMER' && d.raisedByCustomer) {
    return `${d.raisedByCustomer.firstName ?? ''} ${d.raisedByCustomer.lastName ?? ''}`.trim() || d.raisedByCustomer.phone
  }
  if (d.raisedByType === 'VENDOR' && d.raisedByVendor) return d.raisedByVendor.name
  if (d.raisedByType === 'RIDER' && d.raisedByRider) return `${d.raisedByRider.firstName} ${d.raisedByRider.lastName}`
  return '—'
}

export default function DisputesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<DisputeStatus | ''>('')
  const [category, setCategory] = useState<DisputeCategory | ''>('')
  const [raisedByType, setRaisedByType] = useState<DisputeRaisedByType | ''>('')
  const [openId, setOpenId] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useGetDisputesQuery({
    page,
    limit: 15,
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
    ...(raisedByType ? { raisedByType } : {}),
  })

  const disputes = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-[#0D1426]">Disputes</h1>
        <p className="text-xs text-[#9AA1B4] mt-0.5">Issues reported by customers, vendors, and riders on their orders</p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9AA1B4]" />
            <input
              type="text"
              placeholder="Search by tracking code or description…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-8 pr-3 py-1.5 text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] text-[#525A72] placeholder:text-[#9AA1B4] focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] focus:border-[#1E5FFF] w-72"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as DisputeStatus | ''); setPage(1) }}
            className="text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] text-[#525A72] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]"
          >
            <option value="">All statuses</option>
            {Object.entries(statusConfig).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value as DisputeCategory | ''); setPage(1) }}
            className="text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] text-[#525A72] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]"
          >
            <option value="">All categories</option>
            {Object.entries(categoryLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={raisedByType}
            onChange={(e) => { setRaisedByType(e.target.value as DisputeRaisedByType | ''); setPage(1) }}
            className="text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] text-[#525A72] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]"
          >
            <option value="">Raised by anyone</option>
            {Object.entries(raisedByLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <div className="text-xs text-[#525A72] ml-auto">
            {meta?.total != null ? `${meta.total} disputes` : '—'}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-[#9AA1B4]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading disputes…
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-xs text-[#FF3B30]">
            <MessageSquareWarning className="w-6 h-6" />
            Failed to load disputes.
            <button onClick={() => refetch()} className="text-[#1E5FFF] underline">Try again</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#EDF0F6] bg-[#F7F9FC]">
                    {['Order', 'Category', 'Raised by', 'Status', 'Assigned', 'Created'].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F9FC]">
                  {disputes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-xs text-[#9AA1B4]">No disputes found.</td>
                    </tr>
                  ) : (
                    disputes.map((d) => {
                      const s = statusConfig[d.status]
                      return (
                        <tr key={d.id} onClick={() => setOpenId(d.id)} className="hover:bg-[#F7F9FC] transition-colors cursor-pointer">
                          <td className="px-4 py-3">
                            <p className="text-xs font-semibold text-[#0D1426]">#{d.order.trackingCode}</p>
                            <p className="text-[11px] text-[#9AA1B4]">{formatNaira(d.order.totalKobo)}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#525A72]">{categoryLabels[d.category]}</td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-[#0D1426]">{raiserName(d)}</p>
                            <p className="text-[11px] text-[#9AA1B4]">{raisedByLabels[d.raisedByType]}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] font-medium rounded-full px-2 py-0.5" style={{ backgroundColor: s.bg, color: s.text }}>
                              {s.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#525A72]">
                            {d.assignedAdmin ? `${d.assignedAdmin.firstName} ${d.assignedAdmin.lastName}` : <span className="text-[#DDE2EC]">Unassigned</span>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-[11px] text-[#9AA1B4]">
                              {new Date(d.createdAt).toLocaleString('en-NG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {meta && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#EDF0F6]">
                <p className="text-xs text-[#9AA1B4]">Page {meta.page} of {meta.totalPages} — {meta.total} records</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                    className="w-7 h-7 rounded flex items-center justify-center text-[#525A72] hover:bg-[#EDF0F6] disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages}
                    className="w-7 h-7 rounded flex items-center justify-center text-[#525A72] hover:bg-[#EDF0F6] disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {openId && <DisputeDrawer id={openId} onClose={() => setOpenId(null)} />}
    </div>
  )
}

// ─── Detail drawer ─────────────────────────────────────────────────────────

function DisputeDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: dispute, isLoading } = useGetDisputeQuery(id)
  const [addMessage, { isLoading: sending }] = useAddDisputeMessageMutation()
  const [assign, { isLoading: assigning }] = useAssignDisputeMutation()
  const [reply, setReply] = useState('')
  const [isInternal, setIsInternal] = useState(false)

  const closed = dispute?.status === 'RESOLVED' || dispute?.status === 'REJECTED'

  async function send() {
    if (!reply.trim()) return
    await addMessage({ id, message: reply.trim(), isInternal }).unwrap().catch(() => {})
    setReply('')
    setIsInternal(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/30" />
      <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDF0F6] sticky top-0 bg-white z-10">
          <h2 className="text-sm font-bold text-[#0D1426]">Dispute Detail</h2>
          <button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#EDF0F6]">
            <X className="w-4 h-4 text-[#525A72]" />
          </button>
        </div>

        {isLoading || !dispute ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-[#1E5FFF]" />
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="px-5 py-4 border-b border-[#EDF0F6] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#0D1426]">#{dispute.order.trackingCode}</p>
                  <p className="text-[11px] text-[#9AA1B4]">{categoryLabels[dispute.category]} · Raised by {raisedByLabels[dispute.raisedByType].toLowerCase()} ({raiserName(dispute)})</p>
                </div>
                <span className="text-[11px] font-medium rounded-full px-2 py-0.5" style={{ backgroundColor: statusConfig[dispute.status].bg, color: statusConfig[dispute.status].text }}>
                  {statusConfig[dispute.status].label}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#525A72]">
                <span>Order total {formatNaira(dispute.order.totalKobo)}</span>
                {dispute.assignedAdmin ? (
                  <span className="flex items-center gap-1 text-[#1E5FFF]"><UserCheck className="w-3 h-3" /> {dispute.assignedAdmin.firstName} {dispute.assignedAdmin.lastName}</span>
                ) : (
                  <button
                    onClick={() => assign({ id })}
                    disabled={assigning}
                    className="text-[#1E5FFF] font-medium hover:underline disabled:opacity-50"
                  >
                    Assign to me
                  </button>
                )}
              </div>
            </div>

            {/* Thread */}
            <div className="flex-1 px-5 py-4 space-y-3">
              {dispute.messages.map((m) => (
                <div key={m.id} className={m.senderType === 'ADMIN' ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className="max-w-[80%] rounded-2xl px-3 py-2"
                    style={
                      m.isInternal
                        ? { backgroundColor: '#FBEDD7', color: '#8A5A00' }
                        : m.senderType === 'ADMIN'
                        ? { backgroundColor: '#1E5FFF', color: '#fff' }
                        : { backgroundColor: '#F7F9FC', color: '#0D1426' }
                    }
                  >
                    {m.isInternal && (
                      <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Internal note
                      </p>
                    )}
                    <p className="text-xs whitespace-pre-wrap">{m.message}</p>
                    <p className="text-[10px] opacity-70 mt-1">{new Date(m.createdAt).toLocaleString('en-NG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply box */}
            {!closed && (
              <div className="px-5 py-3 border-t border-[#EDF0F6] space-y-2">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Reply, or leave an internal note…"
                  rows={2}
                  className="w-full text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] resize-none"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-[11px] text-[#525A72]">
                    <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
                    Internal note (not visible to {raisedByLabels[dispute.raisedByType].toLowerCase()})
                  </label>
                  <button
                    onClick={send}
                    disabled={sending || !reply.trim()}
                    className="flex items-center gap-1.5 text-xs font-medium text-white bg-[#1E5FFF] rounded px-3 py-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" /> Send
                  </button>
                </div>
              </div>
            )}

            {/* Resolution */}
            {!closed ? (
              <ResolutionPanel
                disputeId={id}
                order={dispute.order}
                category={dispute.category}
                hasRider={!!(dispute.raisedByRider || dispute.order.riderId)}
              />
            ) : (
              <div className="px-5 py-4 border-t border-[#EDF0F6]">
                <p className="text-[11px] font-bold text-[#1E5FFF] uppercase tracking-wider mb-2">Resolution</p>
                <p className="text-xs text-[#0D1426]">
                  {dispute.resolutionType === 'REFUND_CUSTOMER' && `Refunded ${formatNaira(dispute.resolutionAmountKobo ?? 0)} to customer`}
                  {dispute.resolutionType === 'COMPENSATE_RIDER' && `Compensated rider ${formatNaira(dispute.resolutionAmountKobo ?? 0)}`}
                  {dispute.resolutionType === 'NO_ACTION' && 'No action taken'}
                  {dispute.resolutionType === 'REJECTED' && 'Dispute rejected'}
                </p>
                {dispute.resolutionNotes && <p className="text-xs text-[#525A72] mt-1">{dispute.resolutionNotes}</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ResolutionPanel({
  disputeId,
  order,
  category,
  hasRider,
}: {
  disputeId: string
  order: Dispute['order']
  category: DisputeCategory
  hasRider: boolean
}) {
  const [resolve, { isLoading }] = useResolveDisputeMutation()
  const suggestion = resolutionSuggestions[category]
  const [type, setType] = useState<DisputeResolutionType>(suggestion?.type ?? 'REFUND_CUSTOMER')
  const [amountNaira, setAmountNaira] = useState(
    suggestion?.fullRefund ? (order.totalKobo / 100).toFixed(2) : ''
  )
  const [notes, setNotes] = useState('')

  const needsAmount = type === 'REFUND_CUSTOMER' || type === 'COMPENSATE_RIDER'

  async function submit() {
    const amountKobo = needsAmount ? Math.round(parseFloat(amountNaira || '0') * 100) : undefined
    if (needsAmount && (!amountKobo || amountKobo <= 0)) return
    await resolve({ id: disputeId, resolutionType: type, resolutionNotes: notes || undefined, resolutionAmountKobo: amountKobo })
      .unwrap()
      .catch(() => {})
  }

  return (
    <div className="px-5 py-4 border-t border-[#EDF0F6] space-y-3">
      <p className="text-[11px] font-bold text-[#1E5FFF] uppercase tracking-wider">Resolve dispute</p>
      {suggestion && (
        <p className="text-[11px] text-[#9AA1B4] -mt-1">
          Suggested based on category — feel free to adjust.
        </p>
      )}
      <select
        value={type}
        onChange={(e) => setType(e.target.value as DisputeResolutionType)}
        className="w-full text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]"
      >
        <option value="REFUND_CUSTOMER">Refund customer</option>
        <option value="COMPENSATE_RIDER" disabled={!hasRider}>Compensate rider{!hasRider ? ' (no rider on order)' : ''}</option>
        <option value="NO_ACTION">No action</option>
        <option value="REJECTED">Reject dispute</option>
      </select>
      {needsAmount && (
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#9AA1B4]">₦</span>
          <input
            type="number"
            min={0}
            max={type === 'REFUND_CUSTOMER' ? order.totalKobo / 100 : undefined}
            value={amountNaira}
            onChange={(e) => setAmountNaira(e.target.value)}
            placeholder="Amount"
            className="w-full text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] pl-6 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]"
          />
        </div>
      )}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Resolution notes (optional)…"
        rows={2}
        className="w-full text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] resize-none"
      />
      <button
        onClick={submit}
        disabled={isLoading || (needsAmount && !amountNaira)}
        className="w-full text-xs font-semibold text-white bg-[#1E5FFF] rounded py-2 disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Resolve'}
      </button>
    </div>
  )
}
