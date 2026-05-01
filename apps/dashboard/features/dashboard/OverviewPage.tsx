import StatsCard from './components/StatsCard'
import OrdersChart from './components/OrdersChart'
import DeliverySummaryCard from './components/DeliverySummaryCard'
import MetricSparkCard from './components/MetricSparkCard'
import CategoryDonut from './components/CategoryDonut'
import RecentOrdersTable from './components/RecentOrdersTable'
import UpcomingDeliveries from './components/UpcomingDeliveries'
import TopVendors from './components/TopVendors'
import TopRiders from './components/TopRiders'

import { ShoppingBag, Bike, TrendingUp, AlertTriangle } from 'lucide-react'
import { sparklineCompleted, sparklineNew, sparklineRider } from '@/lib/mock-data'

export default function OverviewPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#283c50] leading-tight">Overview</h1>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            {new Date().toLocaleDateString('en-NG', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}{' '}
            — Lagos, Nigeria
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-[#6b7885] bg-white border border-[#e5e7eb] rounded px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#17c666] animate-pulse" />
            Live data
          </span>
          <button className="btn-primary rounded flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Row 1 — Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Active Orders"
          sublabel="Orders in transit"
          current={45}
          total={120}
          trend={8}
          trendLabel="vs yesterday"
          icon={ShoppingBag}
          iconColor="#3454d1"
          iconBg="#eef1fb"
          delay={0}
        />
        <StatsCard
          label="Online Riders"
          sublabel="Currently available"
          current={28}
          total={64}
          trend={4}
          trendLabel="vs yesterday"
          icon={Bike}
          iconColor="#17c666"
          iconBg="#e8faf2"
          delay={100}
        />
        <StatsCard
          label="Today's GMV"
          sublabel="Gross merchandise value"
          current="₦1.24M"
          trend={12}
          trendLabel="vs yesterday"
          icon={TrendingUp}
          iconColor="#ffa21d"
          iconBg="#fff6e8"
          delay={200}
        />
        <StatsCard
          label="Pending Disputes"
          sublabel="Requires attention"
          current={3}
          total={12}
          trend={-2}
          trendLabel="vs yesterday"
          icon={AlertTriangle}
          iconColor="#ea4d4d"
          iconBg="#fdf0f0"
          delay={300}
        />
      </div>

      {/* Row 2 — Chart + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <OrdersChart />
        </div>
        <DeliverySummaryCard />
      </div>

      {/* Row 3 — Metric spark cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricSparkCard
          label="Orders Completed"
          current={22}
          total={35}
          data={sparklineCompleted}
          color="#3dc7be"
          gradientId="grad-completed"
          delay={0}
        />
        <MetricSparkCard
          label="New Orders Today"
          current={5}
          total={20}
          data={sparklineNew}
          color="#3454d1"
          gradientId="grad-new"
          delay={100}
        />
        <MetricSparkCard
          label="Rider Utilization"
          current={20}
          total={30}
          data={sparklineRider}
          color="#ea4d4d"
          gradientId="grad-rider"
          delay={200}
        />
      </div>

      {/* Row 4 — Donut + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CategoryDonut />
        <div className="lg:col-span-2">
          <RecentOrdersTable />
        </div>
      </div>

      {/* Row 5 — Bottom panels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <UpcomingDeliveries />
        <TopVendors />
        <TopRiders />
      </div>
    </div>
  )
}
