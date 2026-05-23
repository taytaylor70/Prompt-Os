'use client'

import { cn, scoreToColor, scoreToGrade } from '@/lib/utils'
import { ScoreBadge } from './score-badge'
import { Lightbulb, RefreshCw } from 'lucide-react'
import type { ScoreResult } from '@/types'

const DIMENSION_LABELS: Record<keyof ScoreResult['dimensions'], { label: string; description: string }> = {
  clarity:             { label: 'Clarity',             description: 'How unambiguous the intent is' },
  specificity:         { label: 'Specificity',         description: 'Avoidance of vague language' },
  context:             { label: 'Context',             description: 'Background & role provided' },
  output_control:      { label: 'Output Control',      description: 'Format & length defined' },
  reusability:         { label: 'Reusability',         description: 'Template variable support' },
  model_compatibility: { label: 'Model Fit',           description: 'Suited to target model' },
  safety:              { label: 'Safety',              description: 'Absence of harmful patterns' },
  commercial_value:    { label: 'Commercial Value',    description: 'Professional applicability' },
}

function DimensionBar({ name, value }: { name: keyof ScoreResult['dimensions']; value: number }) {
  const { label, description } = DIMENSION_LABELS[name]
  const color = scoreToColor(value).replace('text-', 'bg-').replace('-400', '-500')

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-300">{label}</p>
          <p className="text-[10px] text-slate-600">{description}</p>
        </div>
        <span className={cn('text-xs font-bold tabular-nums', scoreToColor(value))}>
          {value}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

interface PromptScorePanelProps {
  result:     ScoreResult | null
  loading?:   boolean
  onRescore?: () => void
  className?: string
}

export function PromptScorePanel({ result, loading, onRescore, className }: PromptScorePanelProps) {
  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Prompt Score</h3>
          <p className="text-xs text-slate-500">AI quality analysis</p>
        </div>
        {onRescore && (
          <button
            onClick={onRescore}
            disabled={loading}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-colors disabled:opacity-50"
            title="Re-score"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          </button>
        )}
      </div>

      {/* Total score */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-16 h-16 rounded-full bg-white/[0.04] border-2 border-white/[0.08] animate-pulse-slow" />
          <div className="flex flex-col gap-1.5 w-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-1.5 rounded-full bg-white/[0.05] animate-pulse" style={{ width: `${60 + i * 10}%` }} />
            ))}
          </div>
          <p className="text-xs text-slate-600">Analyzing prompt…</p>
        </div>
      ) : result ? (
        <>
          <div className="flex items-center gap-5 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
            <ScoreBadge score={result.total} size="lg" showGrade />
            <div>
              <p className="text-xs text-slate-500">Overall Score</p>
              <p className={cn('text-2xl font-bold tabular-nums', scoreToColor(result.total))}>
                {result.total}<span className="text-base text-slate-600">/100</span>
              </p>
              <p className="text-xs text-slate-600 mt-0.5">Grade: {result.grade}</p>
            </div>
          </div>

          {/* Dimension bars */}
          <div className="flex flex-col gap-3">
            {(Object.entries(result.dimensions) as [keyof ScoreResult['dimensions'], number][]).map(([name, val]) => (
              <DimensionBar key={name} name={name} value={val} />
            ))}
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <p className="text-xs font-semibold text-slate-300">Recommendations</p>
              </div>
              <ul className="flex flex-col gap-2">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-slate-400 leading-relaxed flex gap-2">
                    <span className="text-amber-500 shrink-0 mt-0.5">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center text-xl mb-1">⚡</div>
          <p className="text-sm text-slate-400">No score yet</p>
          <p className="text-xs text-slate-600">Start typing to get a quality analysis</p>
        </div>
      )}
    </div>
  )
}
