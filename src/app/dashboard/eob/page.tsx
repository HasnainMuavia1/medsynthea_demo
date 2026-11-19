'use client'

import { Download, FileCheck2, Eye, Inbox, Wallet } from 'lucide-react'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { StatTile } from '@/components/demo/DemoUi'
import { ModuleListPage } from '@/components/demo/ModuleListPage'
import { formatDateTime, money } from '@/demo/engine'
import { downloadEobPdf } from '@/demo/pdf'
import { useDemoStore } from '@/demo/store'

const EobPage = () => {
  const viewEob = useDemoStore((s) => s.viewEob)
  return (
    <ModuleListPage
      title="Explanation of benefits"
      subtitle="Payer EOB documents — view online or download as PDF."
      step="eob"
      filter={(c) => c.eob !== null}
      emptyMessage="No EOBs available yet."
      kpis={(rows) => (
        <>
          <StatTile label="EOBs" value={rows.length} icon={FileCheck2} />
          <StatTile label="Unreviewed" value={rows.filter((r) => !r.c.eob?.viewedAt).length} icon={Inbox} tone="yellow" />
          <StatTile label="Reviewed" value={rows.filter((r) => r.c.eob?.viewedAt).length} icon={Eye} tone="blue" />
          <StatTile label="Plan paid" value={money(rows.reduce((s, r) => s + (r.c.era?.totalPaid ?? 0), 0))} icon={Wallet} />
        </>
      )}
      columns={[
        { id: 'doc', header: 'Document', cell: ({ c }) => <span className="font-mono text-xs">{c.eob?.documentId}</span> },
        { id: 'payer', header: 'Payer', cell: ({ patient }) => patient.insurance.payerName },
        { id: 'paid', header: 'Plan paid', align: 'right', cell: ({ c }) => money(c.era?.totalPaid ?? 0) },
        { id: 'owe', header: 'Patient owes', align: 'right', cell: ({ c }) => money(c.era?.patientResponsibility ?? 0) },
        { id: 'issued', header: 'Issued', cell: ({ c }) => (c.eob ? formatDateTime(c.eob.receivedAt) : '—') },
        { id: 'viewed', header: 'Status', cell: ({ c }) => (c.eob?.viewedAt ? <Badge tone="green" density="fit">Reviewed</Badge> : <Badge tone="yellow" density="fit" dot>New</Badge>) },
        {
          id: 'pdf',
          header: '',
          align: 'right',
          stopRowClick: true,
          cell: ({ c, patient }) => (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                downloadEobPdf(c, patient)
                viewEob(c.id)
              }}
            >
              <Download className="size-3.5" aria-hidden />
              PDF
            </Button>
          ),
        },
      ]}
    />
  )
}

export default EobPage
