'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WaitlistFormProps {
  source?:    string
  className?: string
  variant?:   'hero' | 'cta'
}

export function WaitlistForm({ source = 'landing', className, variant = 'hero' }: WaitlistFormProps) {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [count, setCount]     = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/waitlist').then(r => r.json()).then(d => setCount(d.count ?? null)).catch(() => {})
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not join waitlist')
      setDone(true)
      setCount(c => (c ?? 0) + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className={cn('flex flex-col items-center gap-3', className)}>
        <div className={cn(
          'inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
          variant === 'hero' ? 'h-12 px-5 text-sm' : 'h-11 px-4 text-sm'
        )}>
          <Check className="w-4 h-4" />
          You&apos;re on the list. We&apos;ll be in touch when early access opens.
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          className={cn(
            'flex-1 rounded-xl bg-white/[0.04] border border-white/[0.10] text-slate-100',
            'placeholder:text-slate-600 outline-none transition-all',
            'focus:border-accent/40 focus:bg-white/[0.06]',
            variant === 'hero' ? 'h-12 px-4 text-sm' : 'h-11 px-4 text-sm'
          )}
        />
        <button
          type="submit"
          disabled={loading}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all',
            'bg-accent-600 text-white hover:bg-accent-500 shadow-accent-sm',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            variant === 'hero' ? 'h-12 px-5 text-sm' : 'h-11 px-5 text-sm'
          )}
        >
          {loading ? 'Joining...' : 'Get early access'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      <p className="text-xs text-slate-600">
        {count !== null && count > 0
          ? <><span className="text-slate-400 font-medium tabular-nums">{count.toLocaleString()}</span> {count === 1 ? 'builder' : 'builders'} already on the waitlist</>
          : 'Be first in line · No spam, ever'}
      </p>
    </div>
  )
}
