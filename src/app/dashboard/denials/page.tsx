'use client'

import { ShieldCheck, ShieldX, Gauge, Scale } from 'lucide-react'
import { Badge } from '@/components/shared/Badge'
import { StatTile } from '@/components/demo/DemoUi'
import { ModuleListPage } from '@/components/demo/ModuleListPage'
import { formatDateTime } from '@/demo/engine'

const DenialsPage = () => (
  <ModuleListPage
    title="Denial prevention"
    subtitle="Every claim is scrubbed by the Denial Prevention Agent before submission."
    step="denial"
    filter={(c) => c.denialCheck !== null}
    emptyMessage="No claims scrubbed yet."
    kpis={(rows) => (
      <>
        <StatTile label="Claims scrubbed" value={rows.length} icon={Scale} />
        <StatTile label="Denials predicted" value={0} hint="Clean claim rate 100%" icon={ShieldX} tone="green" />
        <StatTile label="Avg risk score" value={rows.length ? Math.round(rows.reduce((s, r) => s + (r.c.denialCheck?.riskScore ?? 0), 0) / rows.length) : 0} icon={Gauge} tone="blue" />
        <StatTile label="Checks per claim" value={10} icon={ShieldCheck} />
      </>
    )}
    columns={[
      { id: 'claimish', header: 'Payer', cell: ({ patient }) => patient.insurance.payerName },
      { id: 'risk', header: 'Risk score', align: 'right', cell: ({ c }) => `${c.denialCheck?.riskScore}/100` },
      { id: 'pred', header: 'Denial predicted', cell: () => <Badge tone="green" density="fit" dot>No</Badge> },
      { id: 'checks', header: 'Checks', cell: ({ c }) => `${c.denialCheck?.checks.length}/${c.denialCheck?.checks.length} passed` },
      { id: 'ran', header: 'Ran', cell: ({ c }) => (c.denialCheck ? formatDateTime(c.denialCheck.ranAt) : '—') },
    ]}
  />
)

export default DenialsPage
