'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Wand2, Sparkles, Vault, Settings,
  Zap, ChevronRight, Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard', href: '/dashboard',  icon: LayoutDashboard },
  { label: 'Builder',   href: '/builder',    icon: Wand2 },
  { label: 'Enhancer',  href: '/enhancer',   icon: Sparkles },
  { label: 'Vault',     href: '/vault',      icon: Vault },
] as const

const BOTTOM_NAV = [
  { label: 'Settings', href: '/settings', icon: Settings },
] as const

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-60 flex flex-col border-r border-white/[0.07] bg-[#07070f]/90 backdrop-blur-xl z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/[0.07] shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-accent-sm">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-slate-100 tracking-tight">Prompt OS</span>
      </div>

      {/* New prompt CTA */}
      <div className="px-3 pt-4">
        <Link
          href="/builder"
          className={cn(
            'flex items-center gap-2 w-full h-9 px-3 rounded-lg text-sm font-medium',
            'bg-accent-600/20 text-accent-400 border border-accent/20',
            'hover:bg-accent-600/30 hover:border-accent/35 hover:text-accent-300',
            'transition-all duration-200'
          )}
        >
          <Plus className="w-4 h-4" />
          New Prompt
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-3 pt-4 flex flex-col gap-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-3 mb-2">
          Workspace
        </p>
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 h-9 px-3 rounded-lg text-sm transition-all duration-150 group',
                active
                  ? 'bg-accent/10 text-accent-400 border border-accent/15 font-medium'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-accent-400' : 'text-slate-500 group-hover:text-slate-300')} />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-accent-500" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 pb-4 border-t border-white/[0.07] pt-3 flex flex-col gap-0.5">
        {BOTTOM_NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 h-9 px-3 rounded-lg text-sm transition-all duration-150',
                active
                  ? 'bg-accent/10 text-accent-400 border border-accent/15 font-medium'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}

        {/* User strip */}
        <Link
          href="/settings"
          className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.05] transition-colors group"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-300 truncate">My Account</p>
            <p className="text-[10px] text-slate-600 truncate">Free Plan</p>
          </div>
        </Link>
      </div>
    </aside>
  )
}
