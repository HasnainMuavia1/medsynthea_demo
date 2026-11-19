'use client'

import type { ReactNode } from 'react'
import { ArrowRight, Bot } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { STEPS, stepMeta } from '@/demo/reference'
import type { DemoCase, Patient, StepId } from '@/demo/types'
import { ui } from '@/styles/ui'
import { cn } from '@/utils'

export interface StepPanelProps {
  c: DemoCase
  patient: Patient
  goTo: (step: StepId) => void
}

export const nextStepOf = (step: StepId): StepId | null => {
  const i = STEPS.findIndex((s) => s.id === step)
  return STEPS[i + 1]?.id ?? null
}

export const ContinueButton = ({ from, goTo, disabled }: { from: StepId; goTo: (s: StepId) => void; disabled?: boolean }) => {
  const next = nextStepOf(from)
  if (!next) return null
  const meta = stepMeta(next)
  return (
    <Button type="button" variant="primary" size="sm" disabled={disabled} onClick={() => goTo(next)}>
      Continue to step {meta.number}: {meta.short}
      <ArrowRight className="size-3.5" aria-hidden />
    </Button>
  )
}

export const PanelShell = ({
  step,
  children,
  actions,
}: {
  step: StepId
  children: ReactNode
  actions?: ReactNode
}) => {
  const meta = stepMeta(step)
  const Icon = meta.icon
  return (
    <section className={ui.surface.card}>
      <div className={cn(ui.surface.cardHeader, 'min-h-14')}>
        <div className={ui.surface.iconBoxAccent}>
          <Icon className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className={ui.typography.eyebrow}>Step {meta.number} of 15</div>
          <div className="text-md font-semibold leading-tight text-foreground">{meta.label}</div>
          <div className={ui.typography.cardSubtitle}>{meta.description}</div>
        </div>
        <div className={cn('flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-2xs font-semibold', ui.tone.purple)}>
          <Bot className="size-3.5" aria-hidden />
          {meta.agent}
        </div>
      </div>
      <div className="flex flex-col gap-4 p-4">{children}</div>
      {actions ? (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-secondary/30 px-4 py-3">{actions}</div>
      ) : null}
    </section>
  )
}

export const MiniTable = ({
  head,
  rows,
  alignRight = [],
  footer,
}: {
  head: string[]
  rows: ReactNode[][]
  alignRight?: number[]
  footer?: ReactNode[]
}) => (
  <div className="overflow-x-auto rounded-card border border-border custom-scrollbar">
    <table className="w-full border-collapse text-sm">
      <thead className="bg-secondary/40">
        <tr>
          {head.map((h, i) => (
            <th
              key={h || i}
              className={cn(
                'border-b border-border px-3 py-2 text-left text-fluid-caption font-semibold uppercase tracking-wide text-muted-foreground',
                alignRight.includes(i) && 'text-right'
              )}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, r) => (
          <tr key={r} className="border-b border-border last:border-b-0">
            {row.map((cell, i) => (
              <td key={i} className={cn('px-3 py-2 align-top text-foreground', alignRight.includes(i) && 'text-right tabular-nums whitespace-nowrap')}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      {footer ? (
        <tfoot className="bg-secondary/30">
          <tr>
            {footer.map((cell, i) => (
              <td key={i} className={cn('border-t border-border px-3 py-2 font-semibold text-foreground', alignRight.includes(i) && 'text-right tabular-nums whitespace-nowrap')}>
                {cell}
              </td>
            ))}
          </tr>
        </tfoot>
      ) : null}
    </table>
  </div>
)

export const RawBlock = ({ text }: { text: string }) => (
  <pre className="max-h-72 overflow-auto rounded-card border border-border bg-secondary/40 p-3 font-mono text-2xs leading-relaxed text-foreground custom-scrollbar">
    {text}
  </pre>
)
