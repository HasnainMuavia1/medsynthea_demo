'use client'

import { useEffect } from 'react'
import { cn } from '@/utils'
import { lockBodyScroll, unlockBodyScroll } from '@/utils/body-scroll-lock'

const SIZE_MAP = {
  tiny: { container: 'size-5', ring1: 'size-4', ring2: 'size-3', core: 'size-1.5', stroke: 1 },
  sm: { container: 'size-16', ring1: 'size-14', ring2: 'size-10', core: 'size-3.5', stroke: 1.5 },
  md: { container: 'size-32', ring1: 'size-28', ring2: 'size-20', core: 'size-7', stroke: 2 },
  lg: { container: 'size-48', ring1: 'size-40', ring2: 'size-28', core: 'size-10', stroke: 2.5 },
} as const

export const Loader = ({
  label,
  description,
  variant = 'section',
  size = 'md',
  className,
}: LoaderProps) => {
  const { container, ring1, ring2, core, stroke } = SIZE_MAP[size]
  const locksScroll = variant === 'fullscreen'

  useEffect(() => {
    if (!locksScroll) return
    lockBodyScroll()
    return () => unlockBodyScroll()
  }, [locksScroll])

  const containerClasses = cn(
    'flex flex-col items-center justify-center select-none',
    variant === 'fullscreen' &&
      'fixed inset-0 z-100 bg-background/60 backdrop-blur-loader-fullscreen',
    variant === 'section' && 'w-full py-24 min-h-100 backdrop-blur-md bg-background/5 rounded-3xl',
    variant === 'centered' &&
      'flex w-full flex-col items-center justify-center py-12 min-h-50 gap-6',
    variant === 'inline' && 'inline-flex flex-row py-0 min-h-0 gap-3',
    variant !== 'inline' && size !== 'tiny' && 'gap-6',
    className
  )

  return (
    <div className={containerClasses} role="status" aria-live="polite" aria-busy="true">
      <svg className="absolute size-0 invisible" aria-hidden="true">
        <defs>
          <filter id="loader-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </svg>

      <div className={cn('relative shrink-0', container)}>
        {size !== 'tiny' ? (
          <div
            className="animate-med-loader-bloom absolute inset-0 rounded-full bg-primary/20 blur-loader-bloom"
            aria-hidden="true"
          />
        ) : null}

        <div
          className={cn(
            'animate-med-loader-spin absolute inset-0 m-auto rounded-full border-t-primary/60 border-r-primary/10 border-b-transparent border-l-transparent',
            ring1
          )}
          style={{ borderWidth: stroke, filter: 'url(#loader-glow)' }}
          aria-hidden="true"
        />

        <div
          className={cn(
            'animate-med-loader-spin-reverse absolute inset-0 m-auto rounded-full border-b-primary/40 border-l-primary/5 border-t-transparent border-r-transparent',
            ring2
          )}
          style={{ borderWidth: stroke }}
          aria-hidden="true"
        />

        <div
          className={cn(
            'animate-med-loader-core absolute inset-0 m-auto rounded-full bg-gradient-to-tr from-primary to-primary/70 shadow-[0_0_20px_color-mix(in_oklab,var(--primary)_45%,transparent)]',
            core
          )}
          aria-hidden="true"
        />
      </div>

      {(label || description) && size !== 'tiny' && variant !== 'inline' ? (
        <div className="flex max-w-sm flex-col items-center gap-3 px-6 text-center">
          {label ? (
            <div className="flex flex-col items-center">
              <span className="mb-1 text-3xs font-semibold tracking-caps-wide text-foreground/90 uppercase">
                {label}
              </span>
              <div
                className="animate-med-loader-underline h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                aria-hidden="true"
              />
            </div>
          ) : null}
          {description ? (
            <p className="max-w-70 text-4xs leading-relaxed font-semibold tracking-eyebrow text-muted-foreground uppercase opacity-40">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      {variant === 'inline' && label && size !== 'tiny' ? (
        <span className="text-4xs font-semibold tracking-caps text-primary/80 uppercase">
          {label}
        </span>
      ) : null}
    </div>
  )
}

export interface LoaderProps {
  label?: string
  description?: string
  variant?: 'fullscreen' | 'section' | 'inline' | 'centered'
  size?: 'tiny' | 'sm' | 'md' | 'lg'
  className?: string
}
