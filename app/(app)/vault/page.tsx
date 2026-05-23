'use client'

import { Search, SlidersHorizontal, Grid2X2, List } from 'lucide-react'
import { useState } from 'react'
import { TopNav } from '@/components/top-nav'
import { PromptCard } from '@/components/prompt-card'
import { CategoryFilter } from '@/components/category-filter'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { usePrompts } from '@/hooks/use-prompts'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { SortOption } from '@/types'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest',        label: 'Newest' },
  { value: 'oldest',        label: 'Oldest' },
  { value: 'highest_score', label: 'Highest Score' },
  { value: 'lowest_score',  label: 'Lowest Score' },
  { value: 'title_asc',     label: 'Title A→Z' },
]

export default function VaultPage() {
  const [view,       setView]       = useState<'grid' | 'list'>('grid')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const { prompts, loading, error, filters, updateFilter, deletePrompt, toggleFavorite } = usePrompts()

  const activeFilterCount = [
    filters.category !== 'all',
    filters.tags.length > 0,
    filters.target_model !== 'all',
  ].filter(Boolean).length

  return (
    <div className="flex flex-col flex-1">
      <TopNav
        title="Prompt Vault"
        subtitle={`${prompts.length} prompt${prompts.length !== 1 ? 's' : ''} saved`}
        action={
          <Link href="/builder">
            <Button size="sm">New Prompt</Button>
          </Link>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-52 shrink-0 border-r border-white/[0.07] overflow-y-auto p-4">
            <CategoryFilter
              selected={filters.category}
              onChange={cat => updateFilter('category', cat)}
              layout="sidebar"
            />
          </aside>
        )}

        {/* Main */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] sticky top-0 bg-[#07070f]/90 backdrop-blur-sm z-10">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                sidebarOpen ? 'bg-accent/10 text-accent-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]'
              )}
              title="Toggle sidebar"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
              <input
                value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
                placeholder="Search prompts…"
                className="w-full h-8 pl-8 pr-3 rounded-lg text-xs bg-white/[0.04] border border-white/[0.07] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>

            {activeFilterCount > 0 && (
              <Badge variant="accent" size="sm">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}</Badge>
            )}

            <div className="ml-auto flex items-center gap-2">
              <Select
                options={SORT_OPTIONS}
                value={filters.sort}
                onChange={e => updateFilter('sort', e.target.value as SortOption)}
                className="h-8 text-xs w-36"
              />

              <div className="flex rounded-lg border border-white/[0.08] overflow-hidden">
                <button
                  onClick={() => setView('grid')}
                  className={cn('w-8 h-8 flex items-center justify-center transition-colors', view === 'grid' ? 'bg-accent/15 text-accent-400' : 'text-slate-600 hover:text-slate-300')}
                >
                  <Grid2X2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={cn('w-8 h-8 flex items-center justify-center transition-colors border-l border-white/[0.08]', view === 'list' ? 'bg-accent/15 text-accent-400' : 'text-slate-600 hover:text-slate-300')}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex-1">
            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {loading ? (
              <div className={cn(
                'grid gap-4',
                view === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 max-w-3xl'
              )}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-48 rounded-xl border border-white/[0.07] bg-white/[0.02] animate-pulse" />
                ))}
              </div>
            ) : prompts.length === 0 ? (
              <EmptyState
                icon="🗄️"
                title={filters.search || filters.category !== 'all' ? 'No prompts match your filters' : 'Your vault is empty'}
                description={filters.search || filters.category !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Create your first prompt to get started.'}
                action={
                  filters.search || filters.category !== 'all'
                    ? { label: 'Clear filters', onClick: () => { updateFilter('search', ''); updateFilter('category', 'all') } }
                    : { label: 'Build a prompt', href: '/builder' }
                }
              />
            ) : (
              <div className={cn(
                'grid gap-4',
                view === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 max-w-3xl'
              )}>
                {prompts.map(prompt => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onDelete={deletePrompt}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
