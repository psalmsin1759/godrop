'use client'

import { useState } from 'react'
import { useGetAuditLogsQuery } from './store/auditApi'
import type { AuditLogFilters } from '@/types/api'
import { Search, Filter, ChevronLeft, ChevronRight, Loader2, AlertTriangle, RefreshCw } from 'lucide-react'

const actionColors: Record<string, { bg: string; text: string }> = {
  approve: { bg: '#e8faf2', text: '#17c666' },
  reject: { bg: '#fdf0f0', text: '#ea4d4d' },
  suspend: { bg: '#fff6e8', text: '#ffa21d' },
  reinstate: { bg: '#eef1fb', text: '#3454d1' },
  create: { bg: '#e8f8f7', text: '#3dc7be' },
  update: { bg: '#f3f4f6', text: '#6b7885' },
  delete: { bg: '#fdf0f0', text: '#ea4d4d' },
}

function actionStyle(action: string) {
  const key = Object.keys(actionColors).find((k) => action.toLowerCase().includes(k))
  return key ? actionColors[key] : { bg: '#f3f4f6', text: '#6b7885' }
}

export default function DisputesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [entity, setEntity] = useState('')

  const filters: AuditLogFilters = { page, limit: 15, ...(entity ? { entity } : {}) }

  const { data, isLoading, isError, refetch } = useGetAuditLogsQuery(filters)

  const logs = data?.items ?? []
  const totalPages = data?.pages ?? 1

  const visibleLogs = search
    ? logs.filter((log) => {
        const s = search.toLowerCase()
        return (
          log.action.toLowerCase().includes(s) ||
          log.entity.toLowerCase().includes(s) ||
          log.admin?.email?.toLowerCase().includes(s) ||
          log.vendor?.name?.toLowerCase().includes(s)
        )
      })
    : logs

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#283c50]">Audit Log</h1>
          <p className="text-xs text-[#9ca3af] mt-0.5">Track all admin actions across the platform</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-xs text-[#6b7885] bg-white border border-[#e5e7eb] rounded px-3 py-1.5 hover:bg-[#f9fafb]"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Search by admin, action or entity…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#4b5563] placeholder:text-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#3454d1] focus:border-[#3454d1] w-64"
            />
          </div>
          <select
            value={entity}
            onChange={(e) => { setEntity(e.target.value); setPage(1) }}
            className="text-xs rounded border border-[#e5e7eb] bg-[#f9fafb] text-[#4b5563] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#3454d1]"
          >
            <option value="">All entities</option>
            <option value="Vendor">Vendor</option>
            <option value="Admin">Admin</option>
            <option value="Order">Order</option>
          </select>
          <div className="flex items-center gap-1.5 text-xs text-[#6b7885]">
            <Filter className="w-3.5 h-3.5" />
            {data?.total != null ? `${data.total} records` : '—'}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-[#9ca3af]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading audit logs…
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-xs text-[#ea4d4d]">
            <AlertTriangle className="w-6 h-6" />
            Failed to load audit logs.
            <button onClick={() => refetch()} className="text-[#3454d1] underline">Try again</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                    {['Time', 'Admin', 'Action', 'Entity', 'Vendor', 'Details'].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f9fafb]">
                  {visibleLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-xs text-[#9ca3af]">
                        No audit logs found.
                      </td>
                    </tr>
                  ) : (
                    visibleLogs.map((log) => {
                      const style = actionStyle(log.action)
                      return (
                        <tr key={log.id} className="hover:bg-[#fafafa] transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-[11px] text-[#9ca3af]">
                              {new Date(log.createdAt).toLocaleString('en-NG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {log.admin ? (
                              <div>
                                <p className="text-xs font-medium text-[#283c50]">{log.admin.firstName} {log.admin.lastName}</p>
                                <p className="text-[11px] text-[#9ca3af]">{log.admin.email}</p>
                              </div>
                            ) : <span className="text-xs text-[#9ca3af]">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] font-medium rounded-full px-2 py-0.5 capitalize" style={{ backgroundColor: style.bg, color: style.text }}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-[#4b5563] capitalize">{log.entity}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-[#6b7885]">{log.vendor?.name ?? '—'}</span>
                          </td>
                          <td className="px-4 py-3 max-w-[200px]">
                            {log.metadata ? (
                              <span className="text-[11px] text-[#9ca3af] truncate block font-mono" title={JSON.stringify(log.metadata)}>
                                {JSON.stringify(log.metadata).slice(0, 60)}
                              </span>
                            ) : <span className="text-[11px] text-[#d1d5db]">—</span>}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-[#f3f4f6]">
              <p className="text-xs text-[#9ca3af]">
                Page {page} of {totalPages} — {data?.total ?? 0} records
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="w-7 h-7 rounded flex items-center justify-center text-[#6b7885] hover:bg-[#f3f4f6] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-7 h-7 rounded text-xs"
                    style={page === p ? { backgroundColor: '#3454d1', color: '#fff', fontWeight: 600 } : { color: '#6b7885' }}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="w-7 h-7 rounded flex items-center justify-center text-[#6b7885] hover:bg-[#f3f4f6] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
