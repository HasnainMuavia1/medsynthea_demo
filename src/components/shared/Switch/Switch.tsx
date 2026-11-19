import { forwardRef } from 'react'
import { Button } from '@/components/shared/Button'
import { cn } from '@/utils'

const SWITCH_SIZE_CLASSES = {
  sm: {
    track: 'h-4 w-7',
    thumb: 'top-0.5 left-0.5 size-3',
    thumbOn: 'translate-x-3',
  },
  md: {
    track: 'h-6 w-11',
    thumb: 'top-0.5 left-0.5 size-5',
    thumbOn: 'translate-x-5',
  },
} as const

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, label, id, className, size = 'md', disabled = false }, ref) => {
    const sizeClasses = SWITCH_SIZE_CLASSES[size]

    return (
      <Button
        id={id}
        ref={ref}
        type="button"
        variant="unstyled"
        size="auto"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative shrink-0 rounded-full',
          sizeClasses.track,
          checked ? 'bg-primary hover:bg-primary/90' : 'bg-muted hover:bg-muted/90',
          className
        )}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden
          className={cn(
            'absolute rounded-full bg-background shadow-sm transition-transform duration-200',
            sizeClasses.thumb,
            checked ? sizeClasses.thumbOn : 'translate-x-0'
          )}
        />
      </Button>
    )
  }
)
Switch.displayName = 'Switch'

export type SwitchSize = keyof typeof SWITCH_SIZE_CLASSES

export type SwitchProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  id?: string
  className?: string
  size?: SwitchSize
  disabled?: boolean
}
