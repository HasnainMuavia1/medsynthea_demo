'use client'

import { CheckCircle2, FileSearch, Send, Wallet } from 'lucide-react'
import { Badge } from '@/components/shared/Badge'
import { StatTile } from '@/components/demo/DemoUi'
import { ModuleListPage } from '@/components/demo/ModuleListPage'
import { formatDateTime, money } from '@/demo/engine'
import type { DemoCase } from '@/demo/types'

const claimState = (c: DemoCase) => {
  if (c.denial && !c.denial.resolvedAt) return <Badge tone="red" density="fit" dot>Denied {c.denial.code}</Badge>
  if (c.era) return <Badge tone="green" density="fit" dot>Paid</Badge>
  if (c.claim?.submittedAt) return <Badge tone="yellow" density="fit" dot>Submitted</Badge>
  return <Badge tone="blue" density="fit" dot>Ready</Badge>
}

const ClaimsPage = () => (
  <ModuleListPage
    title="Claims"
    subtitle="837P professional claims created from approved codes."
    step="claim"
    filter={(c) => c.claim !== null}
    emptyMessage="No claims yet."
    kpis={(rows) => (
      <>
        <StatTile label="Claims" value={rows.length} icon={FileSearch} />
        <StatTile label="Submitted" value={rows.filter((r) => r.c.claim?.submittedAt).length} icon={Send} tone="yellow" />
        <StatTile label="Paid" value={rows.filter((r) => r.c.era).length} hint={`${rows.filter((r) => r.c.denial).length} denied by payer`} icon={CheckCircle2} />
        <StatTile label="Billed" value={money(rows.reduce((s, r) => s + (r.c.claim?.totalCharge ?? 0), 0))} icon={Wallet} tone="blue" />
      </>
    )}
    columns={[
      { id: 'id', header: 'Claim ID', cell: ({ c }) => <span className="font-mono text-xs">{c.claim?.claimId}</span> },
      { id: 'payer', header: 'Payer', cell: ({ patient }) => patient.insurance.payerName },
      { id: 'amount', header: 'Billed', align: 'right', cell: ({ c }) => money(c.claim?.totalCharge ?? 0) },
      { id: 'state', header: 'Status', cell: ({ c }) => claimState(c) },
      { id: 'submitted', header: 'Submitted', cell: ({ c }) => (c.claim?.submittedAt ? formatDateTime(c.claim.submittedAt) : '—') },
    ]}
  />
)

export default ClaimsPage
