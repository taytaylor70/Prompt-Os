import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?:    'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:opacity-50 disabled:pointer-events-none select-none',
          {
            // variants
            'bg-accent-600 hover:bg-accent-500 text-white shadow-accent-sm hover:shadow-accent active:scale-[0.98]':
              variant === 'primary',
            'bg-white/[0.06] hover:bg-white/[0.10] text-slate-200 border border-white/[0.08] hover:border-white/[0.14]':
              variant === 'secondary',
            'hover:bg-white/[0.06] text-slate-400 hover:text-slate-200':
              variant === 'ghost',
            'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20':
              variant === 'danger',
            'border border-white/[0.12] hover:border-accent/40 text-slate-300 hover:text-white hover:bg-accent/5':
              variant === 'outline',
            // sizes
            'h-8  px-3 text-xs gap-1.5': size === 'sm',
            'h-10 px-4 text-sm':         size === 'md',
            'h-12 px-6 text-base':       size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
