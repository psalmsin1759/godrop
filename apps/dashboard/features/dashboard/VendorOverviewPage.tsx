'use client'

import { ShoppingBag, TrendingUp, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useGetVendorAnalyticsQuery, useGetVendorGraphQuery } from '@/store/services/analyticsApi'
import { useGetVendorSettingsQuery, useUpdateVendorSettingsMutation } from '@/store/services/teamApi'
import { formatNaira, formatNumber } from '@/lib/utils'
import { useSession } from 'next-auth/react'

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
  label, sublabel, value, icon: Icon, iconColor, iconBg,
}: {
  label: string
  sublabel: string
  value: string | number
  icon: React.ElementType
  iconColor: string
  iconBg: string
}) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg }}>
          <Icon style={{ color: iconColor, width: 18, height: 18 }} />
        </div>
      </div>
      <p className="text-lg font-bold text-[#0D1426] leading-none">{value}</p>
      <p className="text-xs font-medium text-[#525A72] mt-1">{label}</p>
      <p className="text-[11px] text-[#9AA1B4] mt-0.5">{sublabel}</p>
    </div>
  )
}

export default function VendorOverviewPage() {
  const { data: session } = useSession()
  const { data: analytics, isLoading } = useGetVendorAnalyticsQuery()
  const { data: graph } = useGetVendorGraphQuery()
  const { data: settings } = useGetVendorSettingsQuery()
  const [updateSettings, { isLoading: togglingOpen }] = useUpdateVendorSettingsMutation()

  async function toggleOpen() {
    if (!settings) return
    await updateSettings({ isOpen: !settings.isOpen })
  }

  const chartData = graph?.points.slice(-14).map((p) => ({
    date: p.date.slice(5),
    Orders: p.orders,
    Revenue: p.revenueKobo,
  })) ?? []

  const statusData = analytics?.ordersByStatus?.map((s) => ({
    name: s.status,
    value: s.count,
    color: STATUS_COLORS[s.status] ?? '#9AA1B4',
  })) ?? []

  const sum = analytics?.summary

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#1DB980]" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#0D1426] leading-tight">Vendor Dashboard</h1>
          <p className="text-xs text-[#9AA1B4] mt-0.5">
            Welcome back, {session?.admin?.firstName} · {new Date().toLocaleDateString('en-NG', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {settings != null && (
            <button
              onClick={toggleOpen}
              disabled={togglingOpen}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all disabled:opacity-60"
              style={settings.isOpen
                ? { backgroundColor: '#DFF5EC', color: '#1DB980', borderColor: '#A8E6CC' }
                : { backgroundColor: '#EDF0F6', color: '#525A72', borderColor: '#E7EAF1' }}
            >
              {togglingOpen
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <span className={`w-1.5 h-1.5 rounded-full ${settings.isOpen ? 'bg-[#1DB980] animate-pulse' : 'bg-[#9AA1B4]'}`} />}
              {settings.isOpen ? 'Store Open' : 'Store Closed'}
            </button>
          )}
          <span className="flex items-center gap-1.5 text-xs text-[#525A72] bg-white border border-[#E7EAF1] rounded px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1DB980] animate-pulse" />
            Live data
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          sublabel="All time"
          value={sum ? formatNumber(sum.totalOrders) : '—'}
          icon={ShoppingBag}
          iconColor="#1E5FFF"
          iconBg="#E7EEFF"
        />
        <StatCard
          label="Total Revenue"
          sublabel="Paid orders"
          value={sum ? formatNaira(sum.totalRevenueKobo) : '—'}
          icon={TrendingUp}
          iconColor="#E8930C"
          iconBg="#FBEDD7"
        />
        <StatCard
          label="Completed"
          sublabel="Delivered orders"
          value={sum ? formatNumber(sum.completedOrders) : '—'}
          icon={CheckCircle}
          iconColor="#1DB980"
          iconBg="#DFF5EC"
        />
        <StatCard
          label="Cancelled"
          sublabel="Cancelled orders"
          value={sum ? formatNumber(sum.cancelledOrders) : '—'}
          icon={XCircle}
          iconColor="#FF3B30"
          iconBg="#FFE3E1"
        />
      </div>

      {/* Chart + Status donut */}
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
                  <Bar dataKey="Orders" fill="#1DB980" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-xs text-[#9AA1B4]">
                No chart data available
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-[#EDF0F6]">
              <div>
                <p className="text-[11px] text-[#9AA1B4]">Avg. Order Value</p>
                <p className="text-sm font-bold text-[#0D1426]">{sum ? formatNaira(sum.avgOrderValueKobo) : '—'}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#9AA1B4]">Completion Rate</p>
                <p className="text-sm font-bold text-[#1DB980]">
                  {sum && sum.totalOrders > 0
                    ? `${((sum.completedOrders / sum.totalOrders) * 100).toFixed(1)}%`
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status donut */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Order Status</h3>
          </div>
          <div className="p-4">
            {statusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%" cy="50%"
                      innerRadius={40} outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatNumber(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {statusData.map((s) => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-[#525A72] capitalize">{s.name.replace('_', ' ').toLowerCase()}</span>
                      </span>
                      <span className="font-semibold text-[#0D1426]">{formatNumber(s.value)}</span>
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

      {/* Top products */}
      {analytics?.topProducts && analytics.topProducts.length > 0 && (
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="card-title">Top Products</h3>
            <a href="/catalog" className="text-xs text-[#1DB980] hover:underline">Manage catalog</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EDF0F6] bg-[#F7F9FC]">
                  {['Product', 'Orders', 'Revenue'].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-[#9AA1B4] uppercase tracking-wide px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F9FC]">
                {analytics.topProducts.map((p) => (
                  <tr key={p.name} className="hover:bg-[#F7F9FC] transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-medium text-[#0D1426]">{p.name}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-semibold text-[#1E5FFF]">{formatNumber(p.orders)}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-semibold text-[#0D1426]">{formatNaira(p.revenueKobo)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
