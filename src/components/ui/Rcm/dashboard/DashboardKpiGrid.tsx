'use client'

import { useRouter } from 'next/navigation'
import { List, Check, BarChart3, History, Send, Briefcase, Banknote } from 'lucide-react'
import { KpiCard } from '@/components/ui/Rcm/RcmPrimitives'
import type { Kpi } from '@/demo/dashboard'

const KPI_ICONS = {
  queue: <List className="size-3.5" />,
  clean: <Check className="size-3.5" />,
  denials: <BarChart3 className="size-3.5" />,
  ar: <History className="size-3.5" />,
  submit: <Send className="size-3.5" />,
  adj: <Briefcase className="size-3.5" />,
  paid: <Banknote className="size-3.5" />,
  coll: <Banknote className="size-3.5" />,
} as const

export const DashboardKpiGrid = ({ kpis }: { kpis: Kpi[] }) => {
  const router = useRouter()
  return (
    <div className="grid grid-cols-4 gap-3">
      {kpis.map((k) => (
        <KpiCard
          key={k.id}
          label={k.label}
          value={k.value}
          delta={k.delta}
          deltaTone={k.deltaTone}
          sparkData={k.sparkData}
          icon={KPI_ICONS[k.id]}
          hint={k.hint}
          onClick={() => router.push(k.href)}
        />
      ))}
    </div>
  )
}
