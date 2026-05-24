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
import { formatNaira, formatDateTime } from '@/lib/utils'
import type { BusinessDocumentField } from '@/types/api'

function StatCard({ label, value, icon: Icon, iconColor, iconBg }: {
  label: string; value: string | number; icon: React.ElementType; iconColor: string; iconBg: string
}) {
  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-[#6b7885] text-xs font-medium">{label}</p>
        <p className="text-[#283c50] text-xl font-bold mt-0.5">{value}</p>
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
    <div className="flex items-center justify-between py-2.5 border-b border-[#f3f4f6] last:border-0">
      <div className="flex items-center gap-2.5">
        {url ? <CheckCircle className="w-4 h-4 text-[#17c666]" /> : <AlertCircle className="w-4 h-4 text-[#d1d5db]" />}
        <div>
          <p className="text-sm text-[#283c50] font-medium">{label}</p>
          {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#3454d1] hover:underline">View document</a>
          ) : (
            <p className="text-xs text-[#9ca3af]">Not uploaded</p>
          )}
        </div>
      </div>
      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-xs text-[#6b7885] hover:bg-[#f9fafb] cursor-pointer">
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

  const inp = "w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]"
  const lbl = "block text-xs font-medium text-[#283c50] mb-1.5"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center justify-between shrink-0">
          <h2 className="text-base font-bold text-[#283c50]">Edit Business Profile</h2>
          <button onClick={onClose} className="text-[#9ca3af] hover:text-[#283c50]">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <p className="text-xs font-semibold text-[#283c50] mb-3">Business Details</p>
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
          <div className="border-t border-[#e5e7eb] pt-4">
            <p className="text-xs font-semibold text-[#283c50] mb-3">Owner Information</p>
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
          <div className="border-t border-[#e5e7eb] pt-4">
            <p className="text-xs font-semibold text-[#283c50] mb-3">Banking Details</p>
            <div className="grid grid-cols-3 gap-3">
              <div><label className={lbl}>Bank Name</label><input value={form.bankName} onChange={(e) => set('bankName', e.target.value)} className={inp} /></div>
              <div><label className={lbl}>Account Name</label><input value={form.accountName} onChange={(e) => set('accountName', e.target.value)} className={inp} /></div>
              <div><label className={lbl}>Account Number</label><input value={form.accountNumber} onChange={(e) => set('accountNumber', e.target.value)} className={inp} /></div>
            </div>
          </div>
          {error && <p className="text-xs text-[#ea4d4d]">{(error as any)?.data?.error ?? 'Failed to update profile'}</p>}
        </form>
        <div className="px-6 py-4 border-t border-[#e5e7eb] flex justify-end gap-2 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#6b7885] hover:bg-[#f3f4f6] rounded-lg">Cancel</button>
          <button onClick={handleSubmit} disabled={isLoading}
            className="px-4 py-2 text-sm text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50"
            style={{ backgroundColor: '#3454d1' }}>
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
    <div className="flex justify-between py-2 border-b border-[#f3f4f6] last:border-0 text-sm">
      <span className="text-[#6b7885]">{label}</span>
      <span className="font-medium text-[#283c50] text-right max-w-[55%] truncate">{value}</span>
    </div>
  )
}

export default function BusinessOverviewPage() {
  const { data: session } = useSession()
  const isOwner = session?.admin?.role === 'OWNER'
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
          <h1 className="text-xl font-bold text-[#283c50]">Welcome, {session?.admin?.firstName}</h1>
          <p className="text-sm text-[#6b7885] mt-0.5">{biz?.name ?? 'Your Business'}</p>
        </div>
        {isOwner && (
          <button onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg text-[#283c50] hover:bg-[#f9fafb]">
            <Edit2 className="w-4 h-4" /> Edit Profile
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Wallet Balance" value={walletLoading ? '—' : formatNaira(wallet?.balanceKobo ?? 0)} icon={Wallet} iconColor="#3454d1" iconBg="#eef0fb" />
        <StatCard label="Total Riders" value={ridersLoading ? '—' : ridersData?.meta?.total ?? 0} icon={Bike} iconColor="#17c666" iconBg="#e8faf0" />
        <StatCard label="Active Riders" value={ridersLoading ? '—' : biz?._count?.riders ?? activeRiders} icon={TrendingUp} iconColor="#f59e0b" iconBg="#fef9ec" />
        <StatCard label="Team Members" value={team?.length ?? '—'} icon={Users} iconColor="#3dc7be" iconBg="#e8faf9" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Profile */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#283c50] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#9ca3af]" /> Business Profile
            </h2>
            {isOwner && (
              <button onClick={() => setShowEdit(true)} className="text-xs text-[#3454d1] hover:underline">Edit</button>
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
              <div className="flex justify-between py-2 border-b border-[#f3f4f6] text-sm">
                <span className="text-[#6b7885]">Service Areas</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[55%]">
                  {biz.serviceAreas.map((a) => (
                    <span key={a} className="text-xs bg-[#eef0fb] text-[#3454d1] px-2 py-0.5 rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="px-5 pb-3 border-t border-[#f3f4f6] pt-3">
            <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">Owner</p>
            <InfoRow label="Full Name" value={biz?.ownerFullName} />
            <InfoRow label="Phone" value={biz?.ownerPhoneNumber} />
            <InfoRow label="Email" value={biz?.ownerEmail} />
          </div>
          <div className="px-5 pb-3 border-t border-[#f3f4f6] pt-3">
            <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">Banking</p>
            <InfoRow label="Bank" value={biz?.bankName} />
            <InfoRow label="Account Name" value={biz?.accountName} />
            <InfoRow label="Account Number" value={biz?.accountNumber} />
          </div>
        </div>

        <div className="space-y-6">
          {/* Documents */}
          {isOwner && (
            <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#283c50]">Compliance Documents</h2>
                <span className="text-xs text-[#6b7885]">{docsUploaded}/{DOC_FIELDS.length} uploaded</span>
              </div>
              <div className="px-5 py-2">
                {DOC_FIELDS.map(({ field, label }) => (
                  <DocumentRow key={field} field={field} label={label} url={biz?.[field as keyof typeof biz] as string | null ?? null} />
                ))}
              </div>
            </div>
          )}

          {/* Riders Preview */}
          <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#283c50]">Recent Riders</h2>
              <a href="/business/riders" className="text-xs text-[#3454d1] hover:underline">View all</a>
            </div>
            {ridersLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#3454d1]" /></div>
            ) : riders.length === 0 ? (
              <p className="text-center text-sm text-[#6b7885] py-8">No riders assigned yet.</p>
            ) : (
              <div className="divide-y divide-[#f3f4f6]">
                {riders.map((r) => (
                  <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#283c50]">{r.firstName} {r.lastName}</p>
                      <p className="text-xs text-[#6b7885]">{r.phone} · {r.vehicleType ?? 'No vehicle'}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.isActive ? 'bg-[#e8faf0] text-[#17c666]' : 'bg-[#fef2f2] text-[#ea4d4d]'}`}>
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
