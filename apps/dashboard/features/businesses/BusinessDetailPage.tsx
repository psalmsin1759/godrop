'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Loader2, Building2, Users, Bike, Wallet,
  ChevronLeft, ChevronRight, CheckCircle, ExternalLink,
  Phone, Mail, MapPin, CreditCard, FileText, User,
  ArrowDownCircle, ArrowUpCircle, Plus,
} from 'lucide-react'
import {
  useGetBusinessQuery,
  useGetBusinessRidersAsAdminQuery,
  useGetBusinessWalletTransactionsAsAdminQuery,
  useGetBusinessTeamAsAdminQuery,
  useCreateBusinessOwnerMutation,
  useUpdateBusinessMutation,
} from '@/store/services/businessApi'
import { formatNaira, formatDate, formatDateTime } from '@/lib/utils'
import type { Business, BusinessStatus } from '@/types/api'

// ─── Helpers ──────────────────────────────────────────────────

const STATUS_CFG: Record<BusinessStatus, { bg: string; text: string; label: string }> = {
  ACTIVE:      { bg: '#e8faf0', text: '#17c666', label: 'Active' },
  SUSPENDED:   { bg: '#fef9ec', text: '#f59e0b', label: 'Suspended' },
  DEACTIVATED: { bg: '#fef2f2', text: '#ea4d4d', label: 'Deactivated' },
}

function StatusBadge({ status }: { status: BusinessStatus }) {
  const cfg = STATUS_CFG[status]
  return (
    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: cfg.bg, color: cfg.text }}>
      {cfg.label}
    </span>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-[#f3f4f6] last:border-0">
      <span className="text-xs text-[#9ca3af] shrink-0 w-40">{label}</span>
      <span className="text-xs text-[#283c50] font-medium text-right">{value || '—'}</span>
    </div>
  )
}

function DocLink({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#f3f4f6] last:border-0">
      <div className="flex items-center gap-2">
        {url
          ? <CheckCircle className="w-3.5 h-3.5 text-[#17c666]" />
          : <div className="w-3.5 h-3.5 rounded-full border-2 border-[#d1d5db]" />}
        <span className="text-xs text-[#283c50]">{label}</span>
      </div>
      {url && (
        <a href={url} target="_blank" rel="noreferrer"
          className="flex items-center gap-1 text-[11px] text-[#3454d1] hover:underline">
          View <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  )
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#f3f4f6] flex items-center gap-2">
        <span className="text-[#3454d1]">{icon}</span>
        <h3 className="text-sm font-semibold text-[#283c50]">{title}</h3>
      </div>
      <div className="px-5 py-3">{children}</div>
    </div>
  )
}

// ─── Add Owner Modal ───────────────────────────────────────────

function AddOwnerModal({ businessId, onClose }: { businessId: string; onClose: () => void }) {
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', password: '' })
  const [addOwner, { isLoading, error }] = useCreateBusinessOwnerMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await addOwner({ id: businessId, body: form }).unwrap()
      onClose()
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[#283c50]">Create Business Owner</h2>
          <button onClick={onClose} className="text-[#9ca3af] hover:text-[#283c50] text-lg leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {(['firstName', 'lastName'] as const).map((f) => (
              <div key={f}>
                <label className="block text-xs font-medium text-[#283c50] mb-1.5">{f === 'firstName' ? 'First Name' : 'Last Name'} *</label>
                <input required value={form[f]} onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))}
                  className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#283c50] mb-1.5">Email *</label>
            <input required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#283c50] mb-1.5">Password *</label>
            <input required type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3454d1]/20 focus:border-[#3454d1]" />
          </div>
          {error && <p className="text-xs text-[#ea4d4d]">{(error as any)?.data?.error ?? 'Failed to create owner'}</p>}
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#6b7885] hover:bg-[#f3f4f6] rounded-lg">Cancel</button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 text-sm text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50"
              style={{ backgroundColor: '#3454d1' }}>
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create Owner
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Tabs ──────────────────────────────────────────────────────

type Tab = 'overview' | 'riders' | 'transactions' | 'team'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',     label: 'Overview',     icon: <Building2 className="w-3.5 h-3.5" /> },
  { id: 'riders',       label: 'Riders',       icon: <Bike className="w-3.5 h-3.5" /> },
  { id: 'transactions', label: 'Transactions', icon: <Wallet className="w-3.5 h-3.5" /> },
  { id: 'team',         label: 'Team',         icon: <Users className="w-3.5 h-3.5" /> },
]

// ─── Tab: Overview ─────────────────────────────────────────────

function OverviewTab({ biz }: { biz: Business }) {
  const [showStatus, setShowStatus] = useState(false)
  const [updateBusiness, { isLoading: updating }] = useUpdateBusinessMutation()

  async function changeStatus(status: BusinessStatus) {
    await updateBusiness({ id: biz.id, body: { status } }).unwrap()
    setShowStatus(false)
  }

  const statuses: BusinessStatus[] = ['ACTIVE', 'SUSPENDED', 'DEACTIVATED']

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#eef1fb' }}>
            <Building2 className="w-5 h-5 text-[#3454d1]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#283c50]">{biz.name}</p>
            <p className="text-xs text-[#9ca3af] mt-0.5">ID: {biz.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={biz.status} />
          <button onClick={() => setShowStatus(true)}
            className="text-xs border border-[#e5e7eb] px-3 py-1.5 rounded-lg text-[#6b7885] hover:bg-[#f9fafb]">
            Change Status
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Wallet Balance', value: formatNaira(biz.wallet?.balanceKobo ?? 0), color: '#17c666' },
          { label: 'Riders', value: String(biz._count?.riders ?? 0), color: '#3454d1' },
          { label: 'Team Members', value: String(biz._count?.admins ?? 0), color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-[#e5e7eb] px-5 py-4">
            <p className="text-xs text-[#9ca3af]">{label}</p>
            <p className="text-xl font-bold mt-1" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Contact */}
        <SectionCard title="Contact" icon={<Phone className="w-4 h-4" />}>
          <InfoRow label="Email" value={biz.email} />
          <InfoRow label="Phone" value={biz.phone} />
          <InfoRow label="Address" value={biz.address} />
          <InfoRow label="Service Areas" value={biz.serviceAreas?.join(', ')} />
        </SectionCard>

        {/* Registration */}
        <SectionCard title="Registration" icon={<FileText className="w-4 h-4" />}>
          <InfoRow label="CAC Number" value={biz.cacRegistrationNumber} />
          <InfoRow label="TIN" value={biz.tin} />
          <InfoRow label="Year Established" value={biz.yearEstablished} />
          <InfoRow label="Joined" value={formatDate(biz.createdAt)} />
        </SectionCard>

        {/* Owner */}
        <SectionCard title="Owner Details" icon={<User className="w-4 h-4" />}>
          <InfoRow label="Full Name" value={biz.ownerFullName} />
          <InfoRow label="Phone" value={biz.ownerPhoneNumber} />
          <InfoRow label="Email" value={biz.ownerEmail} />
          <InfoRow label="NIN" value={biz.ownerNIN} />
          <InfoRow label="BVN" value={biz.ownerBVN ? '••••••••••' : null} />
        </SectionCard>

        {/* Banking */}
        <SectionCard title="Banking" icon={<CreditCard className="w-4 h-4" />}>
          <InfoRow label="Bank" value={biz.bankName} />
          <InfoRow label="Account Name" value={biz.accountName} />
          <InfoRow label="Account Number" value={biz.accountNumber} />
        </SectionCard>
      </div>

      {/* Documents */}
      <SectionCard title="Compliance Documents" icon={<FileText className="w-4 h-4" />}>
        <DocLink label="CAC Certificate"    url={biz.cacCertificateUrl} />
        <DocLink label="Driver's Licence"   url={biz.driversLicenseUrl} />
        <DocLink label="Insurance Document" url={biz.insuranceDocumentUrl} />
        <DocLink label="Utility Bill"       url={biz.utilityBillUrl} />
      </SectionCard>

      {/* Status dialog */}
      {showStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl w-72 p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#283c50]">Change Status</h3>
            {statuses.map((s) => {
              const cfg = STATUS_CFG[s]
              return (
                <button key={s} onClick={() => changeStatus(s)} disabled={updating || s === biz.status}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left disabled:opacity-50"
                  style={s === biz.status ? { borderColor: '#3454d1', background: '#eef1fb' } : { borderColor: '#e5e7eb' }}>
                  <span className="text-xs font-semibold" style={{ color: cfg.text }}>{cfg.label}</span>
                  {s === biz.status && <span className="text-[10px] text-[#9ca3af]">current</span>}
                </button>
              )
            })}
            <button onClick={() => setShowStatus(false)} className="w-full text-xs text-[#6b7885] py-2 hover:bg-[#f3f4f6] rounded-lg">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab: Riders ───────────────────────────────────────────────

function RidersTab({ businessId }: { businessId: string }) {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useGetBusinessRidersAsAdminQuery({ id: businessId, page, limit: 20 })
  const riders = data?.data ?? []
  const meta = data?.meta

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[#3454d1]" /></div>

  if (riders.length === 0) return (
    <div className="text-center py-12">
      <Bike className="w-8 h-8 text-[#d1d5db] mx-auto mb-2" />
      <p className="text-sm text-[#9ca3af]">No riders assigned to this business.</p>
    </div>
  )

  return (
    <div className="space-y-3">
      <table className="w-full text-sm bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
        <thead>
          <tr className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] border-b border-[#f3f4f6]">
            <th className="px-5 py-3 text-left">Rider</th>
            <th className="px-5 py-3 text-left">Phone</th>
            <th className="px-5 py-3 text-left">Status</th>
            <th className="px-5 py-3 text-right">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f3f4f6]">
          {riders.map((r) => (
            <tr key={r.id} className="hover:bg-[#f9fafb]">
              <td className="px-5 py-3">
                <p className="font-medium text-[#283c50]">{r.firstName} {r.lastName}</p>
                <p className="text-xs text-[#9ca3af]">{r.email ?? '—'}</p>
              </td>
              <td className="px-5 py-3 text-[#6b7885] text-sm">{r.phone ?? '—'}</td>
              <td className="px-5 py-3">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.isActive ? 'bg-[#e8faf0] text-[#17c666]' : 'bg-[#f3f4f6] text-[#9ca3af]'}`}>
                  {r.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-5 py-3 text-right text-xs text-[#9ca3af]">{formatDate(r.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {meta && meta.totalPages > 1 && <Pagination page={page} meta={meta} onPage={setPage} />}
    </div>
  )
}

// ─── Tab: Transactions ────────────────────────────────────────

function TransactionsTab({ businessId, walletBalance }: { businessId: string; walletBalance: number }) {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useGetBusinessWalletTransactionsAsAdminQuery({ id: businessId, page, limit: 20 })
  const txs = data?.data ?? []
  const meta = data?.meta

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[#3454d1]" /></div>

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-[#e5e7eb] px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#e8faf0' }}>
          <Wallet className="w-4.5 h-4.5 text-[#17c666]" />
        </div>
        <div>
          <p className="text-xs text-[#9ca3af]">Wallet Balance</p>
          <p className="text-lg font-bold text-[#283c50]">{formatNaira(walletBalance)}</p>
        </div>
      </div>

      {txs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-[#e5e7eb]">
          <Wallet className="w-8 h-8 text-[#d1d5db] mx-auto mb-2" />
          <p className="text-sm text-[#9ca3af]">No transactions yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] border-b border-[#f3f4f6]">
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">Description</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {txs.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#f9fafb]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {tx.type === 'RIDER_EARNING'
                        ? <ArrowDownCircle className="w-4 h-4 text-[#ea4d4d]" />
                        : <ArrowUpCircle className="w-4 h-4 text-[#17c666]" />}
                      <span className="text-xs font-medium text-[#283c50]">
                        {tx.type === 'RIDER_EARNING' ? 'Rider Earning' : 'Withdrawal'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-[#6b7885]">{tx.description ?? tx.reference ?? '—'}</td>
                  <td className={`px-5 py-3 text-right text-sm font-semibold ${tx.type === 'RIDER_EARNING' ? 'text-[#ea4d4d]' : 'text-[#17c666]'}`}>
                    {tx.type === 'RIDER_EARNING' ? '-' : '+'}{formatNaira(tx.amountKobo)}
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-[#9ca3af]">{formatDateTime(tx.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {meta && meta.totalPages > 1 && <Pagination page={page} meta={meta} onPage={setPage} />}
    </div>
  )
}

// ─── Tab: Team ────────────────────────────────────────────────

function TeamTab({ businessId }: { businessId: string }) {
  const [showAddOwner, setShowAddOwner] = useState(false)
  const { data: members = [], isLoading } = useGetBusinessTeamAsAdminQuery(businessId)

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[#3454d1]" /></div>

  const ROLE_CFG: Record<string, { bg: string; text: string }> = {
    OWNER:   { bg: '#eef1fb', text: '#3454d1' },
    MANAGER: { bg: '#fef9ec', text: '#f59e0b' },
    STAFF:   { bg: '#f3f4f6', text: '#6b7280' },
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => setShowAddOwner(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-white rounded-lg"
          style={{ backgroundColor: '#3454d1' }}>
          <Plus className="w-4 h-4" /> Add Owner
        </button>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-[#e5e7eb]">
          <Users className="w-8 h-8 text-[#d1d5db] mx-auto mb-2" />
          <p className="text-sm text-[#9ca3af]">No team members yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] border-b border-[#f3f4f6]">
                <th className="px-5 py-3 text-left">Member</th>
                <th className="px-5 py-3 text-left">Role</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {members.map((m) => {
                const roleCfg = ROLE_CFG[m.role] ?? ROLE_CFG.STAFF
                return (
                  <tr key={m.id} className="hover:bg-[#f9fafb]">
                    <td className="px-5 py-3">
                      <p className="font-medium text-[#283c50]">{m.firstName} {m.lastName}</p>
                      <p className="text-xs text-[#9ca3af]">{m.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: roleCfg.bg, color: roleCfg.text }}>
                        {m.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.isActive ? 'bg-[#e8faf0] text-[#17c666]' : 'bg-[#f3f4f6] text-[#9ca3af]'}`}>
                        {m.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-[#9ca3af]">{formatDate(m.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAddOwner && <AddOwnerModal businessId={businessId} onClose={() => setShowAddOwner(false)} />}
    </div>
  )
}

// ─── Pagination helper ────────────────────────────────────────

function Pagination({ page, meta, onPage }: { page: number; meta: { totalPages: number; total: number }; onPage: (p: number) => void }) {
  return (
    <div className="flex items-center justify-between px-1">
      <p className="text-xs text-[#9ca3af]">{meta.total} total</p>
      <div className="flex items-center gap-2">
        <button disabled={page <= 1} onClick={() => onPage(page - 1)}
          className="p-1.5 rounded-lg border border-[#e5e7eb] disabled:opacity-40 hover:bg-[#f3f4f6]">
          <ChevronLeft className="w-3.5 h-3.5 text-[#283c50]" />
        </button>
        <span className="text-xs text-[#6b7885]">{page} / {meta.totalPages}</span>
        <button disabled={page >= meta.totalPages} onClick={() => onPage(page + 1)}
          className="p-1.5 rounded-lg border border-[#e5e7eb] disabled:opacity-40 hover:bg-[#f3f4f6]">
          <ChevronRight className="w-3.5 h-3.5 text-[#283c50]" />
        </button>
      </div>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────

export default function BusinessDetailPage({ businessId }: { businessId: string }) {
  const [tab, setTab] = useState<Tab>('overview')
  const { data: biz, isLoading } = useGetBusinessQuery(businessId)

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-6 h-6 animate-spin text-[#3454d1]" />
    </div>
  )

  if (!biz) return (
    <div className="text-center py-16">
      <Building2 className="w-10 h-10 text-[#d1d5db] mx-auto mb-3" />
      <p className="text-sm text-[#6b7885]">Business not found.</p>
      <Link href="/businesses" className="mt-2 text-sm text-[#3454d1] hover:underline inline-block">Back to businesses</Link>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/businesses" className="p-2 rounded-lg border border-[#e5e7eb] hover:bg-[#f3f4f6] text-[#6b7885]">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#283c50]">{biz.name}</h1>
          <p className="text-xs text-[#9ca3af] mt-0.5">Business details</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-[#e5e7eb]">
        {TABS.map(({ id, label, icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === id
                ? 'border-[#3454d1] text-[#3454d1]'
                : 'border-transparent text-[#9ca3af] hover:text-[#283c50]'
            }`}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview'     && <OverviewTab biz={biz} />}
      {tab === 'riders'       && <RidersTab businessId={businessId} />}
      {tab === 'transactions' && <TransactionsTab businessId={businessId} walletBalance={biz.wallet?.balanceKobo ?? 0} />}
      {tab === 'team'         && <TeamTab businessId={businessId} />}
    </div>
  )
}
