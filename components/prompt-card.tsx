'use client'

import Link from 'next/link'
import { Heart, Copy, Trash2, MoreHorizontal, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { cn, categoryIcon, modelLabel, relativeTime, truncate } from '@/lib/utils'
import { ScoreBadge } from './score-badge'
import { Badge } from './ui/badge'
import type { Prompt } from '@/types'

interface PromptCardProps {
  prompt:          Prompt
  onDelete?:       (id: string) => void
  onToggleFavorite?: (id: string, current: boolean) => void
  className?:      string
}

export function PromptCard({ prompt, onDelete, onToggleFavorite, className }: PromptCardProps) {
  const [copied,  setCopied]  = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(prompt.prompt_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.02]',
        'hover:bg-white/[0.04] hover:border-white/[0.13] hover:-translate-y-0.5',
        'transition-all duration-200 shadow-card',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <span className="text-xl shrink-0 mt-0.5" title={prompt.category}>
          {categoryIcon(prompt.category)}
        </span>
        <div className="flex-1 min-w-0">
          <Link
            href={`/vault/${prompt.id}`}
            className="font-semibold text-slate-100 text-sm leading-snug hover:text-accent-400 transition-colors line-clamp-1"
          >
            {prompt.title}
          </Link>
          {prompt.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{prompt.description}</p>
          )}
        </div>
        <ScoreBadge score={prompt.score} size="sm" />
      </div>

      {/* Prompt preview */}
      <div className="px-4 pb-3">
        <p className="text-xs text-slate-500 font-mono leading-relaxed line-clamp-2 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.05]">
          {truncate(prompt.prompt_text, 140)}
        </p>
      </div>

      {/* Meta chips */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        <Badge variant="muted" size="sm">{modelLabel(prompt.target_model)}</Badge>
        <Badge variant="muted" size="sm">{prompt.output_type}</Badge>
        {prompt.tags?.slice(0, 2).map(tag => (
          <Badge key={tag.id} variant="default" size="sm">#{tag.name}</Badge>
        ))}
        {(prompt.tags?.length ?? 0) > 2 && (
          <Badge variant="muted" size="sm">+{(prompt.tags?.length ?? 0) - 2}</Badge>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-white/[0.05] mt-auto">
        <span className="text-[11px] text-slate-600">{relativeTime(prompt.created_at)}</span>

        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleFavorite?.(prompt.id, prompt.is_favorite)}
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
              prompt.is_favorite
                ? 'text-red-400 bg-red-500/10'
                : 'text-slate-600 hover:text-red-400 hover:bg-red-500/10'
            )}
            title={prompt.is_favorite ? 'Unfavorite' : 'Favorite'}
          >
            <Heart className={cn('w-3.5 h-3.5', prompt.is_favorite && 'fill-current')} />
          </button>

          <button
            onClick={handleCopy}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
            title="Copy prompt"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <Link
            href={`/vault/${prompt.id}`}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
            title="Open"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {onDelete && (
            <button
              onClick={() => onDelete(prompt.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {copied && (
          <span className="absolute bottom-2 right-3 text-[11px] text-emerald-400 font-medium animate-fade-in">
            Copied!
          </span>
        )}
      </div>
    </div>
  )
}
