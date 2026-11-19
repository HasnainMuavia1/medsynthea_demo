'use client'

import { Banknote, Receipt, Scale, Users } from 'lucide-react'
import { Badge } from '@/components/shared/Badge'
import { StatTile } from '@/components/demo/DemoUi'
import { ModuleListPage } from '@/components/demo/ModuleListPage'
import { formatDateTime, money } from '@/demo/engine'

const RemittancesPage = () => (
  <ModuleListPage
    title="Remittances (ERA / 835)"
    subtitle="Electronic remittance advice received from payers."
    step="era"
    filter={(c) => c.era !== null}
    emptyMessage="No remittances received yet."
    kpis={(rows) => (
      <>
        <StatTile label="ERAs received" value={rows.length} icon={Receipt} />
        <StatTile label="Insurance paid" value={money(rows.reduce((s, r) => s + (r.c.era?.totalPaid ?? 0), 0))} icon={Banknote} />
        <StatTile label="Contractual adj." value={money(rows.reduce((s, r) => s + (r.c.era?.contractualAdjustment ?? 0), 0))} icon={Scale} tone="gray" />
        <StatTile label="Patient responsibility" value={money(rows.reduce((s, r) => s + (r.c.era?.patientResponsibility ?? 0), 0))} icon={Users} tone="orange" />
      </>
    )}
    columns={[
      { id: 'trace', header: 'EFT trace', cell: ({ c }) => <span className="font-mono text-xs">{c.era?.checkNumber}</span> },
      { id: 'payer', header: 'Payer', cell: ({ patient }) => patient.insurance.payerName },
      { id: 'paid', header: 'Paid', align: 'right', cell: ({ c }) => <span className="font-semibold text-primary">{money(c.era?.totalPaid ?? 0)}</span> },
      { id: 'pr', header: 'Patient resp.', align: 'right', cell: ({ c }) => money(c.era?.patientResponsibility ?? 0) },
      { id: 'received', header: 'Received', cell: ({ c }) => (c.era ? formatDateTime(c.era.receivedAt) : '—') },
      { id: 'rev', header: 'Review', cell: ({ c }) => (c.era?.reviewedAt ? <Badge tone="green" density="fit">Reviewed</Badge> : <Badge tone="yellow" density="fit" dot>New</Badge>) },
    ]}
  />
)

export default RemittancesPage
