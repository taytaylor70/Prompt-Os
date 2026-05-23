import { cn } from '@/lib/utils'

interface BadgeProps {
  children:  React.ReactNode
  variant?:  'default' | 'accent' | 'success' | 'warning' | 'danger' | 'muted'
  size?:     'sm' | 'md'
  dot?:      boolean
  className?: string
}

export function Badge({ children, variant = 'default', size = 'sm', dot, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium leading-none',
        {
          'bg-white/[0.07] text-slate-300 border border-white/[0.08]':   variant === 'default',
          'bg-accent/15  text-accent-400  border border-accent/20':      variant === 'accent',
          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': variant === 'success',
          'bg-amber-500/10 text-amber-400 border border-amber-500/20':   variant === 'warning',
          'bg-red-500/10 text-red-400 border border-red-500/20':         variant === 'danger',
          'bg-slate-800 text-slate-500':                                  variant === 'muted',
          'px-2 py-0.5 text-[11px]': size === 'sm',
          'px-2.5 py-1 text-xs':     size === 'md',
        },
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', {
          'bg-slate-400':   variant === 'default',
          'bg-accent-400':  variant === 'accent',
          'bg-emerald-400': variant === 'success',
          'bg-amber-400':   variant === 'warning',
          'bg-red-400':     variant === 'danger',
        })} />
      )}
      {children}
    </span>
  )
}
