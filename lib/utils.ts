import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ScoreResult, PromptCategory, TargetModel } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function scoreToGrade(score: number): ScoreResult['grade'] {
  if (score >= 90) return 'S'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 55) return 'C'
  if (score >= 40) return 'D'
  return 'F'
}

export function scoreToColor(score: number): string {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-blue-400'
  if (score >= 40) return 'text-amber-400'
  return 'text-red-400'
}

export function scoreToRingColor(score: number): string {
  if (score >= 80) return 'ring-emerald-500/40'
  if (score >= 60) return 'ring-blue-500/40'
  if (score >= 40) return 'ring-amber-500/40'
  return 'ring-red-500/40'
}

export function scoreToBgGradient(score: number): string {
  if (score >= 80) return 'from-emerald-500/10 to-emerald-500/5'
  if (score >= 60) return 'from-blue-500/10 to-blue-500/5'
  if (score >= 40) return 'from-amber-500/10 to-amber-500/5'
  return 'from-red-500/10 to-red-500/5'
}

export function categoryIcon(category: PromptCategory): string {
  const icons: Record<PromptCategory, string> = {
    coding:       '💻',
    writing:      '✍️',
    analysis:     '🔍',
    marketing:    '📣',
    research:     '🔬',
    education:    '🎓',
    productivity: '⚡',
    creative:     '🎨',
    business:     '💼',
    data:         '📊',
    other:        '🗂️',
  }
  return icons[category] ?? '🗂️'
}

export function modelLabel(model: TargetModel): string {
  const labels: Record<TargetModel, string> = {
    'gpt-4o':            'GPT-4o',
    'gpt-4-turbo':       'GPT-4 Turbo',
    'gpt-3.5-turbo':     'GPT-3.5',
    'claude-3-5-sonnet': 'Claude 3.5 Sonnet',
    'claude-3-opus':     'Claude 3 Opus',
    'claude-3-haiku':    'Claude 3 Haiku',
    'gemini-1.5-pro':    'Gemini 1.5 Pro',
    'llama-3.1-70b':     'Llama 3.1 70B',
    'mistral-large':     'Mistral Large',
    'any':               'Any Model',
  }
  return labels[model] ?? model
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  })
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)

  if (mins  <  1)  return 'just now'
  if (mins  < 60)  return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  if (days  <  7)  return `${days}d ago`
  return formatDate(iso)
}

export function truncate(str: string, length = 120): string {
  return str.length > length ? str.slice(0, length).trimEnd() + '…' : str
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function countTokensEstimate(text: string): number {
  // rough 4-chars-per-token approximation
  return Math.ceil(text.length / 4)
}
