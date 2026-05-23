'use client'

import { cn, categoryIcon } from '@/lib/utils'
import type { PromptCategory } from '@/types'

const CATEGORIES: { value: PromptCategory | 'all'; label: string }[] = [
  { value: 'all',          label: 'All' },
  { value: 'coding',       label: 'Coding' },
  { value: 'writing',      label: 'Writing' },
  { value: 'analysis',     label: 'Analysis' },
  { value: 'marketing',    label: 'Marketing' },
  { value: 'research',     label: 'Research' },
  { value: 'education',    label: 'Education' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'creative',     label: 'Creative' },
  { value: 'business',     label: 'Business' },
  { value: 'data',         label: 'Data' },
  { value: 'other',        label: 'Other' },
]

interface CategoryFilterProps {
  selected:  PromptCategory | 'all'
  onChange:  (cat: PromptCategory | 'all') => void
  counts?:   Partial<Record<PromptCategory | 'all', number>>
  layout?:   'sidebar' | 'pills'
  className?: string
}

export function CategoryFilter({ selected, onChange, counts, layout = 'sidebar', className }: CategoryFilterProps) {
  if (layout === 'pills') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={cn(
              'flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition-all duration-150',
              selected === value
                ? 'bg-accent/15 text-accent-400 border border-accent/25'
                : 'bg-white/[0.04] text-slate-500 border border-white/[0.07] hover:border-white/[0.12] hover:text-slate-300'
            )}
          >
            {value !== 'all' && <span>{categoryIcon(value)}</span>}
            {label}
            {counts?.[value] !== undefined && (
              <span className={cn('text-[10px] tabular-nums', selected === value ? 'text-accent-500' : 'text-slate-600')}>
                {counts[value]}
              </span>
            )}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-2 mb-1">
        Categories
      </p>
      {CATEGORIES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={cn(
            'flex items-center gap-2.5 h-8 px-2 rounded-lg text-sm transition-all duration-150 group w-full text-left',
            selected === value
              ? 'bg-accent/10 text-accent-400 border border-accent/15'
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
          )}
        >
          {value !== 'all' ? (
            <span className="w-4 text-center text-sm">{categoryIcon(value)}</span>
          ) : (
            <span className="w-4 text-center text-slate-500">◈</span>
          )}
          <span className="flex-1">{label}</span>
          {counts?.[value] !== undefined && (
            <span className={cn('text-[11px] tabular-nums', selected === value ? 'text-accent-500' : 'text-slate-700 group-hover:text-slate-500')}>
              {counts[value]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
