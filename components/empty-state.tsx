import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'

interface EmptyStateProps {
  icon?:       React.ReactNode
  title:       string
  description: string
  action?:     { label: string; href?: string; onClick?: () => void }
  className?:  string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-20 px-8 text-center',
      'rounded-2xl border border-dashed border-white/[0.08]',
      className
    )}>
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-2xl mb-5">
          {icon}
        </div>
      )}

      <h3 className="text-base font-semibold text-slate-200 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-6">{description}</p>

      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button size="sm">{action.label}</Button>
          </Link>
        ) : (
          <Button size="sm" onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  )
}
