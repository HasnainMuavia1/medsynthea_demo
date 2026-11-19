import { Loader } from './Loader'
import { cn } from '@/utils'

interface LoadingOverlayProps {
  label?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /**
   * When true, the overlay captures pointer events (mutation takeovers).
   * Default false — soft refresh/poll indicators must not block the panel.
   */
  blockInteraction?: boolean
}

export const LoadingOverlay = ({
  label,
  description,
  size = 'md',
  className,
  blockInteraction = false,
}: LoadingOverlayProps) => {
  const spinnerSize = size === 'lg' ? 'sm' : 'tiny'
  return (
    <div
      className={cn(
        'absolute inset-0 z-10 rounded-3xl bg-background/40 backdrop-blur-md',
        !blockInteraction && 'pointer-events-none',
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="sticky top-[30%] flex h-state-panel flex-col items-center justify-center gap-2 px-4">
        <Loader variant="inline" size={spinnerSize} />
        {label ? <p className="text-center text-sm font-medium text-foreground">{label}</p> : null}
        {description ? (
          <p className="text-center text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  )
}
