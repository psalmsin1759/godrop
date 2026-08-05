'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useGetAuditLogsQuery, useGetVendorAuditLogsQuery } from './store/auditApi'
import { exportToCsv } from '@/lib/exportCsv'
import { Search, Filter, ChevronLeft, ChevronRight, Loader2, AlertTriangle, RefreshCw, Download } from 'lucide-react'

const actionColors: Record<string, { bg: string; text: string }> = {
  approve: { bg: '#DFF5EC', text: '#1DB980' },
  reject: { bg: '#FFE3E1', text: '#FF3B30' },
  suspend: { bg: '#FBEDD7', text: '#E8930C' },
  reinstate: { bg: '#E7EEFF', text: '#1E5FFF' },
  create: { bg: '#FFEAE1', text: '#FF6A2C' },
  update: { bg: '#EDF0F6', text: '#525A72' },
  delete: { bg: '#FFE3E1', text: '#FF3B30' },
}

function actionStyle(action: string) {
  const key = Object.keys(actionColors).find((k) => action.toLowerCase().includes(k))
  return key ? actionColors[key] : { bg: '#EDF0F6', text: '#525A72' }
}

export default function DisputesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const admin = session?.admin
  const isVendor = admin?.type === 'VENDOR'
  const isVendorStaff = isVendor && admin?.role === 'STAFF'

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [entity, setEntity] = useState('')

  useEffect(() => {
    if (isVendorStaff) router.replace('/orders')
  }, [isVendorStaff, router])

  if (isVendorStaff) return null

  const vendorFilters = { page, limit: 15, ...(entity ? { entity } : {}) }
  const systemFilters = { page, limit: 15, ...(entity ? { entity } : {}) }

  const vendorQuery = useGetVendorAuditLogsQuery(vendorFilters, { skip: !isVendor || isVendorStaff })
  const systemQuery = useGetAuditLogsQuery(systemFilters, { skip: isVendor })

  const { data, isLoading, isError, refetch } = isVendor ? vendorQuery : systemQuery

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
          <h1 className="text-lg font-bold text-[#0D1426]">Audit Log</h1>
          <p className="text-xs text-[#9AA1B4] mt-0.5">
            {isVendor ? 'Activity log for your store' : 'Track all admin actions across the platform'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportToCsv('audit-log', visibleLogs, [
              { header: 'Date', value: (log) => new Date(log.createdAt).toLocaleString('en-NG') },
              { header: 'Admin', value: (log) => log.admin ? `${log.admin.firstName} ${log.admin.lastName}` : '' },
              { header: 'Email', value: (log) => log.admin?.email ?? '' },
              { header: 'Action', value: (log) => log.action },
              { header: 'Entity', value: (log) => log.entity },
              { header: 'Vendor', value: (log) => log.vendor?.name ?? '' },
            ])}
            className="flex items-center gap-1.5 text-xs text-[#525A72] bg-white border border-[#E7EAF1] rounded px-3 py-1.5 hover:bg-[#F7F9FC]"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs text-[#525A72] bg-white border border-[#E7EAF1] rounded px-3 py-1.5 hover:bg-[#F7F9FC]"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9AA1B4]" />
            <input
              type="text"
              placeholder="Search by admin, action or entity…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] text-[#525A72] placeholder:text-[#9AA1B4] focus:outline-none focus:ring-1 focus:ring-[#1E5FFF] focus:border-[#1E5FFF] w-64"
            />
          </div>
          <select
            value={entity}
            onChange={(e) => { setEntity(e.target.value); setPage(1) }}
            className="text-xs rounded border border-[#E7EAF1] bg-[#F7F9FC] text-[#525A72] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E5FFF]"
          >
            <option value="">All entities</option>
            <option value="Vendor">Vendor</option>
            <option value="Admin">Admin</option>
            <option value="Order">Order</option>
          </select>
          <div className="flex items-center gap-1.5 text-xs text-[#525A72]">
            <Filter className="w-3.5 h-3.5" />
            {data?.total != null ? `${data.total} records` : '—'}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-[#9AA1B4]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading audit logs…
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-xs text-[#FF3B30]">
            <AlertTriangle className="w-6 h-6" />
            Failed to load audit logs.
            <button onClick={() => refetch()} className="text-[#1E5FFF] underline">Try again</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#EDF0F6] bg-[#F7F9FC]">
                    {['Time', 'Admin', 'Action', 'Entity', 'Vendor', 'Details'].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F9FC]">
                  {visibleLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-xs text-[#9AA1B4]">
                        No audit logs found.
                      </td>
                    </tr>
                  ) : (
                    visibleLogs.map((log) => {
                      const style = actionStyle(log.action)
                      return (
                        <tr key={log.id} className="hover:bg-[#F7F9FC] transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-[11px] text-[#9AA1B4]">
                              {new Date(log.createdAt).toLocaleString('en-NG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {log.admin ? (
                              <div>
                                <p className="text-xs font-medium text-[#0D1426]">{log.admin.firstName} {log.admin.lastName}</p>
                                <p className="text-[11px] text-[#9AA1B4]">{log.admin.email}</p>
                              </div>
                            ) : <span className="text-xs text-[#9AA1B4]">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] font-medium rounded-full px-2 py-0.5 capitalize" style={{ backgroundColor: style.bg, color: style.text }}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-[#525A72] capitalize">{log.entity}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-[#525A72]">{log.vendor?.name ?? '—'}</span>
                          </td>
                          <td className="px-4 py-3 max-w-[200px]">
                            {log.metadata ? (
                              <span className="text-[11px] text-[#9AA1B4] truncate block font-mono" title={JSON.stringify(log.metadata)}>
                                {JSON.stringify(log.metadata).slice(0, 60)}
                              </span>
                            ) : <span className="text-[11px] text-[#DDE2EC]">—</span>}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-[#EDF0F6]">
              <p className="text-xs text-[#9AA1B4]">
                Page {page} of {totalPages} — {data?.total ?? 0} records
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="w-7 h-7 rounded flex items-center justify-center text-[#525A72] hover:bg-[#EDF0F6] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-7 h-7 rounded text-xs"
                    style={page === p ? { backgroundColor: '#1E5FFF', color: '#fff', fontWeight: 600 } : { color: '#525A72' }}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="w-7 h-7 rounded flex items-center justify-center text-[#525A72] hover:bg-[#EDF0F6] disabled:opacity-40 disabled:cursor-not-allowed"
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
