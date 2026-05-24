'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, ArrowLeft } from 'lucide-react'
import { PricingCard } from '@/components/pricing-card'
import { PRICING_TIERS } from '@/lib/stripe'
import type { PricingTier } from '@/types'
import { cn } from '@/lib/utils'

export default function PricingPage() {
  const [yearly, setYearly]   = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  async function handleSelect(tier: PricingTier) {
    if (tier.id === 'free') {
      window.location.href = '/signup'
      return
    }

    setLoading(tier.id)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ tier: tier.id, yearly }),
      })

      if (res.status === 401) {
        window.location.href = `/login?redirect=/pricing`
        return
      }

      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Checkout failed')
      window.location.href = data.url
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not start checkout')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#07070f] text-slate-200">
      {/* Nav */}
      <nav className="flex items-center justify-between h-16 px-6 md:px-12 border-b border-white/[0.05]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-accent-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-100 tracking-tight">Prompt OS</span>
        </Link>
        <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to app
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4 tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
            Start free. Upgrade when you need more power. No hidden fees.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={cn('text-sm', !yearly ? 'text-slate-200' : 'text-slate-500')}>Monthly</span>
            <button
              onClick={() => setYearly(y => !y)}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors duration-200',
                yearly ? 'bg-accent-600' : 'bg-white/[0.10]'
              )}
            >
              <span className={cn(
                'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
                yearly && 'translate-x-5'
              )} />
            </button>
            <span className={cn('text-sm flex items-center gap-2', yearly ? 'text-slate-200' : 'text-slate-500')}>
              Yearly
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Save ~20%
              </span>
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5 items-start">
          {PRICING_TIERS.map(tier => (
            <PricingCard
              key={tier.id}
              tier={tier}
              yearly={yearly}
              loading={loading === tier.id}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-xl font-bold text-slate-200 text-center mb-8">Frequently asked questions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes, absolutely. Cancel your subscription at any time from your settings. You keep access until the end of your billing period.',
              },
              {
                q: 'What happens to my prompts if I downgrade?',
                a: 'Your prompts are never deleted. If you exceed the free plan limit, you\'ll be prompted to delete or export prompts before proceeding.',
              },
              {
                q: 'Is there a team plan?',
                a: 'Yes! The Team plan supports up to 10 members with a shared vault and analytics. Contact us for larger teams.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'We offer a 7-day refund policy on all paid plans. Contact support if you\'re not satisfied.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-2">{q}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
