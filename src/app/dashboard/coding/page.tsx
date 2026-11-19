'use client'

import { ClipboardCheck, DollarSign, Gauge, ListChecks } from 'lucide-react'
import { Badge } from '@/components/shared/Badge'
import { StatTile } from '@/components/demo/DemoUi'
import { ModuleListPage } from '@/components/demo/ModuleListPage'
import { money, totalCharges } from '@/demo/engine'

const CodingPage = () => (
  <ModuleListPage
    title="Medical coding"
    subtitle="CPT, HCPCS and ICD-10-CM codes suggested by the Coding Agent from signed notes."
    step="coding"
    filter={(c) => c.coding !== null}
    emptyMessage="No coded encounters yet."
    kpis={(rows) => (
      <>
        <StatTile label="Coded encounters" value={rows.length} icon={ClipboardCheck} />
        <StatTile label="Awaiting review" value={rows.filter((r) => !r.c.coding?.approvedAt).length} icon={ListChecks} tone="yellow" />
        <StatTile label="Avg confidence" value="95%" icon={Gauge} tone="blue" />
        <StatTile label="Charges coded" value={money(rows.reduce((s, r) => s + (r.c.coding ? totalCharges(r.c.coding) : 0), 0))} icon={DollarSign} />
      </>
    )}
    columns={[
      { id: 'primary', header: 'Primary CPT', cell: ({ c }) => <span className="font-mono font-semibold">{c.coding?.procedures[0]?.code}{c.coding?.procedures[0]?.modifiers.length ? `-${c.coding.procedures[0].modifiers.join('-')}` : ''}</span> },
      { id: 'lines', header: 'Lines', cell: ({ c }) => c.coding?.procedures.length },
      { id: 'dx', header: 'Diagnoses', cell: ({ c }) => <span className="font-mono text-xs">{c.coding?.diagnoses.map((d) => d.code).join(', ')}</span> },
      { id: 'charges', header: 'Charges', align: 'right', cell: ({ c }) => (c.coding ? money(totalCharges(c.coding)) : '—') },
      { id: 'status', header: 'Status', cell: ({ c }) => (c.coding?.approvedAt ? <Badge tone="green" density="fit" dot>Approved</Badge> : <Badge tone="yellow" density="fit" dot>Needs review</Badge>) },
    ]}
  />
)

export default CodingPage
