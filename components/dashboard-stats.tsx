import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn, categoryIcon } from '@/lib/utils'
import type { DashboardStats } from '@/types'

interface StatCardProps {
  label:     string
  value:     string | number
  icon?:     string
  trend?:    number
  subtitle?: string
  accent?:   boolean
}

function StatCard({ label, value, icon, trend, subtitle, accent }: StatCardProps) {
  const trendPositive = trend !== undefined && trend > 0
  const trendNegative = trend !== undefined && trend < 0

  return (
    <div className={cn(
      'rounded-xl border p-5 flex flex-col gap-3',
      accent
        ? 'border-accent/20 bg-accent/[0.05]'
        : 'border-white/[0.08] bg-white/[0.02]'
    )}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        {icon && <span className="text-lg opacity-60">{icon}</span>}
      </div>

      <div>
        <p className="text-2xl font-bold text-slate-100 tabular-nums">{value}</p>
        {subtitle && <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>}
      </div>

      {trend !== undefined && (
        <div className={cn('flex items-center gap-1 text-xs font-medium', {
          'text-emerald-400': trendPositive,
          'text-red-400':     trendNegative,
          'text-slate-600':   !trendPositive && !trendNegative,
        })}>
          {trendPositive && <TrendingUp  className="w-3 h-3" />}
          {trendNegative && <TrendingDown className="w-3 h-3" />}
          {!trendPositive && !trendNegative && <Minus className="w-3 h-3" />}
          {trend > 0 ? `+${trend}` : trend} vs last week
        </div>
      )}
    </div>
  )
}

interface DashboardStatsProps {
  stats: DashboardStats
}

export function DashboardStatsGrid({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Prompts"
        value={stats.total_prompts}
        icon="📝"
        subtitle="Saved in vault"
      />
      <StatCard
        label="Average Score"
        value={stats.avg_score > 0 ? stats.avg_score.toFixed(1) : '—'}
        icon="⚡"
        subtitle="Across all prompts"
        accent={stats.avg_score >= 75}
        trend={stats.score_trend}
      />
      <StatCard
        label="This Week"
        value={stats.prompts_this_week}
        icon="🗓️"
        subtitle="New prompts created"
      />
      <StatCard
        label="Top Category"
        value={stats.top_category ? stats.top_category.charAt(0).toUpperCase() + stats.top_category.slice(1) : '—'}
        icon={stats.top_category ? categoryIcon(stats.top_category) : '🗂️'}
        subtitle="Most used category"
      />
    </div>
  )
}
