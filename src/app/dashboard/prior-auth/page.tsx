'use client'

import { CheckCircle2, Clock, FileCheck2, Globe } from 'lucide-react'
import { Badge } from '@/components/shared/Badge'
import { StatTile } from '@/components/demo/DemoUi'
import { ModuleListPage } from '@/components/demo/ModuleListPage'
import { formatDate, formatDateTime, paRequired } from '@/demo/engine'
import { visitTypeById } from '@/demo/reference'

const PriorAuthPage = () => (
  <ModuleListPage
    title="Prior authorization"
    subtitle="Surgical services need payer approval before the date of service. ER visits are exempt."
    step="eligibility"
    filter={(c) => paRequired(c)}
    emptyMessage="No services need prior authorization."
    kpis={(rows) => (
      <>
        <StatTile label="Requests" value={rows.length} icon={FileCheck2} />
        <StatTile label="Approved" value={rows.filter((r) => r.c.priorAuth?.status === 'approved').length} icon={CheckCircle2} />
        <StatTile label="Pending" value={rows.filter((r) => r.c.priorAuth?.status !== 'approved').length} icon={Clock} tone="yellow" />
        <StatTile label="Via web portal" value={rows.filter((r) => r.c.priorAuth?.method === 'portal').length} icon={Globe} tone="blue" />
      </>
    )}
    columns={[
      { id: 'svc', header: 'Service', cell: ({ c }) => visitTypeById(c.appointment.visitType).short },
      { id: 'dos', header: 'Date of service', cell: ({ c }) => formatDate(`${c.appointment.date}T12:00:00`) },
      { id: 'payer', header: 'Payer', cell: ({ patient }) => patient.insurance.payerName },
      { id: 'req', header: 'Request', cell: ({ c }) => <span className="font-mono text-xs">{c.priorAuth?.requestId ?? '—'}</span> },
      { id: 'method', header: 'Method', cell: ({ c }) => (c.priorAuth ? (c.priorAuth.method === 'portal' ? 'Web portal' : 'X12 278') : '—') },
      {
        id: 'status',
        header: 'Status',
        cell: ({ c }) =>
          c.priorAuth?.status === 'approved' ? (
            <Badge tone="green" density="fit" dot>Approved</Badge>
          ) : c.priorAuth ? (
            <Badge tone="yellow" density="fit" dot>Pending review</Badge>
          ) : (
            <Badge tone="gray" density="fit" dot>Not started</Badge>
          ),
      },
      { id: 'auth', header: 'Auth #', cell: ({ c }) => <span className="font-mono text-xs">{c.priorAuth?.authNumber ?? '—'}</span> },
      { id: 'when', header: 'Approved', cell: ({ c }) => (c.priorAuth?.approvedAt ? formatDateTime(c.priorAuth.approvedAt) : '—') },
    ]}
  />
)

export default PriorAuthPage
