'use client'

import { RcmSegmented } from '@/components/ui/Rcm/RcmPrimitives'
import { DASHBOARD_PERIOD_OPTIONS, type DashboardPeriod } from '@/demo/dashboard'

interface DashboardHeaderProps {
  firstName: string
  subtitle: string
  period: DashboardPeriod
  onPeriodChange: (period: DashboardPeriod) => void
}

const greeting = (): string => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export const DashboardHeader = ({ firstName, subtitle, period, onPeriodChange }: DashboardHeaderProps) => (
  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
    <div className="min-w-0">
      <h1 className="text-lg font-semibold tracking-tight">
        {greeting()}, {firstName}
      </h1>
      <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
    </div>
    <div className="flex items-center gap-2 shrink-0 flex-wrap">
      <RcmSegmented value={period} onChange={onPeriodChange} options={DASHBOARD_PERIOD_OPTIONS} />
    </div>
  </div>
)
