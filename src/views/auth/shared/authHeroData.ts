import type { LucideIcon } from 'lucide-react'
import { ClipboardCheck, Clock3, TrendingUp, Users } from 'lucide-react'
import { PRODUCT_FACTS } from '@/constants/product-facts'

export const AUTH_HERO_LEAD =
  'Medsynthea automates the revenue cycle behind the care, from eligibility to final payment, so you can focus on what matters most: your patients.'

export const AUTH_HERO_FEATURES = [
  {
    id: 'automate',
    title: 'Automate Routine Work',
    description: 'Eligibility, coding, follow-up, and more, handled by AI agents.',
    Icon: ClipboardCheck,
  },
  {
    id: 'denials',
    title: 'Reduce Claim Denials',
    description: 'Proactive insights and real-time alerts.',
    Icon: Clock3,
  },
  {
    id: 'paid-faster',
    title: 'Get Paid Faster',
    description: 'A smoother, more predictable revenue cycle.',
    Icon: TrendingUp,
  },
  {
    id: 'patients',
    title: 'More Time for Patients',
    description: 'Less administrative burden, more meaningful care.',
    Icon: Users,
  },
] as const satisfies readonly AuthHeroFeature[]

export const AUTH_HERO_STATS = [
  { id: 'accuracy', value: PRODUCT_FACTS.metrics.submissionAccuracy, label: 'Claim accuracy' },
  { id: 'phi', value: PRODUCT_FACTS.metrics.phiExposureInLogs, label: 'PHI in logs' },
  { id: 'evidence', value: PRODUCT_FACTS.metrics.evidenceTraceability, label: 'Evidence linked' },
] as const

export const AUTH_HERO_TRUST_NOTE = [
  'Trusted by healthcare',
  'teams to deliver better care.',
] as const

export interface AuthHeroFeature {
  id: string
  title: string
  description: string
  Icon: LucideIcon
}
