'use client'

import { useRef, useState } from 'react'
import { Copy, RotateCcw, Maximize2, Minimize2 } from 'lucide-react'
import { cn, countWords, countTokensEstimate } from '@/lib/utils'

interface PromptEditorProps {
  value:       string
  onChange:    (val: string) => void
  placeholder?: string
  label?:      string
  minHeight?:  number
  className?:  string
  readOnly?:   boolean
}

export function PromptEditor({
  value,
  onChange,
  placeholder = 'Write your prompt here…',
  label,
  minHeight = 240,
  className,
  readOnly,
}: PromptEditorProps) {
  const [expanded, setExpanded] = useState(false)
  const [copied,   setCopied]   = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)

  const words  = countWords(value)
  const tokens = countTokensEstimate(value)

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleClear() {
    onChange('')
    ref.current?.focus()
  }

  // Auto-resize
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value)
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = `${ref.current.scrollHeight}px`
    }
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {/* Label row */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="h-6 px-2 rounded text-[11px] text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-colors flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          {!readOnly && value && (
            <button
              type="button"
              onClick={handleClear}
              className="h-6 px-2 rounded text-[11px] text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            className="h-6 w-6 rounded flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-colors"
          >
            {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className={cn(
        'relative rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden',
        'focus-within:border-accent/40 focus-within:bg-white/[0.04] focus-within:ring-1 focus-within:ring-accent/15',
        'transition-all duration-200',
        expanded && 'fixed inset-4 z-50 shadow-accent-lg rounded-2xl border-accent/30'
      )}>
        <textarea
          ref={ref}
          value={value}
          onChange={handleInput}
          placeholder={placeholder}
          readOnly={readOnly}
          spellCheck={false}
          style={{ minHeight: expanded ? 'calc(100% - 36px)' : minHeight }}
          className={cn(
            'w-full px-4 py-3 text-sm text-slate-200 placeholder-slate-700 font-mono leading-relaxed',
            'bg-transparent resize-none focus:outline-none',
            readOnly && 'cursor-default select-all'
          )}
        />

        {/* Expanded backdrop */}
        {expanded && (
          <div
            className="fixed inset-0 -z-10 bg-black/60 backdrop-blur-sm"
            onClick={() => setExpanded(false)}
          />
        )}

        {/* Stats bar */}
        <div className="flex items-center gap-3 px-4 py-2 border-t border-white/[0.05] bg-white/[0.02]">
          <span className="text-[11px] text-slate-600 tabular-nums">{words} words</span>
          <span className="text-[11px] text-slate-700">·</span>
          <span className="text-[11px] text-slate-600 tabular-nums">~{tokens} tokens</span>
          <span className="text-[11px] text-slate-700">·</span>
          <span className="text-[11px] text-slate-600 tabular-nums">{value.length} chars</span>
          {expanded && (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="ml-auto text-[11px] text-accent-400 hover:text-accent-300"
            >
              Collapse ↙
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
