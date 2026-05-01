'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  useGetSystemAnalyticsQuery,
  useGetSystemGraphQuery,
  useGetVendorAnalyticsQuery,
  useGetVendorGraphQuery,
} from '@/store/services/analyticsApi'
import { formatNaira, formatNumber } from '@/lib/utils'
import { Loader2, TrendingUp, ShoppingBag, Users, Store } from 'lucide-react'
import type { GraphGranularity } from '@/types/api'

const TYPE_COLORS: Record<string, string> = {
  FOOD: '#3454d1', GROCERY: '#17c666', RETAIL: '#ffa21d',
  PHARMACY: '#3dc7be', PARCEL: '#8b5cf6', TRUCK: '#ea4d4d',
}
const STATUS_COLORS: Record<string, string> = {
  DELIVERED: '#17c666', IN_TRANSIT: '#3454d1', PENDING: '#ffa21d',
  CANCELLED: '#ea4d4d', ACCEPTED: '#3dc7be', PREPARING: '#8b5cf6',
  READY_FOR_PICKUP: '#06b6d4', PICKED_UP: '#f59e0b', FAILED: '#6b7280',
}

interface TooltipProps {
  active?: boolean
  payload?: { color: string; name: string; value: number; dataKey: string }[]
  label?: string
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-[#283c50] mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-[#6b7885]">{p.name}:</span>
          <span className="font-semibold text-[#283c50]">
            {p.dataKey === 'revenueKobo' || p.dataKey === 'Revenue'
              ? formatNaira(p.value)
              : formatNumber(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

const granularities: { value: GraphGranularity; label: string }[] = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
]

function SystemAnalyticsView() {
  const [granularity, setGranularity] = useState<GraphGranularity>('day')
  const { data: analytics, isLoading } = useGetSystemAnalyticsQuery()
  const { data: graph, isLoading: graphLoading } = useGetSystemGraphQuery({ granularity })

  const chartData = graph?.points.map((p) => ({
    date: p.date.slice(5),
    Orders: p.orders,
    Revenue: p.revenueKobo,
    'New Users': p.newUsers,
  })) ?? []

  const s = analytics?.summary

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-[#3454d1]" />
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: s ? formatNaira(s.totalRevenueKobo) : '—', icon: TrendingUp, color: '#ffa21d', bg: '#fff6e8' },
          { label: 'Total Orders', value: s ? formatNumber(s.totalOrders) : '—', icon: ShoppingBag, color: '#3454d1', bg: '#eef1fb' },
          { label: 'Total Users', value: s ? formatNumber(s.totalUsers) : '—', icon: Users, color: '#17c666', bg: '#e8faf2' },
          { label: 'Active Vendors', value: s ? formatNumber(s.activeVendors) : '—', icon: Store, color: '#3dc7be', bg: '#e0f9f7' },
        ].map((c) => (
          <div key={c.label} className="card p-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: c.bg }}>
              <c.icon style={{ color: c.color, width: 18, height: 18 }} />
            </div>
            <p className="text-lg font-bold text-[#283c50]">{c.value}</p>
            <p className="text-xs text-[#6b7885] mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue / Orders over time */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Revenue & Orders Over Time</h3>
          <div className="flex items-center gap-1 p-0.5 bg-[#f3f4f6] rounded">
            {granularities.map((g) => (
              <button
                key={g.value}
                onClick={() => setGranularity(g.value)}
                className="text-[11px] font-medium px-2.5 py-1 rounded transition-all"
                style={granularity === g.value
                  ? { backgroundColor: '#fff', color: '#3454d1', boxShadow: '0 1px 2px rgba(0,0,0,.08)' }
                  : { color: '#6b7885' }}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          {graphLoading ? (
            <div className="h-[260px] flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-[#3454d1]" />
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={32} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Orders" stroke="#3454d1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="New Users" stroke="#17c666" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-xs text-[#9ca3af]">No data available</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Orders by type */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Orders by Type</h3></div>
          <div className="p-4">
            {analytics?.ordersByType?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.ordersByType} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Orders" radius={[3, 3, 0, 0]}>
                    {analytics.ordersByType.map((entry, i) => (
                      <Cell key={i} fill={TYPE_COLORS[entry.type] ?? '#9ca3af'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-xs text-[#9ca3af]">No data</div>
            )}
          </div>
        </div>

        {/* Orders by status */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Orders by Status</h3></div>
          <div className="p-4">
            {analytics?.ordersByStatus?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analytics.ordersByStatus}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="status"
                  >
                    {analytics.ordersByStatus.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.status] ?? '#9ca3af'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatNumber(v)} />
                  <Legend
                    formatter={(value) => <span style={{ fontSize: 11, color: '#4b5563' }}>{value.replace('_', ' ')}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-xs text-[#9ca3af]">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* Top vendors */}
      {analytics?.topVendors?.length ? (
        <div className="card overflow-hidden">
          <div className="card-header"><h3 className="card-title">Top Performing Vendors</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                  {['Vendor', 'Type', 'Rating', 'Orders', 'Revenue'].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f9fafb]">
                {analytics.topVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-4 py-2.5 text-xs font-medium text-[#283c50]">{v.name}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-[11px] font-medium capitalize" style={{ color: TYPE_COLORS[v.type] ?? '#9ca3af' }}>
                        {v.type.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-[#283c50]">{v.rating?.toFixed(1) ?? '—'}</td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-[#3454d1]">{formatNumber(v.orders)}</td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-[#283c50]">{formatNaira(v.revenueKobo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function VendorAnalyticsView() {
  const [granularity, setGranularity] = useState<GraphGranularity>('day')
  const { data: analytics, isLoading } = useGetVendorAnalyticsQuery()
  const { data: graph, isLoading: graphLoading } = useGetVendorGraphQuery({ granularity })

  const chartData = graph?.points.map((p) => ({
    date: p.date.slice(5),
    Orders: p.orders,
    Revenue: p.revenueKobo,
  })) ?? []

  const s = analytics?.summary

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-[#17c666]" />
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: s ? formatNaira(s.totalRevenueKobo) : '—', color: '#ffa21d', bg: '#fff6e8' },
          { label: 'Total Orders', value: s ? formatNumber(s.totalOrders) : '—', color: '#3454d1', bg: '#eef1fb' },
          { label: 'Completed', value: s ? formatNumber(s.completedOrders) : '—', color: '#17c666', bg: '#e8faf2' },
          { label: 'Avg. Order Value', value: s ? formatNaira(s.avgOrderValueKobo) : '—', color: '#3dc7be', bg: '#e0f9f7' },
        ].map((c) => (
          <div key={c.label} className="card p-4">
            <p className="text-lg font-bold text-[#283c50]" style={{ color: c.color }}>{c.value}</p>
            <p className="text-xs text-[#6b7885] mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Orders Over Time</h3>
          <div className="flex items-center gap-1 p-0.5 bg-[#f3f4f6] rounded">
            {granularities.map((g) => (
              <button
                key={g.value}
                onClick={() => setGranularity(g.value)}
                className="text-[11px] font-medium px-2.5 py-1 rounded transition-all"
                style={granularity === g.value
                  ? { backgroundColor: '#fff', color: '#17c666', boxShadow: '0 1px 2px rgba(0,0,0,.08)' }
                  : { color: '#6b7885' }}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          {graphLoading ? (
            <div className="h-[260px] flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-[#17c666]" />
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={32} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="Orders" fill="#17c666" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-xs text-[#9ca3af]">No data available</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Order status */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Orders by Status</h3></div>
          <div className="p-4">
            {analytics?.ordersByStatus?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={analytics.ordersByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="count" nameKey="status">
                    {analytics.ordersByStatus.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.status] ?? '#9ca3af'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatNumber(v)} />
                  <Legend formatter={(value) => <span style={{ fontSize: 11, color: '#4b5563' }}>{value.replace('_', ' ')}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-xs text-[#9ca3af]">No data</div>
            )}
          </div>
        </div>

        {/* Top products */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Top Products</h3></div>
          <div className="p-4">
            {analytics?.topProducts?.length ? (
              <div className="space-y-2.5">
                {analytics.topProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#eef1fb] flex items-center justify-center text-[10px] font-bold text-[#3454d1] shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#283c50] truncate">{p.name}</p>
                      <p className="text-[11px] text-[#9ca3af]">{formatNumber(p.orders)} orders</p>
                    </div>
                    <span className="text-xs font-semibold text-[#283c50] shrink-0">{formatNaira(p.revenueKobo)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[140px] text-xs text-[#9ca3af]">No data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const isVendor = session?.admin?.type === 'VENDOR'

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-[#283c50]">Analytics</h1>
        <p className="text-xs text-[#9ca3af] mt-0.5">
          {isVendor ? 'Your vendor performance data' : 'Platform-wide analytics and insights'}
        </p>
      </div>
      {isVendor ? <VendorAnalyticsView /> : <SystemAnalyticsView />}
    </div>
  )
}
