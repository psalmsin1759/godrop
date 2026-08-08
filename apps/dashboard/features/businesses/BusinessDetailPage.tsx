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
import { formatAmount, formatDate, formatDateTime } from '@/lib/utils'
import type { Business, BusinessStatus } from '@/types/api'

// ─── Helpers ──────────────────────────────────────────────────

const STATUS_CFG: Record<BusinessStatus, { bg: string; text: string; label: string }> = {
  ACTIVE:      { bg: '#DFF5EC', text: '#1DB980', label: 'Active' },
  SUSPENDED:   { bg: '#FBEDD7', text: '#E8930C', label: 'Suspended' },
  DEACTIVATED: { bg: '#FFE3E1', text: '#FF3B30', label: 'Deactivated' },
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
    <div className="flex justify-between items-start py-2.5 border-b border-[#EDF0F6] last:border-0">
      <span className="text-xs text-[#9AA1B4] shrink-0 w-40">{label}</span>
      <span className="text-xs text-[#0D1426] font-medium text-right">{value || '—'}</span>
    </div>
  )
}

function DocLink({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#EDF0F6] last:border-0">
      <div className="flex items-center gap-2">
        {url
          ? <CheckCircle className="w-3.5 h-3.5 text-[#1DB980]" />
          : <div className="w-3.5 h-3.5 rounded-full border-2 border-[#DDE2EC]" />}
        <span className="text-xs text-[#0D1426]">{label}</span>
      </div>
      {url && (
        <a href={url} target="_blank" rel="noreferrer"
          className="flex items-center gap-1 text-[11px] text-[#1E5FFF] hover:underline">
          View <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  )
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#E7EAF1] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#EDF0F6] flex items-center gap-2">
        <span className="text-[#1E5FFF]">{icon}</span>
        <h3 className="text-sm font-semibold text-[#0D1426]">{title}</h3>
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
          <h2 className="text-base font-bold text-[#0D1426]">Create Business Owner</h2>
          <button onClick={onClose} className="text-[#9AA1B4] hover:text-[#0D1426] text-lg leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {(['firstName', 'lastName'] as const).map((f) => (
              <div key={f}>
                <label className="block text-xs font-medium text-[#0D1426] mb-1.5">{f === 'firstName' ? 'First Name' : 'Last Name'} *</label>
                <input required value={form[f]} onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))}
                  className="w-full border border-[#E7EAF1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5FFF]/20 focus:border-[#1E5FFF]" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0D1426] mb-1.5">Email *</label>
            <input required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full border border-[#E7EAF1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5FFF]/20 focus:border-[#1E5FFF]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0D1426] mb-1.5">Password *</label>
            <input required type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className="w-full border border-[#E7EAF1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5FFF]/20 focus:border-[#1E5FFF]" />
          </div>
          {error && <p className="text-xs text-[#FF3B30]">{(error as any)?.data?.error ?? 'Failed to create owner'}</p>}
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#525A72] hover:bg-[#EDF0F6] rounded-lg">Cancel</button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 text-sm text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50"
              style={{ backgroundColor: '#1E5FFF' }}>
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
      <div className="bg-white rounded-xl border border-[#E7EAF1] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E7EEFF' }}>
            <Building2 className="w-5 h-5 text-[#1E5FFF]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#0D1426]">{biz.name}</p>
            <p className="text-xs text-[#9AA1B4] mt-0.5">ID: {biz.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={biz.status} />
          <button onClick={() => setShowStatus(true)}
            className="text-xs border border-[#E7EAF1] px-3 py-1.5 rounded-lg text-[#525A72] hover:bg-[#F7F9FC]">
            Change Status
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Wallet Balance', value: formatAmount(biz.wallet?.balance ?? 0), color: '#1DB980' },
          { label: 'Riders', value: String(biz._count?.riders ?? 0), color: '#1E5FFF' },
          { label: 'Team Members', value: String(biz._count?.admins ?? 0), color: '#E8930C' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-[#E7EAF1] px-5 py-4">
            <p className="text-xs text-[#9AA1B4]">{label}</p>
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
            <h3 className="text-sm font-bold text-[#0D1426]">Change Status</h3>
            {statuses.map((s) => {
              const cfg = STATUS_CFG[s]
              return (
                <button key={s} onClick={() => changeStatus(s)} disabled={updating || s === biz.status}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left disabled:opacity-50"
                  style={s === biz.status ? { borderColor: '#1E5FFF', background: '#E7EEFF' } : { borderColor: '#E7EAF1' }}>
                  <span className="text-xs font-semibold" style={{ color: cfg.text }}>{cfg.label}</span>
                  {s === biz.status && <span className="text-[10px] text-[#9AA1B4]">current</span>}
                </button>
              )
            })}
            <button onClick={() => setShowStatus(false)} className="w-full text-xs text-[#525A72] py-2 hover:bg-[#EDF0F6] rounded-lg">
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

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[#1E5FFF]" /></div>

  if (riders.length === 0) return (
    <div className="text-center py-12">
      <Bike className="w-8 h-8 text-[#DDE2EC] mx-auto mb-2" />
      <p className="text-sm text-[#9AA1B4]">No riders assigned to this business.</p>
    </div>
  )

  return (
    <div className="space-y-3">
      <table className="w-full text-sm bg-white rounded-xl border border-[#E7EAF1] overflow-hidden">
        <thead>
          <tr className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] border-b border-[#EDF0F6]">
            <th className="px-5 py-3 text-left">Rider</th>
            <th className="px-5 py-3 text-left">Phone</th>
            <th className="px-5 py-3 text-left">Status</th>
            <th className="px-5 py-3 text-right">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EDF0F6]">
          {riders.map((r) => (
            <tr key={r.id} className="hover:bg-[#F7F9FC]">
              <td className="px-5 py-3">
                <p className="font-medium text-[#0D1426]">{r.firstName} {r.lastName}</p>
                <p className="text-xs text-[#9AA1B4]">{r.email ?? '—'}</p>
              </td>
              <td className="px-5 py-3 text-[#525A72] text-sm">{r.phone ?? '—'}</td>
              <td className="px-5 py-3">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.isActive ? 'bg-[#DFF5EC] text-[#1DB980]' : 'bg-[#EDF0F6] text-[#9AA1B4]'}`}>
                  {r.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-5 py-3 text-right text-xs text-[#9AA1B4]">{formatDate(r.createdAt)}</td>
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

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[#1E5FFF]" /></div>

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-[#E7EAF1] px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#DFF5EC' }}>
          <Wallet className="w-4.5 h-4.5 text-[#1DB980]" />
        </div>
        <div>
          <p className="text-xs text-[#9AA1B4]">Wallet Balance</p>
          <p className="text-lg font-bold text-[#0D1426]">{formatAmount(walletBalance)}</p>
        </div>
      </div>

      {txs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-[#E7EAF1]">
          <Wallet className="w-8 h-8 text-[#DDE2EC] mx-auto mb-2" />
          <p className="text-sm text-[#9AA1B4]">No transactions yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E7EAF1] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] border-b border-[#EDF0F6]">
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">Description</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF0F6]">
              {txs.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#F7F9FC]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {tx.type === 'RIDER_EARNING'
                        ? <ArrowDownCircle className="w-4 h-4 text-[#FF3B30]" />
                        : <ArrowUpCircle className="w-4 h-4 text-[#1DB980]" />}
                      <span className="text-xs font-medium text-[#0D1426]">
                        {tx.type === 'RIDER_EARNING' ? 'Rider Earning' : 'Withdrawal'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-[#525A72]">{tx.description ?? tx.reference ?? '—'}</td>
                  <td className={`px-5 py-3 text-right text-sm font-semibold ${tx.type === 'RIDER_EARNING' ? 'text-[#FF3B30]' : 'text-[#1DB980]'}`}>
                    {tx.type === 'RIDER_EARNING' ? '-' : '+'}{formatAmount(tx.amount)}
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-[#9AA1B4]">{formatDateTime(tx.createdAt)}</td>
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

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[#1E5FFF]" /></div>

  const FULL_ACCESS_CFG = { bg: '#E7EEFF', text: '#1E5FFF' }
  const DEFAULT_ROLE_CFG = { bg: '#EDF0F6', text: '#9AA1B4' }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => setShowAddOwner(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-white rounded-lg"
          style={{ backgroundColor: '#1E5FFF' }}>
          <Plus className="w-4 h-4" /> Add Owner
        </button>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-[#E7EAF1]">
          <Users className="w-8 h-8 text-[#DDE2EC] mx-auto mb-2" />
          <p className="text-sm text-[#9AA1B4]">No team members yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E7EAF1] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA1B4] border-b border-[#EDF0F6]">
                <th className="px-5 py-3 text-left">Member</th>
                <th className="px-5 py-3 text-left">Role</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF0F6]">
              {members.map((m) => {
                const roleCfg = m.role.permissions.includes('*') ? FULL_ACCESS_CFG : DEFAULT_ROLE_CFG
                return (
                  <tr key={m.id} className="hover:bg-[#F7F9FC]">
                    <td className="px-5 py-3">
                      <p className="font-medium text-[#0D1426]">{m.firstName} {m.lastName}</p>
                      <p className="text-xs text-[#9AA1B4]">{m.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: roleCfg.bg, color: roleCfg.text }}>
                        {m.role.name}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.isActive ? 'bg-[#DFF5EC] text-[#1DB980]' : 'bg-[#EDF0F6] text-[#9AA1B4]'}`}>
                        {m.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-[#9AA1B4]">{formatDate(m.createdAt)}</td>
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
      <p className="text-xs text-[#9AA1B4]">{meta.total} total</p>
      <div className="flex items-center gap-2">
        <button disabled={page <= 1} onClick={() => onPage(page - 1)}
          className="p-1.5 rounded-lg border border-[#E7EAF1] disabled:opacity-40 hover:bg-[#EDF0F6]">
          <ChevronLeft className="w-3.5 h-3.5 text-[#0D1426]" />
        </button>
        <span className="text-xs text-[#525A72]">{page} / {meta.totalPages}</span>
        <button disabled={page >= meta.totalPages} onClick={() => onPage(page + 1)}
          className="p-1.5 rounded-lg border border-[#E7EAF1] disabled:opacity-40 hover:bg-[#EDF0F6]">
          <ChevronRight className="w-3.5 h-3.5 text-[#0D1426]" />
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
      <Loader2 className="w-6 h-6 animate-spin text-[#1E5FFF]" />
    </div>
  )

  if (!biz) return (
    <div className="text-center py-16">
      <Building2 className="w-10 h-10 text-[#DDE2EC] mx-auto mb-3" />
      <p className="text-sm text-[#525A72]">Business not found.</p>
      <Link href="/businesses" className="mt-2 text-sm text-[#1E5FFF] hover:underline inline-block">Back to businesses</Link>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/businesses" className="p-2 rounded-lg border border-[#E7EAF1] hover:bg-[#EDF0F6] text-[#525A72]">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#0D1426]">{biz.name}</h1>
          <p className="text-xs text-[#9AA1B4] mt-0.5">Business details</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-[#E7EAF1]">
        {TABS.map(({ id, label, icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === id
                ? 'border-[#1E5FFF] text-[#1E5FFF]'
                : 'border-transparent text-[#9AA1B4] hover:text-[#0D1426]'
            }`}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview'     && <OverviewTab biz={biz} />}
      {tab === 'riders'       && <RidersTab businessId={businessId} />}
      {tab === 'transactions' && <TransactionsTab businessId={businessId} walletBalance={biz.wallet?.balance ?? 0} />}
      {tab === 'team'         && <TeamTab businessId={businessId} />}
    </div>
  )
}
