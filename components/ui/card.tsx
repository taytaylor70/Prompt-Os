import { cn } from '@/lib/utils'

interface CardProps {
  children:   React.ReactNode
  className?: string
  glass?:     boolean
  hover?:     boolean
  glow?:      boolean
  onClick?:   () => void
}

export function Card({ children, className, glass, hover, glow, onClick }: CardProps) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={cn(
        'rounded-xl border border-white/[0.08] bg-white/[0.03]',
        glass && 'backdrop-blur-sm',
        hover && 'transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.14] hover:-translate-y-0.5',
        glow  && 'hover:shadow-accent-sm hover:border-accent/20',
        onClick && 'text-left w-full cursor-pointer',
        className
      )}
    >
      {children}
    </Tag>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-5 pt-5 pb-0', className)}>{children}</div>
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-5 py-3 border-t border-white/[0.06] flex items-center gap-2', className)}>
      {children}
    </div>
  )
}
