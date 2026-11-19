'use client'

import { Clock, ShieldCheck, Users, Wallet } from 'lucide-react'
import { Badge } from '@/components/shared/Badge'
import { StatTile } from '@/components/demo/DemoUi'
import { ModuleListPage } from '@/components/demo/ModuleListPage'
import { formatDateTime, money } from '@/demo/engine'

const EligibilityPage = () => (
  <ModuleListPage
    title="Eligibility verification"
    subtitle="Real-time 270/271 checks run automatically when an appointment is booked."
    step="eligibility"
    filter={() => true}
    emptyMessage="No appointments yet."
    kpis={(rows) => {
      const verified = rows.filter((r) => r.c.eligibility).length
      return (
        <>
          <StatTile label="Checks run" value={verified} icon={ShieldCheck} />
          <StatTile label="Active coverage" value={`${verified}/${verified}`} hint="100% verified" icon={Users} />
          <StatTile label="Pending" value={rows.length - verified} icon={Clock} tone="yellow" />
          <StatTile label="Avg response" value="1.8s" hint="Payer round-trip" icon={Wallet} tone="blue" />
        </>
      )
    }}
    columns={[
      { id: 'payer', header: 'Payer', cell: ({ patient }) => patient.insurance.payerName },
      { id: 'member', header: 'Member ID', cell: ({ patient }) => <span className="font-mono text-xs">{patient.insurance.memberId}</span> },
      { id: 'status', header: 'Status', cell: ({ c }) => (c.eligibility ? <Badge tone="green" density="fit" dot>Active</Badge> : <Badge tone="yellow" density="fit" dot>Pending</Badge>) },
      { id: 'ded', header: 'Deductible left', align: 'right', cell: ({ c }) => (c.eligibility ? money(c.eligibility.deductible - c.eligibility.deductibleMet) : '—') },
      { id: 'copay', header: 'ER copay', align: 'right', cell: ({ c }) => (c.eligibility ? money(c.eligibility.copay) : '—') },
      { id: 'checked', header: 'Checked', cell: ({ c }) => (c.eligibility ? formatDateTime(c.eligibility.checkedAt) : 'Runs on open') },
    ]}
  />
)

export default EligibilityPage
