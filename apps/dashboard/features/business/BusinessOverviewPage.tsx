'use client'

import { useState } from 'react'
import { Bike, Wallet, Users, TrendingUp, Loader2, Building2, Edit2, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import {
  useGetBusinessWalletQuery,
  useGetBusinessRidersQuery,
  useGetBusinessTeamQuery,
  useGetMyBusinessQuery,
  useUpdateMyBusinessMutation,
  useUploadBusinessDocumentMutation,
} from '@/store/services/businessApi'
import { hasPermission } from '@/lib/permissions'
import { formatAmount, formatDateTime } from '@/lib/utils'
import type { BusinessDocumentField } from '@/types/api'

function StatCard({ label, value, icon: Icon, iconColor, iconBg }: {
  label: string; value: string | number; icon: React.ElementType; iconColor: string; iconBg: string
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E7EAF1] p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-[#525A72] text-xs font-medium">{label}</p>
        <p className="text-[#0D1426] text-xl font-bold mt-0.5">{value}</p>
      </div>
    </div>
  )
}

const DOC_FIELDS: { field: BusinessDocumentField; label: string }[] = [
  { field: 'cacCertificateUrl', label: 'CAC Certificate' },
  { field: 'driversLicenseUrl', label: "Driver's Licence" },
  { field: 'insuranceDocumentUrl', label: 'Insurance Document' },
  { field: 'utilityBillUrl', label: 'Utility Bill' },
]

function DocumentRow({ field, label, url }: { field: BusinessDocumentField; label: string; url: string | null }) {
  const [upload, { isLoading }] = useUploadBusinessDocumentMutation()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await upload({ field, file })
  }

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#EDF0F6] last:border-0">
      <div className="flex items-center gap-2.5">
        {url ? <CheckCircle className="w-4 h-4 text-[#1DB980]" /> : <AlertCircle className="w-4 h-4 text-[#DDE2EC]" />}
        <div>
          <p className="text-sm text-[#0D1426] font-medium">{label}</p>
          {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1E5FFF] hover:underline">View document</a>
          ) : (
            <p className="text-xs text-[#9AA1B4]">Not uploaded</p>
          )}
        </div>
      </div>
      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7EAF1] text-xs text-[#525A72] hover:bg-[#F7F9FC] cursor-pointer">
        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
        {url ? 'Replace' : 'Upload'}
        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
      </label>
    </div>
  )
}

function ProfileEditModal({ onClose }: { onClose: () => void }) {
  const { data: biz } = useGetMyBusinessQuery()
  const [update, { isLoading, error }] = useUpdateMyBusinessMutation()
  const [form, setForm] = useState({
    name: biz?.name ?? '',
    email: biz?.email ?? '',
    phone: biz?.phone ?? '',
    address: biz?.address ?? '',
    cacRegistrationNumber: biz?.cacRegistrationNumber ?? '',
    tin: biz?.tin ?? '',
    yearEstablished: biz?.yearEstablished ?? '',
    ownerFullName: biz?.ownerFullName ?? '',
    ownerPhoneNumber: biz?.ownerPhoneNumber ?? '',
    ownerEmail: biz?.ownerEmail ?? '',
    ownerNIN: biz?.ownerNIN ?? '',
    ownerBVN: biz?.ownerBVN ?? '',
    bankName: biz?.bankName ?? '',
    accountName: biz?.accountName ?? '',
    accountNumber: biz?.accountNumber ?? '',
  })

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await update({
        ...form,
        yearEstablished: form.yearEstablished ? Number(form.yearEstablished) : undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
      }).unwrap()
      onClose()
    } catch {}
  }

  const inp = "w-full border border-[#E7EAF1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5FFF]/20 focus:border-[#1E5FFF]"
  const lbl = "block text-xs font-medium text-[#0D1426] mb-1.5"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-[#E7EAF1] flex items-center justify-between shrink-0">
          <h2 className="text-base font-bold text-[#0D1426]">Edit Business Profile</h2>
          <button onClick={onClose} className="text-[#9AA1B4] hover:text-[#0D1426]">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <p className="text-xs font-semibold text-[#0D1426] mb-3">Business Details</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lbl}>Business Name *</label><input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inp} /></div>
                <div><label className={lbl}>CAC Reg. Number</label><input value={form.cacRegistrationNumber} onChange={(e) => set('cacRegistrationNumber', e.target.value)} className={inp} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className={lbl}>TIN</label><input value={form.tin} onChange={(e) => set('tin', e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Year Established</label><input type="number" value={form.yearEstablished} onChange={(e) => set('yearEstablished', e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Phone</label><input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inp} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lbl}>Email</label><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Address</label><input value={form.address} onChange={(e) => set('address', e.target.value)} className={inp} /></div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#E7EAF1] pt-4">
            <p className="text-xs font-semibold text-[#0D1426] mb-3">Owner Information</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lbl}>Full Name</label><input value={form.ownerFullName} onChange={(e) => set('ownerFullName', e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Phone</label><input value={form.ownerPhoneNumber} onChange={(e) => set('ownerPhoneNumber', e.target.value)} className={inp} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className={lbl}>Email</label><input type="email" value={form.ownerEmail} onChange={(e) => set('ownerEmail', e.target.value)} className={inp} /></div>
                <div><label className={lbl}>NIN</label><input value={form.ownerNIN} onChange={(e) => set('ownerNIN', e.target.value)} className={inp} /></div>
                <div><label className={lbl}>BVN</label><input value={form.ownerBVN} onChange={(e) => set('ownerBVN', e.target.value)} className={inp} /></div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#E7EAF1] pt-4">
            <p className="text-xs font-semibold text-[#0D1426] mb-3">Banking Details</p>
            <div className="grid grid-cols-3 gap-3">
              <div><label className={lbl}>Bank Name</label><input value={form.bankName} onChange={(e) => set('bankName', e.target.value)} className={inp} /></div>
              <div><label className={lbl}>Account Name</label><input value={form.accountName} onChange={(e) => set('accountName', e.target.value)} className={inp} /></div>
              <div><label className={lbl}>Account Number</label><input value={form.accountNumber} onChange={(e) => set('accountNumber', e.target.value)} className={inp} /></div>
            </div>
          </div>
          {error && <p className="text-xs text-[#FF3B30]">{(error as any)?.data?.error ?? 'Failed to update profile'}</p>}
        </form>
        <div className="px-6 py-4 border-t border-[#E7EAF1] flex justify-end gap-2 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#525A72] hover:bg-[#EDF0F6] rounded-lg">Cancel</button>
          <button onClick={handleSubmit} disabled={isLoading}
            className="px-4 py-2 text-sm text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50"
            style={{ backgroundColor: '#1E5FFF' }}>
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between py-2 border-b border-[#EDF0F6] last:border-0 text-sm">
      <span className="text-[#525A72]">{label}</span>
      <span className="font-medium text-[#0D1426] text-right max-w-[55%] truncate">{value}</span>
    </div>
  )
}

export default function BusinessOverviewPage() {
  const { data: session } = useSession()
  const isOwner = hasPermission(session, 'business:write')
  const [showEdit, setShowEdit] = useState(false)

  const { data: wallet, isLoading: walletLoading } = useGetBusinessWalletQuery()
  const { data: ridersData, isLoading: ridersLoading } = useGetBusinessRidersQuery({ limit: 5 })
  const { data: team } = useGetBusinessTeamQuery()
  const { data: biz } = useGetMyBusinessQuery()

  const riders = ridersData?.data ?? []
  const activeRiders = riders.filter((r) => r.isActive).length
  const docsUploaded = DOC_FIELDS.filter(({ field }) => biz?.[field as keyof typeof biz]).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0D1426]">Welcome, {session?.admin?.firstName}</h1>
          <p className="text-sm text-[#525A72] mt-0.5">{biz?.name ?? 'Your Business'}</p>
        </div>
        {isOwner && (
          <button onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[#E7EAF1] rounded-lg text-[#0D1426] hover:bg-[#F7F9FC]">
            <Edit2 className="w-4 h-4" /> Edit Profile
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Wallet Balance" value={walletLoading ? '—' : formatAmount(wallet?.balance ?? 0)} icon={Wallet} iconColor="#1E5FFF" iconBg="#E7EEFF" />
        <StatCard label="Total Riders" value={ridersLoading ? '—' : ridersData?.meta?.total ?? 0} icon={Bike} iconColor="#1DB980" iconBg="#DFF5EC" />
        <StatCard label="Active Riders" value={ridersLoading ? '—' : biz?._count?.riders ?? activeRiders} icon={TrendingUp} iconColor="#E8930C" iconBg="#FBEDD7" />
        <StatCard label="Team Members" value={team?.length ?? '—'} icon={Users} iconColor="#FF6A2C" iconBg="#FFEAE1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Profile */}
        <div className="bg-white rounded-xl border border-[#E7EAF1] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E7EAF1] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0D1426] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#9AA1B4]" /> Business Profile
            </h2>
            {isOwner && (
              <button onClick={() => setShowEdit(true)} className="text-xs text-[#1E5FFF] hover:underline">Edit</button>
            )}
          </div>
          <div className="px-5 py-3">
            <InfoRow label="Business Name" value={biz?.name} />
            <InfoRow label="CAC Number" value={biz?.cacRegistrationNumber} />
            <InfoRow label="TIN" value={biz?.tin} />
            <InfoRow label="Year Established" value={biz?.yearEstablished} />
            <InfoRow label="Email" value={biz?.email} />
            <InfoRow label="Phone" value={biz?.phone} />
            <InfoRow label="Address" value={biz?.address} />
            {biz?.serviceAreas && biz.serviceAreas.length > 0 && (
              <div className="flex justify-between py-2 border-b border-[#EDF0F6] text-sm">
                <span className="text-[#525A72]">Service Areas</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[55%]">
                  {biz.serviceAreas.map((a) => (
                    <span key={a} className="text-xs bg-[#E7EEFF] text-[#1E5FFF] px-2 py-0.5 rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="px-5 pb-3 border-t border-[#EDF0F6] pt-3">
            <p className="text-[10px] font-semibold text-[#9AA1B4] uppercase tracking-wider mb-2">Owner</p>
            <InfoRow label="Full Name" value={biz?.ownerFullName} />
            <InfoRow label="Phone" value={biz?.ownerPhoneNumber} />
            <InfoRow label="Email" value={biz?.ownerEmail} />
          </div>
          <div className="px-5 pb-3 border-t border-[#EDF0F6] pt-3">
            <p className="text-[10px] font-semibold text-[#9AA1B4] uppercase tracking-wider mb-2">Banking</p>
            <InfoRow label="Bank" value={biz?.bankName} />
            <InfoRow label="Account Name" value={biz?.accountName} />
            <InfoRow label="Account Number" value={biz?.accountNumber} />
          </div>
        </div>

        <div className="space-y-6">
          {/* Documents */}
          {isOwner && (
            <div className="bg-white rounded-xl border border-[#E7EAF1] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E7EAF1] flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#0D1426]">Compliance Documents</h2>
                <span className="text-xs text-[#525A72]">{docsUploaded}/{DOC_FIELDS.length} uploaded</span>
              </div>
              <div className="px-5 py-2">
                {DOC_FIELDS.map(({ field, label }) => (
                  <DocumentRow key={field} field={field} label={label} url={biz?.[field as keyof typeof biz] as string | null ?? null} />
                ))}
              </div>
            </div>
          )}

          {/* Riders Preview */}
          <div className="bg-white rounded-xl border border-[#E7EAF1] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E7EAF1] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#0D1426]">Recent Riders</h2>
              <a href="/business/riders" className="text-xs text-[#1E5FFF] hover:underline">View all</a>
            </div>
            {ridersLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#1E5FFF]" /></div>
            ) : riders.length === 0 ? (
              <p className="text-center text-sm text-[#525A72] py-8">No riders assigned yet.</p>
            ) : (
              <div className="divide-y divide-[#EDF0F6]">
                {riders.map((r) => (
                  <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#0D1426]">{r.firstName} {r.lastName}</p>
                      <p className="text-xs text-[#525A72]">{r.phone} · {r.vehicleType ?? 'No vehicle'}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.isActive ? 'bg-[#DFF5EC] text-[#1DB980]' : 'bg-[#FFE3E1] text-[#FF3B30]'}`}>
                      {r.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showEdit && <ProfileEditModal onClose={() => setShowEdit(false)} />}
    </div>
  )
}
