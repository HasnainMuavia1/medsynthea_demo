'use client'

import { Check, MoreHorizontal } from 'lucide-react'
import { buttonVariants } from '@/components/shared/Button'
import { cn } from '@/utils'

const stepState = (
  steps: EncounterProgressStep[],
  index: number
): 'complete' | 'active' | 'pending' => {
  if (steps[index]?.complete) return 'complete'
  const activeIndex = steps.findIndex((step) => !step.complete)
  if (index === activeIndex) return 'active'
  return 'pending'
}

export const EncounterProgressIndicator = ({
  steps,
  compact = false,
  label = 'Encounter progress',
  className,
}: EncounterProgressIndicatorProps) => {
  return (
    <div
      className={cn('flex w-full min-w-0 items-start', className)}
      role="group"
      aria-label={label}
    >
      {steps.map(({ key, label: stepLabel }, index) => {
        const state = stepState(steps, index)
        const priorComplete = index > 0 && Boolean(steps[index - 1]?.complete)

        return (
          <div key={key} className={cn('flex min-w-0 items-start', index > 0 && 'flex-1')}>
            {index > 0 ? (
              <span
                className={cn(
                  'mt-3.5 h-px min-w-8 flex-1 self-start',
                  priorComplete ? 'bg-primary' : 'bg-border'
                )}
                aria-hidden
              />
            ) : null}
            <div className="flex shrink-0 flex-col items-center gap-1">
              <span
                className={cn(
                  'inline-flex size-7 shrink-0 items-center justify-center rounded-full border',
                  state === 'complete' &&
                    cn(
                      buttonVariants({ variant: 'outlinePrimary', size: 'icon' }),
                      'pointer-events-none size-7 rounded-full bg-transparent shadow-none'
                    ),
                  state === 'active' && 'border-primary bg-background text-primary',
                  state === 'pending' && 'border-border bg-secondary text-muted-foreground'
                )}
                title={stepLabel}
              >
                {state === 'complete' ? (
                  <Check className="size-3.5 shrink-0 text-primary" aria-hidden />
                ) : state === 'active' ? (
                  <span className="size-2 rounded-full bg-primary" aria-hidden />
                ) : (
                  <MoreHorizontal className="size-3.5 shrink-0" aria-hidden />
                )}
                <span className="sr-only">
                  {stepLabel}: {state}
                </span>
              </span>
              {!compact ? (
                <span
                  className={cn(
                    'max-w-20 text-center text-4xs leading-tight',
                    state === 'pending' ? 'text-muted-foreground' : 'text-foreground'
                  )}
                  title={stepLabel}
                >
                  {stepLabel}
                </span>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export interface EncounterProgressStep {
  key: string
  label: string
  complete: boolean
}

export interface EncounterProgressIndicatorProps {
  steps: EncounterProgressStep[]
  compact?: boolean
  label?: string
  className?: string
}
