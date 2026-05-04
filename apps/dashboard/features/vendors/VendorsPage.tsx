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
  APPROVED: { bg: '#e8faf2', text: '#17c666', label: 'Approved' },
  PENDING: { bg: '#fff6e8', text: '#ffa21d', label: 'Pending' },
  REJECTED: { bg: '#fdf0f0', text: '#ea4d4d', label: 'Rejected' },
  SUSPENDED: { bg: '#f3f4f6', text: '#6b7885', label: 'Suspended' },
}

const typeConfig: Record<VendorType, { label: string; color: string }> = {
  RESTAURANT: { label: 'Restaurant', color: '#3454d1' },
  GROCERY: { label: 'Grocery', color: '#17c666' },
  RETAIL: { label: 'Retail', color: '#ffa21d' },
  PHARMACY: { label: 'Pharmacy', color: '#3dc7be' },
}

function VendorActionMenu({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  const [approve] = useApproveVendorMutation()
  const [reject] = useRejectVendorMutation()
  const [suspend] = useSuspendVendorMutation()
  const [reinstate] = useReinstateVendorMutation()
  const [reason, setReason] = useState('')
  const [step, setStep] = useState<'menu' | 'reject' | 'suspend'>('menu')
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

  if (step === 'reject' || step === 'suspend') {
    const isReject = step === 'reject'
    return (
      <div className="absolute right-0 top-8 z-50 w-64 bg-white rounded-lg border border-[#e5e7eb] shadow-card-md p-3 space-y-2">
        <p className="text-xs font-semibold text-[#283c50]">
          {isReject ? 'Reject vendor' : 'Suspend vendor'}
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={isReject ? 'Reason (required)…' : 'Reason (optional)…'}
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
            disabled={loading || (isReject && !reason.trim())}
            onClick={() =>
              run(() =>
                isReject
                  ? reject({ id: vendor.id, reason }).unwrap()
                  : suspend({ id: vendor.id, reason: reason || undefined }).unwrap()
              )
            }
            className="flex-1 text-xs py-1.5 rounded text-white font-medium disabled:opacity-50"
            style={{ backgroundColor: isReject ? '#ea4d4d' : '#ffa21d' }}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Confirm'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute right-0 top-8 z-50 w-44 bg-white rounded-lg border border-[#e5e7eb] shadow-card-md py-1">
      {vendor.status === 'PENDING' && (
        <>
          <button
            onClick={() => run(() => approve(vendor.id).unwrap())}
            disabled={loading}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#17c666] hover:bg-[#f9fafb]"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Approve
          </button>
          <button
            onClick={() => setStep('reject')}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#ea4d4d] hover:bg-[#f9fafb]"
          >
            <XCircle className="w-3.5 h-3.5" /> Reject
          </button>
        </>
      )}
      {vendor.status === 'APPROVED' && (
        <button
          onClick={() => setStep('suspend')}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#ffa21d] hover:bg-[#f9fafb]"
        >
          <PauseCircle className="w-3.5 h-3.5" /> Suspend
        </button>
      )}
      {(vendor.status === 'SUSPENDED' || vendor.status === 'REJECTED') && (
        <button
          onClick={() => run(() => reinstate(vendor.id).unwrap())}
          disabled={loading}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#3454d1] hover:bg-[#f9fafb]"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reinstate
        </button>
      )}
      <button
        onClick={onClose}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#6b7885] hover:bg-[#f9fafb] border-t border-[#f3f4f6] mt-1"
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
          <h1 className="text-lg font-bold text-[#283c50]">Vendors</h1>
          <p className="text-xs text-[#9ca3af] mt-0.5">Manage vendor onboarding, approval and status</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportVendorsCSV(filtered)}
            className="flex items-center gap-1.5 text-xs text-[#6b7885] bg-white border border-[#e5e7eb] rounded px-3 py-1.5 hover:bg-[#f9fafb]"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button className="btn-primary flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Vendor
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Vendors', value: counts.ALL, color: '#3454d1', bg: '#eef1fb' },
          { label: 'Approved', value: counts.APPROVED, color: '#17c666', bg: '#e8faf2' },
          { label: 'Pending Review', value: counts.PENDING, color: '#ffa21d', bg: '#fff6e8' },
          { label: 'Suspended', value: counts.SUSPENDED, color: '#ea4d4d', bg: '#fdf0f0' },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              <Store style={{ color: s.color, width: 18, height: 18 }} />
            </div>
            <div>
              <p className="text-lg font-bold text-[#283c50] leading-none">{s.value}</p>
              <p className="text-[11px] text-[#6b7885] mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#f3f4f6] rounded">
            {(['ALL', 'PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="text-xs font-medium px-3 py-1.5 rounded transition-all"
                style={
                  statusFilter === s
                    ? { backgroundColor: '#fff', color: '#3454d1', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }
                    : { color: '#6b7885' }
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
            className="text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#4b5563] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#3454d1]"
          >
            <option value="ALL">All types</option>
            {(Object.keys(typeConfig) as VendorType[]).map((t) => (
              <option key={t} value={t}>{typeConfig[t].label}</option>
            ))}
          </select>

          <div className="flex-1" />

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Search vendors…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#4b5563] placeholder:text-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#3454d1] focus:border-[#3454d1] w-52"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-[#9ca3af]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading vendors…
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-xs text-[#ea4d4d]">
            Failed to load vendors. Check your connection.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                    {['Vendor', 'Type', 'Address', 'Phone', 'Status', 'Rating', 'Joined', ''].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f9fafb]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-xs text-[#9ca3af]">
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
                          className="hover:bg-[#fafafa] transition-colors cursor-pointer"
                          onClick={() => router.push(`/vendors/${vendor.id}`)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                style={{ background: 'linear-gradient(135deg, #3454d1, #3dc7be)' }}
                              >
                                {vendor.name[0]}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-[#283c50]">{vendor.name}</p>
                                <p className="text-[11px] text-[#9ca3af]">{vendor.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] font-medium" style={{ color: type.color }}>
                              {type.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 max-w-[180px]">
                            <span className="text-xs text-[#6b7885] truncate block" title={vendor.address}>
                              {vendor.address}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-[#4b5563] font-mono">{vendor.phone}</span>
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
                            <span className="text-xs text-[#283c50] font-semibold">
                              {vendor.rating != null ? vendor.rating.toFixed(1) : '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] text-[#9ca3af]">
                              {new Date(vendor.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1 relative">
                              <button
                                onClick={() => router.push(`/vendors/${vendor.id}`)}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#eef1fb] transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#3454d1]" />
                              </button>
                              <div className="relative">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === vendor.id ? null : vendor.id) }}
                                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5 text-[#9ca3af]" />
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
            <div className="px-4 py-3 border-t border-[#f3f4f6]">
              <p className="text-xs text-[#9ca3af]">
                Showing {filtered.length} of {vendors.length} vendors
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
