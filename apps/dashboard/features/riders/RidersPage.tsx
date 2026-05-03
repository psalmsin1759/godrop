'use client'

import { useState } from 'react'
import {
  useGetRidersQuery,
  useGetRiderStatsQuery,
  useGetRiderOrdersQuery,
  useGetRiderEarningsQuery,
  useUpdateRiderKycMutation,
  useToggleRiderActiveMutation,
  useGetRiderQuery,
  useCreateRiderMutation,
} from '@/store/services/ridersApi'
import type { Rider, RiderDetail, RiderKycStatus, VehicleType, CreateRiderRequest, RiderOrderSummary, RiderEarning } from '@/types/api'
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Power,
  Loader2,
  Bike,
  ChevronLeft,
  ChevronRight,
  Star,
  X,
  TrendingUp,
  Package,
  Users,
  Wallet,
} from 'lucide-react'

function formatNaira(kobo: number) {
  return '₦' + (kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const kycConfig: Record<RiderKycStatus, { bg: string; text: string; label: string }> = {
  PENDING:   { bg: '#fff6e8', text: '#ffa21d', label: 'Pending' },
  SUBMITTED: { bg: '#eef1fb', text: '#3454d1', label: 'Submitted' },
  VERIFIED:  { bg: '#e8faf2', text: '#17c666', label: 'Verified' },
  REJECTED:  { bg: '#fdf0f0', text: '#ea4d4d', label: 'Rejected' },
}

const vehicleLabels: Record<VehicleType, string> = {
  BICYCLE:    'Bicycle',
  MOTORCYCLE: 'Motorcycle',
  CAR:        'Car',
  VAN:        'Van',
}

// ─── Detail drawer ────────────────────────────────────────────────────────────

type DrawerTab = 'profile' | 'orders' | 'earnings'

function RiderOrdersTab({ id }: { id: string }) {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useGetRiderOrdersQuery({ id, page, limit: 10 })
  const orders = data?.data ?? []
  const meta = data?.meta

  const orderStatusColors: Record<string, { bg: string; text: string }> = {
    DELIVERED:      { bg: '#e8faf2', text: '#17c666' },
    IN_TRANSIT:     { bg: '#eef1fb', text: '#3454d1' },
    PICKED_UP:      { bg: '#eef1fb', text: '#3454d1' },
    READY_FOR_PICKUP: { bg: '#fff6e8', text: '#ffa21d' },
    ACCEPTED:       { bg: '#fff6e8', text: '#ffa21d' },
    PENDING:        { bg: '#f3f4f6', text: '#6b7885' },
    CANCELLED:      { bg: '#fdf0f0', text: '#ea4d4d' },
    FAILED:         { bg: '#fdf0f0', text: '#ea4d4d' },
    PREPARING:      { bg: '#fff6e8', text: '#ffa21d' },
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-10"><Loader2 className="w-4 h-4 animate-spin text-[#3454d1]" /></div>
  }

  return (
    <div className="flex flex-col">
      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10">
          <Package className="w-7 h-7 text-[#d1d5db]" />
          <p className="text-xs text-[#9ca3af]">No orders yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#f9fafb]">
          {orders.map((order) => {
            const sc = orderStatusColors[order.status] ?? { bg: '#f3f4f6', text: '#6b7885' }
            return (
              <div key={order.id} className="px-5 py-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono font-semibold text-[#283c50]">{order.trackingCode}</span>
                    <span className="text-[10px] font-medium rounded-full px-2 py-0.5" style={{ backgroundColor: sc.bg, color: sc.text }}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6b7885] truncate">{order.pickupAddress} → {order.dropoffAddress}</p>
                  <p className="text-[10px] text-[#9ca3af] mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-[#283c50]">{formatNaira(order.deliveryFeeKobo)}</p>
                  <p className="text-[10px] text-[#9ca3af]">{order.type}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {meta && meta.totalPages > 1 && (
        <div className="px-5 py-3 border-t border-[#f3f4f6] flex items-center justify-between">
          <p className="text-[11px] text-[#9ca3af]">Page {page} of {meta.totalPages}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
              className="w-6 h-6 rounded border border-[#e5e7eb] flex items-center justify-center disabled:opacity-40 hover:bg-[#f9fafb]">
              <ChevronLeft className="w-3 h-3 text-[#6b7885]" />
            </button>
            <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages}
              className="w-6 h-6 rounded border border-[#e5e7eb] flex items-center justify-center disabled:opacity-40 hover:bg-[#f9fafb]">
              <ChevronRight className="w-3 h-3 text-[#6b7885]" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function RiderEarningsTab({ id }: { id: string }) {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useGetRiderEarningsQuery({ id, page, limit: 10 })
  const earnings = data?.data ?? []
  const meta = data?.meta

  if (isLoading) {
    return <div className="flex items-center justify-center py-10"><Loader2 className="w-4 h-4 animate-spin text-[#3454d1]" /></div>
  }

  return (
    <div className="flex flex-col">
      {data && (
        <div className="px-5 py-4 bg-[#f9fafb] border-b border-[#f3f4f6]">
          <p className="text-[10px] text-[#9ca3af] uppercase tracking-wide font-medium mb-1">Total Earned</p>
          <p className="text-xl font-bold text-[#283c50]">{formatNaira(data.totalEarnedKobo)}</p>
        </div>
      )}
      {earnings.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10">
          <Wallet className="w-7 h-7 text-[#d1d5db]" />
          <p className="text-xs text-[#9ca3af]">No earnings yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#f9fafb]">
          {earnings.map((earning) => (
            <div key={earning.id} className="px-5 py-3 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-[#283c50] font-medium">{earning.order.trackingCode}</p>
                <p className="text-[11px] text-[#6b7885] truncate mt-0.5">
                  {earning.order.pickupAddress} → {earning.order.dropoffAddress}
                </p>
                <p className="text-[10px] text-[#9ca3af] mt-0.5">
                  {new Date(earning.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold text-[#283c50]">{formatNaira(earning.amountKobo)}</p>
                <span
                  className="text-[10px] font-medium rounded-full px-2 py-0.5"
                  style={earning.status === 'SETTLED'
                    ? { backgroundColor: '#e8faf2', color: '#17c666' }
                    : { backgroundColor: '#fff6e8', color: '#ffa21d' }}
                >
                  {earning.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {meta && meta.totalPages > 1 && (
        <div className="px-5 py-3 border-t border-[#f3f4f6] flex items-center justify-between">
          <p className="text-[11px] text-[#9ca3af]">Page {page} of {meta.totalPages}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
              className="w-6 h-6 rounded border border-[#e5e7eb] flex items-center justify-center disabled:opacity-40 hover:bg-[#f9fafb]">
              <ChevronLeft className="w-3 h-3 text-[#6b7885]" />
            </button>
            <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages}
              className="w-6 h-6 rounded border border-[#e5e7eb] flex items-center justify-center disabled:opacity-40 hover:bg-[#f9fafb]">
              <ChevronRight className="w-3 h-3 text-[#6b7885]" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function RiderDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: rider, isLoading } = useGetRiderQuery(id)
  const [tab, setTab] = useState<DrawerTab>('profile')

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/30" />
      <div
        className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6] sticky top-0 bg-white z-10">
          <h2 className="text-sm font-bold text-[#283c50]">Rider Detail</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#f3f4f6]"
          >
            <X className="w-4 h-4 text-[#6b7885]" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-[#3454d1]" />
          </div>
        ) : !rider ? (
          <div className="flex-1 flex items-center justify-center text-xs text-[#ea4d4d]">
            Failed to load rider.
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex items-center gap-0 border-b border-[#f3f4f6] px-5 sticky top-[57px] bg-white z-10">
              {(['profile', 'orders', 'earnings'] as DrawerTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="py-3 px-4 text-xs font-medium capitalize transition-colors border-b-2"
                  style={tab === t
                    ? { color: '#3454d1', borderColor: '#3454d1' }
                    : { color: '#9ca3af', borderColor: 'transparent' }}
                >
                  {t}
                </button>
              ))}
            </div>
            {tab === 'profile' && <RiderDetailContent rider={rider} />}
            {tab === 'orders' && <RiderOrdersTab id={id} />}
            {tab === 'earnings' && <RiderEarningsTab id={id} />}
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === '') return null
  return (
    <div>
      <p className="text-[10px] text-[#9ca3af] uppercase tracking-wide font-medium">{label}</p>
      <p className="text-xs text-[#283c50] mt-0.5 font-medium">{value}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-[#f9fafb]">
      <p className="text-[11px] font-bold text-[#3454d1] uppercase tracking-wider mb-3">{title}</p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>
    </div>
  )
}

function RiderDetailContent({ rider }: { rider: RiderDetail }) {
  const kyc = kycConfig[rider.kycStatus]
  return (
    <>
      {/* Avatar + name */}
      <div className="px-5 py-5 flex items-center gap-4 border-b border-[#f3f4f6]">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
          style={{ background: 'linear-gradient(135deg, #3454d1, #3dc7be)' }}
        >
          {rider.firstName[0]}{rider.lastName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#283c50]">{rider.firstName} {rider.lastName}</p>
          <p className="text-xs text-[#9ca3af] font-mono">{rider.phone}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] font-medium rounded-full px-2 py-0.5" style={{ backgroundColor: kyc.bg, color: kyc.text }}>
              {kyc.label}
            </span>
            <span
              className="text-[11px] font-medium rounded-full px-2 py-0.5"
              style={rider.isActive ? { backgroundColor: '#e8faf2', color: '#17c666' } : { backgroundColor: '#f3f4f6', color: '#6b7885' }}
            >
              {rider.isActive ? 'Active' : 'Inactive'}
            </span>
            {rider.isAvailable && (
              <span className="text-[11px] font-medium rounded-full px-2 py-0.5" style={{ backgroundColor: '#eef1fb', color: '#3454d1' }}>
                Available
              </span>
            )}
          </div>
        </div>
        {rider.rating != null && (
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3.5 h-3.5 text-[#ffa21d]" fill="#ffa21d" />
            <span className="text-sm font-bold text-[#283c50]">{rider.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <Section title="Personal">
        <Field label="Email" value={rider.email} />
        <Field label="Date of birth" value={rider.dateOfBirth} />
        <Field label="Gender" value={rider.gender} />
        <Field label="City" value={rider.city} />
        <Field label="State" value={rider.state} />
        <Field label="Address" value={rider.streetAddress} />
        <Field label="Landmark" value={rider.landmark} />
      </Section>

      <Section title="Vehicle">
        <Field label="Type" value={rider.vehicleType ? vehicleLabels[rider.vehicleType] : null} />
        <Field label="Plate" value={rider.vehiclePlate} />
        <Field label="Color" value={rider.vehicleColor} />
        <Field label="Model" value={rider.vehicleModel} />
        <Field label="Year" value={rider.vehicleYear} />
        <Field label="License no." value={rider.driverLicenseNumber} />
        <Field label="License expiry" value={rider.driverLicenseExpiry} />
        <Field label="Insurance expiry" value={rider.vehicleInsuranceExpiry} />
      </Section>

      <Section title="Banking">
        <Field label="Bank" value={rider.bankName} />
        <Field label="Account number" value={rider.accountNumber} />
        <Field label="Account name" value={rider.accountName} />
        <Field label="BVN" value={rider.bvn ? '•••••••' + rider.bvn.slice(-4) : null} />
        <Field label="NIN" value={rider.nin ? '•••••••' + rider.nin.slice(-4) : null} />
      </Section>

      {(rider.emergencyContactName || rider.emergencyContactPhone) && (
        <Section title="Emergency Contact">
          <Field label="Name" value={rider.emergencyContactName} />
          <Field label="Phone" value={rider.emergencyContactPhone} />
          <Field label="Relationship" value={rider.emergencyContactRelationship} />
        </Section>
      )}

      {rider.guarantors && rider.guarantors.length > 0 && (
        <div className="px-5 py-4 border-b border-[#f9fafb]">
          <p className="text-[11px] font-bold text-[#3454d1] uppercase tracking-wider mb-3">Guarantors</p>
          <div className="space-y-3">
            {rider.guarantors.map((g, i) => (
              <div key={i} className="bg-[#f9fafb] rounded-lg p-3 space-y-1">
                <p className="text-xs font-semibold text-[#283c50]">{g.name}</p>
                <p className="text-[11px] text-[#6b7885]">{g.phone} · {g.relationship}</p>
                {g.address && <p className="text-[11px] text-[#9ca3af]">{g.address}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 py-4">
        <p className="text-[10px] text-[#9ca3af]">
          Joined {new Date(rider.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>
    </>
  )
}

// ─── Action menu ──────────────────────────────────────────────────────────────

function RiderActionMenu({ rider, onClose, onView }: { rider: Rider; onClose: () => void; onView: () => void }) {
  const [updateKyc] = useUpdateRiderKycMutation()
  const [toggleActive] = useToggleRiderActiveMutation()
  const [notes, setNotes] = useState('')
  const [step, setStep] = useState<'menu' | 'reject_kyc'>('menu')
  const [loading, setLoading] = useState(false)

  async function run(fn: () => Promise<unknown>) {
    setLoading(true)
    try { await fn(); onClose() } finally { setLoading(false) }
  }

  if (step === 'reject_kyc') {
    return (
      <div className="absolute right-0 top-8 z-50 w-64 bg-white rounded-lg border border-[#e5e7eb] shadow-card-md p-3 space-y-2">
        <p className="text-xs font-semibold text-[#283c50]">Reject KYC</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Reason (optional)…"
          className="w-full text-xs border border-[#e5e7eb] rounded p-2 resize-none h-20 focus:outline-none focus:ring-1 focus:ring-[#3454d1]"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setStep('menu')}
            className="flex-1 text-xs py-1.5 rounded border border-[#e5e7eb] text-[#6b7885] hover:bg-[#f9fafb]"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={() => run(() => updateKyc({ id: rider.id, status: 'REJECTED', notes: notes || undefined }).unwrap())}
            className="flex-1 text-xs py-1.5 rounded text-white font-medium disabled:opacity-50 bg-[#ea4d4d]"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Reject'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute right-0 top-8 z-50 w-44 bg-white rounded-lg border border-[#e5e7eb] shadow-card-md py-1">
      <button
        onClick={() => { onView(); onClose() }}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#283c50] hover:bg-[#f9fafb]"
      >
        <Eye className="w-3.5 h-3.5 text-[#3454d1]" /> View detail
      </button>

      {(rider.kycStatus === 'PENDING' || rider.kycStatus === 'SUBMITTED') && (
        <>
          <button
            onClick={() => run(() => updateKyc({ id: rider.id, status: 'VERIFIED' }).unwrap())}
            disabled={loading}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#17c666] hover:bg-[#f9fafb]"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Verify KYC
          </button>
          <button
            onClick={() => setStep('reject_kyc')}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#ea4d4d] hover:bg-[#f9fafb]"
          >
            <XCircle className="w-3.5 h-3.5" /> Reject KYC
          </button>
        </>
      )}
      {rider.kycStatus === 'REJECTED' && (
        <button
          onClick={() => run(() => updateKyc({ id: rider.id, status: 'VERIFIED' }).unwrap())}
          disabled={loading}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#17c666] hover:bg-[#f9fafb]"
        >
          <CheckCircle className="w-3.5 h-3.5" /> Verify KYC
        </button>
      )}

      <div className="border-t border-[#f3f4f6] mt-1">
        <button
          onClick={() => run(() => toggleActive({ id: rider.id, isActive: !rider.isActive }).unwrap())}
          disabled={loading}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-[#f9fafb]"
          style={{ color: rider.isActive ? '#ea4d4d' : '#17c666' }}
        >
          <Power className="w-3.5 h-3.5" />
          {rider.isActive ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  )
}

// ─── Create rider dialog ──────────────────────────────────────────────────────

function CreateRiderDialog({ onClose }: { onClose: () => void }) {
  const [createRider, { isLoading }] = useCreateRiderMutation()
  const [form, setForm] = useState<Partial<CreateRiderRequest>>({})
  const [error, setError] = useState('')

  function set(field: keyof CreateRiderRequest, value: string) {
    setForm((f) => ({ ...f, [field]: value || undefined }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.phone) {
      setError('First name, last name, and phone are required.')
      return
    }
    setError('')
    try {
      await createRider(form as CreateRiderRequest).unwrap()
      onClose()
    } catch (err: any) {
      setError(err?.data?.message ?? 'Failed to create rider.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
          <h2 className="text-sm font-bold text-[#283c50]">Add Rider</h2>
          <button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#f3f4f6]">
            <X className="w-4 h-4 text-[#6b7885]" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {([
              ['firstName', 'First name *'],
              ['lastName', 'Last name *'],
              ['phone', 'Phone *'],
              ['email', 'Email'],
              ['city', 'City'],
              ['state', 'State'],
            ] as [keyof CreateRiderRequest, string][]).map(([field, label]) => (
              <div key={field} className={field === 'phone' ? 'col-span-2 sm:col-span-1' : ''}>
                <label className="block text-[11px] font-medium text-[#6b7885] mb-1">{label}</label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  value={(form[field] as string) ?? ''}
                  onChange={(e) => set(field, e.target.value)}
                  className="w-full text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-1.5 text-[#283c50] focus:outline-none focus:ring-1 focus:ring-[#3454d1]"
                />
              </div>
            ))}
            <div>
              <label className="block text-[11px] font-medium text-[#6b7885] mb-1">Vehicle type</label>
              <select
                value={(form.vehicleType as string) ?? ''}
                onChange={(e) => set('vehicleType', e.target.value)}
                className="w-full text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-1.5 text-[#283c50] focus:outline-none focus:ring-1 focus:ring-[#3454d1]"
              >
                <option value="">Select…</option>
                {(Object.keys(vehicleLabels) as VehicleType[]).map((v) => (
                  <option key={v} value={v}>{vehicleLabels[v]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#6b7885] mb-1">Plate number</label>
              <input
                type="text"
                value={(form.vehiclePlate as string) ?? ''}
                onChange={(e) => set('vehiclePlate', e.target.value)}
                className="w-full text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-1.5 text-[#283c50] focus:outline-none focus:ring-1 focus:ring-[#3454d1]"
              />
            </div>
          </div>

          {error && <p className="text-[11px] text-[#ea4d4d]">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs px-4 py-2 rounded border border-[#e5e7eb] text-[#6b7885] hover:bg-[#f9fafb]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              Add rider
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

// ─── Stats bar ────────────────────────────────────────────────────────────────

function RiderStatsBar() {
  const { data: stats } = useGetRiderStatsQuery()

  const cards = [
    { label: 'Total Riders', value: stats?.total ?? '—', icon: <Users className="w-4 h-4 text-[#3454d1]" />, bg: '#eef1fb' },
    { label: 'Active', value: stats?.active ?? '—', icon: <TrendingUp className="w-4 h-4 text-[#17c666]" />, bg: '#e8faf2' },
    { label: 'Online Now', value: stats?.available ?? '—', icon: <Bike className="w-4 h-4 text-[#ffa21d]" />, bg: '#fff6e8' },
    { label: 'KYC Pending', value: (stats?.byKycStatus.PENDING ?? 0) + (stats?.byKycStatus.SUBMITTED ?? 0), icon: <Package className="w-4 h-4 text-[#ea4d4d]" />, bg: '#fdf0f0' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: c.bg }}>
            {c.icon}
          </div>
          <div>
            <p className="text-[11px] text-[#9ca3af] font-medium">{c.label}</p>
            <p className="text-lg font-bold text-[#283c50] leading-tight">{c.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function RidersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [kycFilter, setKycFilter] = useState<RiderKycStatus | 'ALL'>('ALL')
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'active' | 'inactive'>('ALL')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [viewId, setViewId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const params = {
    page,
    limit: 20,
    ...(search ? { search } : {}),
    ...(kycFilter !== 'ALL' ? { kycStatus: kycFilter } : {}),
    ...(activeFilter === 'active' ? { isActive: true } : activeFilter === 'inactive' ? { isActive: false } : {}),
  }

  const { data, isLoading, isError } = useGetRidersQuery(params)
  const riders = data?.data ?? []
  const meta = data?.meta

  const counts = {
    total: meta?.total ?? 0,
    pages: meta?.totalPages ?? 1,
  }

  return (
    <div className="space-y-5" onClick={() => setOpenMenu(null)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#283c50]">Riders</h1>
          <p className="text-xs text-[#9ca3af] mt-0.5">Delivery rider management and KYC</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Add Rider
        </button>
      </div>

      <RiderStatsBar />

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Active filter */}
          <div className="flex items-center gap-1 p-1 bg-[#f3f4f6] rounded">
            {([['ALL', 'All'], ['active', 'Active'], ['inactive', 'Inactive']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => { setActiveFilter(val); setPage(1) }}
                className="text-xs font-medium px-3 py-1.5 rounded transition-all"
                style={
                  activeFilter === val
                    ? { backgroundColor: '#fff', color: '#3454d1', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }
                    : { color: '#6b7885' }
                }
              >
                {label}
              </button>
            ))}
          </div>

          {/* KYC filter */}
          <select
            value={kycFilter}
            onChange={(e) => { setKycFilter(e.target.value as RiderKycStatus | 'ALL'); setPage(1) }}
            className="text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#4b5563] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#3454d1]"
          >
            <option value="ALL">All KYC</option>
            {(['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED'] as RiderKycStatus[]).map((k) => (
              <option key={k} value={k}>{kycConfig[k].label}</option>
            ))}
          </select>

          <div className="flex-1" />

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Search riders…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-8 pr-3 py-1.5 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#4b5563] placeholder:text-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#3454d1] focus:border-[#3454d1] w-52"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-[#9ca3af]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading riders…
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-xs text-[#ea4d4d]">
            Failed to load riders. Check your connection.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                    {['Rider', 'Phone', 'Vehicle', 'KYC', 'Status', 'Rating', 'Orders', 'Joined', ''].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f9fafb]">
                  {riders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10">
                        <div className="flex flex-col items-center gap-2">
                          <Bike className="w-8 h-8 text-[#d1d5db]" />
                          <p className="text-xs text-[#9ca3af]">No riders found.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    riders.map((rider) => {
                      const kyc = kycConfig[rider.kycStatus]
                      return (
                        <tr
                          key={rider.id}
                          className="hover:bg-[#fafafa] transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                style={{ background: 'linear-gradient(135deg, #3454d1, #3dc7be)' }}
                              >
                                {rider.firstName[0]}{rider.lastName[0]}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-[#283c50]">
                                  {rider.firstName} {rider.lastName}
                                </p>
                                {rider.email && (
                                  <p className="text-[11px] text-[#9ca3af]">{rider.email}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-[#4b5563] font-mono">{rider.phone}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-[#6b7885]">
                              {rider.vehicleType ? vehicleLabels[rider.vehicleType] : '—'}
                            </span>
                            {rider.vehiclePlate && (
                              <p className="text-[11px] text-[#9ca3af] font-mono">{rider.vehiclePlate}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="text-[11px] font-medium rounded-full px-2 py-0.5"
                              style={{ backgroundColor: kyc.bg, color: kyc.text }}
                            >
                              {kyc.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-0.5">
                              <span
                                className="text-[11px] font-medium rounded-full px-2 py-0.5 w-fit"
                                style={rider.isActive
                                  ? { backgroundColor: '#e8faf2', color: '#17c666' }
                                  : { backgroundColor: '#f3f4f6', color: '#6b7885' }}
                              >
                                {rider.isActive ? 'Active' : 'Inactive'}
                              </span>
                              {rider.isAvailable && (
                                <span className="text-[10px] text-[#3454d1]">● Online</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {rider.rating != null ? (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-[#ffa21d]" fill="#ffa21d" />
                                <span className="text-xs font-semibold text-[#283c50]">
                                  {rider.rating.toFixed(1)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-[#9ca3af]">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-semibold text-[#283c50]">
                              {rider._count?.orders ?? 0}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] text-[#9ca3af]">
                              {new Date(rider.createdAt).toLocaleDateString('en-NG', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setOpenMenu(openMenu === rider.id ? null : rider.id)}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5 text-[#9ca3af]" />
                              </button>
                              {openMenu === rider.id && (
                                <RiderActionMenu
                                  rider={rider}
                                  onClose={() => setOpenMenu(null)}
                                  onView={() => setViewId(rider.id)}
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-[#f3f4f6] flex items-center justify-between">
              <p className="text-xs text-[#9ca3af]">
                {counts.total === 0
                  ? 'No riders'
                  : `Page ${page} of ${counts.pages} · ${counts.total} total`}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="w-7 h-7 rounded flex items-center justify-center border border-[#e5e7eb] disabled:opacity-40 hover:bg-[#f9fafb]"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-[#6b7885]" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(counts.pages, p + 1))}
                  disabled={page >= counts.pages}
                  className="w-7 h-7 rounded flex items-center justify-center border border-[#e5e7eb] disabled:opacity-40 hover:bg-[#f9fafb]"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#6b7885]" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail drawer */}
      {viewId && <RiderDrawer id={viewId} onClose={() => setViewId(null)} />}

      {/* Create dialog */}
      {showCreate && <CreateRiderDialog onClose={() => setShowCreate(false)} />}
    </div>
  )
}
