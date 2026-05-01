'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGetCustomersQuery } from './store/customersApi'
import type { CustomerStatus } from '@/types/api'
import { formatNaira, formatDate } from '@/lib/utils'
import {
  Search, ChevronLeft, ChevronRight, Loader2, Users,
  CheckCircle, ShieldOff, UserX, Eye,
} from 'lucide-react'

const STATUS_CONFIG: Record<CustomerStatus, { bg: string; text: string; label: string }> = {
  ACTIVE:      { bg: '#e8faf2', text: '#17c666', label: 'Active' },
  SUSPENDED:   { bg: '#fff6e8', text: '#ffa21d', label: 'Suspended' },
  DEACTIVATED: { bg: '#fdf0f0', text: '#ea4d4d', label: 'Deactivated' },
}

const STATUS_FILTERS: Array<{ value: CustomerStatus | ''; label: string }> = [
  { value: '', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'DEACTIVATED', label: 'Deactivated' },
]

export default function CustomersPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | ''>('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching } = useGetCustomersQuery({
    page,
    limit: 20,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  })

  const customers = data?.data ?? []
  const meta = data?.meta

  function handleSearchChange(val: string) {
    setSearch(val)
    clearTimeout((handleSearchChange as { _t?: ReturnType<typeof setTimeout> })._t)
    const t = setTimeout(() => {
      setDebouncedSearch(val)
      setPage(1)
    }, 400)
    ;(handleSearchChange as { _t?: ReturnType<typeof setTimeout> })._t = t
  }

  function handleStatusChange(val: CustomerStatus | '') {
    setStatusFilter(val)
    setPage(1)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-[#283c50]">Customers</h1>
        <p className="text-xs text-[#9ca3af] mt-0.5">Search and manage customer accounts</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, phone, or email…"
            className="w-full pl-8 pr-3 py-2 text-xs border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3454d1] bg-white"
          />
        </div>
        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleStatusChange(f.value)}
              className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-[#3454d1] text-white'
                  : 'bg-white border border-[#e5e7eb] text-[#6b7885] hover:border-[#3454d1] hover:text-[#3454d1]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {isFetching && !isLoading && (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3454d1]" />
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-5 h-5 animate-spin text-[#3454d1]" />
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <Users className="w-8 h-8 text-[#d1d5db]" />
            <p className="text-sm text-[#9ca3af]">No customers found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                <th className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3">Customer</th>
                <th className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3">Phone</th>
                <th className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-right text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3">Wallet</th>
                <th className="text-right text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3">Orders</th>
                <th className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {customers.map((c) => {
                const sc = STATUS_CONFIG[c.status]
                return (
                  <tr key={c.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#eef1fb] flex items-center justify-center shrink-0 text-[11px] font-bold text-[#3454d1]">
                          {c.firstName[0]}{c.lastName[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#283c50]">{c.firstName} {c.lastName}</p>
                          {c.email && <p className="text-[10px] text-[#9ca3af]">{c.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6b7885]">{c.phone}</td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[11px] font-medium rounded-full px-2 py-0.5"
                        style={{ backgroundColor: sc.bg, color: sc.text }}
                      >
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-medium text-[#283c50]">
                      {c.wallet ? formatNaira(c.wallet.balanceKobo) : <span className="text-[#d1d5db]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-[#6b7885]">{c._count.orders}</td>
                    <td className="px-4 py-3 text-xs text-[#9ca3af]">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/customers/${c.id}`)}
                        className="p-1.5 rounded hover:bg-[#eef1fb] text-[#9ca3af] hover:text-[#3454d1] transition-colors"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-[#9ca3af]">
            {meta.total} customer{meta.total !== 1 ? 's' : ''} · page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded border border-[#e5e7eb] disabled:opacity-40 hover:border-[#3454d1] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="p-1.5 rounded border border-[#e5e7eb] disabled:opacity-40 hover:border-[#3454d1] transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
