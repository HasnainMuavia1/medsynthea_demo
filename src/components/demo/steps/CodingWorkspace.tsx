'use client'

import { useState } from 'react'
import {
  Brain,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Code2,
  FileInput,
  FilePlus2,
  FileText,
  Lightbulb,
  LineChart,
  Loader2,
  Minus,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { Badge } from '@/components/shared/Badge'
import { AppDialog, AppDialogActions } from '@/components/shared/Dialog/AppDialog'
import { DocumentVisitPatientBanner } from '@/components/ui/Agents/DocumentVisitPatientBanner'
import { EncounterProgressIndicator } from '@/components/ui/Agents/EncounterProgressIndicator'
import { CodingCodeRow, type CodingCodeItem } from '@/components/ui/Agents/coding/CodingCodeRow'
import { CODING_INSIGHTS } from '@/demo/codingInsights'
import { formatDate, formatDateTime, money, totalCharges } from '@/demo/engine'
import { payerById, providerById, visitTypeById } from '@/demo/reference'
import { useDemoStore } from '@/demo/store'
import type { ProcedureLine } from '@/demo/types'
import { cn } from '@/utils'
import { PanelShell, type StepPanelProps } from './shared'

type CodingView = 'assign' | 'validate' | 'denial' | 'risk' | 'predict'

const VIEW_TABS: Array<{ id: CodingView; label: string; icon: LucideIcon }> = [
  { id: 'assign', label: 'Assign ICD & CPT / HCPCS', icon: FilePlus2 },
  { id: 'validate', label: 'Validate', icon: ShieldCheck },
  { id: 'denial', label: 'Denial prevention', icon: LineChart },
  { id: 'risk', label: 'Risk mitigation', icon: ShieldCheck },
  { id: 'predict', label: 'Predict denial', icon: Brain },
]

const RUN_MS: Record<CodingView, number> = { assign: 2600, validate: 1500, denial: 1800, risk: 1400, predict: 1300 }

const RUN_COPY: Record<CodingView, { label: string; description: string }> = {
  assign: { label: 'Assigning ICD and CPT / HCPCS codes…', description: 'Reading the signed note and mapping documentation to codes.' },
  validate: { label: 'Running validation…', description: 'Checking coding rules (PTP, MUE, modifiers, and related checks).' },
  denial: { label: 'Running denial prevention…', description: 'Checking codes and documentation for common denial risks.' },
  risk: { label: 'Applying risk mitigations…', description: 'Reviewing actions taken to reduce denial risk.' },
  predict: { label: 'Predicting denial likelihood…', description: 'Scoring this encounter against payer history.' },
}

const procItem = (p: ProcedureLine): CodingCodeItem => ({
  code: p.code,
  description: p.description,
  units: p.units,
  modifiers: p.modifiers,
  needsReview: p.confidence < 0.9,
  rationale: `${Math.round(p.confidence * 100)}% confidence · ${money(p.charge)}`,
})

const ActionLoading = ({ view }: { view: CodingView }) => (
  <div className="flex items-center gap-3 rounded-card border border-border bg-secondary/30 p-4" role="status">
    <Loader2 className="size-5 shrink-0 animate-spin text-primary" aria-hidden />
    <div>
      <p className="text-sm font-semibold text-foreground">{RUN_COPY[view].label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{RUN_COPY[view].description}</p>
    </div>
  </div>
)

const Empty = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-card border border-dashed border-border bg-secondary/20 px-4 py-6 text-center text-sm text-muted-foreground">{children}</div>
)

const CodeColumn = ({ title, tone, codes }: { title: string; tone: 'green' | 'blue'; codes: CodingCodeItem[] }) => (
  <div className="rounded-card border border-border bg-background p-4">
    <div className="mb-3 flex items-center gap-2.5">
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-md border', tone === 'green' ? 'border-pill-green-border bg-pill-green-bg text-primary' : 'border-pill-blue-border bg-pill-blue-bg text-pill-blue-text')}>
        <FileText className="size-4" aria-hidden />
      </span>
      <p className="text-sm font-semibold text-foreground">
        {title} ({codes.length} {codes.length === 1 ? 'Code' : 'Codes'})
      </p>
    </div>
    <ul className="divide-y divide-border/70">
      {codes.map((item) => (
        <li key={item.code} className="py-2.5 first:pt-0 last:pb-0">
          <CodingCodeRow item={item} className="text-sm leading-snug" />
        </li>
      ))}
    </ul>
  </div>
)

const ValidationBanner = ({ checks }: { checks: string[] }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-pill-green-border bg-pill-green-bg/50 p-4">
    <div className="flex min-w-0 items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <CheckCircle2 className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-primary">Validation Passed</p>
        <p className="mt-0.5 text-xs text-muted-foreground">No findings · {checks.join(' · ')}</p>
      </div>
    </div>
    <Badge tone="green" density="fit" dot>
      Passed
    </Badge>
  </div>
)

const FindingColumn = ({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) => (
  <div className="min-w-0 rounded-md border border-border bg-background p-3">
    <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
      <Icon className="size-3.5 text-primary" aria-hidden />
      {title}
    </div>
    <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
  </div>
)

export const CodingWorkspaceStep = ({ c, patient, goTo }: StepPanelProps) => {
  const runCoding = useDemoStore((s) => s.runCoding)
  const approveCoding = useDemoStore((s) => s.approveCoding)
  const setProcedureUnits = useDemoStore((s) => s.setProcedureUnits)
  const removeProcedure = useDemoStore((s) => s.removeProcedure)
  const { coding, note, appointment } = c
  const completed = Boolean(coding?.approvedAt)
  const insights = CODING_INSIGHTS[appointment.visitType]
  const [view, setView] = useState<CodingView>('assign')
  const [pending, setPending] = useState<CodingView | null>(null)
  const [ran, setRan] = useState<Record<CodingView, boolean>>({ assign: Boolean(coding), validate: completed, denial: completed, risk: completed, predict: completed })
  const [editOpen, setEditOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const provider = providerById(appointment.providerId)
  const payer = payerById(patient.insurance.payerId)

  const run = (next: CodingView) => {
    setPending(next)
    window.setTimeout(() => {
      if (next === 'assign') runCoding(c.id)
      setRan((r) => ({ ...r, [next]: true }))
      setPending(null)
    }, RUN_MS[next])
  }

  const selectView = (next: CodingView) => {
    setView(next)
    if (completed || pending) return
    if (next === 'assign' && !coding) run('assign')
    else if (next !== 'assign' && coding && !ran[next] && (next !== 'risk' || ran.denial)) run(next)
  }

  const handOff = () => {
    if (!completed) approveCoding(c.id)
    goTo('estimate')
  }

  const icd: CodingCodeItem[] = (coding?.diagnoses ?? []).map((d) => ({ code: d.code, description: d.description, units: null, modifiers: [], needsReview: d.confidence < 0.9, rationale: `${Math.round(d.confidence * 100)}% confidence` }))
  const cpt: CodingCodeItem[] = (coding?.procedures ?? []).map(procItem)
  const busy = pending !== null

  return (
    <PanelShell step="coding">
      <DocumentVisitPatientBanner
        patientName={`${patient.firstName} ${patient.lastName}`}
        mrn={patient.mrn}
        appointment={`${formatDate(`${appointment.date}T12:00:00`)} · ${appointment.time}`}
        department={provider.specialty}
        visitType={visitTypeById(appointment.visitType).short}
        insurance={payer.name}
        insuranceHint={patient.insurance.memberId}
      />
      <div className="rounded-card border border-border bg-card px-4 py-3">
        <EncounterProgressIndicator
          label="Coding progress"
          steps={[
            { key: 'codes_assigned', label: 'Codes assigned', complete: Boolean(coding) },
            { key: 'validated', label: 'Validated', complete: ran.validate },
            { key: 'denial_checked', label: 'Denial check', complete: ran.denial },
            { key: 'completed', label: 'Complete', complete: completed },
            { key: 'claims_handed_off', label: 'Claims', complete: Boolean(c.estimate) },
          ]}
        />
      </div>

      <section className="flex flex-col gap-4 rounded-card border border-border bg-card p-4">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-pill-blue-border bg-pill-blue-bg text-pill-blue-text">
            <Code2 className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">Assign & Validate</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{completed ? 'Coding is complete. Codes are read-only for this encounter.' : 'Assign and validate ICD and CPT codes from the signed note.'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Coding actions">
          {VIEW_TABS.map(({ id, label, icon: Icon }) => {
            const active = view === id
            return (
              <Button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                variant={active ? 'primary' : 'outline'}
                size="md"
                className={cn(!active && 'bg-background')}
                isLoading={pending === id}
                disabled={(id === 'assign' ? completed && !coding : false) || (busy && pending !== id)}
                onClick={() => selectView(id)}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {label}
              </Button>
            )
          })}
          <Button type="button" variant="outline" size="md" className="bg-background" disabled={!coding || busy} onClick={handOff} title={coding ? 'Complete coding and continue to the patient estimate' : 'Need at least one ICD and one CPT / HCPCS.'}>
            <FileInput className="size-4 shrink-0" aria-hidden />
            Hand off to claims
          </Button>
        </div>

        {view === 'assign' ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground">Assign & Validate</h3>
              {coding ? (
                <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => setEditOpen(true)}>
                  <Pencil className="size-3.5 shrink-0" aria-hidden />
                  {completed ? 'View codes' : 'Edit codes'}
                </Button>
              ) : null}
            </div>
            {pending === 'assign' ? (
              <ActionLoading view="assign" />
            ) : coding ? (
              <div className="grid grid-cols-1 gap-4 @3xl:grid-cols-2">
                <CodeColumn title="ICD-10-CM" tone="green" codes={icd} />
                <CodeColumn title="CPT / HCPCS" tone="blue" codes={cpt} />
              </div>
            ) : (
              <Empty>Click Assign ICD & CPT / HCPCS to populate codes from the signed note.</Empty>
            )}
            {coding && pending !== 'assign' ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-secondary/30 p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Financial estimate</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {coding.procedures.length} service lines · coded {formatDateTime(coding.codedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xl font-semibold tabular-nums text-foreground">{money(totalCharges(coding))}</p>
                  <p className="text-2xs text-muted-foreground">Total billed charges</p>
                </div>
              </div>
            ) : null}
            {ran.validate ? <ValidationBanner checks={insights.validationChecks.slice(0, 3)} /> : null}
          </div>
        ) : null}

        {view === 'validate' ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground">Validate</h3>
              {!completed ? (
                <Button type="button" variant="outline" size="sm" isLoading={pending === 'validate'} disabled={!coding || busy} onClick={() => run('validate')}>
                  Run validation
                </Button>
              ) : null}
            </div>
            {pending === 'validate' ? (
              <ActionLoading view="validate" />
            ) : ran.validate ? (
              <>
                <ValidationBanner checks={insights.validationChecks.slice(0, 3)} />
                <ul className="grid grid-cols-1 gap-2 @md:grid-cols-2 @3xl:grid-cols-3">
                  {insights.validationChecks.map((check) => (
                    <li key={check} className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground">
                      <CheckCircle2 className="size-3.5 shrink-0 text-primary" aria-hidden />
                      {check}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Empty>{coding ? 'Run validation to check assigned codes.' : 'Assign codes first.'}</Empty>
            )}
          </div>
        ) : null}

        {view === 'denial' ? (
          pending === 'denial' ? (
            <ActionLoading view="denial" />
          ) : ran.denial ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">Denial prevention</h3>
                <span className="text-2xs font-medium text-muted-foreground">
                  {insights.findings.length} findings · {insights.findings.filter((f) => f.severity === 'MEDIUM').length} medium · all addressed
                </span>
              </div>
              {insights.findings.map((f) => (
                <div key={f.title} className="rounded-card border border-border bg-card p-4">
                  <div className="mb-3 flex flex-col gap-1.5">
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge tone={f.severity === 'MEDIUM' ? 'yellow' : 'blue'} density="fit">
                        {f.severity}
                      </Badge>
                      <span className="font-mono text-xs font-semibold tabular-nums text-foreground">{Math.round(f.confidence * 100)}%</span>
                    </span>
                    <span className="text-sm font-semibold text-foreground">{f.title}</span>
                    <span className="text-xs text-muted-foreground">{f.codes}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 @2xl:grid-cols-3">
                    <FindingColumn icon={FileText} title="Evidence" body={f.evidence} />
                    <FindingColumn icon={CircleHelp} title="Why this may cause a denial" body={f.why} />
                    <FindingColumn icon={Lightbulb} title="Recommended action" body={f.action} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty>{coding ? 'Open this tab to run denial prevention.' : 'Assign codes first.'}</Empty>
          )
        ) : null}

        {view === 'risk' ? (
          pending === 'risk' ? (
            <ActionLoading view="risk" />
          ) : !ran.denial ? (
            <Empty>Run Denial prevention first, then open Risk mitigation.</Empty>
          ) : ran.risk ? (
            <section className="rounded-card border border-border bg-card p-4">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pill-green-bg text-primary">
                    <ShieldCheck className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">Recommended Risk Mitigations</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">Review actions already applied to reduce denial risk before claim submission.</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-pill-blue-border bg-pill-blue-bg px-2.5 py-0.5 text-2xs font-semibold text-pill-blue-text">
                  <span className="size-1.5 rounded-full bg-pill-blue-text" aria-hidden />
                  Applied
                </span>
              </div>
              <ul className="divide-y divide-border">
                {insights.mitigations.map((m) => (
                  <li key={m.title} className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.title}</p>
                      <p className="text-xs text-muted-foreground">{m.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <Empty>Open this tab to load recommendations.</Empty>
          )
        ) : null}

        {view === 'predict' ? (
          pending === 'predict' ? (
            <ActionLoading view="predict" />
          ) : ran.predict ? (
            <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <div className="flex flex-col items-center justify-center rounded-card border border-pill-green-border bg-pill-green-bg/50 p-5 text-center">
                <p className="text-2xs font-semibold uppercase tracking-wide text-primary">Predicted denial</p>
                <p className="mt-1 font-mono text-4xl font-semibold tabular-nums text-foreground">{insights.prediction.probability}%</p>
                <Badge tone="green" density="fit" className="mt-2">
                  Low risk
                </Badge>
              </div>
              <ul className="flex flex-col gap-2 rounded-card border border-border bg-card p-4">
                {insights.prediction.factors.map((f) => (
                  <li key={f.label} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 text-xs text-foreground">{f.label}</span>
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                      <div className={cn('h-full rounded-full', f.impact === 'lowers' ? 'bg-primary' : 'bg-warning')} style={{ width: `${f.weight * 3}%` }} />
                    </div>
                    <span className={cn('w-14 text-right text-2xs font-medium', f.impact === 'lowers' ? 'text-primary' : 'text-warning')}>{f.impact === 'lowers' ? `−${f.weight}` : `+${f.weight}`}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <Empty>{coding ? 'Open this tab to predict denial likelihood.' : 'Assign codes first.'}</Empty>
          )
        ) : null}
      </section>

      <section className="rounded-card border border-border bg-card">
        <Button type="button" variant="unstyled" size="auto" className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" aria-expanded={noteOpen} onClick={() => setNoteOpen((v) => !v)}>
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-pill-green-border bg-pill-green-bg text-primary">
              <FileText className="size-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">Signed clinical note</span>
              <span className="block text-xs text-muted-foreground">{note?.signedAt ? `${note.title} · signed ${formatDateTime(note.signedAt)}` : 'Not signed'}</span>
            </span>
          </span>
          <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', noteOpen && 'rotate-180')} aria-hidden />
        </Button>
        {noteOpen && note ? (
          <div className="max-h-96 overflow-y-auto border-t border-border px-4 py-3 custom-scrollbar">
            {note.sections.map((s) => (
              <div key={s.heading} className="mb-3">
                <p className="text-2xs font-bold uppercase tracking-wide text-primary">{s.heading}</p>
                {s.lines.map((l, i) => (
                  <p key={i} className="text-xs leading-relaxed text-foreground">
                    {l}
                  </p>
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
        {completed ? (
          <>
            <span className="mr-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              <CheckCircle2 className="size-4 shrink-0" aria-hidden />
              Coding is complete for this encounter
            </span>
            <Button type="button" variant="primary" size="md" onClick={() => goTo('estimate')}>
              Continue to step 8: Patient estimate
            </Button>
          </>
        ) : (
          <Button type="button" variant="primary" size="md" disabled={!coding || busy} onClick={() => approveCoding(c.id)}>
            Complete coding
          </Button>
        )}
      </div>

      <AppDialog
        open={editOpen}
        title={completed ? 'Codes' : 'Edit codes'}
        description="Adjust units or remove lines before completing coding. Charges recalculate automatically."
        onClose={() => setEditOpen(false)}
        footer={
          <AppDialogActions>
            <Button variant="primary" onClick={() => setEditOpen(false)}>
              Done
            </Button>
          </AppDialogActions>
        }
      >
        <ul className="divide-y divide-border rounded-card border border-border">
          {(coding?.procedures ?? []).map((p, i) => (
            <li key={`${p.code}-${i}`} className="flex items-center gap-3 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <CodingCodeRow item={procItem(p)} className="text-sm" />
              </div>
              {completed ? (
                <span className="text-xs text-muted-foreground">×{p.units}</span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Button type="button" variant="outline" size="icon" className="!size-7" aria-label={`Decrease units for ${p.code}`} disabled={p.units <= 1} onClick={() => setProcedureUnits(c.id, i, p.units - 1)}>
                    <Minus className="size-3" aria-hidden />
                  </Button>
                  <span className="w-6 text-center text-sm">{p.units}</span>
                  <Button type="button" variant="outline" size="icon" className="!size-7" aria-label={`Increase units for ${p.code}`} onClick={() => setProcedureUnits(c.id, i, p.units + 1)}>
                    <Plus className="size-3" aria-hidden />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="!size-7 text-muted-foreground hover:text-destructive" aria-label={`Remove ${p.code}`} disabled={(coding?.procedures.length ?? 0) <= 1} onClick={() => removeProcedure(c.id, i)}>
                    <Trash2 className="size-3.5" aria-hidden />
                  </Button>
                </span>
              )}
              <span className="w-20 text-right font-mono text-xs tabular-nums text-foreground">{money(p.charge)}</span>
            </li>
          ))}
        </ul>
        {coding ? <p className="mt-3 text-right text-sm font-semibold text-foreground">Total {money(totalCharges(coding))}</p> : null}
      </AppDialog>
    </PanelShell>
  )
}
