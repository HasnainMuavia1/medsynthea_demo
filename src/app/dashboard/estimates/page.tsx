'use client'

import { BadgeDollarSign, Building2, Send, Users } from 'lucide-react'
import { Badge } from '@/components/shared/Badge'
import { StatTile } from '@/components/demo/DemoUi'
import { ModuleListPage } from '@/components/demo/ModuleListPage'
import { money } from '@/demo/engine'

const EstimatesPage = () => (
  <ModuleListPage
    title="Patient estimates"
    subtitle="What each patient will pay versus what insurance is expected to pay."
    step="estimate"
    filter={(c) => c.estimate !== null}
    emptyMessage="No estimates yet — they are created after coding is approved."
    kpis={(rows) => (
      <>
        <StatTile label="Estimates" value={rows.length} icon={BadgeDollarSign} />
        <StatTile label="Patient responsibility" value={money(rows.reduce((s, r) => s + (r.c.estimate?.patientResponsibility ?? 0), 0))} icon={Users} tone="orange" />
        <StatTile label="Expected from payers" value={money(rows.reduce((s, r) => s + (r.c.estimate?.insurancePays ?? 0), 0))} icon={Building2} />
        <StatTile label="Sent to patients" value={rows.filter((r) => r.c.estimate?.sharedWithPatient).length} icon={Send} tone="blue" />
      </>
    )}
    columns={[
      { id: 'payer', header: 'Payer', cell: ({ patient }) => patient.insurance.payerName },
      { id: 'charges', header: 'Charges', align: 'right', cell: ({ c }) => money(c.estimate?.totalCharges ?? 0) },
      { id: 'allowed', header: 'Allowed', align: 'right', cell: ({ c }) => money(c.estimate?.allowedAmount ?? 0) },
      { id: 'ins', header: 'Insurance pays', align: 'right', cell: ({ c }) => <span className="font-semibold text-primary">{money(c.estimate?.insurancePays ?? 0)}</span> },
      { id: 'pt', header: 'Patient pays', align: 'right', cell: ({ c }) => <span className="font-semibold">{money(c.estimate?.patientResponsibility ?? 0)}</span> },
      { id: 'sent', header: 'Shared', cell: ({ c }) => (c.estimate?.sharedWithPatient ? <Badge tone="green" density="fit">Sent</Badge> : <Badge tone="gray" density="fit">Not sent</Badge>) },
    ]}
  />
)

export default EstimatesPage
