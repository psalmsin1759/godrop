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
import { useGetRiderStatsQuery, useGetRidersQuery } from '@/store/services/ridersApi'
import { formatNaira, formatNumber } from '@/lib/utils'
import { Loader2, TrendingUp, ShoppingBag, Users, Store, Bike, Star, UserCheck, Shield } from 'lucide-react'
import type { GraphGranularity } from '@/types/api'

const TYPE_COLORS: Record<string, string> = {
  FOOD: '#3454d1', GROCERY: '#17c666', RETAIL: '#ffa21d',
  PHARMACY: '#3dc7be', PARCEL: '#8b5cf6', TRUCK: '#ea4d4d',
}
const KYC_COLORS: Record<string, string> = {
  PENDING: '#ffa21d', SUBMITTED: '#3454d1', VERIFIED: '#17c666', REJECTED: '#ea4d4d',
}
const VEHICLE_COLORS: Record<string, string> = {
  MOTORCYCLE: '#3454d1', BICYCLE: '#17c666', CAR: '#ffa21d', VAN: '#ea4d4d',
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

type SystemTab = 'platform' | 'riders'

function SystemAnalyticsView() {
  const [tab, setTab] = useState<SystemTab>('platform')
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
      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-[#e5e7eb]">
        {([
          { id: 'platform', label: 'Platform', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
          { id: 'riders',   label: 'Riders',   icon: <Bike className="w-3.5 h-3.5" /> },
        ] as { id: SystemTab; label: string; icon: React.ReactNode }[]).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-[#3454d1] text-[#3454d1]'
                : 'border-transparent text-[#6b7885] hover:text-[#283c50]'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === 'riders' && <RidersAnalyticsView />}
      {tab === 'platform' && <>
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
      </>}
    </div>
  )
}

// ─── Riders Analytics ─────────────────────────────────────────────────────────

function RidersAnalyticsView() {
  const { data: stats, isLoading } = useGetRiderStatsQuery()
  const { data: ridersData, isLoading: ridersLoading } = useGetRidersQuery({ page: 1, limit: 50 })
  const riders = ridersData?.data ?? []

  const kycData = stats
    ? Object.entries(stats.byKycStatus)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({ name: k, value: v }))
    : []

  const vehicleCounts = riders.reduce<Record<string, number>>((acc, r) => {
    const v = r.vehicleType ?? 'UNKNOWN'
    acc[v] = (acc[v] ?? 0) + 1
    return acc
  }, {})
  const vehicleData = Object.entries(vehicleCounts).map(([name, value]) => ({ name, value }))

  const topRiders = [...riders]
    .sort((a, b) => (b._count?.orders ?? 0) - (a._count?.orders ?? 0))
    .slice(0, 10)

  const topEarningRiders = [...riders]
    .filter((r) => r.rating != null)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 10)

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-[#3454d1]" />
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Riders', value: stats ? formatNumber(stats.total) : '—', icon: Bike, color: '#3454d1', bg: '#eef1fb' },
          { label: 'Active Riders', value: stats ? formatNumber(stats.active) : '—', icon: UserCheck, color: '#17c666', bg: '#e8faf2' },
          { label: 'Online Now', value: stats ? formatNumber(stats.available) : '—', icon: Bike, color: '#ffa21d', bg: '#fff6e8' },
          { label: 'KYC Verified', value: stats ? formatNumber(stats.byKycStatus.VERIFIED ?? 0) : '—', icon: Shield, color: '#3dc7be', bg: '#e0f9f7' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* KYC breakdown */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">KYC Status Breakdown</h3></div>
          <div className="p-4">
            {kycData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={kycData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    paddingAngle={2} dataKey="value" nameKey="name">
                    {kycData.map((entry, i) => (
                      <Cell key={i} fill={KYC_COLORS[entry.name] ?? '#9ca3af'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatNumber(v)} />
                  <Legend formatter={(value) => (
                    <span style={{ fontSize: 11, color: '#4b5563', textTransform: 'capitalize' }}>
                      {value.toLowerCase()}
                    </span>
                  )} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-xs text-[#9ca3af]">No data</div>
            )}
          </div>
        </div>

        {/* Vehicle type breakdown */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Riders by Vehicle Type</h3></div>
          <div className="p-4">
            {vehicleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={vehicleData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => v.charAt(0) + v.slice(1).toLowerCase()} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip formatter={(v: number) => [formatNumber(v), 'Riders']} />
                  <Bar dataKey="value" name="Riders" radius={[3, 3, 0, 0]}>
                    {vehicleData.map((entry, i) => (
                      <Cell key={i} fill={VEHICLE_COLORS[entry.name] ?? '#9ca3af'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-xs text-[#9ca3af]">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* Top riders by orders */}
      {!ridersLoading && topRiders.length > 0 && (
        <div className="card overflow-hidden">
          <div className="card-header"><h3 className="card-title">Top Riders by Orders</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                  {['#', 'Rider', 'Vehicle', 'KYC', 'Rating', 'Orders', 'Status'].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f9fafb]">
                {topRiders.map((rider, i) => {
                  const kycColor = KYC_COLORS[rider.kycStatus] ?? '#9ca3af'
                  const kycBg = rider.kycStatus === 'VERIFIED' ? '#e8faf2'
                    : rider.kycStatus === 'SUBMITTED' ? '#eef1fb'
                    : rider.kycStatus === 'REJECTED' ? '#fdf0f0' : '#fff6e8'
                  return (
                    <tr key={rider.id} className="hover:bg-[#fafafa] transition-colors">
                      <td className="px-4 py-2.5">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{ backgroundColor: '#eef1fb', color: '#3454d1' }}>{i + 1}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                            style={{ background: 'linear-gradient(135deg, #3454d1, #3dc7be)' }}>
                            {rider.firstName[0]}{rider.lastName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[#283c50]">{rider.firstName} {rider.lastName}</p>
                            {rider.isAvailable && <span className="text-[10px] text-[#17c666]">● Online</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-[#6b7885] capitalize">{rider.vehicleType?.toLowerCase() ?? '—'}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-[11px] font-medium rounded-full px-2 py-0.5 capitalize"
                          style={{ backgroundColor: kycBg, color: kycColor }}>
                          {rider.kycStatus.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {rider.rating != null ? (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-[#ffa21d]" fill="#ffa21d" />
                            <span className="text-xs font-semibold text-[#283c50]">{rider.rating.toFixed(1)}</span>
                          </div>
                        ) : <span className="text-xs text-[#9ca3af]">—</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-bold text-[#3454d1]">{rider._count?.orders ?? 0}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-[11px] font-medium rounded-full px-2 py-0.5"
                          style={rider.isActive
                            ? { backgroundColor: '#e8faf2', color: '#17c666' }
                            : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}>
                          {rider.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top rated riders */}
      {!ridersLoading && topEarningRiders.length > 0 && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">Highest Rated Riders</h3></div>
          <div className="p-4">
            <div className="space-y-3">
              {topEarningRiders.slice(0, 5).map((rider, i) => (
                <div key={rider.id} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: '#eef1fb', color: '#3454d1' }}>{i + 1}</span>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg, #3454d1, #3dc7be)' }}>
                    {rider.firstName[0]}{rider.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#283c50] truncate">{rider.firstName} {rider.lastName}</p>
                    <p className="text-[11px] text-[#9ca3af]">{rider._count?.orders ?? 0} orders · {rider.ratingCount} reviews</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-3.5 h-3.5 text-[#ffa21d]" fill="#ffa21d" />
                    <span className="text-sm font-bold text-[#283c50]">{rider.rating?.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Vendor Analytics ─────────────────────────────────────────────────────────

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
