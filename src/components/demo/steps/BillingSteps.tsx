'use client'

import { Fragment, useState } from 'react'
import { AlertTriangle, Banknote, CheckCircle2, Circle, CreditCard, Download, Globe, Landmark, Loader2, Lock, PhoneCall, RefreshCw, Send } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { AgentProgress, DoneBanner, KeyValueGrid, useFakeRun } from '@/components/demo/DemoUi'
import { CARC_LABELS, STATUS_SEQUENCE, isDenialOpen, formatDate, formatDateTime, fullName, money, round2, usDob } from '@/demo/engine'
import { downloadEobPdf, downloadStatementPdf } from '@/demo/pdf'
import { PRACTICE, payerById, providerById } from '@/demo/reference'
import { useDemoStore } from '@/demo/store'
import { ui } from '@/styles/ui'
import { cn } from '@/utils'
import { WebPortalSubmission } from '@/components/demo/WebPortalSubmission'
import { AppDialog, AppDialogActions } from '@/components/shared/Dialog/AppDialog'
import { FormField } from '@/components/shared/FormField/FormField'
import { Select } from '@/components/shared/Select'
import { ContinueButton, MiniTable, PanelShell, RawBlock, type StepPanelProps } from './shared'

const SUBMIT_STAGES = ['Encrypting 837P batch…', `Transmitting to ${PRACTICE.clearinghouse}…`, 'Awaiting transport acknowledgment…']

export const SubmissionStep = ({ c, patient, goTo }: StepPanelProps) => {
  const submitClaim = useDemoStore((s) => s.submitClaim)
  const run = useFakeRun(2600, SUBMIT_STAGES)
  const [method, setMethod] = useState<'edi' | 'portal'>('edi')
  const [portalRunning, setPortalRunning] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [usage, setUsage] = useState('production')
  const { claim, coding } = c
  const submitted = Boolean(claim?.submittedAt)
  const payer = payerById(patient.insurance.payerId)

  return (
    <PanelShell
      step="submission"
      actions={
        submitted ? (
          <ContinueButton from="submission" goTo={goTo} />
        ) : portalRunning ? null : (
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={run.running || !claim}
            isLoading={run.running}
            onClick={() => (method === 'edi' ? setSubmitOpen(true) : setPortalRunning(true))}
          >
            {method === 'edi' ? <Send className="size-3.5" aria-hidden /> : <Globe className="size-3.5" aria-hidden />}
            {method === 'edi' ? 'Submit claim' : 'Start web portal submission'}
          </Button>
        )
      }
    >
      <AgentProgress run={run} agent="Claims Agent" />
      {submitted && claim ? (
        <Fragment>
          <DoneBanner
            title={`Claim submitted via ${claim.submissionMethod === 'portal' ? 'payer web portal' : 'EDI clearinghouse'}`}
            detail={`${claim.claimId} transmitted ${formatDateTime(claim.submittedAt ?? '')} — status updates will arrive automatically.`}
          />
          <KeyValueGrid
            columns={4}
            items={[
              { label: 'Claim ID', value: <span className="font-mono">{claim.claimId}</span> },
              claim.submissionMethod === 'portal'
                ? { label: 'Portal confirmation', value: <span className="font-mono">{claim.portalConfirmation}</span> }
                : { label: 'Batch', value: <span className="font-mono">{claim.batchId}</span> },
              { label: 'Channel', value: claim.submissionMethod === 'portal' ? `${payer.name} portal` : claim.clearinghouse },
              { label: 'Billed amount', value: money(claim.totalCharge) },
            ]}
          />
        </Fragment>
      ) : portalRunning && claim && coding ? (
        <WebPortalSubmission
          payerName={payer.name}
          portalUrl={payer.portal}
          formTitle="Claims — submit professional claim"
          fields={[
            { label: 'Member ID', value: patient.insurance.memberId },
            { label: 'Patient', value: `${fullName(patient)} · ${usDob(patient.dob)}` },
            { label: 'Date of service', value: c.appointment.date },
            { label: 'Billing NPI', value: PRACTICE.groupNpi },
            { label: 'Diagnoses', value: coding.diagnoses.map((d) => d.code).join(', ') },
            { label: 'Procedures', value: coding.procedures.map((p) => p.code).slice(0, 6).join(', ') },
            { label: 'Total charge', value: money(claim.totalCharge) },
            { label: 'Account #', value: claim.claimId },
          ]}
          attachments={[`${c.encounterNumber}-clinical-note.pdf`]}
          confirmationPrefix="CLMWEB"
          onDone={(conf) => submitClaim(c.id, 'portal', conf)}
        />
      ) : run.running ? null : (
        <div className="flex flex-col gap-3">
          {claim ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-pill-green-border bg-pill-green-bg/50 p-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CheckCircle2 className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">Ready to submit</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {claim.claimId} · revision {claim.revision} · finalized {claim.finalizedAt ? formatDateTime(claim.finalizedAt) : '—'} · {money(claim.totalCharge)}
                  </p>
                </div>
              </div>
              <span className={ui.typography.monoSlug}>{payer.name} · {payer.payerIdCode}</span>
            </div>
          ) : null}
          <div className={ui.typography.sectionTitle}>Submission channel</div>
          <div className="grid grid-cols-1 gap-3 @xl:grid-cols-2">
            {[
              { id: 'edi' as const, icon: Send, title: 'EDI via clearinghouse', detail: `837P batch through ${PRACTICE.clearinghouse} · 999/277CA acknowledgments` },
              { id: 'portal' as const, icon: Globe, title: 'Payer web portal (bot)', detail: `Bot signs in to the ${payer.name} portal, keys the claim and attaches the note` },
            ].map((opt) => {
              const Icon = opt.icon
              const active = method === opt.id
              return (
                <Button
                  key={opt.id}
                  type="button"
                  variant="unstyled"
                  size="auto"
                  onClick={() => setMethod(opt.id)}
                  aria-pressed={active}
                  className={cn('flex items-start justify-start gap-3 rounded-card border p-3 text-left whitespace-normal', active ? 'border-primary bg-primary/5 ring-2 ring-primary/15' : 'border-border bg-card hover:bg-secondary/40')}
                >
                  <Icon className={cn('mt-0.5 size-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">{opt.title}</span>
                    <span className="block text-xs text-muted-foreground">{opt.detail}</span>
                  </span>
                </Button>
              )
            })}
          </div>
        </div>
      )}
      <AppDialog
        open={submitOpen}
        title="Submit claim"
        description={`Submit this finalized claim to ${PRACTICE.clearinghouse}. The confirmed revision must match what you finalized on this claim.`}
        onClose={() => setSubmitOpen(false)}
        footer={
          <AppDialogActions>
            <Button variant="outline" onClick={() => setSubmitOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setSubmitOpen(false)
                run.start(() => submitClaim(c.id, 'edi', null))
              }}
            >
              Queue submit
            </Button>
          </AppDialogActions>
        }
      >
        <div className="grid gap-3">
          <p className={ui.typography.value}>
            Finalized revision: <span className={ui.typography.monoSlug}>{String(claim?.revision ?? 1)}</span>
          </p>
          <FormField id="claim-usage" label="Usage indicator">
            <Select
              id="claim-usage"
              value={usage}
              options={[
                { value: 'test', label: 'test' },
                { value: 'production', label: 'production' },
              ]}
              onChange={(e) => setUsage(e.target.value)}
            />
          </FormField>
          <p className={ui.typography.cardSubtitle}>Demo workspace — nothing is sent to a real clearinghouse.</p>
        </div>
      </AppDialog>
    </PanelShell>
  )
}

export const StatusStep = ({ c, goTo }: StepPanelProps) => {
  const advanceStatus = useDemoStore((s) => s.advanceStatus)
  const [checking, setChecking] = useState(false)
  const { claim, statusEvents, era } = c
  const paid = statusEvents.some((e) => e.code === 'paid')
  const tracking = Boolean(claim?.liveTracking) && !c.era && !c.eob && !isDenialOpen(c)
  const denialOpen = isDenialOpen(c)

  const checkNow = () => {
    setChecking(true)
    window.setTimeout(() => {
      advanceStatus(c.id)
      setChecking(false)
    }, 1200)
  }

  return (
    <PanelShell
      step="status"
      actions={
        <Fragment>
          {paid ? null : (
            <Button href={`/dashboard/ar/call/${c.id}`} variant={denialOpen ? 'primary' : 'outline'} size="sm">
              <PhoneCall className="size-3.5" aria-hidden />
              Call payer (AR agent)
            </Button>
          )}
          {(paid && era) || denialOpen ? null : (
            <Button type="button" variant="outline" size="sm" disabled={checking} isLoading={checking} onClick={checkNow}>
              <RefreshCw className="size-3.5" aria-hidden />
              {paid ? 'Fetch remittance' : 'Check status now (276)'}
            </Button>
          )}
          <ContinueButton from="status" goTo={goTo} disabled={!paid || denialOpen} />
        </Fragment>
      }
    >
      {c.denial ? (
        <div className={cn('rounded-card border px-3 py-2.5', denialOpen ? ui.tone.red : ui.tone.green)}>
          <div className="flex items-center gap-2 text-sm font-semibold">
            {denialOpen ? <AlertTriangle className="size-4" aria-hidden /> : <CheckCircle2 className="size-4" aria-hidden />}
            {denialOpen ? `Denied ${c.denial.code} — ${c.denial.reason}` : `Denial ${c.denial.code} resolved`}
          </div>
          <div className="mt-0.5 text-xs text-foreground/80">
            {denialOpen ? `${c.denial.remark} · denied ${formatDateTime(c.denial.deniedAt)}. Launch the AR caller agent to confirm the fix with the payer.` : `${c.denial.resolution} · ${formatDateTime(c.denial.resolvedAt ?? '')}`}
          </div>
        </div>
      ) : null}
      {c.arCalls.length ? (
        <div className="rounded-card border border-border bg-card p-3 text-xs">
          <div className="mb-1 flex items-center gap-1.5 font-semibold text-foreground">
            <PhoneCall className="size-3.5 text-primary" aria-hidden />
            Last AR call · {formatDateTime(c.arCalls[0].startedAt)} · ref {c.arCalls[0].referenceNumber}
          </div>
          <div className="text-muted-foreground">{c.arCalls[0].outcome}</div>
          {c.arCalls[0].actionTaken ? <div className="mt-1 font-medium text-primary">Action: {c.arCalls[0].actionTaken}</div> : null}
        </div>
      ) : null}
      {tracking ? (
        <div className={cn('flex items-center gap-2 rounded-card border px-3 py-2 text-xs', ui.tone.blue)}>
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          Status Agent is tracking this claim — updates arrive as notifications.
        </div>
      ) : null}
      <KeyValueGrid
        columns={3}
        items={[
          { label: 'Claim ID', value: <span className="font-mono">{claim?.claimId ?? '—'}</span> },
          { label: 'Payer claim #', value: <span className="font-mono">{claim?.payerClaimControl ?? 'Pending'}</span> },
          { label: 'Submitted', value: claim?.submittedAt ? formatDateTime(claim.submittedAt) : '—' },
        ]}
      />
      <ol className="flex flex-col">
        {STATUS_SEQUENCE.map((s, i) => {
          const event = statusEvents.find((e) => e.code === s.code)
          const isNext = !event && i === statusEvents.length
          return (
            <li key={s.code} className="flex gap-3">
              <div className="flex flex-col items-center">
                {event ? (
                  <CheckCircle2 className="size-5 text-primary" aria-hidden />
                ) : isNext ? (
                  <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />
                ) : (
                  <Circle className="size-5 text-border" aria-hidden />
                )}
                {i < STATUS_SEQUENCE.length - 1 ? <div className={cn('my-1 w-px flex-1', event ? 'bg-primary/40' : 'bg-border')} /> : null}
              </div>
              <div className="min-w-0 pb-4">
                <div className={cn('text-sm font-semibold', event ? 'text-foreground' : 'text-muted-foreground')}>{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.detail}</div>
                {event ? <div className="mt-0.5 text-2xs text-muted-foreground">{formatDateTime(event.at)}</div> : null}
              </div>
            </li>
          )
        })}
      </ol>
      {paid ? <DoneBanner title="Claim finalized as paid" detail={era ? `ERA received ${formatDateTime(era.receivedAt)}` : 'Waiting for the 835 remittance…'} /> : null}
    </PanelShell>
  )
}

export const EraStep = ({ c, patient, goTo }: StepPanelProps) => {
  const reviewEra = useDemoStore((s) => s.reviewEra)
  const [showRaw, setShowRaw] = useState(false)
  const { era, estimate, claim } = c
  const payer = payerById(patient.insurance.payerId)

  if (!era) {
    return (
      <PanelShell step="era">
        <div className="flex items-center gap-2 rounded-card border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Waiting for the payer&apos;s 835 remittance. It arrives automatically after the claim is paid.
        </div>
      </PanelShell>
    )
  }

  const variance = estimate ? round2(era.patientResponsibility - estimate.patientResponsibility) : 0
  const raw = [
    'ST*835*0001~',
    `BPR*I*${era.totalPaid}*C*ACH*CCP*01*111000025*DA*000123456*${payer.payerIdCode}**01*121000248*DA*987654321*${era.paymentDate.replace(/-/g, '')}~`,
    `TRN*1*${era.checkNumber}*1${payer.payerIdCode}~`,
    `N1*PR*${payer.name.toUpperCase()}~`,
    `N1*PE*${PRACTICE.name.toUpperCase()}*XX*${PRACTICE.groupNpi}~`,
    `CLP*${claim?.claimId}*1*${era.totalCharge}*${era.totalPaid}*${era.patientResponsibility}*12*${claim?.payerClaimControl}~`,
    `NM1*QC*1*${patient.lastName.toUpperCase()}*${patient.firstName.toUpperCase()}****MI*${patient.insurance.memberId}~`,
    ...era.lines.flatMap((l) => [
      `SVC*HC:${l.code}${l.modifiers.map((m) => `:${m}`).join('')}*${l.charge}*${l.paid}**${l.units}~`,
      ...l.adjustments.map((a) => `CAS*${a.group}*${a.reason}*${a.amount}~`),
      `AMT*B6*${l.allowed}~`,
    ]),
    'SE*42*0001~',
  ].join('\n')

  return (
    <PanelShell
      step="era"
      actions={
        <Fragment>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowRaw((v) => !v)}>
            {showRaw ? 'Hide' : 'View'} raw 835
          </Button>
          {era.reviewedAt ? (
            <ContinueButton from="era" goTo={goTo} />
          ) : (
            <Button type="button" variant="primary" size="sm" onClick={() => reviewEra(c.id)}>
              <CheckCircle2 className="size-3.5" aria-hidden />
              Mark ERA reviewed
            </Button>
          )}
        </Fragment>
      }
    >
      <DoneBanner title={`ERA received from ${payer.name}`} detail={`${era.paymentMethod} ${era.checkNumber} · ${money(era.totalPaid)} · received ${formatDateTime(era.receivedAt)}`} />
      <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-4">
        {[
          { label: 'Billed', value: money(era.totalCharge) },
          { label: 'Insurance paid', value: money(era.totalPaid) },
          { label: 'Contractual adj. (CO-45)', value: money(era.contractualAdjustment) },
          { label: 'Patient responsibility', value: money(era.patientResponsibility) },
        ].map((t) => (
          <div key={t.label} className={cn(ui.surface.card, 'p-3')}>
            <div className={ui.typography.eyebrow}>{t.label}</div>
            <div className="mt-1 text-xl font-semibold text-foreground">{t.value}</div>
          </div>
        ))}
      </div>
      {estimate ? (
        <div className={cn('rounded-card border px-3 py-2 text-xs', variance === 0 ? ui.tone.green : ui.tone.yellow)}>
          Estimate accuracy: patient estimate {money(estimate.patientResponsibility)} vs. ERA {money(era.patientResponsibility)}
          {variance === 0 ? ' — exact match.' : ` — variance ${money(variance)}.`}
        </div>
      ) : null}
      <MiniTable
        head={['Service', 'Units', 'Billed', 'Allowed', 'Paid', 'Adjustments']}
        alignRight={[1, 2, 3, 4]}
        rows={era.lines.map((l) => [
          <span key="c" className="font-mono font-semibold">{`${l.code}${l.modifiers.length ? `-${l.modifiers.join('-')}` : ''}`}</span>,
          l.units,
          money(l.charge),
          money(l.allowed),
          money(l.paid),
          <div key="a" className="flex flex-col gap-0.5 font-mono text-2xs leading-snug">
            {l.adjustments.map((a) => (
              <span key={`${a.group}${a.reason}`} title={CARC_LABELS[`${a.group}-${a.reason}`]} className={a.group === 'CO' ? 'text-muted-foreground' : 'text-pill-orange-text'}>
                {a.group}-{a.reason} {money(a.amount)}
              </span>
            ))}
          </div>,
        ])}
        footer={['Total', '', money(era.totalCharge), money(round2(era.totalCharge - era.contractualAdjustment)), money(era.totalPaid), '']}
      />
      {showRaw ? <RawBlock text={raw} /> : null}
    </PanelShell>
  )
}

export const EobStep = ({ c, patient, goTo }: StepPanelProps) => {
  const viewEob = useDemoStore((s) => s.viewEob)
  const { eob, era, claim, coding } = c
  const payer = payerById(patient.insurance.payerId)
  const provider = providerById(c.appointment.providerId)

  if (!eob || !era || !claim || !coding) {
    return (
      <PanelShell step="eob">
        <div className="flex items-center gap-2 rounded-card border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          The EOB becomes available shortly after the ERA is received.
        </div>
      </PanelShell>
    )
  }

  return (
    <PanelShell
      step="eob"
      actions={
        <Fragment>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              downloadEobPdf(c, patient)
              viewEob(c.id)
            }}
          >
            <Download className="size-3.5" aria-hidden />
            Download EOB (PDF)
          </Button>
          {eob.viewedAt ? (
            <ContinueButton from="eob" goTo={goTo} />
          ) : (
            <Button type="button" variant="primary" size="sm" onClick={() => viewEob(c.id)}>
              <CheckCircle2 className="size-3.5" aria-hidden />
              Mark EOB reviewed
            </Button>
          )}
        </Fragment>
      }
    >
      <article className="overflow-hidden rounded-card border border-border bg-card">
        <header className="flex items-start justify-between gap-4 bg-primary px-5 py-4 text-primary-foreground">
          <div>
            <div className="text-lg font-bold">{payer.name}</div>
            <div className="text-xs opacity-90">Explanation of Benefits — this is not a bill</div>
          </div>
          <div className="text-right text-xs opacity-90">
            <div className="font-mono">{eob.documentId}</div>
            <div>Issued {formatDate(eob.receivedAt)}</div>
          </div>
        </header>
        <div className="grid grid-cols-1 gap-4 border-b border-border p-5 text-xs @lg:grid-cols-3">
          <div>
            <div className={ui.typography.eyebrow}>Member</div>
            <div className="mt-1 font-semibold text-foreground">{fullName(patient)}</div>
            <div className="text-muted-foreground">ID {patient.insurance.memberId}</div>
            <div className="text-muted-foreground">Group {patient.insurance.groupNumber}</div>
          </div>
          <div>
            <div className={ui.typography.eyebrow}>Claim</div>
            <div className="mt-1 font-mono font-semibold text-foreground">{claim.payerClaimControl}</div>
            <div className="text-muted-foreground">Account {claim.claimId}</div>
            <div className="text-muted-foreground">Service {formatDate(`${c.appointment.date}T12:00:00`)}</div>
          </div>
          <div>
            <div className={ui.typography.eyebrow}>Provider</div>
            <div className="mt-1 font-semibold text-foreground">Dr. {provider.name}</div>
            <div className="text-muted-foreground">{PRACTICE.name}</div>
            <div className="text-muted-foreground">In-network</div>
          </div>
        </div>
        <div className="p-5">
          <MiniTable
            head={['Service', 'Billed', 'Plan discount', 'Plan paid', 'You owe']}
            alignRight={[1, 2, 3, 4]}
            rows={era.lines.map((l, i) => [
              <div key="s">
                <div className="font-mono text-xs font-semibold">{l.code}</div>
                <div className="text-2xs text-muted-foreground">{coding.procedures[i]?.description}</div>
              </div>,
              money(l.charge),
              money(l.adjustments.filter((a) => a.group === 'CO').reduce((s, a) => s + a.amount, 0)),
              money(l.paid),
              money(l.adjustments.filter((a) => a.group === 'PR').reduce((s, a) => s + a.amount, 0)),
            ])}
            footer={['Total', money(era.totalCharge), money(era.contractualAdjustment), money(era.totalPaid), money(era.patientResponsibility)]}
          />
          <div className="mt-4 grid grid-cols-1 gap-3 @md:grid-cols-2">
            <div className={cn('rounded-card border p-4', ui.tone.green)}>
              <div className="text-2xs font-semibold uppercase tracking-wide">Your plan paid</div>
              <div className="mt-1 text-2xl font-bold text-foreground">{money(era.totalPaid)}</div>
            </div>
            <div className={cn('rounded-card border p-4', ui.tone.orange)}>
              <div className="text-2xs font-semibold uppercase tracking-wide">You may owe your provider</div>
              <div className="mt-1 text-2xl font-bold text-foreground">{money(era.patientResponsibility)}</div>
            </div>
          </div>
        </div>
      </article>
      {eob.viewedAt ? <DoneBanner title="EOB reviewed" detail={formatDateTime(eob.viewedAt)} /> : null}
    </PanelShell>
  )
}

const PAYMENT_METHODS = ['Visa •••• 4242 (card on file)', 'Text-to-pay link (paid via Apple Pay)', 'HSA card •••• 9917']

export const ReconciliationStep = ({ c, patient }: StepPanelProps) => {
  const postPayment = useDemoStore((s) => s.postPayment)
  const collectPatientPayment = useDemoStore((s) => s.collectPatientPayment)
  const matchDeposit = useDemoStore((s) => s.matchDeposit)
  const closeAccount = useDemoStore((s) => s.closeAccount)
  const [busy, setBusy] = useState<string | null>(null)
  const [method, setMethod] = useState(PAYMENT_METHODS[0])
  const { era, reconciliation: r, claim } = c

  if (!era) {
    return (
      <PanelShell step="reconciliation">
        <div className="rounded-card border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">Reconciliation starts once the ERA is received.</div>
      </PanelShell>
    )
  }

  const act = (key: string, fn: () => void) => {
    setBusy(key)
    window.setTimeout(() => {
      fn()
      setBusy(null)
    }, 1100)
  }

  const insurancePosted = r?.postedAt ? era.totalPaid : 0
  const adjPosted = r?.postedAt ? era.contractualAdjustment : 0
  const patientPaid = r?.patientPaidAt ? era.patientResponsibility : 0
  const balance = round2(era.totalCharge - insurancePosted - adjPosted - patientPaid)

  const ledger: { date: string; label: string; amount: number; kind: 'charge' | 'credit' }[] = [
    { date: c.appointment.date, label: `Charges — ${claim?.claimId}`, amount: era.totalCharge, kind: 'charge' },
    ...(r?.postedAt
      ? [
          { date: r.postedAt, label: `Insurance payment — ${era.checkNumber}`, amount: era.totalPaid, kind: 'credit' as const },
          { date: r.postedAt, label: 'Contractual adjustment (CO-45)', amount: era.contractualAdjustment, kind: 'credit' as const },
        ]
      : []),
    ...(r?.patientPaidAt ? [{ date: r.patientPaidAt, label: `Patient payment — ${r.patientPaymentMethod}`, amount: era.patientResponsibility, kind: 'credit' as const }] : []),
  ]

  const tasks = [
    {
      key: 'post',
      icon: Banknote,
      title: 'Post insurance payment',
      detail: `${money(era.totalPaid)} paid + ${money(era.contractualAdjustment)} contractual adjustment from ERA`,
      doneAt: r?.postedAt ?? null,
      enabled: true,
      run: () => postPayment(c.id),
    },
    {
      key: 'patient',
      icon: CreditCard,
      title: 'Collect patient responsibility',
      detail: `${money(era.patientResponsibility)} from ${fullName(patient)}`,
      doneAt: r?.patientPaidAt ?? null,
      enabled: Boolean(r?.postedAt),
      run: () => collectPatientPayment(c.id, method),
    },
    {
      key: 'deposit',
      icon: Landmark,
      title: 'Match bank deposit',
      detail: `EFT trace ${era.checkNumber} ↔ operating account deposit ${money(era.totalPaid)}`,
      doneAt: r?.depositMatchedAt ?? null,
      enabled: Boolean(r?.patientPaidAt),
      run: () => matchDeposit(c.id),
    },
    {
      key: 'close',
      icon: Lock,
      title: 'Close & reconcile account',
      detail: 'Verify $0.00 balance and lock the encounter',
      doneAt: r?.closedAt ?? null,
      enabled: Boolean(r?.depositMatchedAt),
      run: () => closeAccount(c.id),
    },
  ]

  return (
    <PanelShell
      step="reconciliation"
      actions={
        <Button type="button" variant="outline" size="sm" onClick={() => downloadStatementPdf(c, patient)}>
          <Download className="size-3.5" aria-hidden />
          Patient statement PDF
        </Button>
      }
    >
      {r?.closedAt ? (
        <DoneBanner title="Account reconciled — all 15 steps complete" detail={`Closed ${formatDateTime(r.closedAt)} · balance $0.00 · deposit matched`} />
      ) : null}
      <div className="grid grid-cols-1 gap-4 @3xl:grid-cols-2">
        <div className="flex flex-col gap-2">
          {tasks.map((t) => {
            const Icon = t.icon
            return (
              <div key={t.key} className={cn('flex items-center gap-3 rounded-card border p-3', t.doneAt ? ui.tone.green : 'border-border bg-card')}>
                <div className={t.doneAt ? 'text-primary' : 'text-muted-foreground'}>
                  {t.doneAt ? <CheckCircle2 className="size-5" aria-hidden /> : <Icon className="size-5" aria-hidden />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground">{t.title}</div>
                  <div className="text-xs text-muted-foreground">{t.doneAt ? `Done ${formatDateTime(t.doneAt)}` : t.detail}</div>
                  {t.key === 'patient' && !t.doneAt && t.enabled ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {PAYMENT_METHODS.map((m) => (
                        <Button key={m} type="button" size="sm" variant={m === method ? 'primary' : 'outline'} className="h-7 text-xs" onClick={() => setMethod(m)}>
                          {m}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </div>
                {t.doneAt ? null : (
                  <Button type="button" variant="primary" size="sm" disabled={!t.enabled || busy !== null} isLoading={busy === t.key} onClick={() => act(t.key, t.run)}>
                    Run
                  </Button>
                )}
              </div>
            )
          })}
        </div>
        <div className="flex flex-col gap-3">
          <MiniTable
            head={['Date', 'Transaction', 'Debit', 'Credit']}
            alignRight={[2, 3]}
            rows={ledger.map((l) => [<span key="d" className="whitespace-nowrap">{formatDate(l.date.length === 10 ? `${l.date}T12:00:00` : l.date)}</span>, l.label, l.kind === 'charge' ? money(l.amount) : '', l.kind === 'credit' ? money(l.amount) : ''])}
            footer={['', 'Account balance', '', money(balance)]}
          />
          <div className={cn('rounded-card border p-4', balance === 0 ? ui.tone.green : ui.tone.yellow)}>
            <div className="text-2xs font-semibold uppercase tracking-wide">Outstanding balance</div>
            <div className="mt-1 text-2xl font-bold text-foreground">{money(balance)}</div>
          </div>
        </div>
      </div>
    </PanelShell>
  )
}
