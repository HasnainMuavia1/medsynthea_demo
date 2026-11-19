'use client'

import { CheckCircle2, Landmark, Scale, Wallet } from 'lucide-react'
import { Badge } from '@/components/shared/Badge'
import { StatTile } from '@/components/demo/DemoUi'
import { ModuleListPage } from '@/components/demo/ModuleListPage'
import { money, round2 } from '@/demo/engine'
import type { DemoCase } from '@/demo/types'

const balanceOf = (c: DemoCase): number => {
  if (!c.era) return 0
  const r = c.reconciliation
  return round2(c.era.totalCharge - (r?.postedAt ? c.era.totalPaid + c.era.contractualAdjustment : 0) - (r?.patientPaidAt ? c.era.patientResponsibility : 0))
}

const ReconciliationPage = () => (
  <ModuleListPage
    title="Account reconciliation"
    subtitle="Payment posting, patient balances and bank deposit matching."
    step="reconciliation"
    filter={(c) => c.era !== null}
    emptyMessage="Nothing to reconcile yet."
    kpis={(rows) => (
      <>
        <StatTile label="Accounts" value={rows.length} icon={Landmark} />
        <StatTile label="Reconciled" value={rows.filter((r) => r.c.reconciliation?.closedAt).length} icon={CheckCircle2} />
        <StatTile label="Collected" value={money(rows.reduce((s, r) => s + (r.c.reconciliation?.postedAt ? r.c.era?.totalPaid ?? 0 : 0) + (r.c.reconciliation?.patientPaidAt ? r.c.era?.patientResponsibility ?? 0 : 0), 0))} icon={Wallet} tone="blue" />
        <StatTile label="Open balance" value={money(rows.reduce((s, r) => s + balanceOf(r.c), 0))} icon={Scale} tone="orange" />
      </>
    )}
    columns={[
      { id: 'ins', header: 'Insurance posted', cell: ({ c }) => (c.reconciliation?.postedAt ? <Badge tone="green" density="fit">Posted</Badge> : <Badge tone="gray" density="fit">Pending</Badge>) },
      { id: 'pt', header: 'Patient paid', cell: ({ c }) => (c.reconciliation?.patientPaidAt ? <Badge tone="green" density="fit">Paid</Badge> : <Badge tone="gray" density="fit">Open</Badge>) },
      { id: 'dep', header: 'Deposit', cell: ({ c }) => (c.reconciliation?.depositMatchedAt ? <Badge tone="green" density="fit">Matched</Badge> : <Badge tone="gray" density="fit">Unmatched</Badge>) },
      { id: 'bal', header: 'Balance', align: 'right', cell: ({ c }) => money(balanceOf(c)) },
      { id: 'state', header: 'Status', cell: ({ c }) => (c.reconciliation?.closedAt ? <Badge tone="green" density="fit" dot>Reconciled</Badge> : <Badge tone="yellow" density="fit" dot>Open</Badge>) },
    ]}
  />
)

export default ReconciliationPage
