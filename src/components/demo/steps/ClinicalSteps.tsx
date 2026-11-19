'use client'

import { Fragment, useState } from 'react'
import { CheckCircle2, Download, PenLine, Send, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { AgentProgress, DoneBanner, KeyValueGrid, useFakeRun } from '@/components/demo/DemoUi'
import { formatDateTime, fullName, money } from '@/demo/engine'
import { downloadEstimatePdf, downloadNotePdf } from '@/demo/pdf'
import { PRACTICE, payerById, providerById } from '@/demo/reference'
import { useDemoStore } from '@/demo/store'
import { ui } from '@/styles/ui'
import { cn } from '@/utils'
import { ContinueButton, MiniTable, PanelShell, type StepPanelProps } from './shared'

const NOTE_STAGES = ['Extracting HPI, ROS and exam findings…', 'Structuring timed infusion log…', 'Applying note template…', 'Checking documentation completeness…']

const NoteLine = ({ text }: { text: string }) => {
  if (text.startsWith('• ')) {
    return (
      <li className="ml-4 list-disc pl-1 text-sm leading-relaxed text-foreground">{text.slice(2)}</li>
    )
  }
  const colon = text.indexOf(':')
  if (colon > 0 && colon < 34 && text.slice(0, colon) === text.slice(0, colon).toUpperCase()) {
    return (
      <p className="text-sm leading-relaxed text-foreground">
        <span className="font-semibold">{text.slice(0, colon + 1)}</span>
        {text.slice(colon + 1)}
      </p>
    )
  }
  return <p className="text-sm leading-relaxed text-foreground">{text}</p>
}

export const NoteStep = ({ c, patient, goTo }: StepPanelProps) => {
  const generateNote = useDemoStore((s) => s.generateNote)
  const signNote = useDemoStore((s) => s.signNote)
  const run = useFakeRun(3200, NOTE_STAGES)
  const { note } = c
  const provider = providerById(c.appointment.providerId)

  return (
    <PanelShell
      step="note"
      actions={
        note ? (
          <Fragment>
            <Button type="button" variant="outline" size="sm" onClick={() => downloadNotePdf(c, patient)}>
              <Download className="size-3.5" aria-hidden />
              Download PDF
            </Button>
            {note.signedAt ? (
              <ContinueButton from="note" goTo={goTo} />
            ) : (
              <Button type="button" variant="primary" size="sm" onClick={() => signNote(c.id)}>
                <PenLine className="size-3.5" aria-hidden />
                Sign & finalize note
              </Button>
            )}
          </Fragment>
        ) : (
          <Button type="button" variant="primary" size="sm" disabled={run.running} isLoading={run.running} onClick={() => run.start(() => generateNote(c.id))}>
            <Sparkles className="size-3.5" aria-hidden />
            Generate clinical note
          </Button>
        )
      }
    >
      <AgentProgress run={run} agent="Documentation Agent" />
      {note ? (
        <Fragment>
          {note.signedAt ? (
            <DoneBanner title="Note signed and locked" detail={`Electronically signed by ${provider.name}, ${provider.credentials} · ${formatDateTime(note.signedAt)}`} />
          ) : (
            <div className={cn('rounded-card border px-3 py-2.5 text-sm', ui.tone.yellow)}>
              Draft generated {formatDateTime(note.generatedAt)} — review and sign to release for coding.
            </div>
          )}
          <article className="rounded-card border border-border bg-card p-6">
            <header className="mb-4 border-b border-border pb-3">
              <div className={ui.typography.eyebrow}>{PRACTICE.name}</div>
              <h2 className="mt-1 text-lg font-bold uppercase tracking-tight text-foreground">{note.title}</h2>
              <div className="mt-1 text-xs text-muted-foreground">
                {fullName(patient)} · {c.encounterNumber} · Dr. {provider.name}
              </div>
            </header>
            <div className="flex flex-col gap-5">
              {note.sections.map((section) => (
                <section key={section.heading}>
                  <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-primary">{section.heading}</h3>
                  <ul className="flex flex-col gap-1">
                    {section.lines.map((line, i) => (
                      <NoteLine key={i} text={line} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            {note.signedAt ? (
              <footer className="mt-5 border-t border-border pt-3 text-xs italic text-muted-foreground">
                Electronically signed by {provider.name}, {provider.credentials} · {formatDateTime(note.signedAt)}
              </footer>
            ) : null}
          </article>
        </Fragment>
      ) : run.running ? null : (
        <div className="rounded-card border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
          The Documentation Agent will draft a structured note from the {c.transcript?.length ?? 0}-utterance transcript using the visit-type template.
        </div>
      )}
    </PanelShell>
  )
}

const ESTIMATE_STAGES = ['Loading payer fee schedule…', 'Applying benefits from 271…', 'Computing deductible, copay and coinsurance…']

export const EstimateStep = ({ c, patient, goTo }: StepPanelProps) => {
  const createEstimate = useDemoStore((s) => s.createEstimate)
  const shareEstimate = useDemoStore((s) => s.shareEstimate)
  const run = useFakeRun(2400, ESTIMATE_STAGES)
  const { estimate, eligibility } = c
  const payer = payerById(patient.insurance.payerId)

  return (
    <PanelShell
      step="estimate"
      actions={
        estimate ? (
          <Fragment>
            <Button type="button" variant="outline" size="sm" onClick={() => downloadEstimatePdf(c, patient)}>
              <Download className="size-3.5" aria-hidden />
              Estimate PDF
            </Button>
            {estimate.sharedWithPatient ? null : (
              <Button type="button" variant="outline" size="sm" onClick={() => shareEstimate(c.id)}>
                <Send className="size-3.5" aria-hidden />
                Send estimate to patient
              </Button>
            )}
            <ContinueButton from="estimate" goTo={goTo} />
          </Fragment>
        ) : (
          <Button type="button" variant="primary" size="sm" disabled={run.running} isLoading={run.running} onClick={() => run.start(() => createEstimate(c.id))}>
            <Sparkles className="size-3.5" aria-hidden />
            Calculate patient estimate
          </Button>
        )
      }
    >
      <AgentProgress run={run} agent="Estimate Agent" />
      {estimate ? (
        <Fragment>
          <div className="grid grid-cols-1 gap-3 @2xl:grid-cols-3">
            <div className={cn('rounded-card border p-4', ui.tone.orange)}>
              <div className="text-2xs font-semibold uppercase tracking-wide">Patient responsibility</div>
              <div className="mt-1 text-3xl font-bold text-foreground">{money(estimate.patientResponsibility)}</div>
              <div className="mt-1 text-xs text-foreground/80">What {patient.firstName} is expected to pay</div>
            </div>
            <div className={cn('rounded-card border p-4', ui.tone.green)}>
              <div className="text-2xs font-semibold uppercase tracking-wide">Expected insurance payment</div>
              <div className="mt-1 text-3xl font-bold text-foreground">{money(estimate.insurancePays)}</div>
              <div className="mt-1 text-xs text-foreground/80">{payer.name}</div>
            </div>
            <div className={cn('rounded-card border p-4', ui.tone.gray)}>
              <div className="text-2xs font-semibold uppercase tracking-wide">Total charges</div>
              <div className="mt-1 text-3xl font-bold text-foreground">{money(estimate.totalCharges)}</div>
              <div className="mt-1 text-xs text-foreground/80">Allowed {money(estimate.allowedAmount)} under contract</div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 @3xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <MiniTable
              head={['Breakdown', 'Amount']}
              alignRight={[1]}
              rows={[
                ['Billed charges', money(estimate.totalCharges)],
                ['Contractual adjustment (in-network discount)', `− ${money(estimate.contractualAdjustment)}`],
                ['Allowed amount', money(estimate.allowedAmount)],
                ['Copay', money(estimate.copayAmount)],
                ['Deductible applied', money(estimate.deductibleApplied)],
                [`Coinsurance (${payer.coinsurancePct}%)`, money(estimate.coinsuranceAmount)],
              ]}
              footer={['Patient pays / Insurance pays', `${money(estimate.patientResponsibility)} / ${money(estimate.insurancePays)}`]}
            />
            <div className="flex flex-col gap-3">
              <div className={cn(ui.surface.card, 'p-4')}>
                <div className={ui.typography.sectionTitle}>Patient share of allowed</div>
                <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-warning" style={{ width: `${(estimate.patientResponsibility / Math.max(estimate.allowedAmount, 1)) * 100}%` }} />
                  <div className="h-full flex-1 bg-primary" />
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Patient {Math.round((estimate.patientResponsibility / Math.max(estimate.allowedAmount, 1)) * 100)}%</span>
                  <span>Insurance {Math.round((estimate.insurancePays / Math.max(estimate.allowedAmount, 1)) * 100)}%</span>
                </div>
              </div>
              {eligibility ? (
                <KeyValueGrid
                  columns={2}
                  items={[
                    { label: 'Deductible remaining', value: money(eligibility.deductible - eligibility.deductibleMet) },
                    { label: 'OOP remaining', value: eligibility.oopMax > 0 ? money(eligibility.oopMax - eligibility.oopMet) : 'N/A' },
                  ]}
                />
              ) : null}
              {estimate.sharedWithPatient ? (
                <div className={cn('flex items-center gap-2 rounded-card border px-3 py-2 text-xs', ui.tone.green)}>
                  <ShieldCheck className="size-3.5" aria-hidden />
                  Estimate sent to {patient.phone} and {patient.email || 'patient portal'}
                </div>
              ) : null}
            </div>
          </div>
        </Fragment>
      ) : run.running ? null : (
        <div className="rounded-card border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
          Uses the approved codes, the {payer.name} contracted rates and the patient&apos;s live benefits to estimate what the patient owes and what insurance will pay.
        </div>
      )}
    </PanelShell>
  )
}

const DENIAL_STAGES = ['Loading payer edit library…', 'Running NCCI / MUE edits…', 'Validating modifiers and linkage…', 'Scoring denial probability…']

export const DenialStep = ({ c, goTo }: StepPanelProps) => {
  const runDenialCheck = useDemoStore((s) => s.runDenialCheck)
  const run = useFakeRun(3200, DENIAL_STAGES)
  const [expanded, setExpanded] = useState(true)
  const { denialCheck } = c

  return (
    <PanelShell
      step="denial"
      actions={
        denialCheck ? (
          <ContinueButton from="denial" goTo={goTo} />
        ) : (
          <Button type="button" variant="primary" size="sm" disabled={run.running} isLoading={run.running} onClick={() => run.start(() => runDenialCheck(c.id))}>
            <ShieldCheck className="size-3.5" aria-hidden />
            Run denial prevention agent
          </Button>
        )
      }
    >
      <AgentProgress run={run} agent="Denial Prevention Agent" />
      {denialCheck ? (
        <Fragment>
          <div className="grid grid-cols-1 gap-3 @2xl:grid-cols-3">
            <div className={cn('rounded-card border p-4', ui.tone.green)}>
              <div className="text-2xs font-semibold uppercase tracking-wide">Denial predicted</div>
              <div className="mt-1 text-3xl font-bold text-foreground">No</div>
              <div className="mt-1 text-xs text-foreground/80">Claim is clean to submit</div>
            </div>
            <div className={cn(ui.surface.card, 'p-4')}>
              <div className={ui.typography.eyebrow}>Risk score</div>
              <div className="mt-1 text-3xl font-bold text-foreground">
                {denialCheck.riskScore}
                <span className="text-base font-medium text-muted-foreground">/100</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Low risk</div>
            </div>
            <div className={cn(ui.surface.card, 'p-4')}>
              <div className={ui.typography.eyebrow}>Checks passed</div>
              <div className="mt-1 text-3xl font-bold text-foreground">
                {denialCheck.checks.length}/{denialCheck.checks.length}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Ran {formatDateTime(denialCheck.ranAt)}</div>
            </div>
          </div>
          <div>
            <Button type="button" variant="link" size="sm" onClick={() => setExpanded((v) => !v)}>
              {expanded ? 'Hide' : 'Show'} check details
            </Button>
            {expanded ? (
              <ul className="mt-2 grid grid-cols-1 gap-2 @xl:grid-cols-2">
                {denialCheck.checks.map((check) => (
                  <li key={check.label} className="flex items-start gap-2 rounded-card border border-border bg-card p-3">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">{check.label}</div>
                      <div className="text-xs text-muted-foreground">{check.detail}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Fragment>
      ) : run.running ? null : (
        <div className="rounded-card border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
          The Denial Prevention Agent scrubs the claim against payer rules before it leaves the building.
        </div>
      )}
    </PanelShell>
  )
}
