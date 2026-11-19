'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronDown, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import type { AssistantAnswer } from '@/demo/assistant'
import type { Patient } from '@/demo/types'
import { cn } from '@/utils'

/** Playful status words shown while the assistant works, rotated every VERB_MS. */
const VERBS = [
  'Hammering',
  'Brainstorming',
  'Manifesting',
  'Noodling',
  'Cogitating',
  'Percolating',
  'Untangling',
  'Crunching',
  'Conjuring',
  'Pondering',
  'Synthesizing',
  'Moseying',
]
const VERB_MS = 750

/** Where each topic's answer comes from, as the assistant would describe it. */
const SOURCES: Record<string, string> = {
  appointments: 'the appointment schedule',
  eligibility: 'eligibility responses (271)',
  pa: 'prior authorizations',
  coding: 'coded encounters',
  note: 'clinical notes',
  estimate: 'patient estimates',
  claims: 'claims (837P)',
  status: 'claim status updates (277CA)',
  denied: 'denials and adjustment codes',
  denial: 'denials and adjustment codes',
  era: 'remittances (835)',
  eob: 'EOB documents',
  paid: 'payment postings',
  balance: 'patient balances',
  reconcile: 'the reconciliation ledger',
  calls: 'AR call logs',
  patients: 'the patient registry',
  pipeline: 'the revenue cycle pipeline',
}

/** Thinking steps for one answer, derived from what the answer actually looked up. */
export const thinkingSteps = (
  answer: AssistantAnswer,
  patients: Patient[],
  caseCount: number
): string[] => {
  const [scope, topic = ''] = answer.intent.split('.')
  if (scope === 'clarify' || scope === 'fallback') {
    return ['Reading the question', 'Matching it to workspace data', 'Preparing a few suggestions']
  }
  const patient = answer.patientId ? patients.find((p) => p.id === answer.patientId) : null
  const steps = ['Reading the question']
  steps.push(
    patient
      ? `Finding ${patient.firstName} ${patient.lastName} in the patient registry`
      : `Scanning ${caseCount} encounters across the revenue cycle`
  )
  if (SOURCES[topic]) steps.push(`Checking ${SOURCES[topic]}`)
  if (answer.table?.rows.length) {
    const rows = answer.table.rows.length
    steps.push(`Building a table of ${rows} ${rows === 1 ? 'row' : 'rows'}`)
  }
  steps.push('Writing the answer')
  return steps
}

/** How long to think before answering: longer for answers with more steps. */
export const thinkingDurationMs = (steps: string[]): number =>
  1400 + steps.length * 450 + Math.round(Math.random() * 500)

const useNow = (active: boolean, everyMs: number): number => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const t = window.setInterval(() => setNow(Date.now()), everyMs)
    return () => window.clearInterval(t)
  }, [active, everyMs])
  return now
}

const StepList = ({ steps, doneCount }: { steps: string[]; doneCount: number }) => (
  <ol className="mt-2 flex flex-col gap-1.5 border-l border-border pl-3">
    {steps.slice(0, doneCount + 1).map((step, i) => {
      const done = i < doneCount
      const current = i === doneCount
      return (
        <li
          key={step}
          className={cn(
            'flex items-center gap-2 text-xs',
            done ? 'text-muted-foreground' : current && 'text-foreground'
          )}
        >
          {done ? (
            <Check className="size-3 shrink-0 text-primary" aria-hidden />
          ) : (
            <Loader2 className="size-3 shrink-0 animate-spin text-primary" aria-hidden />
          )}
          {step}
        </li>
      )
    })}
  </ol>
)

/** Live "thinking" state: rotating status word, elapsed seconds and steps ticking off. */
export const AssistantThinking = ({ steps, startedAt, durationMs }: AssistantThinkingProps) => {
  const now = useNow(true, 120)
  const elapsed = Math.max(0, now - startedAt)
  const verb = VERBS[Math.floor(elapsed / VERB_MS) % VERBS.length]
  const doneCount = Math.min(steps.length - 1, Math.floor((elapsed / durationMs) * steps.length))

  return (
    <div role="status" aria-live="polite" aria-label="Assistant is thinking">
      <div className="flex items-center gap-2 text-sm">
        <Sparkles className="size-3.5 shrink-0 text-primary motion-safe:animate-spin [animation-duration:2.4s]" aria-hidden />
        <span className="thinking-shimmer font-semibold">{verb}…</span>
        <span className="font-mono text-2xs tabular-nums text-muted-foreground">{(elapsed / 1000).toFixed(1)}s</span>
      </div>
      <StepList steps={steps} doneCount={doneCount} />
    </div>
  )
}

/** After the answer: a collapsed "Thought for Ns" line that reopens the steps. */
export const AssistantThoughtSummary = ({ steps, durationMs }: AssistantThoughtSummaryProps) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-2">
      <Button
        type="button"
        variant="unstyled"
        size="auto"
        className="inline-flex items-center gap-1 text-2xs font-medium text-muted-foreground hover:text-foreground"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Thought for {Math.max(1, Math.round(durationMs / 1000))}s
        <ChevronDown className={cn('size-3 transition-transform', open && 'rotate-180')} aria-hidden />
      </Button>
      {open ? <StepList steps={steps} doneCount={steps.length} /> : null}
    </div>
  )
}

interface AssistantThinkingProps {
  steps: string[]
  startedAt: number
  durationMs: number
}

interface AssistantThoughtSummaryProps {
  steps: string[]
  durationMs: number
}
