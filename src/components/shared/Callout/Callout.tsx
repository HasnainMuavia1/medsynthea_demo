import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/utils'
import { ui } from '@/styles/ui'

export const Callout = ({
  icon,
  title,
  children,
  className,
  variant = 'default',
}: CalloutProps) => {
  const isFeature = variant === 'feature'
  const resolvedIcon =
    icon === null
      ? null
      : (icon ?? <Info className={isFeature ? 'size-8' : 'size-4'} aria-hidden />)

  return (
    <aside
      className={cn(isFeature ? ui.surface.calloutFeature : ui.surface.callout, className)}
      role="note"
    >
      <div className={isFeature ? ui.surface.calloutFeatureBody : ui.surface.calloutBody}>
        {resolvedIcon ? (
          <div className={isFeature ? ui.surface.calloutFeatureIcon : ui.surface.calloutIcon}>
            {resolvedIcon}
          </div>
        ) : null}
        <div className={isFeature ? ui.surface.calloutFeatureContent : 'min-w-0'}>
          {title ? (
            <p
              className={cn(
                isFeature ? ui.surface.calloutFeatureTitle : ui.typography.cardTitle,
                children ? (isFeature ? 'mb-0.5' : 'mb-1') : undefined
              )}
            >
              {title}
            </p>
          ) : null}
          {children ? (
            <div className={isFeature ? ui.surface.calloutFeatureDescription : undefined}>
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  )
}

Callout.displayName = 'Callout'

export interface CalloutProps {
  icon?: ReactNode | null
  title?: string
  children?: ReactNode
  className?: string
  variant?: 'default' | 'feature'
}
