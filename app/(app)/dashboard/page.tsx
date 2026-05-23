import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Wand2, Sparkles, Vault, ArrowRight, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { TopNav } from '@/components/top-nav'
import { DashboardStatsGrid } from '@/components/dashboard-stats'
import { PromptCard } from '@/components/prompt-card'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import type { Prompt, DashboardStats, PromptCategory } from '@/types'

async function getDashboardData(userId: string) {
  const supabase = await createClient()
  const weekAgo  = new Date(Date.now() - 7 * 864e5).toISOString()

  const [{ data: prompts }, { count: weekCount }] = await Promise.all([
    supabase
      .from('prompts')
      .select('*, tags:prompt_tags(tag:tags(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('prompts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', weekAgo),
  ])

  const all = prompts ?? []
  const avgScore = all.filter(p => p.score !== null).reduce((s, p, _, a) => s + p.score / a.length, 0)

  const catCounts = all.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1
    return acc
  }, {})
  const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as PromptCategory | null

  const stats: DashboardStats = {
    total_prompts:     all.length,
    avg_score:         Math.round(avgScore),
    prompts_this_week: weekCount ?? 0,
    top_category:      topCategory,
    score_trend:       2, // placeholder — calculate from historical data
  }

  return { prompts: all as unknown as Prompt[], stats }
}

const QUICK_ACTIONS = [
  { label: 'Build a prompt',    href: '/builder',  icon: Wand2,    desc: 'Create from scratch' },
  { label: 'Enhance a prompt',  href: '/enhancer', icon: Sparkles, desc: 'Improve existing prompts' },
  { label: 'Browse the vault',  href: '/vault',    icon: Vault,    desc: 'Search your library' },
] as const

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { prompts, stats } = await getDashboardData(user.id)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex flex-col flex-1">
      <TopNav
        title={`${greeting} 👋`}
        subtitle="Here's your prompt workspace"
        action={
          <Link href="/builder">
            <Button size="sm">New Prompt</Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 flex flex-col gap-8 max-w-6xl">
        {/* Stats */}
        <section>
          <DashboardStatsGrid stats={stats} />
        </section>

        {/* Quick actions */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_ACTIONS.map(({ label, href, icon: Icon, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.13] hover:bg-white/[0.04] transition-all duration-200 group"
              >
                <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0 group-hover:bg-accent/15 transition-colors">
                  <Icon className="w-4 h-4 text-accent-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{label}</p>
                  <p className="text-xs text-slate-600">{desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-700 ml-auto group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </section>

        {/* Recent prompts */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-600" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-600">Recent Prompts</h2>
            </div>
            <Link href="/vault" className="text-xs text-slate-500 hover:text-accent-400 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {prompts.length === 0 ? (
            <EmptyState
              icon="📝"
              title="No prompts yet"
              description="Build your first prompt and it'll appear here."
              action={{ label: 'Build a prompt', href: '/builder' }}
            />
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {prompts.map(prompt => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
