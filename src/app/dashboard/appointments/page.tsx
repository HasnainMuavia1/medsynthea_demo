'use client'

import { useRouter } from 'next/navigation'
import { CalendarPlus } from 'lucide-react'
import { RcmPage, RcmPageHeader } from '@/components/ui/Rcm/RcmLayout'
import { Button } from '@/components/shared/Button'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { PatientCell } from '@/components/demo/PatientCell'
import { StageBadge, StepProgress } from '@/components/demo/StageBadge'
import { caseHref } from '@/components/demo/caseLinks'
import { formatDate } from '@/demo/engine'
import { providerById, visitTypeById } from '@/demo/reference'
import { useDemoStore } from '@/demo/store'
import type { DemoCase } from '@/demo/types'

const AppointmentsPage = () => {
  const router = useRouter()
  const cases = useDemoStore((s) => s.cases)
  const patients = useDemoStore((s) => s.patients)
  const sorted = [...cases].sort((a, b) => `${b.appointment.date}${b.appointment.time}`.localeCompare(`${a.appointment.date}${a.appointment.time}`))

  const columns: DataTableColumn<DemoCase>[] = [
    { id: 'patient', header: 'Patient', cell: (c) => <PatientCell patient={patients.find((p) => p.id === c.patientId) ?? null} /> },
    { id: 'when', header: 'Date & time', cell: (c) => `${formatDate(`${c.appointment.date}T12:00:00`)} · ${c.appointment.time}` },
    { id: 'visit', header: 'Visit type', cell: (c) => visitTypeById(c.appointment.visitType).short },
    { id: 'provider', header: 'Provider', cell: (c) => `Dr. ${providerById(c.appointment.providerId).name}` },
    { id: 'location', header: 'Location', cell: (c) => c.appointment.location },
    { id: 'stage', header: 'Stage', cell: (c) => <StageBadge c={c} /> },
    { id: 'progress', header: 'Journey', cell: (c) => <StepProgress c={c} /> },
  ]

  return (
    <RcmPage>
      <RcmPageHeader
        title="Appointments"
        subtitle="Every appointment opens an encounter that moves through the 15-step revenue cycle."
        action={
          <Button href="/dashboard/appointments/new" variant="primary" size="sm">
            <CalendarPlus className="size-3.5" aria-hidden />
            New appointment
          </Button>
        }
      />
      <DataTable columns={columns} data={sorted} getRowKey={(c) => c.id} onRowClick={(c) => router.push(caseHref(c.id))} />
    </RcmPage>
  )
}

export default AppointmentsPage
