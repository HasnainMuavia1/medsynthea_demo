import {
  Activity,
  BadgeDollarSign,
  Sparkles,
  FileLock2,
  PhoneCall,
  CalendarDays,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Landmark,
  LayoutDashboard,
  type LucideIcon,
  Receipt,
  Scale,
  Send,
  ShieldCheck,
  Users,
} from 'lucide-react'
import type { DemoCase } from '@/demo/types'

export interface DemoNavItem {
  id: string
  label: string
  href: string
  icon: LucideIcon
}

export interface DemoNavGroup {
  section: string
  items: DemoNavItem[]
}

export const DEMO_NAV: DemoNavGroup[] = [
  {
    section: 'My Workspace',
    items: [
      { id: 'overview', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { id: 'patients', label: 'Patients', href: '/dashboard/patients', icon: Users },
      { id: 'assistant', label: 'AI Assistant', href: '/dashboard/assistant', icon: Sparkles },
    ],
  },
  {
    section: 'Revenue Cycle',
    items: [
      { id: 'appointments', label: 'Appointments', href: '/dashboard/appointments', icon: CalendarDays },
      { id: 'eligibility', label: 'Eligibility', href: '/dashboard/eligibility', icon: ShieldCheck },
      { id: 'prior-auth', label: 'Prior Authorization', href: '/dashboard/prior-auth', icon: FileLock2 },
      { id: 'documentation', label: 'Clinical Note', href: '/dashboard/documentation', icon: FileText },
      { id: 'coding', label: 'Medical Coding', href: '/dashboard/coding', icon: ClipboardCheck },
      { id: 'estimates', label: 'Patient Estimates', href: '/dashboard/estimates', icon: BadgeDollarSign },
      { id: 'claims', label: 'Claims', href: '/dashboard/claims', icon: Send },
      { id: 'denials', label: 'Denial Intelligence', href: '/dashboard/denials', icon: Scale },
      { id: 'claim-status', label: 'Claim Status', href: '/dashboard/claim-status', icon: Activity },
      { id: 'ar', label: 'AR Caller Agent', href: '/dashboard/ar', icon: PhoneCall },
      { id: 'remittances', label: 'ERA / EOB', href: '/dashboard/remittances', icon: Receipt },
      { id: 'eob', label: 'EOB Documents', href: '/dashboard/eob', icon: FileCheck2 },
      { id: 'reconciliation', label: 'Payment Posting', href: '/dashboard/reconciliation', icon: Landmark },
    ],
  },
]

export const isNavActive = (href: string, pathname: string): boolean =>
  href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

const WORK_QUEUES: Record<string, (c: DemoCase) => boolean> = {
  eligibility: (c) => !c.eligibility,
  documentation: (c) => Boolean(c.eligibility) && !c.note?.signedAt,
  coding: (c) => Boolean(c.note?.signedAt) && !c.coding?.approvedAt,
  estimates: (c) => Boolean(c.coding?.approvedAt) && !c.estimate,
  denials: (c) => Boolean(c.estimate) && !c.denialCheck,
  claims: (c) => Boolean(c.denialCheck) && !c.claim?.submittedAt,
  'prior-auth': (c) => c.appointment.visitType === 'renal-exploration' && c.priorAuth?.status !== 'approved',
  ar: (c) => c.denial !== null && c.denial.resolvedAt === null,
  'claim-status': (c) => Boolean(c.claim?.submittedAt) && !c.statusEvents.some((e) => e.code === 'paid'),
  remittances: (c) => Boolean(c.era) && !c.era?.reviewedAt,
  eob: (c) => Boolean(c.eob) && !c.eob?.viewedAt,
  reconciliation: (c) => Boolean(c.era) && !c.reconciliation?.closedAt,
}

export const workQueueCount = (navId: string, cases: DemoCase[]): number => {
  const test = WORK_QUEUES[navId]
  return test ? cases.filter(test).length : 0
}
