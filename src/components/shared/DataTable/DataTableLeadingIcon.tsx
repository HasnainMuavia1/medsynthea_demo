import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils'

export const DataTableLeadingIcon = ({
  icon: Icon,
  className,
}: {
  icon: LucideIcon
  className?: string
}) => {
  return (
    <div
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground',
        className
      )}
    >
      <Icon className="size-3" aria-hidden />
    </div>
  )
}
