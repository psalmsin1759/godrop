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
  ACTIVE:      { bg: '#DFF5EC', text: '#1DB980', label: 'Active' },
  SUSPENDED:   { bg: '#FBEDD7', text: '#E8930C', label: 'Suspended' },
  DEACTIVATED: { bg: '#FFE3E1', text: '#FF3B30', label: 'Deactivated' },
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
        <h1 className="text-lg font-bold text-[#0D1426]">Customers</h1>
        <p className="text-xs text-[#9AA1B4] mt-0.5">Search and manage customer accounts</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9AA1B4]" />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, phone, or email…"
            className="w-full pl-8 pr-3 py-2 text-xs border border-[#E7EAF1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] bg-white"
          />
        </div>
        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleStatusChange(f.value)}
              className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-[#1E5FFF] text-white'
                  : 'bg-white border border-[#E7EAF1] text-[#525A72] hover:border-[#1E5FFF] hover:text-[#1E5FFF]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {isFetching && !isLoading && (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1E5FFF]" />
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-5 h-5 animate-spin text-[#1E5FFF]" />
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <Users className="w-8 h-8 text-[#DDE2EC]" />
            <p className="text-sm text-[#9AA1B4]">No customers found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EDF0F6] bg-[#F7F9FC]">
                <th className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3">Customer</th>
                <th className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3">Phone</th>
                <th className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-right text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3">Wallet</th>
                <th className="text-right text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3">Orders</th>
                <th className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF0F6]">
              {customers.map((c) => {
                const sc = STATUS_CONFIG[c.status]
                return (
                  <tr key={c.id} className="hover:bg-[#F7F9FC] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#E7EEFF] flex items-center justify-center shrink-0 text-[11px] font-bold text-[#1E5FFF]">
                          {c.firstName[0]}{c.lastName[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#0D1426]">{c.firstName} {c.lastName}</p>
                          {c.email && <p className="text-[10px] text-[#9AA1B4]">{c.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#525A72]">{c.phone}</td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[11px] font-medium rounded-full px-2 py-0.5"
                        style={{ backgroundColor: sc.bg, color: sc.text }}
                      >
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-medium text-[#0D1426]">
                      {c.wallet ? formatNaira(c.wallet.balanceKobo) : <span className="text-[#DDE2EC]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-[#525A72]">{c._count.orders}</td>
                    <td className="px-4 py-3 text-xs text-[#9AA1B4]">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/customers/${c.id}`)}
                        className="p-1.5 rounded hover:bg-[#E7EEFF] text-[#9AA1B4] hover:text-[#1E5FFF] transition-colors"
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
          <p className="text-[11px] text-[#9AA1B4]">
            {meta.total} customer{meta.total !== 1 ? 's' : ''} · page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded border border-[#E7EAF1] disabled:opacity-40 hover:border-[#1E5FFF] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="p-1.5 rounded border border-[#E7EAF1] disabled:opacity-40 hover:border-[#1E5FFF] transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
