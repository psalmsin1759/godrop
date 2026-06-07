'use client'

import { ShoppingBag, TrendingUp, AlertTriangle, Store, Users, Loader2, Bike, Star } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useGetSystemAnalyticsQuery, useGetSystemGraphQuery } from '@/store/services/analyticsApi'
import { useGetRiderStatsQuery } from '@/store/services/ridersApi'
import { useGetRidersQuery } from '@/store/services/ridersApi'
import { formatNaira, formatNumber } from '@/lib/utils'

const TYPE_COLORS: Record<string, string> = {
  FOOD: '#1E5FFF',
  GROCERY: '#1DB980',
  RETAIL: '#E8930C',
  PHARMACY: '#FF6A2C',
  PARCEL: '#7A5AE0',
  TRUCK: '#FF3B30',
}

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: '#1DB980',
  IN_TRANSIT: '#1E5FFF',
  PENDING: '#E8930C',
  CANCELLED: '#FF3B30',
  ACCEPTED: '#FF6A2C',
  PREPARING: '#7A5AE0',
  READY_FOR_PICKUP: '#06b6d4',
  PICKED_UP: '#E8930C',
  FAILED: '#9AA1B4',
}

interface TooltipProps {
  active?: boolean
  payload?: { color: string; name: string; value: number }[]
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
              ? { backgroundColor: '#DFF5EC', color: '#1DB980' }
              : { backgroundColor: '#FFE3E1', color: '#FF3B30' }}
          >
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-lg font-bold text-[#0D1426] leading-none">{value}</p>
      <p className="text-xs font-medium text-[#525A72] mt-1">{label}</p>
      <p className="text-[11px] text-[#9AA1B4] mt-0.5">{sublabel}</p>
    </div>
  )
}

const KYC_COLORS: Record<string, string> = {
  PENDING: '#E8930C', SUBMITTED: '#1E5FFF', VERIFIED: '#1DB980', REJECTED: '#FF3B30',
}

export default function SystemOverviewPage() {
  const { data: analytics, isLoading } = useGetSystemAnalyticsQuery()
  const { data: graph } = useGetSystemGraphQuery()
  const { data: riderStats } = useGetRiderStatsQuery()
  const { data: ridersData } = useGetRidersQuery({ page: 1, limit: 5 })

  const chartData = graph?.points.slice(-14).map((p) => ({
    date: p.date.slice(5),
    Orders: p.orders,
    Revenue: p.revenueKobo,
    Users: p.newUsers,
  })) ?? []

  const typeData = analytics?.ordersByType?.map((t) => ({
    name: t.type,
    value: t.count,
    color: TYPE_COLORS[t.type] ?? '#9AA1B4',
  })) ?? []

  const s = analytics?.summary

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#1E5FFF]" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#0D1426] leading-tight">Platform Overview</h1>
          <p className="text-xs text-[#9AA1B4] mt-0.5">
            {new Date().toLocaleDateString('en-NG', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}{' '}— Lagos, Nigeria
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-[#525A72] bg-white border border-[#E7EAF1] rounded px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1DB980] animate-pulse" />
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
          iconColor="#1E5FFF"
          iconBg="#E7EEFF"
        />
        <StatCard
          label="Platform Revenue"
          sublabel="Paid orders"
          value={s ? formatNaira(s.totalRevenueKobo) : '—'}
          icon={TrendingUp}
          iconColor="#E8930C"
          iconBg="#FBEDD7"
        />
        <StatCard
          label="Total Users"
          sublabel={s ? `${formatNumber(s.newUsers)} new this period` : 'Registered customers'}
          value={s ? formatNumber(s.totalUsers) : '—'}
          icon={Users}
          iconColor="#1DB980"
          iconBg="#DFF5EC"
        />
        <StatCard
          label="Active Vendors"
          sublabel={s ? `${s.pendingVendors} pending review` : 'Approved vendors'}
          value={s ? formatNumber(s.activeVendors) : '—'}
          icon={Store}
          iconColor="#FF6A2C"
          iconBg="#FFEAE1"
        />
      </div>

      {/* Rider stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Riders"
          sublabel="All registered"
          value={riderStats ? formatNumber(riderStats.total) : '—'}
          icon={Bike}
          iconColor="#1E5FFF"
          iconBg="#E7EEFF"
        />
        <StatCard
          label="Active Riders"
          sublabel="Account enabled"
          value={riderStats ? formatNumber(riderStats.active) : '—'}
          icon={Bike}
          iconColor="#1DB980"
          iconBg="#DFF5EC"
        />
        <StatCard
          label="Online Now"
          sublabel="Available for dispatch"
          value={riderStats ? formatNumber(riderStats.available) : '—'}
          icon={Bike}
          iconColor="#E8930C"
          iconBg="#FBEDD7"
        />
        <StatCard
          label="KYC Verified"
          sublabel={riderStats ? `${(riderStats.byKycStatus.PENDING ?? 0) + (riderStats.byKycStatus.SUBMITTED ?? 0)} awaiting review` : 'Verified riders'}
          value={riderStats ? formatNumber(riderStats.byKycStatus.VERIFIED ?? 0) : '—'}
          icon={Bike}
          iconColor="#FF6A2C"
          iconBg="#FFEAE1"
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF0F6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9AA1B4' }} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={{ fontSize: 10, fill: '#9AA1B4' }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(52,84,209,0.04)' }} />
                  <Bar dataKey="Orders" fill="#1E5FFF" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Users" fill="#1DB980" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-xs text-[#9AA1B4]">
                No chart data available
              </div>
            )}
            <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-[#EDF0F6]">
              <div>
                <p className="text-[11px] text-[#9AA1B4]">Completed Orders</p>
                <p className="text-sm font-bold text-[#0D1426]">{s ? formatNumber(s.completedOrders) : '—'}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#9AA1B4]">Total Vendors</p>
                <p className="text-sm font-bold text-[#0D1426]">{s ? formatNumber(s.totalVendors) : '—'}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#9AA1B4]">Completion Rate</p>
                <p className="text-sm font-bold text-[#1DB980]">
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
                        <span className="text-[#525A72] capitalize">{t.name.toLowerCase()}</span>
                      </span>
                      <span className="font-semibold text-[#0D1426]">{formatNumber(t.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[140px] flex items-center justify-center text-xs text-[#9AA1B4]">
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
            <a href="/vendors" className="text-xs text-[#1E5FFF] hover:underline">View all</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EDF0F6] bg-[#F7F9FC]">
                  {['Vendor', 'Type', 'Rating', 'Orders', 'Revenue'].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F9FC]">
                {analytics.topVendors.slice(0, 5).map((v) => (
                  <tr key={v.id} className="hover:bg-[#F7F9FC] transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ background: 'linear-gradient(135deg, #1E5FFF, #FF6A2C)' }}
                        >
                          {v.name[0]}
                        </div>
                        <span className="text-xs font-medium text-[#0D1426]">{v.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[11px] font-medium capitalize" style={{ color: TYPE_COLORS[v.type] ?? '#9AA1B4' }}>
                        {v.type.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-[#0D1426] font-semibold">{v.rating?.toFixed(1) ?? '—'}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-semibold text-[#1E5FFF]">{formatNumber(v.orders)}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-semibold text-[#0D1426]">{formatNaira(v.revenueKobo)}</span>
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
                <p className="text-lg font-bold" style={{ color: STATUS_COLORS[s.status] ?? '#0D1426' }}>
                  {formatNumber(s.count)}
                </p>
                <p className="text-[10px] text-[#525A72] mt-0.5 capitalize">{s.status.replace('_', ' ').toLowerCase()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rider fleet section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* KYC breakdown donut */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Rider KYC Status</h3>
          </div>
          <div className="p-4">
            {riderStats ? (() => {
              const kycData = Object.entries(riderStats.byKycStatus)
                .filter(([, v]) => v > 0)
                .map(([k, v]) => ({ name: k, value: v }))
              return kycData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={kycData} cx="50%" cy="50%" innerRadius={38} outerRadius={60}
                        paddingAngle={2} dataKey="value">
                        {kycData.map((entry, i) => (
                          <Cell key={i} fill={KYC_COLORS[entry.name] ?? '#9AA1B4'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatNumber(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {kycData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: KYC_COLORS[d.name] ?? '#9AA1B4' }} />
                          <span className="text-[#525A72] capitalize">{d.name.toLowerCase()}</span>
                        </span>
                        <span className="font-semibold text-[#0D1426]">{formatNumber(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[140px] flex items-center justify-center text-xs text-[#9AA1B4]">No data</div>
              )
            })() : (
              <div className="h-[140px] flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-[#1E5FFF]" />
              </div>
            )}
          </div>
        </div>

        {/* Top riders table */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="card-header">
            <h3 className="card-title">Top Riders by Orders</h3>
            <a href="/riders" className="text-xs text-[#1E5FFF] hover:underline">View all</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EDF0F6] bg-[#F7F9FC]">
                  {['Rider', 'Vehicle', 'Rating', 'Orders', 'Status'].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-2.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F9FC]">
                {ridersData?.data && ridersData.data.length > 0 ? (
                  [...ridersData.data]
                    .sort((a, b) => (b._count?.orders ?? 0) - (a._count?.orders ?? 0))
                    .slice(0, 5)
                    .map((rider) => (
                      <tr key={rider.id} className="hover:bg-[#F7F9FC] transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                              style={{ background: 'linear-gradient(135deg, #1E5FFF, #FF6A2C)' }}>
                              {rider.firstName[0]}{rider.lastName[0]}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-[#0D1426]">{rider.firstName} {rider.lastName}</p>
                              {rider.isAvailable && (
                                <span className="text-[10px] text-[#1DB980]">● Online</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs text-[#525A72] capitalize">{rider.vehicleType?.toLowerCase() ?? '—'}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          {rider.rating != null ? (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-[#E8930C]" fill="#E8930C" />
                              <span className="text-xs font-semibold text-[#0D1426]">{rider.rating.toFixed(1)}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-[#9AA1B4]">—</span>
                          )}
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
                    ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-xs text-[#9AA1B4]">No rider data.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
