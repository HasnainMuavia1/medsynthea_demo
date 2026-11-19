'use client'

import { Fragment, useState } from 'react'
import {
  Building,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  FileInput,
  FilePlus2,
  FileSignature,
  IdCard,
  Shield,
  Stethoscope,
  User,
} from 'lucide-react'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { AppDialog, AppDialogActions } from '@/components/shared/Dialog/AppDialog'
import { Input } from '@/components/shared/Input/Input'
import { ClaimFormSection } from '@/components/ui/Agents/ClaimFormSection'
import { KeyValueGrid } from '@/components/demo/DemoUi'
import { build837P } from '@/demo/edi'
import { formatDate, formatDateTime, fullName, money, usDob } from '@/demo/engine'
import { downloadClaimPdf } from '@/demo/pdf'
import { PRACTICE, payerById, providerById } from '@/demo/reference'
import { useDemoStore } from '@/demo/store'
import { ui } from '@/styles/ui'
import { cn } from '@/utils'
import { ContinueButton, MiniTable, PanelShell, RawBlock, type StepPanelProps } from './shared'

const DX = 'ABCDEFGHIJKL'

const RoField = ({ id, label, value, className }: { id: string; label: string; value: string; className?: string }) => (
  <div className={cn(ui.layout.fieldStack, className)}>
    <label htmlFor={id} className={ui.typography.label}>
      {label}
    </label>
    <Input id={id} value={value} readOnly className={ui.form.controlCompact} />
  </div>
)

const COVERAGE_TYPES = ['Medicare', 'Medicaid', 'TRICARE', 'CHAMPVA', 'Group Health Plan', 'FECA Black Lung', 'Other']

const CHECKS = ['Subscriber and patient demographics', 'Payer ID and claim filing indicator', 'Rendering and billing NPI (Luhn)', 'Diagnosis pointers on every line', 'Charge and unit totals', 'Prior authorization reference']

export const ClaimCms1500Step = ({ c, patient, goTo }: StepPanelProps) => {
  const createClaim = useDemoStore((s) => s.createClaim)
  const checkClaim = useDemoStore((s) => s.checkClaim)
  const finalizeClaim = useDemoStore((s) => s.finalizeClaim)
  const [saving, setSaving] = useState(false)
  const [busy, setBusy] = useState<'check' | 'finalize' | null>(null)
  const [dialog, setDialog] = useState<'lines' | 'dx' | null>(null)
  const [showEdi, setShowEdi] = useState(false)
  const { claim, coding, appointment } = c
  const payer = payerById(patient.insurance.payerId)
  const provider = providerById(appointment.providerId)
  const pos = appointment.visitType === 'renal-exploration' ? '21' : '23'
  const dos = formatDate(`${appointment.date}T12:00:00`)
  const coverageType = payer.id === 'medicare' ? 'Medicare' : 'Group Health Plan'

  if (!coding) return null

  const act = (kind: 'check' | 'finalize') => {
    setBusy(kind)
    window.setTimeout(() => {
      if (kind === 'check') checkClaim(c.id)
      else finalizeClaim(c.id)
      setBusy(null)
    }, 1300)
  }

  if (!claim) {
    return (
      <PanelShell step="claim">
        <div className={ui.layout.pageHeader}>
          <div className="min-w-0">
            <h2 className={cn(ui.typography.heroTitle, 'font-bold')}>Health Insurance Claim Form (CMS-1500)</h2>
            <p className={cn(ui.typography.heroDescription, 'mt-1')}>Prefilled from the handed-off encounter. Review, then create a draft. Check, mark ready and submit on the claim.</p>
          </div>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <Badge tone="green">Form 1500 (02-12)</Badge>
            <span className={ui.typography.monoSlug}>OMB-0938-1197</span>
          </div>
        </div>
        <div className={ui.layout.formColumn}>
          <ClaimFormSection icon={FileInput} title="Prefill from clinical encounter">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {fullName(patient)} · {dos}
                </p>
                <p className={ui.typography.monoSlug}>{c.encounterNumber}</p>
              </div>
              <Badge tone="green" density="fit" dot>
                Claim context loaded
              </Badge>
            </div>
            <ul className="mt-3 grid grid-cols-3 gap-2">
              {['Coverage active (271)', 'Coding complete', c.priorAuth?.authNumber ? `Prior auth ${c.priorAuth.authNumber}` : 'Prior auth not required'].map((r) => (
                <li key={r} className="flex items-center gap-2 rounded-md border border-pill-green-border bg-pill-green-bg/50 px-3 py-2 text-xs text-foreground">
                  <CheckCircle2 className="size-3.5 shrink-0 text-primary" aria-hidden />
                  {r}
                </li>
              ))}
            </ul>
          </ClaimFormSection>

          <ClaimFormSection icon={Shield} title="1. Type of Health Insurance Coverage">
            <div className="flex flex-wrap gap-2">
              {COVERAGE_TYPES.map((t) => (
                <span key={t} className={cn('inline-flex h-8 items-center rounded-md border px-3 text-xs', t === coverageType ? 'border-primary bg-primary/10 font-semibold text-primary' : 'border-border text-muted-foreground')}>
                  {t}
                </span>
              ))}
            </div>
          </ClaimFormSection>

          <ClaimFormSection icon={Building2} title="Payer / Insurance (Carrier) Address">
            <div className={ui.layout.fieldGrid3}>
              <RoField id="payer-name" label="Payer name" value={payer.name} />
              <RoField id="payer-id" label="Payer ID" value={payer.payerIdCode} />
              <RoField id="payer-plan" label="Plan" value={payer.planName} />
            </div>
          </ClaimFormSection>

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
            <ClaimFormSection icon={User} title="2–3. Patient Information">
              <div className={ui.layout.fieldGrid}>
                <RoField id="pt-name" label="2. Patient name" value={`${patient.lastName}, ${patient.firstName}`} />
                <RoField id="pt-dob" label="3. Birth date / sex" value={`${usDob(patient.dob)} · ${patient.sex === 'Male' ? 'M' : 'F'}`} />
                <RoField id="pt-addr" label="5. Address" value={`${patient.address}, ${patient.city} ${patient.state} ${patient.zip}`} className="col-span-2" />
              </div>
            </ClaimFormSection>
            <ClaimFormSection icon={IdCard} title="4, 7. Insured Information">
              <div className={ui.layout.fieldGrid}>
                <RoField id="ins-id" label="1a. Insured ID" value={patient.insurance.memberId} />
                <RoField id="ins-grp" label="11. Group number" value={patient.insurance.groupNumber} />
                <RoField id="ins-name" label="4. Insured name" value={`${patient.lastName}, ${patient.firstName}`} />
                <RoField id="ins-rel" label="6. Relationship" value={patient.insurance.subscriberRelation} />
              </div>
            </ClaimFormSection>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
            <ClaimFormSection icon={CalendarDays} title="10, 14–16. Conditions & Dates">
              <div className={ui.layout.fieldGrid}>
                <RoField id="cond-emp" label="10a. Employment related" value="No" />
                <RoField id="cond-auto" label="10b. Auto accident" value={appointment.visitType === 'renal-exploration' ? 'No (blunt trauma, non-auto)' : 'No'} />
                <RoField id="cond-onset" label="14. Date of current illness" value={dos} />
                <RoField id="cond-other" label="10c. Other accident" value="No" />
              </div>
            </ClaimFormSection>
            <ClaimFormSection icon={FileSignature} title="12–13. Signatures">
              <div className={ui.layout.fieldGrid}>
                <RoField id="sig-pt" label="12. Patient signature" value="Signature on file" />
                <RoField id="sig-ins" label="13. Insured signature" value="Signature on file" />
              </div>
            </ClaimFormSection>
          </div>

          <ClaimFormSection icon={Stethoscope} title="21–23. Diagnosis">
            <div className="grid grid-cols-4 gap-3">
              {coding.diagnoses.map((d, i) => (
                <RoField key={d.code} id={`dx-${i}`} label={`${DX[i]}. ICD-10-CM`} value={`${d.code} — ${d.description}`} />
              ))}
              <RoField id="prior-auth" label="23. Prior authorization #" value={c.priorAuth?.authNumber ?? '—'} />
            </div>
          </ClaimFormSection>

          <ClaimFormSection icon={ClipboardList} title="24. Service Details">
            <MiniTable
              head={['A. DOS', 'B. POS', 'D. CPT/HCPCS', 'Modifier', 'E. Dx ptr', 'F. Charges', 'G. Units', 'J. Rendering NPI']}
              alignRight={[5, 6]}
              rows={coding.procedures.map((p) => [
                appointment.date,
                pos,
                <span key="c" className="font-mono font-semibold">{p.code}</span>,
                p.modifiers.join(' ') || '—',
                p.dxPointers.map((n) => DX[n - 1]).join(''),
                money(p.charge),
                p.units,
                <span key="n" className="font-mono text-xs">{provider.npi}</span>,
              ])}
            />
          </ClaimFormSection>

          <ClaimFormSection icon={CircleDollarSign} title="25–30. Financials & IDs">
            <div className="grid grid-cols-4 gap-3">
              <RoField id="fin-tin" label="25. Federal tax ID (EIN)" value={PRACTICE.taxId} />
              <RoField id="fin-acct" label="26. Patient account #" value={c.encounterNumber} />
              <RoField id="fin-assign" label="27. Accept assignment" value="Yes" />
              <RoField id="fin-total" label="28. Total charge" value={money(coding.procedures.reduce((s, p) => s + p.charge, 0))} />
            </div>
          </ClaimFormSection>

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
            <ClaimFormSection icon={Building} title="33. Billing Provider">
              <div className={ui.layout.fieldGrid}>
                <RoField id="bp-name" label="Name" value={PRACTICE.name} />
                <RoField id="bp-npi" label="33a. NPI" value={PRACTICE.groupNpi} />
                <RoField id="bp-addr" label="Address" value={PRACTICE.address} className="col-span-2" />
              </div>
            </ClaimFormSection>
            <ClaimFormSection icon={Building} title="31–32. Physician & Service Facility">
              <div className={ui.layout.fieldGrid}>
                <RoField id="phys" label="31. Physician" value={`${provider.name}, ${provider.credentials}`} />
                <RoField id="fac" label="32. Facility" value={appointment.location} />
              </div>
            </ClaimFormSection>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-card p-4">
            <Button type="button" variant="outline" size="md" disabled={saving} onClick={() => goTo('denial')}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              isLoading={saving}
              disabled={saving}
              onClick={() => {
                setSaving(true)
                window.setTimeout(() => {
                  createClaim(c.id)
                  setSaving(false)
                }, 900)
              }}
            >
              <FilePlus2 className="size-3.5 shrink-0" aria-hidden />
              Create draft
            </Button>
          </div>
        </div>
      </PanelShell>
    )
  }

  const status = claim.finalizedAt ? 'Ready to submit' : claim.checkedAt ? 'Checked' : 'Draft'

  return (
    <PanelShell step="claim" actions={claim.finalizedAt ? <ContinueButton from="claim" goTo={goTo} /> : null}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">Claim {claim.claimId}</h2>
            <Badge tone={claim.finalizedAt ? 'green' : claim.checkedAt ? 'blue' : 'gray'} density="fit" dot>
              {status}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">Edit insurance and services, check the claim, mark it ready, then submit.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {!claim.finalizedAt ? (
          <Fragment>
            <Button variant="secondary" size="md" onClick={() => setDialog('lines')}>
              Edit services
            </Button>
            <Button variant="secondary" size="md" onClick={() => setDialog('dx')}>
              Edit diagnoses
            </Button>
            <Button variant="secondary" size="md" isLoading={busy === 'check'} disabled={busy !== null} onClick={() => act('check')}>
              Check claim
            </Button>
            <Button variant="primary" size="md" isLoading={busy === 'finalize'} disabled={busy !== null || !claim.checkedAt} onClick={() => act('finalize')} title={claim.checkedAt ? 'Finalize this revision' : 'Check the claim first'}>
              Mark ready
            </Button>
          </Fragment>
        ) : null}
        <Button variant="ghost" size="md" onClick={() => downloadClaimPdf(c, patient)}>
          Download form
        </Button>
        <Button variant="ghost" size="md" onClick={() => setShowEdi((v) => !v)}>
          {showEdi ? 'Hide' : 'View'} 837P
        </Button>
      </div>

      <KeyValueGrid
        columns={4}
        items={[
          { label: 'Patient', value: fullName(patient) },
          { label: 'Payer', value: `${payer.name} (${payer.payerIdCode})` },
          { label: 'Date of service', value: dos },
          { label: 'Total charge', value: money(claim.totalCharge) },
          { label: 'Revision', value: String(claim.revision) },
          { label: 'Created', value: formatDateTime(claim.createdAt) },
          { label: 'Checked', value: claim.checkedAt ? formatDateTime(claim.checkedAt) : '—' },
          { label: 'Finalized', value: claim.finalizedAt ? formatDateTime(claim.finalizedAt) : '—' },
        ]}
      />

      {claim.checkedAt ? (
        <div className="rounded-card border border-pill-green-border bg-pill-green-bg/50 p-4">
          <p className="text-sm font-semibold text-primary">Claim check passed · 0 findings</p>
          <ul className="mt-2 grid grid-cols-3 gap-2">
            {CHECKS.map((ch) => (
              <li key={ch} className="flex items-center gap-2 text-xs text-foreground">
                <CheckCircle2 className="size-3.5 shrink-0 text-primary" aria-hidden />
                {ch}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className={cn('rounded-card border px-3 py-2.5 text-sm', ui.tone.blue)}>Draft created — run “Check claim”, then “Mark ready” to finalize the revision for submission.</div>
      )}

      <MiniTable
        head={['#', 'CPT/HCPCS', 'Modifiers', 'Dx ptr', 'Units', 'Charge']}
        alignRight={[4, 5]}
        rows={coding.procedures.map((p, i) => [i + 1, <span key="c" className="font-mono font-semibold">{p.code}</span>, p.modifiers.join(', ') || '—', p.dxPointers.map((n) => DX[n - 1]).join(''), p.units, money(p.charge)])}
        footer={['', '', '', '', 'Total', money(claim.totalCharge)]}
      />
      {showEdi ? <RawBlock text={build837P(c, patient)} /> : null}

      <AppDialog
        open={dialog !== null}
        title={dialog === 'lines' ? 'Service lines' : 'Diagnoses'}
        description="Codes come from completed coding. Re-open the coding step to change them."
        onClose={() => setDialog(null)}
        footer={
          <AppDialogActions>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => { setDialog(null); goTo('coding') }}>
              Open coding
            </Button>
          </AppDialogActions>
        }
      >
        {dialog === 'lines' ? (
          <MiniTable head={['CPT/HCPCS', 'Description', 'Units', 'Charge']} alignRight={[2, 3]} rows={coding.procedures.map((p) => [p.code, p.description, p.units, money(p.charge)])} />
        ) : (
          <MiniTable head={['Ptr', 'ICD-10-CM', 'Description']} rows={coding.diagnoses.map((d, i) => [DX[i], d.code, d.description])} />
        )}
      </AppDialog>
    </PanelShell>
  )
}
