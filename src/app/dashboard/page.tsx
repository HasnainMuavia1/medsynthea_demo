'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { RcmCard, RcmPage, RcmSectionHeader } from '@/components/ui/Rcm/RcmLayout'
import {
  AgentActivityFeed,
  AgentRecommendations,
  AgentThroughputGrid,
  AttentionList,
  ClaimPipelineFunnel,
  DashboardHeader,
  DashboardKpiGrid,
} from '@/components/ui/Rcm/dashboard'
import { Button } from '@/components/shared/Button'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { PatientCell } from '@/components/demo/PatientCell'
import { StageBadge, StepProgress } from '@/components/demo/StageBadge'
import { caseHref } from '@/components/demo/caseLinks'
import {
  buildActivity,
  buildAttention,
  buildFunnel,
  buildKpis,
  buildRecommendations,
  buildThroughput,
  dashboardSubtitle,
  type DashboardPeriod,
} from '@/demo/dashboard'
import { currentStep, isCaseClosed } from '@/demo/engine'
import { DEMO_ACCOUNT, stepMeta, visitTypeById } from '@/demo/reference'
import { useDemoStore } from '@/demo/store'
import type { DemoCase, Patient } from '@/demo/types'

interface Row {
  c: DemoCase
  patient: Patient | null
}

const DONE_LABEL: Record<DashboardPeriod, string> = { today: 'Done today', wk: 'Done this week', mo: 'Done this month', yearly: 'Done this year' }

const RcmConsolePage = () => {
  const router = useRouter()
  const cases = useDemoStore((s) => s.cases)
  const patients = useDemoStore((s) => s.patients)
  const notifications = useDemoStore((s) => s.notifications)
  const [period, setPeriod] = useState<DashboardPeriod>('today')
  const funnel = buildFunnel(cases)

  const rows: Row[] = cases.map((c) => ({ c, patient: patients.find((p) => p.id === c.patientId) ?? null }))
  const columns: DataTableColumn<Row>[] = [
    { id: 'patient', header: 'Patient', cell: ({ patient }) => <PatientCell patient={patient} /> },
    { id: 'visit', header: 'Visit', cell: ({ c }) => visitTypeById(c.appointment.visitType).short },
    { id: 'stage', header: 'Stage', cell: ({ c }) => <StageBadge c={c} /> },
    { id: 'progress', header: 'Journey', cell: ({ c }) => <StepProgress c={c} /> },
    {
      id: 'next',
      header: '',
      align: 'right',
      stopRowClick: true,
      cell: ({ c }) => (
        <Button href={caseHref(c.id)} variant={isCaseClosed(c) ? 'ghost' : 'outline'} size="sm">
          {isCaseClosed(c) ? 'View' : stepMeta(currentStep(c)).short}
          {isCaseClosed(c) ? null : <ArrowRight className="size-3.5" aria-hidden />}
        </Button>
      ),
    },
  ]

  return (
    <RcmPage>
      <DashboardHeader firstName={DEMO_ACCOUNT.name.split(' ')[0]} subtitle={dashboardSubtitle(cases, period)} period={period} onPeriodChange={setPeriod} />

      <DashboardKpiGrid kpis={buildKpis(cases, period)} />

      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-3 mt-4">
        <ClaimPipelineFunnel rows={funnel.rows} subtitle={funnel.subtitle} />
        <AgentRecommendations recs={buildRecommendations(cases, patients)} />
      </div>

      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-3 mt-4">
        <AgentActivityFeed items={buildActivity(notifications)} />
        <AttentionList items={buildAttention(cases, patients)} />
      </div>

      <AgentThroughputGrid items={buildThroughput(cases, period)} doneLabel={DONE_LABEL[period]} />

      <RcmCard className="mt-4" pad={false}>
        <div className="px-4 pt-4">
          <RcmSectionHeader
            title="Encounters"
            subtitle="Open any encounter to walk its 15-step revenue-cycle journey"
            action={
              <Button href="/dashboard/patients/new" variant="primary" size="sm">
                Start new patient journey
              </Button>
            }
          />
        </div>
        <DataTable bordered={false} columns={columns} data={rows} getRowKey={(r) => r.c.id} onRowClick={(r) => router.push(caseHref(r.c.id))} />
      </RcmCard>
    </RcmPage>
  )
}

export default RcmConsolePage
