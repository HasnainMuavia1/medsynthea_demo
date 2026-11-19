'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { cn } from '@/utils'

export const CreationStepper = <TStep extends number>({
  steps,
  currentStep,
  onStepSelect,
  ariaLabel,
}: CreationStepperProps<TStep>) => {
  return (
    <ol className="flex w-full items-start" aria-label={ariaLabel}>
      {steps.map(({ step, title, description }) => {
        const isCompleted = step < currentStep
        const isActive = step === currentStep

        return (
          <li
            key={step}
            className="flex min-w-0 flex-1 flex-col items-start"
            aria-current={isActive ? 'step' : undefined}
          >
            <div className="flex w-full items-center">
              <Button
                type="button"
                variant="unstyled"
                size="auto"
                onClick={isCompleted && onStepSelect ? () => onStepSelect(step) : undefined}
                disabled={!isCompleted || !onStepSelect}
                aria-label={`Step ${step}: ${title}${isCompleted ? ' (completed)' : ''}`}
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full border text-2xs font-semibold',
                  'disabled:pointer-events-none disabled:opacity-100',
                  isCompleted && 'border-primary bg-primary text-primary-foreground',
                  isActive && 'border-primary bg-primary text-primary-foreground',
                  !isCompleted && !isActive && 'border-border bg-card text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="size-3" aria-hidden /> : step}
              </Button>
              <div
                className={cn(
                  'mx-2 h-px flex-1 shrink-0',
                  isCompleted ? 'bg-primary' : 'bg-border'
                )}
                aria-hidden
              />
            </div>
            <div className="mt-1 min-w-0 pl-8">
              <p className="text-xs leading-tight font-semibold text-foreground">{title}</p>
              <p className="mt-0.5 text-2xs leading-snug text-muted-foreground block">
                {description}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export interface CreationStepConfig<TStep extends number> {
  step: TStep
  title: string
  description: string
}

export interface CreationStepperProps<TStep extends number> {
  steps: readonly CreationStepConfig<TStep>[]
  currentStep: TStep
  onStepSelect?: (step: TStep) => void
  ariaLabel: string
}
