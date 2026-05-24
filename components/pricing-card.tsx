'use client'

import { Check, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import type { PricingTier } from '@/types'

interface PricingCardProps {
  tier:      PricingTier
  yearly:    boolean
  loading?:  boolean
  onSelect?: (tier: PricingTier) => void
}

export function PricingCard({ tier, yearly, loading, onSelect }: PricingCardProps) {
  const price = yearly ? tier.price_yearly : tier.price_monthly
  const monthlyEquiv = yearly && tier.price_yearly > 0
    ? (tier.price_yearly / 12).toFixed(0)
    : null

  return (
    <div className={cn(
      'relative flex flex-col rounded-2xl border p-6 transition-all duration-300',
      tier.highlighted
        ? 'border-accent/30 bg-accent/[0.06] shadow-accent'
        : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14]'
    )}>
      {/* Popular badge */}
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent-600 text-white shadow-accent-sm">
            <Zap className="w-3 h-3" />
            {tier.badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <h3 className="font-semibold text-slate-100 text-lg">{tier.name}</h3>
        <p className="text-sm text-slate-500 mt-1">{tier.description}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-end gap-1.5">
          <span className="text-4xl font-bold text-slate-100 tabular-nums">
            ${monthlyEquiv ?? price}
          </span>
          {price > 0 && (
            <span className="text-slate-500 text-sm pb-1.5">/mo</span>
          )}
        </div>
        {yearly && monthlyEquiv && (
          <p className="text-xs text-emerald-400 mt-1">
            Billed ${tier.price_yearly}/year · Save ${(tier.price_monthly * 12 - tier.price_yearly).toFixed(0)}/yr
          </p>
        )}
        {tier.price_monthly === 0 && (
          <p className="text-xs text-slate-600 mt-1">No credit card required</p>
        )}
      </div>

      {/* CTA */}
      <Button
        variant={tier.highlighted ? 'primary' : 'outline'}
        className="w-full mb-6"
        loading={loading}
        onClick={() => onSelect?.(tier)}
      >
        {tier.price_monthly === 0 ? 'Get started free' : `Start ${tier.name}`}
      </Button>

      {/* Limits chips */}
      <div className="flex flex-wrap gap-2 mb-5 pb-5 border-b border-white/[0.06]">
        {[
          { label: typeof tier.limits.prompts === 'number' ? `${tier.limits.prompts} prompts` : 'Unlimited prompts' },
          { label: typeof tier.limits.enhancements_per_month === 'number' ? `${tier.limits.enhancements_per_month} enhances/mo` : 'Unlimited enhances' },
        ].map(chip => (
          <span key={chip.label} className="inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-medium bg-white/[0.05] text-slate-400 border border-white/[0.07]">
            {chip.label}
          </span>
        ))}
      </div>

      {/* Feature list */}
      <ul className="flex flex-col gap-2.5 flex-1">
        {tier.features.map(f => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-slate-400">
            <Check className={cn('w-4 h-4 mt-0.5 shrink-0', tier.highlighted ? 'text-accent-400' : 'text-emerald-500')} />
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}
