'use client'

import { ShoppingBag, TrendingUp, AlertTriangle, Store, Users, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useGetSystemAnalyticsQuery, useGetSystemGraphQuery } from '@/store/services/analyticsApi'
import { formatNaira, formatNumber } from '@/lib/utils'

const TYPE_COLORS: Record<string, string> = {
  FOOD: '#3454d1',
  GROCERY: '#17c666',
  RETAIL: '#ffa21d',
  PHARMACY: '#3dc7be',
  PARCEL: '#8b5cf6',
  TRUCK: '#ea4d4d',
}

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: '#17c666',
  IN_TRANSIT: '#3454d1',
  PENDING: '#ffa21d',
  CANCELLED: '#ea4d4d',
  ACCEPTED: '#3dc7be',
  PREPARING: '#8b5cf6',
  READY_FOR_PICKUP: '#06b6d4',
  PICKED_UP: '#f59e0b',
  FAILED: '#6b7280',
}

interface TooltipProps {
  active?: boolean
  payload?: { color: string; name: string; value: number }[]
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
            {p.name === 'Revenue' ? formatNaira(p.value) : formatNumber(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

function StatCard({
  label, sublabel, value, icon: Icon, iconColor, iconBg, trend,
}: {
  label: string
  sublabel: string
  value: string | number
  icon: React.ElementType
  iconColor: string
  iconBg: string
  trend?: number
}) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg }}>
          <Icon className="w-4.5 h-4.5" style={{ color: iconColor, width: 18, height: 18 }} />
        </div>
        {trend !== undefined && (
          <span
            className="text-[11px] font-semibold rounded-full px-2 py-0.5"
            style={trend >= 0
              ? { backgroundColor: '#e8faf2', color: '#17c666' }
              : { backgroundColor: '#fdf0f0', color: '#ea4d4d' }}
          >
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-lg font-bold text-[#283c50] leading-none">{value}</p>
      <p className="text-xs font-medium text-[#4b5563] mt-1">{label}</p>
      <p className="text-[11px] text-[#9ca3af] mt-0.5">{sublabel}</p>
    </div>
  )
}

export default function SystemOverviewPage() {
  const { data: analytics, isLoading } = useGetSystemAnalyticsQuery()
  const { data: graph } = useGetSystemGraphQuery()

  const chartData = graph?.points.slice(-14).map((p) => ({
    date: p.date.slice(5),
    Orders: p.orders,
    Revenue: p.revenueKobo,
    Users: p.newUsers,
  })) ?? []

  const typeData = analytics?.ordersByType?.map((t) => ({
    name: t.type,
    value: t.count,
    color: TYPE_COLORS[t.type] ?? '#9ca3af',
  })) ?? []

  const s = analytics?.summary

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#3454d1]" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#283c50] leading-tight">Platform Overview</h1>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            {new Date().toLocaleDateString('en-NG', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}{' '}— Lagos, Nigeria
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-[#6b7885] bg-white border border-[#e5e7eb] rounded px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#17c666] animate-pulse" />
          Live data
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          sublabel="All time"
          value={s ? formatNumber(s.totalOrders) : '—'}
          icon={ShoppingBag}
          iconColor="#3454d1"
          iconBg="#eef1fb"
        />
        <StatCard
          label="Platform Revenue"
          sublabel="Paid orders"
          value={s ? formatNaira(s.totalRevenueKobo) : '—'}
          icon={TrendingUp}
          iconColor="#ffa21d"
          iconBg="#fff6e8"
        />
        <StatCard
          label="Total Users"
          sublabel={s ? `${formatNumber(s.newUsers)} new this period` : 'Registered customers'}
          value={s ? formatNumber(s.totalUsers) : '—'}
          icon={Users}
          iconColor="#17c666"
          iconBg="#e8faf2"
        />
        <StatCard
          label="Active Vendors"
          sublabel={s ? `${s.pendingVendors} pending review` : 'Approved vendors'}
          value={s ? formatNumber(s.activeVendors) : '—'}
          icon={Store}
          iconColor="#3dc7be"
          iconBg="#e0f9f7"
        />
      </div>

      {/* Chart + Type breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="card-title">Orders & Revenue (Last 14 Days)</h3>
          </div>
          <div className="p-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barGap={2} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(52,84,209,0.04)' }} />
                  <Bar dataKey="Orders" fill="#3454d1" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Users" fill="#17c666" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-xs text-[#9ca3af]">
                No chart data available
              </div>
            )}
            <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-[#f3f4f6]">
              <div>
                <p className="text-[11px] text-[#9ca3af]">Completed Orders</p>
                <p className="text-sm font-bold text-[#283c50]">{s ? formatNumber(s.completedOrders) : '—'}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#9ca3af]">Total Vendors</p>
                <p className="text-sm font-bold text-[#283c50]">{s ? formatNumber(s.totalVendors) : '—'}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#9ca3af]">Completion Rate</p>
                <p className="text-sm font-bold text-[#17c666]">
                  {s && s.totalOrders > 0
                    ? `${((s.completedOrders / s.totalOrders) * 100).toFixed(1)}%`
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order types donut */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Orders by Type</h3>
          </div>
          <div className="p-4">
            {typeData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%" cy="50%"
                      innerRadius={40} outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {typeData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatNumber(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {typeData.map((t) => (
                    <div key={t.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                        <span className="text-[#4b5563] capitalize">{t.name.toLowerCase()}</span>
                      </span>
                      <span className="font-semibold text-[#283c50]">{formatNumber(t.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[140px] flex items-center justify-center text-xs text-[#9ca3af]">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top vendors table */}
      {analytics?.topVendors && analytics.topVendors.length > 0 && (
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="card-title">Top Vendors</h3>
            <a href="/vendors" className="text-xs text-[#3454d1] hover:underline">View all</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                  {['Vendor', 'Type', 'Rating', 'Orders', 'Revenue'].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f9fafb]">
                {analytics.topVendors.slice(0, 5).map((v) => (
                  <tr key={v.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ background: 'linear-gradient(135deg, #3454d1, #3dc7be)' }}
                        >
                          {v.name[0]}
                        </div>
                        <span className="text-xs font-medium text-[#283c50]">{v.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[11px] font-medium capitalize" style={{ color: TYPE_COLORS[v.type] ?? '#9ca3af' }}>
                        {v.type.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-[#283c50] font-semibold">{v.rating?.toFixed(1) ?? '—'}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-semibold text-[#3454d1]">{formatNumber(v.orders)}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-semibold text-[#283c50]">{formatNaira(v.revenueKobo)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order status breakdown */}
      {analytics?.ordersByStatus && analytics.ordersByStatus.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Orders by Status</h3>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {analytics.ordersByStatus.map((s) => (
              <div key={s.status} className="rounded-lg p-3 text-center" style={{ backgroundColor: `${STATUS_COLORS[s.status]}15` }}>
                <p className="text-lg font-bold" style={{ color: STATUS_COLORS[s.status] ?? '#283c50' }}>
                  {formatNumber(s.count)}
                </p>
                <p className="text-[10px] text-[#6b7885] mt-0.5 capitalize">{s.status.replace('_', ' ').toLowerCase()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
