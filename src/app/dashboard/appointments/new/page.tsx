'use client'

import { Suspense, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CalendarPlus, ShieldCheck, Stethoscope } from 'lucide-react'
import { RcmPage, RcmPageHeader } from '@/components/ui/Rcm/RcmLayout'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input/Input'
import { Select } from '@/components/shared/Select'
import { Textarea } from '@/components/shared/Textarea'
import { FormField } from '@/components/shared/FormField/FormField'
import { KeyValueGrid, SectionCard } from '@/components/demo/DemoUi'
import { PatientCell } from '@/components/demo/PatientCell'
import { caseHref } from '@/components/demo/caseLinks'
import { fullName, todayIso, usDob } from '@/demo/engine'
import { PROVIDERS, VISIT_TYPES, visitTypeById } from '@/demo/reference'
import { useDemoStore } from '@/demo/store'
import type { AppointmentDraft, TemplateId } from '@/demo/types'
import { ui } from '@/styles/ui'

const isTemplateId = (v: string): v is TemplateId => VISIT_TYPES.some((t) => t.id === v)

const nowTime = (): string => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes() < 30 ? 30 : 0).padStart(2, '0')}`
}

const NewAppointmentForm = () => {
  const router = useRouter()
  const params = useSearchParams()
  const patients = useDemoStore((s) => s.patients)
  const createAppointment = useDemoStore((s) => s.createAppointment)
  const first = VISIT_TYPES[0]
  const [draft, setDraft] = useState<AppointmentDraft>({
    patientId: params.get('patientId') ?? '',
    date: todayIso(),
    time: nowTime(),
    visitType: first.id,
    providerId: first.defaultProviderId,
    reason: first.defaultReason,
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const patient = patients.find((p) => p.id === draft.patientId) ?? null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft.patientId) {
      setError('Select a patient')
      return
    }
    setSaving(true)
    window.setTimeout(() => {
      const c = createAppointment(draft)
      router.push(caseHref(c.id, 'eligibility'))
    }, 500)
  }

  return (
    <RcmPage>
      <Button href="/dashboard/appointments" variant="link" size="sm" className={ui.interact.backLink}>
        <ArrowLeft className="size-3.5" aria-hidden />
        Appointments
      </Button>
      <RcmPageHeader title="Schedule appointment" subtitle="Step 2 — book the visit. Eligibility runs automatically next." />
      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SectionCard title="Visit details" icon={CalendarPlus}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField id="patient" label="Patient" required error={error} className="sm:col-span-2">
              <Select
                id="patient"
                searchable
                placeholder="Select a patient"
                value={draft.patientId}
                options={patients.map((p) => ({ value: p.id, label: `${fullName(p)} · ${p.mrn}` }))}
                onChange={(e) => {
                  setError('')
                  setDraft((d) => ({ ...d, patientId: e.target.value }))
                }}
              />
            </FormField>
            <FormField id="visitType" label="Visit type" required className="sm:col-span-2" hint="Sets the place of service, copay and prior authorization. The transcript, note and codes come from the demo recording.">
              <Select
                id="visitType"
                value={draft.visitType}
                options={VISIT_TYPES.map((v) => ({ value: v.id, label: v.label }))}
                onChange={(e) => {
                  if (!isTemplateId(e.target.value)) return
                  const v = visitTypeById(e.target.value)
                  setDraft((d) => ({ ...d, visitType: v.id, providerId: v.defaultProviderId, reason: v.defaultReason }))
                }}
              />
            </FormField>
            <FormField id="provider" label="Provider" required>
              <Select
                id="provider"
                value={draft.providerId}
                options={PROVIDERS.map((p) => ({ value: p.id, label: `Dr. ${p.name} — ${p.specialty}` }))}
                onChange={(e) => setDraft((d) => ({ ...d, providerId: e.target.value }))}
              />
            </FormField>
            <FormField id="location" label="Location">
              <Input id="location" value={visitTypeById(draft.visitType).location} readOnly />
            </FormField>
            <FormField id="date" label="Date" required>
              <Input id="date" type="date" value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} />
            </FormField>
            <FormField id="time" label="Time" required>
              <Input id="time" type="time" value={draft.time} onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))} />
            </FormField>
            <FormField id="reason" label="Chief complaint / reason" className="sm:col-span-2">
              <Textarea id="reason" value={draft.reason} onChange={(e) => setDraft((d) => ({ ...d, reason: e.target.value }))} />
            </FormField>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button href="/dashboard/appointments" variant="outline">
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving} disabled={saving}>
              <CalendarPlus className="size-4" aria-hidden />
              Book appointment
            </Button>
          </div>
        </SectionCard>
        <SectionCard title="Patient & coverage" icon={ShieldCheck}>
          {patient ? (
            <div className="flex flex-col gap-4">
              <PatientCell patient={patient} />
              <KeyValueGrid
                columns={2}
                items={[
                  { label: 'DOB', value: usDob(patient.dob) },
                  { label: 'Phone', value: patient.phone },
                  { label: 'Payer', value: patient.insurance.payerName },
                  { label: 'Member ID', value: <span className="font-mono">{patient.insurance.memberId}</span> },
                ]}
              />
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Stethoscope className="size-4" aria-hidden />
                Choose a patient to see coverage.
              </div>
              <Button href="/dashboard/patients/new" variant="outline" size="sm">
                Register new patient
              </Button>
            </div>
          )}
        </SectionCard>
      </form>
    </RcmPage>
  )
}

const NewAppointmentPage = () => (
  <Suspense fallback={null}>
    <NewAppointmentForm />
  </Suspense>
)

export default NewAppointmentPage
