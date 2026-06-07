'use client'

import { useRouter } from 'next/navigation'
import { useGetVendorQuery, useApproveVendorMutation, useRejectVendorMutation, useSuspendVendorMutation, useReinstateVendorMutation, useGetVendorWithdrawalsQuery, useGetVendorWalletBalanceQuery, type VendorWithdrawal } from './store/vendorsApi'
import type { VendorStatus } from '@/types/api'
import { formatDate, formatDateTime, formatNaira } from '@/lib/utils'
import {
  ArrowLeft, Loader2, Store, MapPin, Phone, Mail, Star,
  Clock, CheckCircle, XCircle, PauseCircle, RefreshCw,
  FileText, ExternalLink, FileCheck, Wallet, ArrowUpRight,
} from 'lucide-react'
import { useState } from 'react'

const withdrawalStatusConfig: Record<VendorWithdrawal['status'], { bg: string; text: string; label: string }> = {
  PENDING:    { bg: '#FBEDD7', text: '#E8930C', label: 'Pending' },
  PROCESSING: { bg: '#E7EEFF', text: '#1E5FFF', label: 'Processing' },
  COMPLETED:  { bg: '#DFF5EC', text: '#1DB980', label: 'Completed' },
  FAILED:     { bg: '#FFE3E1', text: '#FF3B30', label: 'Failed' },
}

function WithdrawalsSection({ vendorId }: { vendorId: string }) {
  const { data: walletData } = useGetVendorWalletBalanceQuery(vendorId)
  const { data, isLoading } = useGetVendorWithdrawalsQuery({ id: vendorId })
  const withdrawals = data?.data ?? []

  return (
    <div className="card overflow-hidden">
      <div className="card-header flex items-center justify-between">
        <h3 className="card-title flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-[#9AA1B4]" /> Wallet &amp; Withdrawals
        </h3>
        {walletData && (
          <span className="text-xs font-semibold text-[#1DB980]">
            Balance: {formatNaira(walletData.balanceKobo)}
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-4 h-4 animate-spin text-[#9AA1B4]" /></div>
      ) : withdrawals.length === 0 ? (
        <p className="text-xs text-[#9AA1B4] px-4 py-6 text-center">No withdrawal requests yet</p>
      ) : (
        <div className="divide-y divide-[#F7F9FC]">
          {withdrawals.map((w) => {
            const s = withdrawalStatusConfig[w.status]
            return (
              <div key={w.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#FFE3E1] shrink-0">
                  <ArrowUpRight className="w-4 h-4 text-[#FF3B30]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#0D1426]">{formatNaira(w.amountKobo)}</p>
                  <p className="text-[11px] text-[#9AA1B4] truncate">
                    {w.accountName} · {w.bankName} ···{w.accountNumber.slice(-4)}
                  </p>
                  <p className="text-[11px] text-[#9AA1B4]">{formatDateTime(w.createdAt)}</p>
                </div>
                <span
                  className="text-[11px] font-semibold rounded-full px-2.5 py-0.5 shrink-0"
                  style={{ backgroundColor: s.bg, color: s.text }}
                >
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const statusConfig: Record<VendorStatus, { bg: string; text: string; label: string }> = {
  APPROVED:  { bg: '#DFF5EC', text: '#1DB980', label: 'Approved' },
  PENDING:   { bg: '#FBEDD7', text: '#E8930C', label: 'Pending Review' },
  REJECTED:  { bg: '#FFE3E1', text: '#FF3B30', label: 'Rejected' },
  SUSPENDED: { bg: '#EDF0F6', text: '#525A72', label: 'Suspended' },
}

const typeColors: Record<string, string> = {
  RESTAURANT: '#1E5FFF',
  GROCERY:    '#1DB980',
  RETAIL:     '#E8930C',
  PHARMACY:   '#FF6A2C',
}

const DAY_LABELS: Record<string, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
}

function ConfirmDialog({
  title, placeholder, required, confirmLabel, confirmColor, onConfirm, onCancel, loading,
}: {
  title: string
  placeholder: string
  required: boolean
  confirmLabel: string
  confirmColor: string
  onConfirm: (reason: string) => void
  onCancel: () => void
  loading: boolean
}) {
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-80 p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#0D1426]">{title}</h3>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={placeholder}
          className="w-full text-xs border border-[#E7EAF1] rounded-lg p-3 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]"
        />
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 text-xs py-2 rounded-lg border border-[#E7EAF1] text-[#525A72] hover:bg-[#F7F9FC]"
          >
            Cancel
          </button>
          <button
            disabled={loading || (required && !reason.trim())}
            onClick={() => onConfirm(reason)}
            className="flex-1 text-xs py-2 rounded-lg text-white font-semibold disabled:opacity-50"
            style={{ backgroundColor: confirmColor }}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function ApproveConfirmDialog({
  vendorName, onConfirm, onCancel, loading,
}: {
  vendorName: string
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-80 p-5 space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[#0D1426]">Approve vendor</h3>
          <p className="text-xs text-[#525A72] leading-snug">
            Approve <span className="font-semibold text-[#0D1426]">{vendorName}</span>? Their store goes live immediately and the owner is notified by email.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 text-xs py-2 rounded-lg border border-[#E7EAF1] text-[#525A72] hover:bg-[#F7F9FC]"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={onConfirm}
            className="flex-1 text-xs py-2 rounded-lg text-white font-semibold disabled:opacity-50"
            style={{ backgroundColor: '#1DB980' }}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VendorDetailPage({ vendorId }: { vendorId: string }) {
  const router = useRouter()
  const { data: vendor, isLoading, isError } = useGetVendorQuery(vendorId)
  const [approve, { isLoading: approving }] = useApproveVendorMutation()
  const [reject, { isLoading: rejecting }] = useRejectVendorMutation()
  const [suspend, { isLoading: suspending }] = useSuspendVendorMutation()
  const [reinstate, { isLoading: reinstating }] = useReinstateVendorMutation()

  const [dialog, setDialog] = useState<'approve' | 'reject' | 'suspend' | null>(null)
  const actionLoading = approving || rejecting || suspending || reinstating

  async function handleApprove() {
    await approve(vendorId).unwrap()
    setDialog(null)
  }

  async function handleReject(reason: string) {
    await reject({ id: vendorId, reason }).unwrap()
    setDialog(null)
  }

  async function handleSuspend(reason: string) {
    await suspend({ id: vendorId, reason: reason || undefined }).unwrap()
    setDialog(null)
  }

  async function handleReinstate() {
    await reinstate(vendorId).unwrap()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#1E5FFF]" />
      </div>
    )
  }

  if (isError || !vendor) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-[#FF3B30]">Failed to load vendor.</p>
        <button onClick={() => router.back()} className="text-xs text-[#1E5FFF] hover:underline">
          Go back
        </button>
      </div>
    )
  }

  const status = statusConfig[vendor.status]
  const typeColor = typeColors[vendor.type] ?? '#9AA1B4'
  const typeLabel = vendor.type.charAt(0) + vendor.type.slice(1).toLowerCase()

  return (
    <>
      {dialog === 'approve' && (
        <ApproveConfirmDialog
          vendorName={vendor.name}
          onConfirm={handleApprove}
          onCancel={() => setDialog(null)}
          loading={approving}
        />
      )}
      {dialog === 'reject' && (
        <ConfirmDialog
          title="Reject vendor"
          placeholder="Reason for rejection (required)…"
          required
          confirmLabel="Reject"
          confirmColor="#FF3B30"
          onConfirm={handleReject}
          onCancel={() => setDialog(null)}
          loading={rejecting}
        />
      )}
      {dialog === 'suspend' && (
        <ConfirmDialog
          title="Suspend vendor"
          placeholder="Reason for suspension (optional)…"
          required={false}
          confirmLabel="Suspend"
          confirmColor="#E8930C"
          onConfirm={handleSuspend}
          onCancel={() => setDialog(null)}
          loading={suspending}
        />
      )}

      <div className="space-y-5">
        {/* Back + header */}
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.back()}
            className="mt-0.5 w-8 h-8 flex items-center justify-center rounded-lg border border-[#E7EAF1] hover:bg-[#EDF0F6] transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-[#525A72]" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-[#0D1426]">{vendor.name}</h1>
              <span className="text-[11px] font-semibold rounded-full px-2.5 py-0.5" style={{ backgroundColor: status.bg, color: status.text }}>
                {status.label}
              </span>
              {vendor.isOpen != null && (
                <span
                  className="text-[11px] font-semibold rounded-full px-2.5 py-0.5"
                  style={vendor.isOpen
                    ? { backgroundColor: '#DFF5EC', color: '#1DB980' }
                    : { backgroundColor: '#EDF0F6', color: '#525A72' }}
                >
                  {vendor.isOpen ? 'Open' : 'Closed'}
                </span>
              )}
            </div>
            <p className="text-xs text-[#9AA1B4] mt-0.5">
              <span className="font-medium" style={{ color: typeColor }}>{typeLabel}</span>
              {' · '}Joined {formatDate(vendor.createdAt)}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {vendor.status === 'PENDING' && (
              <>
                <button
                  onClick={() => setDialog('approve')}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
                  style={{ backgroundColor: '#1DB980' }}
                >
                  {approving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Approve
                </button>
                <button
                  onClick={() => setDialog('reject')}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
                  style={{ backgroundColor: '#FF3B30' }}
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </>
            )}
            {vendor.status === 'APPROVED' && (
              <button
                onClick={() => setDialog('suspend')}
                disabled={actionLoading}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
                style={{ backgroundColor: '#E8930C' }}
              >
                <PauseCircle className="w-3.5 h-3.5" /> Suspend
              </button>
            )}
            {(vendor.status === 'SUSPENDED' || vendor.status === 'REJECTED') && (
              <button
                onClick={handleReinstate}
                disabled={actionLoading}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
                style={{ backgroundColor: '#1E5FFF' }}
              >
                {reinstating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Reinstate
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Contact info */}
          <div className="card p-4 space-y-3">
            <h2 className="text-xs font-bold text-[#0D1426] uppercase tracking-wide">Contact</h2>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#9AA1B4] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[#9AA1B4]">Email</p>
                  <p className="text-xs font-medium text-[#0D1426]">{vendor.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#9AA1B4] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[#9AA1B4]">Phone</p>
                  <p className="text-xs font-medium text-[#0D1426] font-mono">{vendor.phone}</p>
                </div>
              </div>
              {(vendor.ownerFirstName || vendor.ownerLastName) && (
                <div className="flex items-start gap-2.5">
                  <Store className="w-4 h-4 text-[#9AA1B4] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] text-[#9AA1B4]">Owner</p>
                    <p className="text-xs font-medium text-[#0D1426]">
                      {[vendor.ownerFirstName, vendor.ownerLastName].filter(Boolean).join(' ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="card p-4 space-y-3">
            <h2 className="text-xs font-bold text-[#0D1426] uppercase tracking-wide">Location</h2>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#9AA1B4] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[#9AA1B4]">Address</p>
                  <p className="text-xs font-medium text-[#0D1426]">{vendor.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                  <span className="text-[10px] text-[#9AA1B4] font-mono">GPS</span>
                </div>
                <div>
                  <p className="text-[11px] text-[#9AA1B4]">Coordinates</p>
                  <p className="text-xs text-[#525A72] font-mono">{vendor.lat.toFixed(5)}, {vendor.lng.toFixed(5)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Business details */}
          <div className="card p-4 space-y-3">
            <h2 className="text-xs font-bold text-[#0D1426] uppercase tracking-wide">Business</h2>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#9AA1B4]">Type</span>
                <span className="text-xs font-semibold" style={{ color: typeColor }}>{typeLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#9AA1B4]">Rating</span>
                <span className="flex items-center gap-1 text-xs font-semibold text-[#0D1426]">
                  <Star className="w-3 h-3 text-[#E8930C] fill-[#E8930C]" />
                  {vendor.rating != null ? vendor.rating.toFixed(1) : '—'}
                </span>
              </div>
              {vendor.deliveryFeeKobo != null && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#9AA1B4]">Delivery fee</span>
                  <span className="text-xs font-semibold text-[#0D1426]">
                    ₦{(vendor.deliveryFeeKobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              )}
              {vendor.estimatedMinutes != null && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#9AA1B4]">Est. time</span>
                  <span className="text-xs font-semibold text-[#0D1426]">{vendor.estimatedMinutes} min</span>
                </div>
              )}
              {vendor.cuisines && vendor.cuisines.length > 0 && (
                <div>
                  <p className="text-[11px] text-[#9AA1B4] mb-1">Cuisines</p>
                  <div className="flex flex-wrap gap-1">
                    {vendor.cuisines.map((c) => (
                      <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-[#E7EEFF] text-[#1E5FFF] font-medium">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {vendor.description && (
          <div className="card p-4">
            <h2 className="text-xs font-bold text-[#0D1426] uppercase tracking-wide mb-2">Description</h2>
            <p className="text-xs text-[#525A72] leading-relaxed">{vendor.description}</p>
          </div>
        )}

        {/* Opening hours */}
        {vendor.openingHours && Object.keys(vendor.openingHours).length > 0 && (
          <div className="card overflow-hidden">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#9AA1B4]" /> Opening Hours
              </h3>
            </div>
            <div className="divide-y divide-[#F7F9FC]">
              {Object.entries(vendor.openingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs font-medium text-[#0D1426]">{DAY_LABELS[day] ?? day}</span>
                  <span className="text-xs text-[#525A72] font-mono">
                    {hours.open} – {hours.close}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-[#9AA1B4]" /> Submitted Documents
            </h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'businessRegistrationUrl', label: 'Business Registration (CAC)', hint: 'Certificate of incorporation' },
              { key: 'governmentIdUrl', label: 'Government-Issued ID', hint: 'NIN, passport, driver\'s licence' },
              { key: 'utilityBillUrl', label: 'Utility Bill', hint: 'Proof of business address' },
            ].map(({ key, label, hint }) => {
              const url = vendor.documents?.[key as keyof typeof vendor.documents]
              return (
                <div
                  key={key}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                  style={{ borderColor: url ? '#1E5FFF' : '#E7EAF1', backgroundColor: url ? '#E7EEFF' : '#F7F9FC' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: url ? '#1E5FFF' : '#E7EAF1' }}
                  >
                    <FileText className="w-4 h-4" style={{ color: url ? '#fff' : '#9AA1B4' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#0D1426] leading-snug">{label}</p>
                    <p className="text-[11px] text-[#9AA1B4] mt-0.5">{hint}</p>
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1E5FFF] hover:underline mt-1.5"
                      >
                        View document <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-[11px] text-[#FF3B30] font-medium mt-1.5">Not uploaded</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Rejection / suspension reason */}
        {vendor.rejectionReason && (
          <div className="flex items-start gap-2.5 rounded-lg border border-[#FFB3AD] bg-[#FFE3E1] px-4 py-3">
            <XCircle className="w-4 h-4 text-[#FF3B30] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#FF3B30]">
                {vendor.status === 'REJECTED' ? 'Rejection reason' : 'Suspension reason'}
              </p>
              <p className="text-xs text-[#525A72] mt-0.5">{vendor.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Withdrawals */}
        <WithdrawalsSection vendorId={vendorId} />
      </div>
    </>
  )
}
