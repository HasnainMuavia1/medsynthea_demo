import { Children, type ReactNode } from 'react'
import { Button } from '@/components/shared/Button'
import { cn } from '@/utils'

const ACTION_INTENT_CLASS: Record<DataTableActionIntent, string> = {
  neutral: 'text-muted-foreground',
  view: 'text-view',
  edit: 'text-pill-blue-text',
  archive: 'text-pill-gray-text hover:text-archive-hover',
  delete: 'text-destructive hover:text-destructive-hover',
}

export const DataTableIconButton = ({
  children,
  onClick,
  href,
  intent = 'neutral',
  className,
  'aria-label': ariaLabel,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHasPopup,
}: {
  children: ReactNode
  onClick?: () => void
  href?: string
  intent?: DataTableActionIntent
  className?: string
  'aria-label'?: string
  'aria-expanded'?: boolean
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
}) => {
  const classes = cn(
    'size-5.5 min-h-0 p-0 hover:bg-secondary',
    intent === 'neutral'
      ? 'text-muted-foreground hover:text-foreground'
      : ACTION_INTENT_CLASS[intent],
    className
  )

  if (href) {
    return (
      <Button href={href} variant="ghost" size="sm" className={classes} aria-label={ariaLabel}>
        {children}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={classes}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
    >
      {children}
    </Button>
  )
}

export const DataTableTextAction = ({
  children,
  href,
  onClick,
  intent = 'neutral',
  className,
  disabled,
}: {
  children: ReactNode
  href?: string
  onClick?: () => void
  intent?: DataTableActionIntent
  className?: string
  disabled?: boolean
}) => {
  const classes = cn(
    'h-7 min-h-0 shrink-0 px-fluid-action text-2xs font-medium @max-table-compact:h-auto @max-table-compact:shrink @max-table-compact:min-h-7 @max-table-compact:py-1 @max-table-compact:whitespace-normal @max-table-compact:leading-tight',
    ACTION_INTENT_CLASS[intent],
    className
  )

  if (href) {
    return (
      <Button href={href} variant="outline" size="sm" className={classes} disabled={disabled}>
        {children}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className={classes}
      disabled={disabled}
    >
      {children}
    </Button>
  )
}

export const DataTableActions = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  const denseGroup = Children.toArray(children).length > 2

  return (
    <div
      className={cn(
        'inline-flex flex-nowrap items-center gap-1 @max-table-compact:flex-wrap',
        denseGroup && '@max-table-compact:min-w-36',
        className
      )}
    >
      {children}
    </div>
  )
}

export type DataTableActionIntent = 'neutral' | 'view' | 'edit' | 'archive' | 'delete'
