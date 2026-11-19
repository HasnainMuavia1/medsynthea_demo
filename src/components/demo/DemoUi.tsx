'use client'

import { useCallback, useRef, useState, type ReactNode } from 'react'
import { Bot, CheckCircle2, Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/shared/Badge'
import { ui } from '@/styles/ui'
import { cn } from '@/utils'

export const SectionCard = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
  bodyClassName,
  className,
}: {
  title: ReactNode
  subtitle?: ReactNode
  icon?: LucideIcon
  actions?: ReactNode
  children: ReactNode
  bodyClassName?: string
  className?: string
}) => (
  <section className={cn(ui.surface.card, className)}>
    <div className={ui.surface.cardHeader}>
      {Icon ? (
        <div className={ui.surface.iconBox}>
          <Icon className="size-4" aria-hidden />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className={ui.typography.cardTitle}>{title}</div>
        {subtitle ? <div className={ui.typography.cardSubtitle}>{subtitle}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
    <div className={cn(ui.surface.cardBody, bodyClassName)}>{children}</div>
  </section>
)

export const StatTile = ({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'green',
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon: LucideIcon
  tone?: BadgeTone
}) => (
  <article className={cn('flex min-w-0 items-center gap-4 rounded-card border p-fluid-card', ui.tone[tone])}>
    <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg border', ui.tone[tone])} aria-hidden>
      <Icon className="size-5" />
    </span>
    <div className="min-w-0">
      <p className="truncate text-sm font-medium text-foreground" title={label}>
        {label}
      </p>
      <p className="mt-0.5 text-2xl font-bold tracking-tight tabular-nums text-foreground">{value}</p>
      {hint ? <p className="truncate text-2xs text-foreground/70">{hint}</p> : null}
    </div>
  </article>
)

export interface KeyValueItem {
  label: string
  value: ReactNode
}

export const KeyValueGrid = ({ items, columns = 3 }: { items: KeyValueItem[]; columns?: 2 | 3 | 4 }) => (
  <dl
    className={cn(
      'grid gap-x-6 gap-y-3',
      columns === 2 && 'grid-cols-2',
      columns === 3 && 'grid-cols-3',
      columns === 4 && 'grid-cols-4'
    )}
  >
    {items.map(({ label, value }) => (
      <div key={label} className="min-w-0">
        <dt className={ui.typography.label}>{label}</dt>
        <dd className={cn(ui.typography.value, 'mt-1 break-words')}>{value}</dd>
      </div>
    ))}
  </dl>
)

export const ToneBadge = ({ tone, children }: { tone: BadgeTone; children: ReactNode }) => (
  <Badge tone={tone} density="fit">
    {children}
  </Badge>
)

export interface FakeRun {
  running: boolean
  progress: number
  stage: string
  start: (onDone: () => void) => void
}

export const useFakeRun = (durationMs: number, stages: string[]): FakeRun => {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const timer = useRef<number | null>(null)

  const start = useCallback(
    (onDone: () => void) => {
      if (timer.current) window.clearInterval(timer.current)
      const began = Date.now()
      setRunning(true)
      setProgress(0)
      timer.current = window.setInterval(() => {
        const pct = Math.min(100, ((Date.now() - began) / durationMs) * 100)
        setProgress(pct)
        if (pct >= 100) {
          if (timer.current) window.clearInterval(timer.current)
          timer.current = null
          setRunning(false)
          onDone()
        }
      }, 80)
    },
    [durationMs]
  )

  const stage = stages[Math.min(stages.length - 1, Math.floor((progress / 100) * stages.length))] ?? ''
  return { running, progress, stage, start }
}

export const AgentProgress = ({ run, agent }: { run: FakeRun; agent: string }) => {
  if (!run.running) return null
  return (
    <div className={cn('rounded-card border p-3', ui.tone.blue)}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Bot className="size-4" aria-hidden />
        {agent}
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
      </div>
      <div className="mt-1 text-xs">{run.stage}</div>
      <div className={cn(ui.progress.track, 'mt-2')}>
        <div className={ui.progress.fill} style={{ width: `${run.progress}%` }} />
      </div>
    </div>
  )
}

export const DoneBanner = ({ title, detail }: { title: ReactNode; detail?: ReactNode }) => (
  <div className={cn('flex items-start gap-2.5 rounded-card border px-3 py-2.5', ui.tone.green)}>
    <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
    <div className="min-w-0">
      <div className="text-sm font-semibold">{title}</div>
      {detail ? <div className="mt-0.5 text-xs text-foreground/80">{detail}</div> : null}
    </div>
  </div>
)

export const EmptyHint = ({ icon: Icon, title, hint, action }: { icon: LucideIcon; title: string; hint?: string; action?: ReactNode }) => (
  <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
    <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
      <Icon className="size-5" aria-hidden />
    </div>
    <div className={cn(ui.typography.sectionTitle, 'mb-1')}>{title}</div>
    {hint ? <div className={cn(ui.typography.sectionDescriptionSm, 'max-w-md')}>{hint}</div> : null}
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
)
