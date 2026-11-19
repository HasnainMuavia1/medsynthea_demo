'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { RcmPage, RcmPageHeader } from '@/components/ui/Rcm/RcmLayout'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { PatientCell } from '@/components/demo/PatientCell'
import { caseHref } from '@/components/demo/caseLinks'
import { useDemoStore } from '@/demo/store'
import type { DemoCase, Patient, StepId } from '@/demo/types'

export interface CaseRow {
  c: DemoCase
  patient: Patient
}

export const patientColumn: DataTableColumn<CaseRow> = {
  id: 'patient',
  header: 'Patient',
  cell: ({ patient }) => <PatientCell patient={patient} />,
}

export const ModuleListPage = ({
  title,
  subtitle,
  filter,
  columns,
  step,
  kpis,
  action,
  emptyMessage,
}: {
  title: string
  subtitle: string
  filter: (c: DemoCase) => boolean
  columns: DataTableColumn<CaseRow>[]
  step: StepId
  kpis?: (rows: CaseRow[]) => ReactNode
  action?: ReactNode
  emptyMessage: string
}) => {
  const router = useRouter()
  const cases = useDemoStore((s) => s.cases)
  const patients = useDemoStore((s) => s.patients)
  const rows: CaseRow[] = cases.filter(filter).flatMap((c) => {
    const patient = patients.find((p) => p.id === c.patientId)
    return patient ? [{ c, patient }] : []
  })

  return (
    <RcmPage>
      <RcmPageHeader title={title} subtitle={subtitle} action={action} />
      {kpis ? <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{kpis(rows)}</div> : null}
      <DataTable
        columns={[patientColumn, ...columns]}
        data={rows}
        getRowKey={(r) => r.c.id}
        onRowClick={(r) => router.push(caseHref(r.c.id, step))}
        emptyMessage={emptyMessage}
      />
    </RcmPage>
  )
}
