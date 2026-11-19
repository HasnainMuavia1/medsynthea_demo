'use client'

import type { LucideIcon } from 'lucide-react'
import { ui } from '@/styles/ui'
import { cn } from '@/utils'

export const ClaimFormSection = ({
  icon: Icon,
  title,
  children,
  className,
}: ClaimFormSectionProps) => {
  return (
    <section className={cn('overflow-hidden rounded-card border border-border bg-card', className)}>
      <div className="flex items-center gap-2 border-b border-border bg-pill-green-bg px-4 py-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Icon className="size-3.5" aria-hidden />
        </span>
        <h2 className={ui.typography.sectionTitle}>{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

export interface ClaimFormSectionProps {
  icon: LucideIcon
  title: string
  children: React.ReactNode
  className?: string
}
