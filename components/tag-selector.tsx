'use client'

import { useState } from 'react'
import { X, Plus, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

const SUGGESTED_TAGS = [
  'coding', 'writing', 'analysis', 'marketing', 'research',
  'structured-output', 'creative', 'summarization', 'translation',
  'customer-success', 'automation', 'seo', 'email', 'sql',
]

interface TagSelectorProps {
  selected:   string[]
  onChange:   (tags: string[]) => void
  className?: string
  max?:       number
}

export function TagSelector({ selected, onChange, className, max = 10 }: TagSelectorProps) {
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)

  const available = SUGGESTED_TAGS.filter(t => !selected.includes(t))
  const filtered  = input
    ? available.filter(t => t.includes(input.toLowerCase()))
    : available

  function addTag(tag: string) {
    const clean = tag.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (!clean || selected.includes(clean) || selected.length >= max) return
    onChange([...selected, clean])
    setInput('')
  }

  function removeTag(tag: string) {
    onChange(selected.filter(t => t !== tag))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      addTag(input)
    }
    if (e.key === 'Backspace' && !input && selected.length > 0) {
      removeTag(selected[selected.length - 1])
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
        Tags
        <span className="ml-1 text-slate-600 normal-case">({selected.length}/{max})</span>
      </label>

      {/* Input + selected chips */}
      <div className={cn(
        'flex flex-wrap gap-1.5 min-h-[42px] p-2 rounded-lg',
        'border border-white/[0.08] bg-white/[0.03]',
        'focus-within:border-accent/40 focus-within:ring-1 focus-within:ring-accent/15',
        'transition-all duration-200'
      )}>
        {selected.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 h-6 px-2 rounded-full text-[11px] font-medium bg-accent/10 text-accent-400 border border-accent/20"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-accent-500 hover:text-accent-300 transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}

        {selected.length < max && (
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder={selected.length === 0 ? 'Add tags…' : ''}
            className="h-6 min-w-[80px] flex-1 bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none"
          />
        )}
      </div>

      {/* Suggestions dropdown */}
      {focused && filtered.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-1">
          {filtered.slice(0, 8).map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="inline-flex items-center gap-1 h-6 px-2 rounded-full text-[11px] bg-white/[0.04] text-slate-400 border border-white/[0.07] hover:border-accent/25 hover:text-accent-400 hover:bg-accent/5 transition-colors"
            >
              <Plus className="w-2.5 h-2.5" />
              {tag}
            </button>
          ))}
        </div>
      )}

      <p className="text-[11px] text-slate-600">Press Enter or comma to add a custom tag</p>
    </div>
  )
}
