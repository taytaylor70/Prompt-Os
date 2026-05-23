'use client'

import { Search, Bell, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface TopNavProps {
  title?:    string
  subtitle?: string
  action?:   React.ReactNode
}

export function TopNav({ title, subtitle, action }: TopNavProps) {
  const [query, setQuery] = useState('')
  const router            = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/vault?search=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="h-16 flex items-center gap-4 px-6 border-b border-white/[0.07] bg-[#07070f]/60 backdrop-blur-xl sticky top-0 z-20">
      {/* Title */}
      <div className="flex-1 min-w-0">
        {title && (
          <div>
            <h1 className="text-base font-semibold text-slate-100 leading-none">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="hidden md:flex items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search prompts…"
            className={cn(
              'w-52 h-8 pl-8 pr-3 rounded-lg text-xs bg-white/[0.04] border border-white/[0.07]',
              'text-slate-300 placeholder-slate-600',
              'focus:outline-none focus:border-accent/40 focus:w-72 focus:bg-white/[0.06]',
              'transition-all duration-300'
            )}
          />
        </div>
      </form>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {action}

        <Link
          href="/pricing"
          className="hidden sm:flex h-8 px-3 rounded-lg items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Upgrade
        </Link>

        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent-500" />
        </button>
      </div>
    </header>
  )
}
