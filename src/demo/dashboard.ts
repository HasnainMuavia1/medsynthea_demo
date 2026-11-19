import { currentStep, daysSince, fullName, isCaseClosed, isDenialOpen, paRequired, round2 } from './engine'
import type { DemoCase, DemoNotification, Patient, StepId } from './types'

export type DashboardPeriod = 'today' | 'wk' | 'mo' | 'yearly'

export const DASHBOARD_PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'wk', label: 'Week' },
  { value: 'mo', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

const PERIOD_DAYS: Record<DashboardPeriod, number> = { today: 1, wk: 7, mo: 30, yearly: 365 }
const PERIOD_LABEL: Record<DashboardPeriod, string> = { today: 'today', wk: 'this week', mo: 'this month', yearly: 'this year' }

const inPeriod = (iso: string | null | undefined, period: DashboardPeriod): boolean =>
  Boolean(iso) && daysSince(iso ?? '') < PERIOD_DAYS[period]

export const fmtUSD = (n: number): string => {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e4) return `$${Math.round(n / 1e3)}K`
  return `$${Math.round(n).toLocaleString('en-US')}`
}

const spark = (stamps: (string | null | undefined)[], points = 8): number[] => {
  const out = Array<number>(points).fill(0)
  stamps.forEach((s) => {
    if (!s) return
    const d = daysSince(s)
    const idx = points - 1 - Math.min(points - 1, Math.floor(d / 2))
    out[idx] += 1
  })
  let acc = 0
  return out.map((v) => (acc += v) + 1)
}

export interface Kpi {
  id: 'queue' | 'clean' | 'denials' | 'ar' | 'submit' | 'adj' | 'paid' | 'coll'
  label: string
  value: string
  delta: string
  deltaTone: 'up' | 'down' | 'flat'
  sparkData: number[]
  hint: string
  href: string
}

export const buildKpis = (cases: DemoCase[], period: DashboardPeriod): Kpi[] => {
  const label = PERIOD_LABEL[period]
  const submitted = cases.filter((c) => c.claim?.submittedAt)
  const denied = cases.filter((c) => c.denial)
  const openDenials = cases.filter(isDenialOpen)
  const queue = cases.filter((c) => c.claim && !c.claim.submittedAt).length + cases.filter((c) => c.coding && !c.claim).length
  const openAr = submitted.filter((c) => !c.era)
  const daysAr = openAr.length ? Math.round(openAr.reduce((s, c) => s + daysSince(c.claim?.submittedAt ?? ''), 0) / openAr.length) : 0
  const clean = submitted.length ? Math.round(((submitted.length - denied.length) / submitted.length) * 100) : 100
  const posted = cases.filter((c) => c.reconciliation?.postedAt && inPeriod(c.reconciliation.postedAt, period))
  const eras = cases.filter((c) => c.era && inPeriod(c.era.receivedAt, period))
  const patientPaid = cases.filter((c) => c.reconciliation?.patientPaidAt && inPeriod(c.reconciliation.patientPaidAt, period))
  return [
    { id: 'queue', label: 'Claims in Queue', value: String(queue), delta: `${cases.filter((c) => !c.claim).length} pre-claim`, deltaTone: 'flat', sparkData: spark(cases.map((c) => c.coding?.codedAt)), hint: 'Coded or created, not yet submitted', href: '/dashboard/claims' },
    { id: 'clean', label: 'Clean-Claim Rate', value: `${clean}%`, delta: `${denied.length} denied`, deltaTone: denied.length ? 'down' : 'up', sparkData: spark(submitted.map((c) => c.claim?.submittedAt)), hint: 'Accepted without payer denial', href: '/dashboard/denials' },
    { id: 'denials', label: 'Open Denials', value: String(openDenials.length), delta: `${denied.length - openDenials.length} resolved`, deltaTone: openDenials.length ? 'down' : 'up', sparkData: spark(denied.map((c) => c.denial?.deniedAt)), hint: 'Waiting on the AR caller agent', href: '/dashboard/ar' },
    { id: 'ar', label: 'Days in A/R', value: String(daysAr), delta: `${openAr.length} unpaid`, deltaTone: daysAr > 14 ? 'down' : 'up', sparkData: spark(openAr.map((c) => c.claim?.submittedAt)), hint: 'Average age of unpaid claims', href: '/dashboard/ar' },
    { id: 'submit', label: `Submitted ${label.replace(/\b\w/g, (ch) => ch.toUpperCase())}`, value: String(submitted.filter((c) => inPeriod(c.claim?.submittedAt, period)).length), delta: `${submitted.length} total`, deltaTone: 'up', sparkData: spark(submitted.map((c) => c.claim?.submittedAt)), hint: 'EDI and web-portal submissions', href: '/dashboard/claims' },
    { id: 'adj', label: 'Contractual Adj.', value: fmtUSD(eras.reduce((s, c) => s + (c.era?.contractualAdjustment ?? 0), 0)), delta: `${eras.length} ERAs`, deltaTone: 'flat', sparkData: spark(eras.map((c) => c.era?.receivedAt)), hint: `CO-45 write-downs ${label}`, href: '/dashboard/remittances' },
    { id: 'paid', label: 'Insurance Paid', value: fmtUSD(posted.reduce((s, c) => s + (c.era?.totalPaid ?? 0), 0)), delta: `${posted.length} posted`, deltaTone: 'up', sparkData: spark(posted.map((c) => c.reconciliation?.postedAt)), hint: `Posted from ERAs ${label}`, href: '/dashboard/reconciliation' },
    { id: 'coll', label: 'Patient Collections', value: fmtUSD(patientPaid.reduce((s, c) => s + (c.era?.patientResponsibility ?? 0), 0)), delta: `${patientPaid.length} paid`, deltaTone: 'up', sparkData: spark(patientPaid.map((c) => c.reconciliation?.patientPaidAt)), hint: `Patient responsibility collected ${label}`, href: '/dashboard/reconciliation' },
  ]
}

export const dashboardSubtitle = (cases: DemoCase[], period: DashboardPeriod): string => {
  const open = cases.filter((c) => !isCaseClosed(c)).length
  const attention = cases.filter(isDenialOpen).length + cases.filter((c) => paRequired(c) && c.priorAuth?.status !== 'approved').length
  return `Agents are working ${open} open encounters ${PERIOD_LABEL[period] === 'today' ? 'today' : PERIOD_LABEL[period]} · ${attention} need${attention === 1 ? 's' : ''} your attention`
}

export type StageColor = 'intake' | 'eligibility' | 'coding-stage' | 'scrubbing' | 'submitted' | 'adjudication' | 'denial-mgmt' | 'paid-posted'

export const STAGE_COLOR_CLASS: Record<StageColor, string> = {
  intake: 'bg-pill-blue-text',
  eligibility: 'bg-chart-green',
  'coding-stage': 'bg-pill-purple-text',
  scrubbing: 'bg-chart-amber',
  submitted: 'bg-chart-cyan',
  adjudication: 'bg-chart-pink',
  'denial-mgmt': 'bg-destructive',
  'paid-posted': 'bg-primary',
}

const STAGES: { id: string; label: string; color: StageColor; steps: StepId[] }[] = [
  { id: 'intake', label: 'Intake', color: 'intake', steps: ['registration', 'appointment', 'audio', 'transcription', 'note'] },
  { id: 'eligibility', label: 'Eligibility', color: 'eligibility', steps: ['eligibility'] },
  { id: 'coding', label: 'Coding', color: 'coding-stage', steps: ['coding'] },
  { id: 'scrub', label: 'Scrubbing', color: 'scrubbing', steps: ['estimate', 'denial', 'claim'] },
  { id: 'submitted', label: 'Submitted', color: 'submitted', steps: ['submission'] },
  { id: 'adjudication', label: 'Adjudication', color: 'adjudication', steps: ['status'] },
  { id: 'denial', label: 'Denial Mgmt', color: 'denial-mgmt', steps: [] },
  { id: 'posted', label: 'Paid / Posted', color: 'paid-posted', steps: ['era', 'eob', 'reconciliation'] },
]

export interface FunnelRow {
  id: string
  label: string
  color: StageColor
  count: number
  amount: number
}

export const buildFunnel = (cases: DemoCase[]): { rows: FunnelRow[]; subtitle: string } => {
  const stageOf = (c: DemoCase): string => {
    if (isDenialOpen(c)) return 'denial'
    if (isCaseClosed(c)) return 'posted'
    const step = currentStep(c)
    return STAGES.find((s) => s.steps.includes(step))?.id ?? 'intake'
  }
  const rows = STAGES.map((s) => {
    const inStage = cases.filter((c) => stageOf(c) === s.id)
    return { id: s.id, label: s.label, color: s.color, count: inStage.length, amount: inStage.reduce((sum, c) => sum + (c.claim?.totalCharge ?? c.estimate?.totalCharges ?? 0), 0) }
  })
  const inFlight = cases.filter((c) => c.claim && !isCaseClosed(c))
  return { rows, subtitle: `${cases.length} encounters · ${fmtUSD(inFlight.reduce((s, c) => s + (c.claim?.totalCharge ?? 0), 0))} billed in flight` }
}

export interface Recommendation {
  key: string
  ref: string
  risk: number
  action: string
  impact: string
  href: string
}

export const buildRecommendations = (cases: DemoCase[], patients: Patient[]): Recommendation[] => {
  const name = (c: DemoCase) => {
    const p = patients.find((x) => x.id === c.patientId)
    return p ? fullName(p) : ''
  }
  const recs: Recommendation[] = []
  cases.filter(isDenialOpen).forEach((c) =>
    recs.push({ key: `den-${c.id}`, ref: c.claim?.claimId ?? '', risk: 92, action: `Call payer about ${c.denial?.code} — ${c.denial?.code === 'CO-16' ? 'fix subscriber DOB and send corrected claim' : 'upload medical records via portal'}`, impact: `${name(c)} · recovers $${Math.round(c.claim?.totalCharge ?? 0).toLocaleString('en-US')}`, href: `/dashboard/ar/call/${c.id}` })
  )
  cases.filter((c) => paRequired(c) && c.eligibility && c.priorAuth?.status !== 'approved').forEach((c) =>
    recs.push({ key: `pa-${c.id}`, ref: c.encounterNumber, risk: 74, action: 'Submit prior authorization before surgery', impact: `${name(c)} · CPT 50010 needs payer approval`, href: `/dashboard/cases/${c.id}?step=eligibility` })
  )
  cases.filter((c) => c.coding && !c.coding.approvedAt).forEach((c) =>
    recs.push({ key: `cod-${c.id}`, ref: c.encounterNumber, risk: 41, action: 'Approve suggested codes to release the claim', impact: `${name(c)} · ${c.coding?.procedures.length} lines ready`, href: `/dashboard/cases/${c.id}?step=coding` })
  )
  cases.filter((c) => c.claim?.submittedAt && !c.era && !isDenialOpen(c) && daysSince(c.claim.submittedAt) > 2).forEach((c) =>
    recs.push({ key: `ar-${c.id}`, ref: c.claim?.claimId ?? '', risk: 38, action: `Claim pending ${daysSince(c.claim?.submittedAt ?? '')} days — request expedite`, impact: `${name(c)} · AR status call`, href: `/dashboard/ar/call/${c.id}` })
  )
  return recs.slice(0, 4)
}

export type ActivityFilter = 'all' | 'elig' | 'denial' | 'eob'
export type ActivityTone = 'green' | 'yellow' | 'purple' | 'blue' | 'gray'

export const ACTIVITY_TONE_CLASS: Record<ActivityTone, string> = {
  green: 'bg-primary',
  yellow: 'bg-warning',
  purple: 'bg-pill-purple-text',
  blue: 'bg-pill-blue-text',
  gray: 'bg-pill-gray-text',
}

export const ACTIVITY_FILTER_OPTIONS: { value: ActivityFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'elig', label: 'Eligibility' },
  { value: 'denial', label: 'Denials' },
  { value: 'eob', label: 'EOB' },
]

const ACTOR: Record<DemoNotification['kind'], { actor: string; category: ActivityFilter; tone: ActivityTone }> = {
  patient: { actor: 'Intake Agent', category: 'all', tone: 'gray' },
  eligibility: { actor: 'Eligibility Agent', category: 'elig', tone: 'green' },
  priorauth: { actor: 'Prior Auth Agent', category: 'elig', tone: 'purple' },
  note: { actor: 'Documentation Agent', category: 'all', tone: 'blue' },
  coding: { actor: 'Coding Agent', category: 'all', tone: 'purple' },
  claim: { actor: 'Claims Agent', category: 'all', tone: 'blue' },
  status: { actor: 'Status Agent', category: 'all', tone: 'yellow' },
  denial: { actor: 'Denial Agent', category: 'denial', tone: 'yellow' },
  ar: { actor: 'AR Caller Agent', category: 'denial', tone: 'yellow' },
  era: { actor: 'Remittance Agent', category: 'eob', tone: 'green' },
  eob: { actor: 'Remittance Agent', category: 'eob', tone: 'green' },
  payment: { actor: 'Posting Agent', category: 'eob', tone: 'green' },
}

export interface ActivityItem {
  id: string
  actor: string
  verb: string
  target: string
  at: string
  tone: ActivityTone
  category: ActivityFilter
  href: string | null
}

export const buildActivity = (notifications: DemoNotification[]): ActivityItem[] =>
  notifications.map((n) => ({
    id: n.id,
    actor: ACTOR[n.kind].actor,
    verb: n.title.charAt(0).toLowerCase() + n.title.slice(1),
    target: n.message.split(' · ')[0].split(' — ')[0],
    at: n.at,
    tone: ACTOR[n.kind].tone,
    category: ACTOR[n.kind].category,
    href: n.caseId ? `/dashboard/cases/${n.caseId}${n.step ? `?step=${n.step}` : ''}` : null,
  }))

export interface AttentionItem {
  key: string
  time: string
  tone: 'red' | 'yellow' | 'blue' | 'green'
  title: string
  sub: string
  href: string
}

export const buildAttention = (cases: DemoCase[], patients: Patient[]): AttentionItem[] => {
  const name = (c: DemoCase) => {
    const p = patients.find((x) => x.id === c.patientId)
    return p ? fullName(p) : ''
  }
  const age = (iso: string) => {
    const d = daysSince(iso)
    return d === 0 ? 'Today' : `${d}d`
  }
  const items: AttentionItem[] = []
  cases.filter(isDenialOpen).forEach((c) => items.push({ key: `d-${c.id}`, time: age(c.denial?.deniedAt ?? ''), tone: 'red', title: `Denied ${c.denial?.code} — ${name(c)}`, sub: c.denial?.remark ?? '', href: `/dashboard/ar/call/${c.id}` }))
  cases.filter((c) => c.era && !c.era.reviewedAt).forEach((c) => items.push({ key: `e-${c.id}`, time: age(c.era?.receivedAt ?? ''), tone: 'blue', title: `ERA to review — ${name(c)}`, sub: `$${round2(c.era?.totalPaid ?? 0).toLocaleString('en-US')} paid by payer`, href: `/dashboard/cases/${c.id}?step=era` }))
  cases.filter((c) => c.eob && !c.eob.viewedAt).forEach((c) => items.push({ key: `o-${c.id}`, time: age(c.eob?.receivedAt ?? ''), tone: 'green', title: `EOB available — ${name(c)}`, sub: c.eob?.documentId ?? '', href: `/dashboard/cases/${c.id}?step=eob` }))
  cases.filter((c) => !c.eligibility).forEach((c) => items.push({ key: `g-${c.id}`, time: age(c.createdAt), tone: 'yellow', title: `Eligibility not run — ${name(c)}`, sub: `Appointment ${c.appointment.date} ${c.appointment.time}`, href: `/dashboard/cases/${c.id}?step=eligibility` }))
  return items.slice(0, 5)
}

export interface Throughput {
  id: string
  label: string
  done: number
  queue: number
  badge: string | null
  href: string
}

export const buildThroughput = (cases: DemoCase[], period: DashboardPeriod): Throughput[] => [
  { id: 'eligibility', label: 'Eligibility', done: cases.filter((c) => inPeriod(c.eligibility?.checkedAt, period)).length, queue: cases.filter((c) => !c.eligibility).length, badge: null, href: '/dashboard/eligibility' },
  { id: 'coding', label: 'Coding', done: cases.filter((c) => inPeriod(c.coding?.approvedAt, period)).length, queue: cases.filter((c) => c.coding && !c.coding.approvedAt).length, badge: null, href: '/dashboard/coding' },
  { id: 'scrubbing', label: 'Scrubbing', done: cases.filter((c) => inPeriod(c.denialCheck?.ranAt, period)).length, queue: cases.filter((c) => c.estimate && !c.denialCheck).length, badge: null, href: '/dashboard/denials' },
  { id: 'denial', label: 'Denial Mgmt', done: cases.filter((c) => inPeriod(c.denial?.resolvedAt, period)).length, queue: cases.filter(isDenialOpen).length, badge: cases.filter(isDenialOpen).length ? `${cases.filter(isDenialOpen).length} open` : null, href: '/dashboard/ar' },
  { id: 'eob', label: 'ERA / EOB', done: cases.filter((c) => inPeriod(c.era?.receivedAt, period)).length, queue: cases.filter((c) => (c.era && !c.era.reviewedAt) || (c.eob && !c.eob.viewedAt)).length, badge: null, href: '/dashboard/remittances' },
]
