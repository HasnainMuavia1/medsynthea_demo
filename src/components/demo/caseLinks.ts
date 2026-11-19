import type { StepId } from '@/demo/types'

export const caseHref = (caseId: string, step?: StepId | null): string =>
  step ? `/dashboard/cases/${caseId}?step=${step}` : `/dashboard/cases/${caseId}`
