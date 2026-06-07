'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useGetVendorsQuery,
  useApproveVendorMutation,
  useRejectVendorMutation,
  useSuspendVendorMutation,
  useReinstateVendorMutation,
} from './store/vendorsApi'
import type { Vendor, VendorStatus, VendorType } from '@/types/api'
import {
  Search,
  Plus,
  Download,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  PauseCircle,
  RefreshCw,
  Loader2,
  Store,
} from 'lucide-react'

function exportVendorsCSV(vendors: Vendor[]) {
  const headers = ['Name', 'Email', 'Phone', 'Type', 'Status', 'Address', 'Rating', 'Joined']
  const rows = vendors.map((v) => [
    v.name,
    v.email,
    v.phone,
    v.type,
    v.status,
    v.address,
    v.rating != null ? v.rating.toFixed(1) : '',
    new Date(v.createdAt).toLocaleDateString('en-NG'),
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `vendors-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const statusConfig: Record<VendorStatus, { bg: string; text: string; label: string }> = {
  APPROVED: { bg: '#DFF5EC', text: '#1DB980', label: 'Approved' },
  PENDING: { bg: '#FBEDD7', text: '#E8930C', label: 'Pending' },
  REJECTED: { bg: '#FFE3E1', text: '#FF3B30', label: 'Rejected' },
  SUSPENDED: { bg: '#EDF0F6', text: '#525A72', label: 'Suspended' },
}

const typeConfig: Record<VendorType, { label: string; color: string }> = {
  RESTAURANT: { label: 'Restaurant', color: '#1E5FFF' },
  GROCERY: { label: 'Grocery', color: '#1DB980' },
  RETAIL: { label: 'Retail', color: '#E8930C' },
  PHARMACY: { label: 'Pharmacy', color: '#FF6A2C' },
}

function VendorActionMenu({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  const [approve] = useApproveVendorMutation()
  const [reject] = useRejectVendorMutation()
  const [suspend] = useSuspendVendorMutation()
  const [reinstate] = useReinstateVendorMutation()
  const [reason, setReason] = useState('')
  const [step, setStep] = useState<'menu' | 'approve' | 'reject' | 'suspend'>('menu')
  const [loading, setLoading] = useState(false)

  async function run(fn: () => Promise<unknown>) {
    setLoading(true)
    try {
      await fn()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (step === 'approve') {
    return (
      <div className="absolute right-0 top-8 z-50 w-64 bg-white rounded-lg border border-[#E7EAF1] shadow-card-md p-3 space-y-2">
        <p className="text-xs font-semibold text-[#0D1426]">Approve vendor</p>
        <p className="text-[11px] text-[#525A72] leading-snug">
          Approve <span className="font-semibold text-[#0D1426]">{vendor.name}</span>? Their store goes live immediately and the owner is notified by email.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setStep('menu')}
            className="flex-1 text-xs py-1.5 rounded border border-[#E7EAF1] text-[#525A72] hover:bg-[#F7F9FC]"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={() => run(() => approve(vendor.id).unwrap())}
            className="flex-1 text-xs py-1.5 rounded text-white font-medium disabled:opacity-50"
            style={{ backgroundColor: '#1DB980' }}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Confirm'}
          </button>
        </div>
      </div>
    )
  }

  if (step === 'reject' || step === 'suspend') {
    const isReject = step === 'reject'
    return (
      <div className="absolute right-0 top-8 z-50 w-64 bg-white rounded-lg border border-[#E7EAF1] shadow-card-md p-3 space-y-2">
        <p className="text-xs font-semibold text-[#0D1426]">
          {isReject ? 'Reject vendor' : 'Suspend vendor'}
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={isReject ? 'Reason (required)…' : 'Reason (optional)…'}
          className="w-full text-xs border border-[#E7EAF1] rounded p-2 resize-none h-20 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setStep('menu')}
            className="flex-1 text-xs py-1.5 rounded border border-[#E7EAF1] text-[#525A72] hover:bg-[#F7F9FC]"
          >
            Cancel
          </button>
          <button
            disabled={loading || (isReject && !reason.trim())}
            onClick={() =>
              run(() =>
                isReject
                  ? reject({ id: vendor.id, reason }).unwrap()
                  : suspend({ id: vendor.id, reason: reason || undefined }).unwrap()
              )
            }
            className="flex-1 text-xs py-1.5 rounded text-white font-medium disabled:opacity-50"
            style={{ backgroundColor: isReject ? '#FF3B30' : '#E8930C' }}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Confirm'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute right-0 top-8 z-50 w-44 bg-white rounded-lg border border-[#E7EAF1] shadow-card-md py-1">
      {vendor.status === 'PENDING' && (
        <>
          <button
            onClick={() => setStep('approve')}
            disabled={loading}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#1DB980] hover:bg-[#F7F9FC]"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Approve
          </button>
          <button
            onClick={() => setStep('reject')}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#FF3B30] hover:bg-[#F7F9FC]"
          >
            <XCircle className="w-3.5 h-3.5" /> Reject
          </button>
        </>
      )}
      {vendor.status === 'APPROVED' && (
        <button
          onClick={() => setStep('suspend')}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#E8930C] hover:bg-[#F7F9FC]"
        >
          <PauseCircle className="w-3.5 h-3.5" /> Suspend
        </button>
      )}
      {(vendor.status === 'SUSPENDED' || vendor.status === 'REJECTED') && (
        <button
          onClick={() => run(() => reinstate(vendor.id).unwrap())}
          disabled={loading}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#1E5FFF] hover:bg-[#F7F9FC]"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reinstate
        </button>
      )}
      <button
        onClick={onClose}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#525A72] hover:bg-[#F7F9FC] border-t border-[#EDF0F6] mt-1"
      >
        Close
      </button>
    </div>
  )
}

export default function VendorsPage() {
  const router = useRouter()
  const { data: vendors = [], isLoading, isError } = useGetVendorsQuery()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<VendorStatus | 'ALL'>('ALL')
  const [typeFilter, setTypeFilter] = useState<VendorType | 'ALL'>('ALL')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const filtered = vendors.filter((v) => {
    if (statusFilter !== 'ALL' && v.status !== statusFilter) return false
    if (typeFilter !== 'ALL' && v.type !== typeFilter) return false
    if (
      search &&
      !v.name.toLowerCase().includes(search.toLowerCase()) &&
      !v.email.toLowerCase().includes(search.toLowerCase()) &&
      !v.address.toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  const counts = {
    ALL: vendors.length,
    APPROVED: vendors.filter((v) => v.status === 'APPROVED').length,
    PENDING: vendors.filter((v) => v.status === 'PENDING').length,
    SUSPENDED: vendors.filter((v) => v.status === 'SUSPENDED').length,
    REJECTED: vendors.filter((v) => v.status === 'REJECTED').length,
  }

  return (
    <div className="space-y-5" onClick={() => setOpenMenu(null)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#0D1426]">Vendors</h1>
          <p className="text-xs text-[#9AA1B4] mt-0.5">Manage vendor onboarding, approval and status</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportVendorsCSV(filtered)}
            className="flex items-center gap-1.5 text-xs text-[#525A72] bg-white border border-[#E7EAF1] rounded px-3 py-1.5 hover:bg-[#F7F9FC]"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
         
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Vendors', value: counts.ALL, color: '#1E5FFF', bg: '#E7EEFF' },
          { label: 'Approved', value: counts.APPROVED, color: '#1DB980', bg: '#DFF5EC' },
          { label: 'Pending Review', value: counts.PENDING, color: '#E8930C', bg: '#FBEDD7' },
          { label: 'Suspended', value: counts.SUSPENDED, color: '#FF3B30', bg: '#FFE3E1' },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              <Store style={{ color: s.color, width: 18, height: 18 }} />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0D1426] leading-none">{s.value}</p>
              <p className="text-[11px] text-[#525A72] mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#EDF0F6] rounded">
            {(['ALL', 'PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="text-xs font-medium px-3 py-1.5 rounded transition-all"
                style={
                  statusFilter === s
                    ? { backgroundColor: '#fff', color: '#1E5FFF', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }
                    : { color: '#525A72' }
                }
              >
                {s === 'ALL' ? 'All' : statusConfig[s].label}
                {s !== 'ALL' && counts[s] > 0 && (
                  <span className="ml-1 opacity-60">({counts[s]})</span>
                )}
              </button>
            ))}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as VendorType | 'ALL')}
            className="text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] text-[#525A72] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]"
          >
            <option value="ALL">All types</option>
            {(Object.keys(typeConfig) as VendorType[]).map((t) => (
              <option key={t} value={t}>{typeConfig[t].label}</option>
            ))}
          </select>

          <div className="flex-1" />

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9AA1B4]" />
            <input
              type="text"
              placeholder="Search vendors…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] text-[#525A72] placeholder:text-[#9AA1B4] focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] focus:border-[#1E5FFF] w-52"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-[#9AA1B4]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading vendors…
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-xs text-[#FF3B30]">
            Failed to load vendors. Check your connection.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#EDF0F6] bg-[#F7F9FC]">
                    {['Vendor', 'Type', 'Address', 'Phone', 'Status', 'Rating', 'Joined', ''].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F9FC]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-xs text-[#9AA1B4]">
                        No vendors match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((vendor) => {
                      const type = typeConfig[vendor.type]
                      const status = statusConfig[vendor.status]
                      return (
                        <tr
                          key={vendor.id}
                          className="hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                          onClick={() => router.push(`/vendors/${vendor.id}`)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                style={{ background: 'linear-gradient(135deg, #1E5FFF, #FF6A2C)' }}
                              >
                                {vendor.name[0]}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-[#0D1426]">{vendor.name}</p>
                                <p className="text-[11px] text-[#9AA1B4]">{vendor.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] font-medium" style={{ color: type.color }}>
                              {type.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 max-w-[180px]">
                            <span className="text-xs text-[#525A72] truncate block" title={vendor.address}>
                              {vendor.address}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-[#525A72] font-mono">{vendor.phone}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="text-[11px] font-medium rounded-full px-2 py-0.5"
                              style={{ backgroundColor: status.bg, color: status.text }}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-[#0D1426] font-semibold">
                              {vendor.rating != null ? vendor.rating.toFixed(1) : '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] text-[#9AA1B4]">
                              {new Date(vendor.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1 relative">
                              <button
                                onClick={() => router.push(`/vendors/${vendor.id}`)}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#E7EEFF] transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#1E5FFF]" />
                              </button>
                              <div className="relative">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === vendor.id ? null : vendor.id) }}
                                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#EDF0F6] transition-colors"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5 text-[#9AA1B4]" />
                                </button>
                                {openMenu === vendor.id && (
                                  <VendorActionMenu vendor={vendor} onClose={() => setOpenMenu(null)} />
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-[#EDF0F6]">
              <p className="text-xs text-[#9AA1B4]">
                Showing {filtered.length} of {vendors.length} vendors
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
