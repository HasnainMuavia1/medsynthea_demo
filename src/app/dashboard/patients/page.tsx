'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarPlus, UserPlus } from 'lucide-react'
import { RcmPage, RcmPageHeader } from '@/components/ui/Rcm/RcmLayout'
import { Button } from '@/components/shared/Button'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { SearchField } from '@/components/shared/SearchField'
import { PatientCell } from '@/components/demo/PatientCell'
import { StageBadge } from '@/components/demo/StageBadge'
import { formatDate, fullName, usDob } from '@/demo/engine'
import { useDemoStore } from '@/demo/store'
import type { DemoCase, Patient } from '@/demo/types'
import { ui } from '@/styles/ui'

interface PatientRow {
  patient: Patient
  latest: DemoCase | null
  visits: number
}

const PatientsPage = () => {
  const router = useRouter()
  const patients = useDemoStore((s) => s.patients)
  const cases = useDemoStore((s) => s.cases)
  const [query, setQuery] = useState('')

  const rows = useMemo<PatientRow[]>(() => {
    const q = query.trim().toLowerCase()
    return patients
      .filter((p) => !q || fullName(p).toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q))
      .map((patient) => {
        const own = cases.filter((c) => c.patientId === patient.id)
        return { patient, latest: own[0] ?? null, visits: own.length }
      })
  }, [patients, cases, query])

  const columns: DataTableColumn<PatientRow>[] = [
    { id: 'patient', header: 'Patient', cell: ({ patient }) => <PatientCell patient={patient} /> },
    { id: 'dob', header: 'DOB', cell: ({ patient }) => usDob(patient.dob) },
    { id: 'payer', header: 'Primary payer', cell: ({ patient }) => patient.insurance.payerName },
    { id: 'member', header: 'Member ID', cell: ({ patient }) => <span className="font-mono text-xs">{patient.insurance.memberId}</span> },
    { id: 'visits', header: 'Encounters', cell: ({ visits }) => visits },
    { id: 'stage', header: 'Latest stage', cell: ({ latest }) => (latest ? <StageBadge c={latest} /> : <span className="text-xs text-muted-foreground">No appointment</span>) },
    { id: 'created', header: 'Registered', cell: ({ patient }) => formatDate(patient.createdAt) },
    {
      id: 'actions',
      header: '',
      stopRowClick: true,
      align: 'right',
      cell: ({ patient }) => (
        <Button href={`/dashboard/appointments/new?patientId=${patient.id}`} variant="outline" size="sm">
          <CalendarPlus className="size-3.5" aria-hidden />
          Schedule
        </Button>
      ),
    },
  ]

  return (
    <RcmPage>
      <RcmPageHeader
        title="Patients"
        subtitle="Patient registry — register a patient to start a new revenue-cycle journey."
        action={
          <Button href="/dashboard/patients/new" variant="primary" size="sm">
            <UserPlus className="size-3.5" aria-hidden />
            Register patient
          </Button>
        }
      />
      <div className={ui.surface.filterCard}>
        <div className="w-80">
          <SearchField value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery("")} placeholder="Search by name or MRN" />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={rows}
        getRowKey={(r) => r.patient.id}
        onRowClick={(r) => router.push(`/dashboard/patients/${r.patient.id}`)}
        emptyMessage="No patients match your search."
      />
    </RcmPage>
  )
}

export default PatientsPage
