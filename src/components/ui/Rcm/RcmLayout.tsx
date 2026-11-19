'use client'

import { cn } from '@/utils'
import { ui } from '@/styles/ui'

export const RcmPage = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return <div className={cn(ui.layout.pagePad, className)}>{children}</div>
}

export const RcmCard = ({
  children,
  className,
  pad = true,
}: {
  children: React.ReactNode
  className?: string
  pad?: boolean
}) => {
  return (
    <div className={cn(ui.surface.card, pad && ui.surface.cardBody, className)}>{children}</div>
  )
}

export const RcmSectionHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) => {
  return (
    <div className={ui.layout.sectionHeader}>
      <div className="min-w-0">
        <div className={ui.typography.sectionTitle}>{title}</div>
        {subtitle ? <div className={ui.typography.cardSubtitle}>{subtitle}</div> : null}
      </div>
      {action}
    </div>
  )
}

export const RcmPageHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) => {
  return (
    <div className={ui.layout.pageHeader}>
      <div className="min-w-0">
        <h1 className={cn(ui.typography.heroTitle, 'font-bold')}>{title}</h1>
        {subtitle ? <p className={cn(ui.typography.heroDescription, 'mt-1')}>{subtitle}</p> : null}
      </div>
      {action ? (
        <div className="ml-auto flex min-w-0 max-w-full shrink-0 flex-wrap items-center justify-end gap-2">
          {action}
        </div>
      ) : null}
    </div>
  )
}

export const RcmEmptyState = ({
  icon,
  title,
  hint,
  action,
}: {
  icon: React.ReactNode
  title: string
  hint?: string
  action?: React.ReactNode
}) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center text-muted-foreground">
      <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        {icon}
      </div>
      <div className={cn(ui.typography.sectionTitle, 'mb-1')}>{title}</div>
      {hint ? <div className={ui.typography.sectionDescriptionSm}>{hint}</div> : null}
      {action ? <div className="mt-section">{action}</div> : null}
    </div>
  )
}
