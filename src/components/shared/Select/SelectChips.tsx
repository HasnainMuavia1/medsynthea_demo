import { X } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { cn } from '@/utils'
import type { SelectOption } from './select.types'

export const SelectChips = ({ options, disabled, onRemove }: SelectChipsProps) => {
  if (options.length === 0) return null

  return (
    <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
      {options.map((option) => (
        <span
          key={option.value}
          className={cn(
            'inline-flex max-w-full items-center gap-1 rounded-md border border-border',
            'bg-secondary/70 px-2 py-0.5 text-xs font-medium text-foreground'
          )}
        >
          <span className="min-w-0 truncate">{option.label}</span>
          <Button
            type="button"
            variant="unstyled"
            size="auto"
            disabled={disabled}
            aria-label={`Remove ${option.label}`}
            className={cn(
              'inline-flex size-4 shrink-0 items-center justify-center rounded-sm',
              'text-muted-foreground hover:bg-muted hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              'disabled:pointer-events-none disabled:opacity-50'
            )}
            onClick={(event) => {
              event.stopPropagation()
              onRemove(option.value)
            }}
          >
            <X className="size-3" aria-hidden />
          </Button>
        </span>
      ))}
    </div>
  )
}

export type SelectChipsProps = {
  options: SelectOption[]
  disabled?: boolean
  onRemove: (value: string) => void
}
