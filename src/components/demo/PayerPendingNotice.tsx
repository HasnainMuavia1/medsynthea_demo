'use client'

import { CheckCircle2, Circle, Clock, Loader2, Play, Square } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { useAutopilotControls } from '@/components/demo/useAutopilot'
import { PAYER_STEPS, isAwaitingPayer } from '@/demo/autopilot'
import { isStepDone } from '@/demo/engine'
import { stepMeta } from '@/demo/reference'
import type { DemoCase } from '@/demo/types'
import { ui } from '@/styles/ui'
import { cn } from '@/utils'

/**
 * Shown on the Submission, Status, ERA and EOB steps after a claim is submitted,
 * whether it was submitted by autopilot or by hand. Nothing advances on its own:
 * the user can wait (real life) or run Demo autopilot to simulate the payer side.
 */
export const PayerPendingNotice = ({ c, className }: { c: DemoCase; className?: string }) => {
  const autopilot = useAutopilotControls()
  if (!isAwaitingPayer(c)) return null
  const runningPayer = autopilot?.running && autopilot.mode === 'payer'
  const busy = Boolean(autopilot?.running)

  return (
    <section aria-label="Waiting on clearinghouse and payer" className={cn('rounded-card border p-4', ui.tone.blue, className)}>
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-current/20 bg-card">
          <Clock className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">Claim submitted. Waiting on the clearinghouse and payer</h3>
          <p className="mt-1 text-xs leading-relaxed text-foreground/80">
            The ERA (835 remittance) and EOB will be received after confirmation from the clearinghouse and the payer. Nothing more is needed from you until then.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-foreground/80">
            Want to see what happens next? <span className="font-medium text-foreground">Demo autopilot</span> simulates the remaining 3 steps hypothetically.
          </p>

          <ol className="mt-3 flex flex-wrap gap-2" aria-label="Remaining steps">
            {PAYER_STEPS.map((id) => {
              const done = isStepDone(c, id)
              return (
                <li
                  key={id}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-2xs font-medium',
                    done ? 'border-primary/40 bg-card text-primary' : 'border-border bg-card text-muted-foreground'
                  )}
                >
                  {done ? <CheckCircle2 className="size-3" aria-hidden /> : <Circle className="size-3" aria-hidden />}
                  {stepMeta(id).label}
                </li>
              )
            })}
          </ol>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {runningPayer ? (
              <>
                <span className="flex items-center gap-1.5 text-xs font-medium text-primary" role="status">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  {autopilot?.label}…
                </span>
                <Button type="button" variant="outline" size="sm" onClick={autopilot?.stop}>
                  <Square className="size-3" aria-hidden />
                  Stop
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={!autopilot || busy}
                onClick={() => autopilot?.start('payer')}
                title="Simulate claim status, ERA and EOB"
              >
                <Play className="size-3.5" aria-hidden />
                Demo autopilot
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
