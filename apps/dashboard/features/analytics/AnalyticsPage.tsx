'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
import { useGetVendorsQuery } from '@/features/vendors/store/vendorsApi'
import { useGetDisputesQuery } from '@/store/services/disputesApi'
import { formatNaira, formatNumber } from '@/lib/utils'
import { hasPermission } from '@/lib/permissions'
import { Loader2, TrendingUp, ShoppingBag, Users, Store, Bike, Star, UserCheck, Shield, MessageSquareWarning } from 'lucide-react'
import type { GraphGranularity } from '@/types/api'

const TYPE_COLORS: Record<string, string> = {
  FOOD: '#1E5FFF', GROCERY: '#1DB980', RETAIL: '#E8930C',
  PHARMACY: '#FF6A2C', PARCEL: '#7A5AE0', TRUCK: '#FF3B30',
  RESTAURANT: '#1E5FFF', // Vendor.type value (distinct enum from Order.type's FOOD)
}
const VENDOR_STATUS_COLORS: Record<string, string> = {
  APPROVED: '#1DB980', PENDING: '#E8930C', REJECTED: '#FF3B30', SUSPENDED: '#9AA1B4',
}
const KYC_COLORS: Record<string, string> = {
  PENDING: '#E8930C', SUBMITTED: '#1E5FFF', VERIFIED: '#1DB980', REJECTED: '#FF3B30',
}
const VEHICLE_COLORS: Record<string, string> = {
  MOTORCYCLE: '#1E5FFF', BICYCLE: '#1DB980', CAR: '#E8930C', VAN: '#FF3B30',
}
const STATUS_COLORS: Record<string, string> = {
  DELIVERED: '#1DB980', IN_TRANSIT: '#1E5FFF', PENDING: '#E8930C',
  CANCELLED: '#FF3B30', ACCEPTED: '#FF6A2C', PREPARING: '#7A5AE0',
  READY_FOR_PICKUP: '#06b6d4', PICKED_UP: '#E8930C', FAILED: '#9AA1B4',
}

interface TooltipProps {
  active?: boolean
  payload?: { color: string; name: string; value: number; dataKey: string }[]
  label?: string
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E7EAF1] rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-[#0D1426] mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-[#525A72]">{p.name}:</span>
          <span className="font-semibold text-[#0D1426]">
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

type SystemTab = 'platform' | 'riders' | 'vendors'

function SystemAnalyticsView() {
  const [tab, setTab] = useState<SystemTab>('platform')
  const [granularity, setGranularity] = useState<GraphGranularity>('day')
  const { data: analytics, isLoading } = useGetSystemAnalyticsQuery()
  const { data: graph, isLoading: graphLoading } = useGetSystemGraphQuery({ granularity })
  const { data: openDisputes } = useGetDisputesQuery({ status: 'OPEN', limit: 1 })

  const chartData = graph?.points.map((p) => ({
    date: p.date.slice(5),
    Orders: p.orders,
    Revenue: p.revenueKobo,
    'New Users': p.newUsers,
  })) ?? []

  const s = analytics?.summary

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-[#1E5FFF]" />
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-[#E7EAF1]">
        {([
          { id: 'platform', label: 'Platform', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
          { id: 'riders',   label: 'Riders',   icon: <Bike className="w-3.5 h-3.5" /> },
          { id: 'vendors',  label: 'Vendors',  icon: <Store className="w-3.5 h-3.5" /> },
        ] as { id: SystemTab; label: string; icon: React.ReactNode }[]).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-[#1E5FFF] text-[#1E5FFF]'
                : 'border-transparent text-[#525A72] hover:text-[#0D1426]'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === 'riders' && <RidersAnalyticsView />}
      {tab === 'vendors' && <VendorsAnalyticsView analytics={analytics} />}
      {tab === 'platform' && <>
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Revenue', value: s ? formatNaira(s.totalRevenueKobo) : '—', icon: TrendingUp, color: '#E8930C', bg: '#FBEDD7' },
          { label: 'Total Orders', value: s ? formatNumber(s.totalOrders) : '—', icon: ShoppingBag, color: '#1E5FFF', bg: '#E7EEFF' },
          { label: 'Total Users', value: s ? formatNumber(s.totalUsers) : '—', icon: Users, color: '#1DB980', bg: '#DFF5EC' },
          { label: 'Active Vendors', value: s ? formatNumber(s.activeVendors) : '—', icon: Store, color: '#FF6A2C', bg: '#FFEAE1' },
          { label: 'Open Disputes', value: openDisputes ? formatNumber(openDisputes.meta.total) : '—', icon: MessageSquareWarning, color: '#FF3B30', bg: '#FFE3E1' },
        ].map((c) => (
          <div key={c.label} className="card p-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: c.bg }}>
              <c.icon style={{ color: c.color, width: 18, height: 18 }} />
            </div>
            <p className="text-lg font-bold text-[#0D1426]">{c.value}</p>
            <p className="text-xs text-[#525A72] mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue / Orders over time */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Revenue & Orders Over Time</h3>
          <div className="flex items-center gap-1 p-0.5 bg-[#EDF0F6] rounded">
            {granularities.map((g) => (
              <button
                key={g.value}
                onClick={() => setGranularity(g.value)}
                className="text-[11px] font-medium px-2.5 py-1 rounded transition-all"
                style={granularity === g.value
                  ? { backgroundColor: '#fff', color: '#1E5FFF', boxShadow: '0 1px 2px rgba(0,0,0,.08)' }
                  : { color: '#525A72' }}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          {graphLoading ? (
            <div className="h-[260px] flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-[#1E5FFF]" />
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF0F6" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9AA1B4' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9AA1B4' }} axisLine={false} tickLine={false} width={32} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Orders" stroke="#1E5FFF" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="New Users" stroke="#1DB980" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-xs text-[#9AA1B4]">No data available</div>
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF0F6" />
                  <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#9AA1B4' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9AA1B4' }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Orders" radius={[3, 3, 0, 0]}>
                    {analytics.ordersByType.map((entry, i) => (
                      <Cell key={i} fill={TYPE_COLORS[entry.type] ?? '#9AA1B4'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-xs text-[#9AA1B4]">No data</div>
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
                      <Cell key={i} fill={STATUS_COLORS[entry.status] ?? '#9AA1B4'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatNumber(v)} />
                  <Legend
                    formatter={(value) => <span style={{ fontSize: 11, color: '#525A72' }}>{value.replace('_', ' ')}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-xs text-[#9AA1B4]">No data</div>
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
                <tr className="border-b border-[#EDF0F6] bg-[#F7F9FC]">
                  {['Vendor', 'Type', 'Rating', 'Orders', 'Revenue'].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F9FC]">
                {analytics.topVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-[#F7F9FC] transition-colors">
                    <td className="px-4 py-2.5 text-xs font-medium text-[#0D1426]">{v.name}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-[11px] font-medium capitalize" style={{ color: TYPE_COLORS[v.type] ?? '#9AA1B4' }}>
                        {v.type.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-[#0D1426]">{v.rating?.toFixed(1) ?? '—'}</td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-[#1E5FFF]">{formatNumber(v.orders)}</td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-[#0D1426]">{formatNaira(v.revenueKobo)}</td>
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
      <Loader2 className="w-6 h-6 animate-spin text-[#1E5FFF]" />
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Riders', value: stats ? formatNumber(stats.total) : '—', icon: Bike, color: '#1E5FFF', bg: '#E7EEFF' },
          { label: 'Active Riders', value: stats ? formatNumber(stats.active) : '—', icon: UserCheck, color: '#1DB980', bg: '#DFF5EC' },
          { label: 'Online Now', value: stats ? formatNumber(stats.available) : '—', icon: Bike, color: '#E8930C', bg: '#FBEDD7' },
          { label: 'KYC Verified', value: stats ? formatNumber(stats.byKycStatus.VERIFIED ?? 0) : '—', icon: Shield, color: '#FF6A2C', bg: '#FFEAE1' },
        ].map((c) => (
          <div key={c.label} className="card p-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: c.bg }}>
              <c.icon style={{ color: c.color, width: 18, height: 18 }} />
            </div>
            <p className="text-lg font-bold text-[#0D1426]">{c.value}</p>
            <p className="text-xs text-[#525A72] mt-0.5">{c.label}</p>
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
                      <Cell key={i} fill={KYC_COLORS[entry.name] ?? '#9AA1B4'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatNumber(v)} />
                  <Legend formatter={(value) => (
                    <span style={{ fontSize: 11, color: '#525A72', textTransform: 'capitalize' }}>
                      {value.toLowerCase()}
                    </span>
                  )} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-xs text-[#9AA1B4]">No data</div>
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF0F6" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9AA1B4' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => v.charAt(0) + v.slice(1).toLowerCase()} />
                  <YAxis tick={{ fontSize: 10, fill: '#9AA1B4' }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip formatter={(v: number) => [formatNumber(v), 'Riders']} />
                  <Bar dataKey="value" name="Riders" radius={[3, 3, 0, 0]}>
                    {vehicleData.map((entry, i) => (
                      <Cell key={i} fill={VEHICLE_COLORS[entry.name] ?? '#9AA1B4'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-xs text-[#9AA1B4]">No data</div>
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
                <tr className="border-b border-[#EDF0F6] bg-[#F7F9FC]">
                  {['#', 'Rider', 'Vehicle', 'KYC', 'Rating', 'Orders', 'Status'].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F9FC]">
                {topRiders.map((rider, i) => {
                  const kycColor = KYC_COLORS[rider.kycStatus] ?? '#9AA1B4'
                  const kycBg = rider.kycStatus === 'VERIFIED' ? '#DFF5EC'
                    : rider.kycStatus === 'SUBMITTED' ? '#E7EEFF'
                    : rider.kycStatus === 'REJECTED' ? '#FFE3E1' : '#FBEDD7'
                  return (
                    <tr key={rider.id} className="hover:bg-[#F7F9FC] transition-colors">
                      <td className="px-4 py-2.5">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{ backgroundColor: '#E7EEFF', color: '#1E5FFF' }}>{i + 1}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                            style={{ background: 'linear-gradient(135deg, #1E5FFF, #FF6A2C)' }}>
                            {rider.firstName[0]}{rider.lastName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[#0D1426]">{rider.firstName} {rider.lastName}</p>
                            {rider.isAvailable && <span className="text-[10px] text-[#1DB980]">● Online</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-[#525A72] capitalize">{rider.vehicleType?.toLowerCase() ?? '—'}</span>
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
                            <Star className="w-3 h-3 text-[#E8930C]" fill="#E8930C" />
                            <span className="text-xs font-semibold text-[#0D1426]">{rider.rating.toFixed(1)}</span>
                          </div>
                        ) : <span className="text-xs text-[#9AA1B4]">—</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-bold text-[#1E5FFF]">{rider._count?.orders ?? 0}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-[11px] font-medium rounded-full px-2 py-0.5"
                          style={rider.isActive
                            ? { backgroundColor: '#DFF5EC', color: '#1DB980' }
                            : { backgroundColor: '#EDF0F6', color: '#9AA1B4' }}>
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
                    style={{ backgroundColor: '#E7EEFF', color: '#1E5FFF' }}>{i + 1}</span>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg, #1E5FFF, #FF6A2C)' }}>
                    {rider.firstName[0]}{rider.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#0D1426] truncate">{rider.firstName} {rider.lastName}</p>
                    <p className="text-[11px] text-[#9AA1B4]">{rider._count?.orders ?? 0} orders · {rider.ratingCount} reviews</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-3.5 h-3.5 text-[#E8930C]" fill="#E8930C" />
                    <span className="text-sm font-bold text-[#0D1426]">{rider.rating?.toFixed(1)}</span>
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

// ─── Vendors Analytics (system-admin, cross-vendor) ───────────────────────────

function VendorsAnalyticsView({ analytics }: { analytics: import('@/types/api').SystemAnalytics | undefined }) {
  const { data: vendors = [], isLoading: vendorsLoading } = useGetVendorsQuery()
  const s = analytics?.summary

  // Vendors created per month, last 6 months — same client-side-from-raw-list
  // approach the Riders tab uses (no dedicated backend endpoint needed).
  const monthsBack = 6
  const now = new Date()
  const months = Array.from({ length: monthsBack }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - i), 1)
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-US', { month: 'short' }) }
  })
  const growthCounts = vendors.reduce<Record<string, number>>((acc, v) => {
    const d = new Date(v.createdAt)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
  const growthData = months.map((m) => ({ date: m.label, Vendors: growthCounts[m.key] ?? 0 }))

  const typeCounts = vendors.reduce<Record<string, number>>((acc, v) => {
    acc[v.type] = (acc[v.type] ?? 0) + 1
    return acc
  }, {})
  const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }))

  if (!analytics && !vendorsLoading) return null

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Vendors', value: s ? formatNumber(s.totalVendors) : '—', icon: Store, color: '#1E5FFF', bg: '#E7EEFF' },
          { label: 'Active', value: s ? formatNumber(s.activeVendors) : '—', icon: UserCheck, color: '#1DB980', bg: '#DFF5EC' },
          { label: 'Pending', value: s ? formatNumber(s.pendingVendors) : '—', icon: Loader2, color: '#E8930C', bg: '#FBEDD7' },
          { label: 'Rejected', value: s ? formatNumber(s.rejectedVendors) : '—', icon: Shield, color: '#FF3B30', bg: '#FFE3E1' },
          { label: 'Suspended', value: s ? formatNumber(s.suspendedVendors) : '—', icon: Shield, color: '#9AA1B4', bg: '#EDF0F6' },
        ].map((c) => (
          <div key={c.label} className="card p-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: c.bg }}>
              <c.icon style={{ color: c.color, width: 18, height: 18 }} />
            </div>
            <p className="text-lg font-bold text-[#0D1426]">{c.value}</p>
            <p className="text-xs text-[#525A72] mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* New vendors over time */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">New Vendors (last 6 months)</h3></div>
          <div className="p-4">
            {vendorsLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-[#1E5FFF]" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={growthData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF0F6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9AA1B4' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9AA1B4' }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                  <Tooltip formatter={(v: number) => [formatNumber(v), 'Vendors']} />
                  <Bar dataKey="Vendors" fill="#1E5FFF" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Vendor type breakdown */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Vendors by Type</h3></div>
          <div className="p-4">
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    paddingAngle={2} dataKey="value" nameKey="name">
                    {typeData.map((entry, i) => (
                      <Cell key={i} fill={TYPE_COLORS[entry.name] ?? '#9AA1B4'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatNumber(v)} />
                  <Legend formatter={(value) => (
                    <span style={{ fontSize: 11, color: '#525A72', textTransform: 'capitalize' }}>
                      {value.toLowerCase()}
                    </span>
                  )} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-xs text-[#9AA1B4]">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* Top vendors by orders/revenue */}
      {analytics?.topVendors?.length ? (
        <div className="card overflow-hidden">
          <div className="card-header"><h3 className="card-title">Top Performing Vendors</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EDF0F6] bg-[#F7F9FC]">
                  {['Vendor', 'Type', 'Rating', 'Orders', 'Revenue'].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F9FC]">
                {analytics.topVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-[#F7F9FC] transition-colors">
                    <td className="px-4 py-2.5 text-xs font-medium text-[#0D1426]">{v.name}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-[11px] font-medium capitalize" style={{ color: TYPE_COLORS[v.type] ?? '#9AA1B4' }}>
                        {v.type.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-[#0D1426]">{v.rating?.toFixed(1) ?? '—'}</td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-[#1E5FFF]">{formatNumber(v.orders)}</td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-[#0D1426]">{formatNaira(v.revenueKobo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Vendor status breakdown */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">Vendors by Status</h3></div>
        <div className="p-4">
          {s ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'APPROVED', value: s.activeVendors },
                    { name: 'PENDING', value: s.pendingVendors },
                    { name: 'REJECTED', value: s.rejectedVendors },
                    { name: 'SUSPENDED', value: s.suspendedVendors },
                  ].filter((d) => d.value > 0)}
                  cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                  paddingAngle={2} dataKey="value" nameKey="name"
                >
                  {[
                    { name: 'APPROVED', value: s.activeVendors },
                    { name: 'PENDING', value: s.pendingVendors },
                    { name: 'REJECTED', value: s.rejectedVendors },
                    { name: 'SUSPENDED', value: s.suspendedVendors },
                  ].filter((d) => d.value > 0).map((entry, i) => (
                    <Cell key={i} fill={VENDOR_STATUS_COLORS[entry.name] ?? '#9AA1B4'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatNumber(v)} />
                <Legend formatter={(value) => (
                  <span style={{ fontSize: 11, color: '#525A72', textTransform: 'capitalize' }}>
                    {value.toLowerCase()}
                  </span>
                )} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-xs text-[#9AA1B4]">No data</div>
          )}
        </div>
      </div>
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
      <Loader2 className="w-6 h-6 animate-spin text-[#1DB980]" />
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: s ? formatNaira(s.totalRevenueKobo) : '—', color: '#E8930C', bg: '#FBEDD7' },
          { label: 'Total Orders', value: s ? formatNumber(s.totalOrders) : '—', color: '#1E5FFF', bg: '#E7EEFF' },
          { label: 'Completed', value: s ? formatNumber(s.completedOrders) : '—', color: '#1DB980', bg: '#DFF5EC' },
          { label: 'Avg. Order Value', value: s ? formatNaira(s.avgOrderValueKobo) : '—', color: '#FF6A2C', bg: '#FFEAE1' },
        ].map((c) => (
          <div key={c.label} className="card p-4">
            <p className="text-lg font-bold text-[#0D1426]" style={{ color: c.color }}>{c.value}</p>
            <p className="text-xs text-[#525A72] mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Orders Over Time</h3>
          <div className="flex items-center gap-1 p-0.5 bg-[#EDF0F6] rounded">
            {granularities.map((g) => (
              <button
                key={g.value}
                onClick={() => setGranularity(g.value)}
                className="text-[11px] font-medium px-2.5 py-1 rounded transition-all"
                style={granularity === g.value
                  ? { backgroundColor: '#fff', color: '#1DB980', boxShadow: '0 1px 2px rgba(0,0,0,.08)' }
                  : { color: '#525A72' }}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          {graphLoading ? (
            <div className="h-[260px] flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-[#1DB980]" />
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF0F6" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9AA1B4' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9AA1B4' }} axisLine={false} tickLine={false} width={32} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="Orders" fill="#1DB980" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-xs text-[#9AA1B4]">No data available</div>
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
                      <Cell key={i} fill={STATUS_COLORS[entry.status] ?? '#9AA1B4'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatNumber(v)} />
                  <Legend formatter={(value) => <span style={{ fontSize: 11, color: '#525A72' }}>{value.replace('_', ' ')}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-xs text-[#9AA1B4]">No data</div>
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
                    <span className="w-5 h-5 rounded-full bg-[#E7EEFF] flex items-center justify-center text-[10px] font-bold text-[#1E5FFF] shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#0D1426] truncate">{p.name}</p>
                      <p className="text-[11px] text-[#9AA1B4]">{formatNumber(p.orders)} orders</p>
                    </div>
                    <span className="text-xs font-semibold text-[#0D1426] shrink-0">{formatNaira(p.revenueKobo)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[140px] text-xs text-[#9AA1B4]">No data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const admin = session?.admin
  const isVendor = admin?.type === 'VENDOR'
  const isVendorStaff = isVendor && !hasPermission(session, 'analytics:read')

  useEffect(() => {
    if (isVendorStaff) router.replace('/orders')
  }, [isVendorStaff, router])

  if (isVendorStaff) return null

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-[#0D1426]">Analytics</h1>
        <p className="text-xs text-[#9AA1B4] mt-0.5">
          {isVendor ? 'Your vendor performance data' : 'Platform-wide analytics and insights'}
        </p>
      </div>
      {isVendor ? <VendorAnalyticsView /> : <SystemAnalyticsView />}
    </div>
  )
}
