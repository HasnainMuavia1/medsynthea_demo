'use client'

import { useRouter } from 'next/navigation'
import { AlertTriangle, Clock, PhoneCall, Wallet } from 'lucide-react'
import { RcmPage, RcmPageHeader } from '@/components/ui/Rcm/RcmLayout'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { SectionCard, StatTile } from '@/components/demo/DemoUi'
import { PatientCell } from '@/components/demo/PatientCell'
import { caseHref } from '@/components/demo/caseLinks'
import { daysSince, formatDateTime, fullName, isDenialOpen, money } from '@/demo/engine'
import { useDemoStore } from '@/demo/store'
import type { ArCall, DemoCase, Patient } from '@/demo/types'

interface Row {
  c: DemoCase
  patient: Patient
}

interface CallRow {
  call: ArCall
  c: DemoCase
  patient: Patient
}

const isOpenAr = (c: DemoCase): boolean => Boolean(c.claim?.submittedAt) && !c.era

const ArPage = () => {
  const router = useRouter()
  const cases = useDemoStore((s) => s.cases)
  const patients = useDemoStore((s) => s.patients)
  const rows: Row[] = cases.filter(isOpenAr).flatMap((c) => {
    const patient = patients.find((p) => p.id === c.patientId)
    return patient ? [{ c, patient }] : []
  })
  const calls: CallRow[] = cases
    .flatMap((c) => {
      const patient = patients.find((p) => p.id === c.patientId)
      return patient ? c.arCalls.map((call) => ({ call, c, patient })) : []
    })
    .sort((a, b) => b.call.startedAt.localeCompare(a.call.startedAt))

  const openAr = rows.reduce((s, r) => s + (r.c.claim?.totalCharge ?? 0), 0)
  const denied = cases.filter(isDenialOpen).length
  const avgAge = rows.length ? Math.round(rows.reduce((s, r) => s + daysSince(r.c.claim?.submittedAt ?? ''), 0) / rows.length) : 0

  const columns: DataTableColumn<Row>[] = [
    { id: 'patient', header: 'Patient', cell: ({ patient }) => <PatientCell patient={patient} /> },
    { id: 'claim', header: 'Claim', cell: ({ c }) => <span className="font-mono text-xs">{c.claim?.claimId}</span> },
    { id: 'payer', header: 'Payer', cell: ({ patient }) => patient.insurance.payerName },
    { id: 'billed', header: 'Billed', align: 'right', cell: ({ c }) => money(c.claim?.totalCharge ?? 0) },
    { id: 'age', header: 'Days out', align: 'right', cell: ({ c }) => daysSince(c.claim?.submittedAt ?? '') },
    {
      id: 'status',
      header: 'Status',
      cell: ({ c }) =>
        isDenialOpen(c) ? (
          <Badge tone="red" density="fit" dot>Denied {c.denial?.code}</Badge>
        ) : c.denial?.resolvedAt ? (
          <Badge tone="blue" density="fit" dot>Resubmitted</Badge>
        ) : (
          <Badge tone="yellow" density="fit" dot>In process</Badge>
        ),
    },
    { id: 'last', header: 'Last call', cell: ({ c }) => (c.arCalls[0] ? formatDateTime(c.arCalls[0].startedAt) : <span className="text-muted-foreground">Never</span>) },
    {
      id: 'call',
      header: '',
      align: 'right',
      stopRowClick: true,
      cell: ({ c }) => (
        <Button href={`/dashboard/ar/call/${c.id}`} variant={isDenialOpen(c) ? 'primary' : 'outline'} size="sm">
          <PhoneCall className="size-3.5" aria-hidden />
          Call payer
        </Button>
      ),
    },
  ]

  const callColumns: DataTableColumn<CallRow>[] = [
    { id: 'when', header: 'When', cell: ({ call }) => formatDateTime(call.startedAt) },
    { id: 'patient', header: 'Patient', cell: ({ patient }) => fullName(patient) },
    { id: 'payer', header: 'Payer', cell: ({ patient, call }) => `${patient.insurance.payerName} · ${call.payerPhone}` },
    { id: 'ref', header: 'Reference', cell: ({ call }) => <span className="font-mono text-xs">{call.referenceNumber}</span> },
    { id: 'outcome', header: 'Outcome', cell: ({ call }) => <span className="text-xs">{call.outcome}</span> },
    { id: 'action', header: 'Action', cell: ({ call }) => (call.actionTaken ? <span className="text-xs text-primary">{call.actionTaken}</span> : <Badge tone="yellow" density="fit">Pending</Badge>) },
  ]

  return (
    <RcmPage>
      <RcmPageHeader title="AR follow-up · caller agent" subtitle="Unpaid and denied claims. The AI caller phones the payer, extracts the answer and takes the next action." />
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Open AR" value={money(openAr)} hint={`${rows.length} claims awaiting payment`} icon={Wallet} />
        <StatTile label="Open denials" value={denied} hint="Need payer follow-up" icon={AlertTriangle} tone="red" />
        <StatTile label="Avg days outstanding" value={avgAge} icon={Clock} tone="yellow" />
        <StatTile label="Calls made" value={calls.length} hint="By the AR caller agent" icon={PhoneCall} tone="blue" />
      </div>
      <DataTable columns={columns} data={rows} getRowKey={(r) => r.c.id} onRowClick={(r) => router.push(caseHref(r.c.id, 'status'))} emptyMessage="No open AR — every submitted claim has been paid." />
      <div className="mt-4">
        <SectionCard title="Call history" icon={PhoneCall} bodyClassName="p-0">
          <DataTable bordered={false} columns={callColumns} data={calls} getRowKey={(r) => r.call.id} onRowClick={(r) => router.push(caseHref(r.c.id, 'status'))} emptyMessage="No calls yet — start one from the worklist above." />
        </SectionCard>
      </div>
    </RcmPage>
  )
}

export default ArPage
