'use client'

import { RcmAvatar } from '@/components/ui/Rcm/RcmPrimitives'
import { fullName } from '@/demo/engine'
import type { Patient } from '@/demo/types'

export const PatientCell = ({ patient }: { patient: Patient | null }) => {
  if (!patient) return <span className="text-muted-foreground">Unknown patient</span>
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <RcmAvatar name={fullName(patient)} className="size-7 shrink-0 text-3xs" />
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">{fullName(patient)}</div>
        <div className="truncate font-mono text-2xs text-muted-foreground">{patient.mrn}</div>
      </div>
    </div>
  )
}
