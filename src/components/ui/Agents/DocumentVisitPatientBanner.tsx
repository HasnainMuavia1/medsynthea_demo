'use client'

import { Building2, CalendarDays, Shield, Stethoscope, type LucideIcon } from 'lucide-react'
import { ui } from '@/styles/ui'
import { cn } from '@/utils'

const initialsFromName = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase()
}

export const DocumentVisitPatientBanner = ({ patientName, mrn, appointment, department, visitType, insurance, insuranceHint }: DocumentVisitPatientBannerProps) => {
  const columns: Array<{ label: string; value: string; hint?: string; icon: LucideIcon }> = [
    { label: 'Appointment', value: appointment, icon: CalendarDays },
    { label: 'Department', value: department, icon: Building2 },
    { label: 'Visit Type', value: visitType, icon: Stethoscope },
    { label: 'Insurance', value: insurance, hint: insuranceHint, icon: Shield },
  ]
  return (
    <section className="@container rounded-card border border-border bg-card">
      <div className="grid min-w-0 grid-cols-1 items-start gap-4 p-4 @md:grid-cols-2 @4xl:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))] @4xl:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-pill-green-border bg-pill-green-bg text-sm font-semibold text-primary" aria-hidden>
            {initialsFromName(patientName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground" title={patientName}>
              {patientName}
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground" title={mrn}>
              {mrn}
            </p>
          </div>
        </div>
        {columns.map((column) => {
          const Icon = column.icon
          return (
            <div key={column.label} className="flex min-w-0 items-start gap-2.5 @4xl:border-l @4xl:border-border @4xl:pl-4">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-pill-blue-border bg-pill-blue-bg text-pill-blue-text" aria-hidden>
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className={ui.typography.label}>{column.label}</p>
                <p className={cn(ui.typography.value, 'mt-1 line-clamp-2')} title={column.value}>
                  {column.value}
                </p>
                {column.hint ? (
                  <p className="mt-0.5 line-clamp-1 text-2xs text-muted-foreground" title={column.hint}>
                    {column.hint}
                  </p>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export interface DocumentVisitPatientBannerProps {
  patientName: string
  mrn: string
  appointment: string
  department: string
  visitType: string
  insurance: string
  insuranceHint?: string
}
