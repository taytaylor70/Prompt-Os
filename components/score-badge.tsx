import { cn, scoreToColor, scoreToRingColor, scoreToGrade } from '@/lib/utils'

interface ScoreBadgeProps {
  score:      number | null
  size?:      'sm' | 'md' | 'lg'
  showGrade?: boolean
  className?: string
}

export function ScoreBadge({ score, size = 'md', showGrade, className }: ScoreBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <span className={cn('inline-flex items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.08] text-slate-600 font-mono font-bold', {
        'w-8 h-8 text-[10px]':   size === 'sm',
        'w-11 h-11 text-sm':     size === 'md',
        'w-16 h-16 text-lg':     size === 'lg',
      }, className)}>
        —
      </span>
    )
  }

  const grade = scoreToGrade(score)

  return (
    <div className={cn('inline-flex flex-col items-center gap-0.5', className)}>
      <span className={cn(
        'inline-flex items-center justify-center rounded-full ring-2 font-mono font-bold tabular-nums',
        'bg-white/[0.05] border border-white/[0.08]',
        scoreToColor(score),
        scoreToRingColor(score),
        {
          'w-8  h-8  text-[11px]': size === 'sm',
          'w-11 h-11 text-sm':     size === 'md',
          'w-16 h-16 text-xl':     size === 'lg',
        }
      )}>
        {score}
      </span>
      {showGrade && (
        <span className={cn('text-[10px] font-bold tracking-wider', scoreToColor(score))}>
          {grade}
        </span>
      )}
    </div>
  )
}
