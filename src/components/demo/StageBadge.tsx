'use client'

import { Badge, type BadgeTone } from '@/components/shared/Badge'
import { completedCount, currentStep, isCaseClosed, stageLabel } from '@/demo/engine'
import type { DemoCase, StepId } from '@/demo/types'

const TONE_BY_STEP: Record<StepId, BadgeTone> = {
  registration: 'gray',
  appointment: 'gray',
  eligibility: 'yellow',
  audio: 'blue',
  transcription: 'blue',
  note: 'blue',
  coding: 'purple',
  estimate: 'purple',
  denial: 'purple',
  claim: 'orange',
  submission: 'orange',
  status: 'yellow',
  era: 'green',
  eob: 'green',
  reconciliation: 'green',
}

export const StageBadge = ({ c }: { c: DemoCase }) => (
  <Badge tone={isCaseClosed(c) ? 'green' : TONE_BY_STEP[currentStep(c)]} density="fit" dot>
    {stageLabel(c)}
  </Badge>
)

export const StepProgress = ({ c }: { c: DemoCase }) => {
  const done = completedCount(c)
  return (
    <div className="flex min-w-24 items-center gap-2">
      <div className="h-1.5 w-full min-w-16 overflow-hidden rounded-full bg-secondary/60">
        <div className="h-full rounded-full bg-primary" style={{ width: `${(done / 15) * 100}%` }} />
      </div>
      <span className="shrink-0 font-mono text-2xs text-muted-foreground">{done}/15</span>
    </div>
  )
}
