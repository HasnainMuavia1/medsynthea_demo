import { cn } from '@/utils'
import { badgeVariants, type BadgeProps, type BadgeTone } from './variants'

export const Badge = ({
  children,
  tone = 'gray',
  density = 'default',
  dot,
  className,
  ...props
}: BadgeProps) => {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ tone, density }), className)} {...props}>
      {dot ? (
        <span className="size-1.5 shrink-0 rounded-full bg-current opacity-90" aria-hidden />
      ) : null}
      {children}
    </span>
  )
}

Badge.displayName = 'Badge'

export const resolveActiveStatusTone = (status: string): BadgeTone => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'verified':
    case 'completed':
    case 'succeeded':
    case 'success':
      return 'green'
    case 'pending':
    case 'in_progress':
    case 'running':
      return 'yellow'
    case 'draft':
      return 'blue'
    case 'inactive':
    case 'rejected':
    case 'denied':
    case 'failed':
    case 'error':
      return 'red'
    default:
      return 'gray'
  }
}
