'use client'

import { Activity, CheckCircle2, Clock, Inbox } from 'lucide-react'
import { Badge } from '@/components/shared/Badge'
import { StatTile } from '@/components/demo/DemoUi'
import { ModuleListPage } from '@/components/demo/ModuleListPage'
import { formatDateTime } from '@/demo/engine'

const ClaimStatusPage = () => (
  <ModuleListPage
    title="Claim status"
    subtitle="999 / 277CA acknowledgments and 276/277 status updates tracked by the Status Agent."
    step="status"
    filter={(c) => Boolean(c.claim?.submittedAt)}
    emptyMessage="No submitted claims."
    kpis={(rows) => (
      <>
        <StatTile label="Tracked claims" value={rows.length} icon={Activity} />
        <StatTile label="Accepted by payer" value={rows.filter((r) => r.c.statusEvents.some((e) => e.code === 'accepted_277ca')).length} icon={Inbox} tone="blue" />
        <StatTile label="In adjudication" value={rows.filter((r) => !r.c.statusEvents.some((e) => e.code === 'paid')).length} icon={Clock} tone="yellow" />
        <StatTile label="Finalized paid" value={rows.filter((r) => r.c.statusEvents.some((e) => e.code === 'paid')).length} icon={CheckCircle2} />
      </>
    )}
    columns={[
      { id: 'id', header: 'Claim ID', cell: ({ c }) => <span className="font-mono text-xs">{c.claim?.claimId}</span> },
      { id: 'pcn', header: 'Payer claim #', cell: ({ c }) => <span className="font-mono text-xs">{c.claim?.payerClaimControl ?? 'Pending'}</span> },
      {
        id: 'status',
        header: 'Latest status',
        cell: ({ c }) => {
          const last = c.statusEvents[c.statusEvents.length - 1]
          if (!last) return <Badge tone="gray" density="fit" dot>Transmitted</Badge>
          return <Badge tone={last.code === 'paid' ? 'green' : 'yellow'} density="fit" dot>{last.label}</Badge>
        },
      },
      { id: 'updated', header: 'Last update', cell: ({ c }) => { const last = c.statusEvents[c.statusEvents.length - 1]; return last ? formatDateTime(last.at) : '—' } },
    ]}
  />
)

export default ClaimStatusPage
