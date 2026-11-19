'use client'

import { useState, type FormEvent } from 'react'
import { ArrowLeft, CalendarPlus, CheckCircle2, ShieldCheck, Sparkles, User, UserPlus } from 'lucide-react'
import { RcmPage, RcmPageHeader } from '@/components/ui/Rcm/RcmLayout'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input/Input'
import { Select } from '@/components/shared/Select'
import { FormField } from '@/components/shared/FormField/FormField'
import { KeyValueGrid, SectionCard } from '@/components/demo/DemoUi'
import { PAYERS, US_STATES, payerById } from '@/demo/reference'
import { fullName, newMemberId, randomFrom, usDob } from '@/demo/engine'
import { useDemoStore } from '@/demo/store'
import type { Patient, PatientDraft } from '@/demo/types'
import { ui } from '@/styles/ui'

const EMPTY: PatientDraft = {
  firstName: '',
  lastName: '',
  dob: '',
  sex: 'Female',
  phone: '',
  email: '',
  address: '',
  city: 'Austin',
  state: 'TX',
  zip: '',
  payerId: 'aetna',
  memberId: '',
  groupNumber: '',
  subscriberRelation: 'Self',
}

const FIRST = { Female: ['Sofia', 'Olivia', 'Grace', 'Hannah', 'Leah', 'Nora'], Male: ['Ethan', 'Lucas', 'Noah', 'Owen', 'Caleb', 'Mason'] }
const LAST = ['Patel', 'Morales', 'Bennett', 'Reyes', 'Foster', 'Campbell', 'Hughes', 'Ortiz']
const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)]

const sampleDraft = (): PatientDraft => {
  const sex = Math.random() > 0.5 ? 'Female' : 'Male'
  const firstName = pick(FIRST[sex])
  const lastName = pick(LAST)
  const year = 1960 + Math.floor(Math.random() * 40)
  const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')
  const day = String(1 + Math.floor(Math.random() * 27)).padStart(2, '0')
  const payer = pick(PAYERS.filter((p) => p.id !== 'medicare'))
  return {
    firstName,
    lastName,
    dob: `${year}-${month}-${day}`,
    sex,
    phone: `(512) 555-0${randomFrom('0123456789', 3)}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    address: `${randomFrom('123456789', 4)} ${pick(['Lamar Blvd', 'Congress Ave', 'Oltorf St', 'Manor Rd'])}`,
    city: 'Austin',
    state: 'TX',
    zip: `787${randomFrom('0123456789', 2)}`,
    payerId: payer.id,
    memberId: newMemberId(payer.id),
    groupNumber: `GRP-${randomFrom('0123456789', 6)}`,
    subscriberRelation: 'Self',
  }
}

type Errors = Partial<Record<keyof PatientDraft, string>>

const validate = (d: PatientDraft): Errors => {
  const e: Errors = {}
  if (!d.firstName.trim()) e.firstName = 'First name is required'
  if (!d.lastName.trim()) e.lastName = 'Last name is required'
  if (!d.dob) e.dob = 'Date of birth is required'
  else if (new Date(d.dob) > new Date()) e.dob = 'Date of birth cannot be in the future'
  if (!d.phone.trim()) e.phone = 'Phone is required'
  if (!d.memberId.trim()) e.memberId = 'Member ID is required'
  return e
}

const RegisterPatientPage = () => {
  const registerPatient = useDemoStore((s) => s.registerPatient)
  const [draft, setDraft] = useState<PatientDraft>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState<Patient | null>(null)

  const set = <K extends keyof PatientDraft>(key: K, value: PatientDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const found = validate(draft)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setSaving(true)
    window.setTimeout(() => {
      setCreated(registerPatient(draft))
      setSaving(false)
    }, 600)
  }

  if (created) {
    const { insurance } = created
    return (
      <RcmPage>
        <RcmPageHeader title="Patient registered" subtitle="Step 1 of 15 complete — the patient is now in the registry." />
        <SectionCard
          title={fullName(created)}
          subtitle={`${created.mrn} · Registered just now`}
          icon={CheckCircle2}
          actions={
            <Button href={`/dashboard/appointments/new?patientId=${created.id}`} variant="primary" size="sm">
              <CalendarPlus className="size-3.5" aria-hidden />
              Schedule appointment
            </Button>
          }
        >
          <KeyValueGrid
            columns={4}
            items={[
              { label: 'Date of birth', value: usDob(created.dob) },
              { label: 'Sex', value: created.sex },
              { label: 'Phone', value: created.phone },
              { label: 'Email', value: created.email || '—' },
              { label: 'Payer', value: insurance.payerName },
              { label: 'Plan', value: insurance.planName },
              { label: 'Member ID', value: <span className="font-mono">{insurance.memberId}</span> },
              { label: 'Group', value: <span className="font-mono">{insurance.groupNumber}</span> },
            ]}
          />
          <div className="mt-4 flex gap-2">
            <Button href={`/dashboard/patients/${created.id}`} variant="outline" size="sm">
              View patient profile
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setCreated(null)
                setDraft(EMPTY)
              }}
            >
              Register another
            </Button>
          </div>
        </SectionCard>
      </RcmPage>
    )
  }

  const payer = payerById(draft.payerId)

  return (
    <RcmPage>
      <Button href="/dashboard/patients" variant="link" size="sm" className={ui.interact.backLink}>
        <ArrowLeft className="size-3.5" aria-hidden />
        Patients
      </Button>
      <RcmPageHeader
        title="Register patient"
        subtitle="Step 1 — capture demographics and insurance. The Intake Agent validates the record."
        action={
          <Button type="button" variant="outline" size="sm" onClick={() => { setDraft(sampleDraft()); setErrors({}) }}>
            <Sparkles className="size-3.5" aria-hidden />
            Auto-fill sample patient
          </Button>
        }
      />
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <SectionCard title="Demographics" icon={User}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FormField id="firstName" label="First name" required error={errors.firstName}>
              <Input id="firstName" value={draft.firstName} hasError={Boolean(errors.firstName)} onChange={(e) => set('firstName', e.target.value)} />
            </FormField>
            <FormField id="lastName" label="Last name" required error={errors.lastName}>
              <Input id="lastName" value={draft.lastName} hasError={Boolean(errors.lastName)} onChange={(e) => set('lastName', e.target.value)} />
            </FormField>
            <FormField id="dob" label="Date of birth" required error={errors.dob}>
              <Input id="dob" type="date" value={draft.dob} hasError={Boolean(errors.dob)} onChange={(e) => set('dob', e.target.value)} />
            </FormField>
            <FormField id="sex" label="Sex at birth" required>
              <Select
                id="sex"
                value={draft.sex}
                options={[{ value: 'Female', label: 'Female' }, { value: 'Male', label: 'Male' }]}
                onChange={(e) => set('sex', e.target.value === 'Male' ? 'Male' : 'Female')}
              />
            </FormField>
            <FormField id="phone" label="Phone" required error={errors.phone}>
              <Input id="phone" value={draft.phone} placeholder="(512) 555-0100" hasError={Boolean(errors.phone)} onChange={(e) => set('phone', e.target.value)} />
            </FormField>
            <FormField id="email" label="Email">
              <Input id="email" type="email" value={draft.email} onChange={(e) => set('email', e.target.value)} />
            </FormField>
            <FormField id="address" label="Street address" className="sm:col-span-2 lg:col-span-3">
              <Input id="address" value={draft.address} onChange={(e) => set('address', e.target.value)} />
            </FormField>
            <FormField id="city" label="City">
              <Input id="city" value={draft.city} onChange={(e) => set('city', e.target.value)} />
            </FormField>
            <FormField id="state" label="State">
              <Select id="state" value={draft.state} options={US_STATES.map((s) => ({ value: s, label: s }))} onChange={(e) => set('state', e.target.value)} />
            </FormField>
            <FormField id="zip" label="ZIP">
              <Input id="zip" value={draft.zip} onChange={(e) => set('zip', e.target.value)} />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Insurance" subtitle="Primary coverage used for eligibility and claims." icon={ShieldCheck}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FormField id="payer" label="Payer" required>
              <Select id="payer" value={draft.payerId} options={PAYERS.map((p) => ({ value: p.id, label: p.name }))} onChange={(e) => set('payerId', e.target.value)} />
            </FormField>
            <FormField id="plan" label="Plan">
              <Input id="plan" value={payer.planName} readOnly />
            </FormField>
            <FormField id="relation" label="Subscriber relationship">
              <Select
                id="relation"
                value={draft.subscriberRelation}
                options={[{ value: 'Self', label: 'Self' }, { value: 'Spouse', label: 'Spouse' }, { value: 'Child', label: 'Child' }]}
                onChange={(e) => set('subscriberRelation', e.target.value === 'Spouse' ? 'Spouse' : e.target.value === 'Child' ? 'Child' : 'Self')}
              />
            </FormField>
            <FormField id="memberId" label="Member ID" required error={errors.memberId}>
              <Input id="memberId" value={draft.memberId} hasError={Boolean(errors.memberId)} onChange={(e) => set('memberId', e.target.value)} />
            </FormField>
            <FormField id="group" label="Group number">
              <Input id="group" value={draft.groupNumber} onChange={(e) => set('groupNumber', e.target.value)} />
            </FormField>
            <FormField id="payerCode" label="Payer ID (EDI)">
              <Input id="payerCode" value={payer.payerIdCode} readOnly />
            </FormField>
          </div>
        </SectionCard>

        <div className="flex justify-end gap-2">
          <Button href="/dashboard/patients" variant="outline">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={saving} disabled={saving}>
            <UserPlus className="size-4" aria-hidden />
            Register patient
          </Button>
        </div>
      </form>
    </RcmPage>
  )
}

export default RegisterPatientPage
