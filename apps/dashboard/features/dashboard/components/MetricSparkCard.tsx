'use client'

import { AreaChart, Area, ResponsiveContainer } from 'recharts'

interface MetricSparkCardProps {
  label: string
  current: number
  total: number
  data: { v: number }[]
  color: string
  gradientId: string
  delay?: number
}

export default function MetricSparkCard({
  label,
  current,
  total,
  data,
  color,
  gradientId,
  delay = 0,
}: MetricSparkCardProps) {
  const pct = Math.round((current / total) * 100)

  return (
    <div
      className="card overflow-hidden animate-fade-in"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs text-[#6b7885] font-medium">{label}</p>
          </div>
          <span
            className="text-[11px] font-bold rounded-full px-2 py-0.5"
            style={{ backgroundColor: `${color}18`, color }}
          >
            {pct}%
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-[#283c50] leading-none">{current}</span>
          <span className="text-sm text-[#9ca3af]">/ {total}</span>
        </div>
      </div>

      <div className="-mb-1">
        <ResponsiveContainer width="100%" height={56}>
          <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
