import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  sublabel: string
  current: number | string
  total?: number | string
  trend?: number
  trendLabel?: string
  icon: LucideIcon
  iconColor: string
  iconBg: string
  delay?: number
}

export default function StatsCard({
  label,
  sublabel,
  current,
  total,
  trend,
  trendLabel,
  icon: Icon,
  iconColor,
  iconBg,
  delay = 0,
}: StatsCardProps) {
  const isPositive = trend !== undefined && trend >= 0

  return (
    <div
      className="card p-4 animate-fade-in"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-[#6b7885] font-medium">{label}</p>
          <p className="text-[11px] text-[#9ca3af] mt-0.5">{sublabel}</p>
        </div>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color: iconColor, width: 18, height: 18 }} strokeWidth={2} />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-[#283c50] leading-none">{current}</span>
            {total !== undefined && (
              <span className="text-sm text-[#9ca3af] leading-none">/ {total}</span>
            )}
          </div>
        </div>

        {trend !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5',
              isPositive
                ? 'bg-[#e8faf2] text-[#17c666]'
                : 'bg-[#fdf0f0] text-[#ea4d4d]'
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
            ) : (
              <TrendingDown className="w-3 h-3" strokeWidth={2.5} />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      {trendLabel && (
        <p className="text-[11px] text-[#9ca3af] mt-1.5">{trendLabel}</p>
      )}
    </div>
  )
}
