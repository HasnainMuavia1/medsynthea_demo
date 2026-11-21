'use client'

import { Suspense, useEffect, useRef, type ComponentType } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Check, FileX, Lock, Loader2, Play, Square } from 'lucide-react'
import { RcmPage } from '@/components/ui/Rcm/RcmLayout'
import { RcmAvatar } from '@/components/ui/Rcm/RcmPrimitives'
import { Button } from '@/components/shared/Button'
import { EmptyHint } from '@/components/demo/DemoUi'
import { StageBadge, StepProgress } from '@/components/demo/StageBadge'
import { caseHref } from '@/components/demo/caseLinks'
import { AutopilotProvider, useAutopilot } from '@/components/demo/useAutopilot'
import { isAwaitingPayer } from '@/demo/autopilot'
import { AppointmentStep, AudioStep, EligibilityStep, RegistrationStep, TranscriptionStep } from '@/components/demo/steps/FrontOfficeSteps'
import { DenialStep, EstimateStep, NoteStep } from '@/components/demo/steps/ClinicalSteps'
import { CodingWorkspaceStep } from '@/components/demo/steps/CodingWorkspace'
import { ClaimCms1500Step } from '@/components/demo/steps/ClaimCms1500'
import { EobStep, EraStep, ReconciliationStep, StatusStep, SubmissionStep } from '@/components/demo/steps/BillingSteps'
import type { StepPanelProps } from '@/components/demo/steps/shared'
import { currentStep, formatDate, fullName, isCaseClosed, isStepDone } from '@/demo/engine'
import { STEPS, providerById, visitTypeById } from '@/demo/reference'
import { useCase, usePatient } from '@/demo/store'
import type { StepId } from '@/demo/types'
import { ui } from '@/styles/ui'
import { cn } from '@/utils'

const PANELS: Record<StepId, ComponentType<StepPanelProps>> = {
  registration: RegistrationStep,
  appointment: AppointmentStep,
  eligibility: EligibilityStep,
  audio: AudioStep,
  transcription: TranscriptionStep,
  note: NoteStep,
  coding: CodingWorkspaceStep,
  estimate: EstimateStep,
  denial: DenialStep,
  claim: ClaimCms1500Step,
  submission: SubmissionStep,
  status: StatusStep,
  era: EraStep,
  eob: EobStep,
  reconciliation: ReconciliationStep,
}

const isStepId = (v: string | null): v is StepId => STEPS.some((s) => s.id === v)

const CaseWorkspace = () => {
  const router = useRouter()
  const params = useSearchParams()
  const { caseId } = useParams<{ caseId: string }>()
  const c = useCase(caseId)
  const patient = usePatient(c?.patientId ?? null)

  const requestedStep = params.get('step')
  const activeStepRef = useRef<HTMLButtonElement>(null)
  const autopilot = useAutopilot(caseId, (step) => router.replace(caseHref(caseId, step), { scroll: false }))
  useEffect(() => {
    document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' })
    activeStepRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [requestedStep])

  const caseExists = Boolean(c)
  const initialStep = c ? currentStep(c) : null
  useEffect(() => {
    if (caseExists && initialStep && !isStepId(requestedStep)) router.replace(caseHref(caseId, initialStep), { scroll: false })
  }, [caseExists, initialStep, requestedStep, caseId, router])

  if (!c || !patient) {
    return (
      <RcmPage>
        <EmptyHint icon={FileX} title="Encounter not found" hint="It may have been removed." action={<Button href="/dashboard/appointments" variant="outline" size="sm">Back to appointments</Button>} />
      </RcmPage>
    )
  }

  const current = currentStep(c)
  const currentIndex = STEPS.findIndex((s) => s.id === current)
  const requested = params.get('step')
  const requestedIndex = isStepId(requested) ? STEPS.findIndex((s) => s.id === requested) : -1
  const active: StepId = requestedIndex >= 0 && (requestedIndex <= currentIndex || isStepDone(c, STEPS[requestedIndex].id)) ? STEPS[requestedIndex].id : current
  const Panel = PANELS[active]
  const visit = visitTypeById(c.appointment.visitType)
  const provider = providerById(c.appointment.providerId)
  const goTo = (step: StepId) => router.push(caseHref(c.id, step), { scroll: false })

  return (
    <AutopilotProvider value={autopilot}>
    <RcmPage>
      <Button href="/dashboard/appointments" variant="link" size="sm" className={ui.interact.backLink}>
        <ArrowLeft className="size-3.5" aria-hidden />
        Appointments
      </Button>

      <div className={cn(ui.surface.card, 'mt-2 mb-4 flex flex-wrap items-center gap-x-4 gap-y-3 p-4')}>
        <RcmAvatar name={fullName(patient)} className="size-11 text-sm" />
        <div className="min-w-0 flex-1 basis-48">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className={cn(ui.typography.heroTitle, 'font-bold')}>{fullName(patient)}</h1>
            <StageBadge c={c} />
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground md:truncate">
            {patient.mrn} · {c.encounterNumber} · {visit.short} · {formatDate(`${c.appointment.date}T12:00:00`)} {c.appointment.time} · Dr. {provider.name} · {patient.insurance.payerName}
          </div>
        </div>
        {isCaseClosed(c) ? null : autopilot.running ? (
          <div className="flex shrink-0 items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-primary" role="status">
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              {autopilot.label}…
            </span>
            <Button type="button" variant="outline" size="sm" onClick={autopilot.stop}>
              <Square className="size-3" aria-hidden />
              Stop
            </Button>
          </div>
        ) : !c.claim?.submittedAt ? (
          <Button type="button" variant="outline" size="sm" onClick={() => autopilot.start('workflow')} title="Run every step up to claim submission">
            <Play className="size-3.5" aria-hidden />
            Autopilot
          </Button>
        ) : isAwaitingPayer(c) ? (
          <Button type="button" variant="outline" size="sm" onClick={() => autopilot.start('payer')} title="Simulate claim status, ERA and EOB">
            <Play className="size-3.5" aria-hidden />
            Demo autopilot
          </Button>
        ) : null}
        <div className="w-full shrink-0 sm:w-44">
          <div className={cn(ui.typography.eyebrow, 'mb-1')}>Revenue cycle progress</div>
          <StepProgress c={c} />
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[var(--spacing-app-sidebar)_minmax(0,1fr)]">
        <nav aria-label="Revenue cycle steps" className={cn(ui.surface.card, 'min-w-0 p-2 xl:sticky xl:top-4')}>
          <ol className="flex gap-1 overflow-x-auto no-scrollbar xl:flex-col xl:gap-px xl:overflow-visible">
            {STEPS.map((s, i) => {
              const done = isStepDone(c, s.id)
              const reachable = done || i <= currentIndex
              const isActive = s.id === active
              return (
                <li key={s.id} className="shrink-0 xl:shrink">
                  <Button
                    ref={isActive ? activeStepRef : undefined}
                    type="button"
                    variant="unstyled"
                    size="auto"
                    disabled={!reachable}
                    onClick={() => goTo(s.id)}
                    className={cn(
                      'flex w-full items-center justify-start gap-2.5 rounded-md px-2 py-1.5 text-left whitespace-normal max-xl:w-44',
                      isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground',
                      !reachable && 'opacity-60'
                    )}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <span
                      className={cn(
                        'flex size-6 shrink-0 items-center justify-center rounded-full border text-2xs font-semibold',
                        done ? 'border-primary bg-primary text-primary-foreground' : s.id === current ? 'border-primary text-primary' : 'border-border text-muted-foreground'
                      )}
                    >
                      {done ? <Check className="size-3.5" aria-hidden /> : reachable ? s.number : <Lock className="size-3" aria-hidden />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn('block truncate text-xs font-medium', isActive && 'font-semibold text-foreground')}>{s.label}</span>
                      <span className="block truncate text-2xs text-muted-foreground">{done ? 'Completed' : s.id === current ? 'In progress' : 'Locked'}</span>
                    </span>
                  </Button>
                </li>
              )
            })}
          </ol>
        </nav>
        <div className="@container min-w-0">
          <Panel key={active} c={c} patient={patient} goTo={goTo} />
        </div>
      </div>
    </RcmPage>
    </AutopilotProvider>
  )
}

const CasePage = () => (
  <Suspense fallback={null}>
    <CaseWorkspace />
  </Suspense>
)

export default CasePage
