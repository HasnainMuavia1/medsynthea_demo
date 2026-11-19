'use client'

import { Fragment, useEffect, useState } from 'react'
import { FileCheck2, Globe, Loader2, RefreshCw, Send, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { AgentProgress, DoneBanner, KeyValueGrid, SectionCard, useFakeRun } from '@/components/demo/DemoUi'
import { WebPortalSubmission } from '@/components/demo/WebPortalSubmission'
import { formatDate, formatDateTime, fullName, paRequired, usDob } from '@/demo/engine'
import { payerById, providerById } from '@/demo/reference'
import { useDemoStore } from '@/demo/store'
import { TEMPLATES } from '@/demo/templates'
import type { DemoCase, Patient } from '@/demo/types'
import { ui } from '@/styles/ui'
import { cn } from '@/utils'

const APPROVAL_MS = 4500
const EDI_STAGES = ['Building X12 278 request…', 'Attaching clinical justification…', 'Transmitting to utilization management…']

export const PriorAuthPanel = ({ c, patient }: { c: DemoCase; patient: Patient }) => {
  const submitPriorAuth = useDemoStore((s) => s.submitPriorAuth)
  const approve = useDemoStore((s) => s.approvePriorAuthFor)
  const [mode, setMode] = useState<'idle' | 'portal'>('idle')
  const [checking, setChecking] = useState(false)
  const run = useFakeRun(2400, EDI_STAGES)
  const payer = payerById(patient.insurance.payerId)
  const provider = providerById(c.appointment.providerId)
  const { priorAuth } = c
  const status = priorAuth?.status

  useEffect(() => {
    if (status !== 'submitted') return
    const t = window.setTimeout(() => approve(c.id), APPROVAL_MS)
    return () => window.clearTimeout(t)
  }, [status, approve, c.id])

  if (!paRequired(c)) {
    return (
      <div className={cn('flex items-start gap-2.5 rounded-card border px-3 py-2.5 text-sm', ui.tone.gray)}>
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
        <div>
          <div className="font-semibold text-foreground">Prior authorization not required</div>
          <div className="text-xs">Emergency services are exempt from prior authorization for {payer.name}.</div>
        </div>
      </div>
    )
  }

  const dx = TEMPLATES[c.appointment.visitType].diagnoses.map((d) => d.code).join(', ')
  const fields = [
    { label: 'Member ID', value: patient.insurance.memberId },
    { label: 'Patient', value: `${fullName(patient)} · ${usDob(patient.dob)}` },
    { label: 'Servicing provider NPI', value: provider.npi },
    { label: 'Procedure (CPT)', value: '50010 — Renal exploration' },
    { label: 'Diagnoses (ICD-10)', value: dx },
    { label: 'Date of service', value: c.appointment.date },
  ]

  return (
    <SectionCard
      title="Prior authorization"
      subtitle={`Required by ${payer.name} for CPT 50010 (renal exploration)`}
      icon={FileCheck2}
      actions={
        status === 'submitted' ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={checking}
            onClick={() => {
              setChecking(true)
              window.setTimeout(() => {
                approve(c.id)
                setChecking(false)
              }, 900)
            }}
          >
            <RefreshCw className="size-3.5" aria-hidden />
            Check status
          </Button>
        ) : null
      }
    >
      <div className="flex flex-col gap-3">
        {status === 'approved' && priorAuth ? (
          <DoneBanner
            title={`Approved — auth ${priorAuth.authNumber}`}
            detail={`Valid ${formatDate(`${priorAuth.validFrom}T12:00:00`)} – ${formatDate(`${priorAuth.validTo}T12:00:00`)} · 1 unit CPT 50010 · approved ${formatDateTime(priorAuth.approvedAt ?? '')}`}
          />
        ) : status === 'submitted' && priorAuth ? (
          <div className={cn('flex items-center gap-2 rounded-card border px-3 py-2.5 text-sm', ui.tone.yellow)}>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {priorAuth.requestId} submitted via {priorAuth.method === 'portal' ? 'payer web portal' : 'X12 278'} — pending utilization review…
          </div>
        ) : null}
        {priorAuth ? (
          <KeyValueGrid
            columns={4}
            items={[
              { label: 'Request ID', value: <span className="font-mono">{priorAuth.requestId}</span> },
              { label: 'Method', value: priorAuth.method === 'portal' ? 'Web portal' : 'X12 278' },
              { label: 'Submitted', value: priorAuth.submittedAt ? formatDateTime(priorAuth.submittedAt) : '—' },
              { label: 'Auth number', value: <span className="font-mono">{priorAuth.authNumber ?? 'Pending'}</span> },
            ]}
          />
        ) : mode === 'portal' ? (
          <WebPortalSubmission
            payerName={payer.name}
            portalUrl={payer.portal}
            formTitle="Authorizations — new surgical request"
            fields={fields}
            attachments={['CT-abdomen-report.pdf', 'clinical-justification.pdf']}
            confirmationPrefix="PAWEB"
            onDone={() => submitPriorAuth(c.id, 'portal')}
          />
        ) : (
          <Fragment>
            <AgentProgress run={run} agent="Prior Auth Agent" />
            <div className="rounded-card border border-border bg-secondary/30 p-3">
              <div className={ui.typography.eyebrow}>AI-drafted clinical justification</div>
              <p className="mt-1 text-sm leading-relaxed text-foreground">
                Blunt left flank trauma with CT-confirmed left perirenal hematoma, persistent flank pain and falling hematocrit. Equivocal imaging for active extravasation; open retroperitoneal exploration is indicated to confirm renal vascular integrity and rule out urinary extravasation.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="primary" size="sm" disabled={run.running} onClick={() => setMode('portal')}>
                <Globe className="size-3.5" aria-hidden />
                Submit via payer portal (web bot)
              </Button>
              <Button type="button" variant="outline" size="sm" disabled={run.running} isLoading={run.running} onClick={() => run.start(() => submitPriorAuth(c.id, 'edi'))}>
                <Send className="size-3.5" aria-hidden />
                Submit X12 278 (EDI)
              </Button>
            </div>
          </Fragment>
        )}
      </div>
    </SectionCard>
  )
}
