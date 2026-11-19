'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CalendarPlus, ClipboardList, ShieldCheck, User, UserX } from 'lucide-react'
import { RcmPage, RcmPageHeader } from '@/components/ui/Rcm/RcmLayout'
import { Button } from '@/components/shared/Button'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { EmptyHint, KeyValueGrid, SectionCard } from '@/components/demo/DemoUi'
import { StageBadge, StepProgress } from '@/components/demo/StageBadge'
import { caseHref } from '@/components/demo/caseLinks'
import { ageFrom, formatDate, fullName, usDob } from '@/demo/engine'
import { providerById, visitTypeById } from '@/demo/reference'
import { useDemoStore, usePatient } from '@/demo/store'
import type { DemoCase } from '@/demo/types'
import { ui } from '@/styles/ui'

const PatientProfilePage = () => {
  const router = useRouter()
  const { patientId } = useParams<{ patientId: string }>()
  const patient = usePatient(patientId)
  const allCases = useDemoStore((s) => s.cases)
  const cases = allCases.filter((c) => c.patientId === patientId)

  if (!patient) {
    return (
      <RcmPage>
        <EmptyHint icon={UserX} title="Patient not found" action={<Button href="/dashboard/patients" variant="outline" size="sm">Back to patients</Button>} />
      </RcmPage>
    )
  }

  const { insurance } = patient
  const columns: DataTableColumn<DemoCase>[] = [
    { id: 'enc', header: 'Encounter', cell: (c) => <span className="font-mono text-xs">{c.encounterNumber}</span> },
    { id: 'date', header: 'Date of service', cell: (c) => `${formatDate(`${c.appointment.date}T12:00:00`)} · ${c.appointment.time}` },
    { id: 'visit', header: 'Visit', cell: (c) => visitTypeById(c.appointment.visitType).short },
    { id: 'provider', header: 'Provider', cell: (c) => `Dr. ${providerById(c.appointment.providerId).name}` },
    { id: 'stage', header: 'Stage', cell: (c) => <StageBadge c={c} /> },
    { id: 'progress', header: 'Progress', cell: (c) => <StepProgress c={c} /> },
  ]

  return (
    <RcmPage>
      <Button href="/dashboard/patients" variant="link" size="sm" className={ui.interact.backLink}>
        <ArrowLeft className="size-3.5" aria-hidden />
        Patients
      </Button>
      <RcmPageHeader
        title={fullName(patient)}
        subtitle={`${patient.mrn} · ${ageFrom(patient.dob)} y/o ${patient.sex.toLowerCase()} · registered ${formatDate(patient.createdAt)}`}
        action={
          <Button href={`/dashboard/appointments/new?patientId=${patient.id}`} variant="primary" size="sm">
            <CalendarPlus className="size-3.5" aria-hidden />
            Schedule appointment
          </Button>
        }
      />
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
        <SectionCard title="Demographics" icon={User}>
          <KeyValueGrid
            columns={2}
            items={[
              { label: 'Date of birth', value: usDob(patient.dob) },
              { label: 'Sex', value: patient.sex },
              { label: 'Phone', value: patient.phone },
              { label: 'Email', value: patient.email || '—' },
              { label: 'Address', value: `${patient.address}, ${patient.city}, ${patient.state} ${patient.zip}` },
            ]}
          />
        </SectionCard>
        <SectionCard title="Primary insurance" icon={ShieldCheck}>
          <KeyValueGrid
            columns={2}
            items={[
              { label: 'Payer', value: insurance.payerName },
              { label: 'Plan', value: insurance.planName },
              { label: 'Member ID', value: <span className="font-mono">{insurance.memberId}</span> },
              { label: 'Group', value: <span className="font-mono">{insurance.groupNumber}</span> },
              { label: 'Relationship', value: insurance.subscriberRelation },
            ]}
          />
        </SectionCard>
      </div>
      <div className="mt-4">
        <SectionCard title="Encounters" subtitle="Each encounter follows the 15-step revenue-cycle journey." icon={ClipboardList} bodyClassName="p-0">
          {cases.length === 0 ? (
            <EmptyHint
              icon={CalendarPlus}
              title="No appointments yet"
              hint="Schedule an appointment to start eligibility, documentation, coding and billing."
              action={<Button href={`/dashboard/appointments/new?patientId=${patient.id}`} variant="primary" size="sm">Schedule appointment</Button>}
            />
          ) : (
            <DataTable bordered={false} columns={columns} data={cases} getRowKey={(c) => c.id} onRowClick={(c) => router.push(caseHref(c.id))} />
          )}
        </SectionCard>
      </div>
    </RcmPage>
  )
}

export default PatientProfilePage
