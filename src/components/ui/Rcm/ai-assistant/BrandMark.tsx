'use client'

import { cn } from '@/utils'


/** Compact brand mark — primary green, sized via className (default size-8). */
export const BrandMark = ({ className, title = 'MedSynthea' }: BrandMarkProps) => {
  return (
    <span
      role="img"
      aria-label={title}
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground',
        className
      )}
    >
      <svg viewBox="0 0 24 24" className="size-[60%] fill-current" aria-hidden>
        <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="14.5" cy="11" r="3" />
      </svg>
    </span>
  )
}

export interface BrandMarkProps {
  className?: string
  title?: string
}
