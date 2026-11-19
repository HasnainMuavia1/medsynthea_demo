import { completedCount, currentStep, formatDate, formatDateTime, fullName, isCaseClosed, isDenialOpen, money, paRequired, round2, totalCharges } from './engine'
import { STEPS, stepMeta, visitTypeById } from './reference'
import type { DemoCase, Patient, StepId } from './types'

export type Concept =
  | 'patient'
  | 'appointment'
  | 'reconcile'
  | 'eob'
  | 'era'
  | 'coding'
  | 'eligibility'
  | 'estimate'
  | 'claim'
  | 'denied'
  | 'paid'
  | 'status'
  | 'priorauth'
  | 'call'
  | 'balance'
  | 'note'
  | 'submitted'
  | 'pending'
  | 'today'
  | 'count'
  | 'list'
  | 'help'
  | 'filler'

const VOCAB: Record<Concept, string[]> = {
  patient: ['patient', 'patients', 'pt', 'pts', 'people', 'person'],
  appointment: ['appointment', 'appointments', 'appt', 'appts', 'visit', 'visits', 'scheduled', 'schedule', 'booking', 'bookings', 'booked', 'encounter', 'encounters'],
  reconcile: ['reconcile', 'reconciled', 'reconciles', 'reconciliation', 'reconciliations', 'settled', 'closed'],
  eob: ['eob', 'eobs', 'explanation'],
  era: ['era', 'eras', 'remittance', 'remittances', 'remit', 'remits', '835'],
  coding: ['coding', 'codes', 'code', 'coded', 'cpt', 'icd', 'hcpcs', 'diagnosis', 'diagnoses', 'procedure', 'procedures'],
  eligibility: ['eligibility', 'eligible', 'coverage', 'covered', 'benefits', 'benefit', 'insurance', 'insured', 'verification', 'verified', 'verify', 'plan'],
  estimate: ['estimate', 'estimates', 'estimated', 'responsibility', 'owe', 'owes', 'pay', 'pays', 'copay', 'deductible', 'coinsurance', 'cost', 'costs'],
  claim: ['claim', 'claims'],
  denied: ['denied', 'denial', 'denials', 'deny', 'rejected', 'rejection', 'rejections'],
  paid: ['paid', 'payment', 'payments', 'collected', 'collection', 'collections', 'revenue'],
  status: ['status', 'stage', 'progress', 'where', 'journey', 'step', 'summary', 'update'],
  priorauth: ['authorization', 'authorizations', 'authorisation', 'auth', 'auths', 'preauth', 'precert', 'preauthorization', 'pa', 'prior'],
  call: ['call', 'calls', 'caller', 'called', 'calling', 'phone'],
  balance: ['balance', 'balances', 'outstanding', 'owed', 'unpaid', 'ar', 'receivable', 'receivables'],
  note: ['note', 'notes', 'documentation', 'transcript', 'transcription', 'soap', 'clinical'],
  submitted: ['submitted', 'submission', 'submissions', 'sent', 'filed'],
  pending: ['pending', 'open', 'waiting', 'queue', 'remaining'],
  today: ['today', 'todays'],
  count: ['many', 'number', 'count', 'total', 'much', 'howmany'],
  list: ['list', 'show', 'which', 'who', 'names', 'all', 'display'],
  help: ['help', 'hi', 'hello', 'hey', 'examples', 'example', 'questions'],
  filler: ['medical', 'arrived', 'arrive', 'received', 'receive', 'document', 'details', 'detail', 'information', 'info', 'record', 'records'],
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'of', 'for', 'to', 'is', 'are', 'was', 'were', 'be', 'been', 'do', 'does', 'did', 'have', 'has', 'had', 'what', 'whats', 'how',
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'can', 'could', 'would', 'should', 'please', 'tell', 'give', 'get', 'about', 'on', 'in', 'at', 'by',
  'with', 'and', 'or', 'any', 'there', 'it', 'its', 'from', 'so', 'far', 'yet', 'now', 'currently', 'current', 'many', 'much', 'will', 'did', 'got',
  'this', 'that', 'these', 'those', 'he', 'she', 'him', 'her', 'his', 'hers', 'they', 'them', 'their', 'same', 'up', 'out', 'than', 'more', 'less',
  'mr', 'mrs', 'ms', 'dr', 'whose', 'when', 'why', 'does', 'said', 'say', 'know', 'want', 'need', 'see', 'check', 'find', 'look',
])

const PRONOUNS = new Set(['this', 'that', 'he', 'she', 'him', 'her', 'his', 'hers', 'their', 'them', 'they', 'same'])

const VOCAB_INDEX: { word: string; concept: Concept }[] = (Object.entries(VOCAB) as [Concept, string[]][]).flatMap(([concept, words]) =>
  words.map((word) => ({ word, concept }))
)
const EXACT = new Map(VOCAB_INDEX.map(({ word, concept }) => [word, concept]))

export const editDistance = (a: string, b: string): number => {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
    }
  }
  return d[a.length][b.length]
}

const keywordThreshold = (len: number): number => (len <= 3 ? 0 : len <= 6 ? 1 : 2)
const nameThreshold = (len: number): number => (len <= 4 ? 0 : len <= 6 ? 1 : 2)

export const normalize = (q: string): string[] => {
  const cleaned = q
    .toLowerCase()
    .replace(/[’']s\b/g, '')
    .replace(/how\s+many/g, ' howmany ')
    .replace(/prior\s*-?\s*auth\w*/g, ' preauth ')
    .replace(/e\.?\s?o\.?\s?b\.?/g, ' eob ')
    .replace(/e\.?\s?r\.?\s?a\.?\b/g, ' era ')
    .replace(/[^a-z0-9]+/g, ' ')
  return cleaned.split(' ').filter(Boolean)
}

const matchKeyword = (token: string): Concept | null => {
  const exact = EXACT.get(token)
  if (exact) return exact
  if (STOPWORDS.has(token)) return null
  const limit = keywordThreshold(token.length)
  if (limit === 0) return null
  let best: { concept: Concept; dist: number } | null = null
  for (const { word, concept } of VOCAB_INDEX) {
    if (word[0] !== token[0] || Math.abs(word.length - token.length) > limit) continue
    const dist = editDistance(token, word)
    if (dist <= limit && (!best || dist < best.dist)) best = { concept, dist }
  }
  return best?.concept ?? null
}

export interface ParsedQuestion {
  tokens: string[]
  concepts: Set<Concept>
  patients: Patient[]
  pronoun: boolean
}

export const parseQuestion = (q: string, patients: Patient[]): ParsedQuestion => {
  const tokens = normalize(q)
  const nameTokens = new Set<number>()
  const scores = new Map<string, number>()

  tokens.forEach((token, i) => {
    if (STOPWORDS.has(token) || EXACT.has(token)) return
    const digits = token.replace(/\D/g, '')
    patients.forEach((p) => {
      let score = 0
      if (digits.length >= 5 && p.mrn.replace(/\D/g, '').includes(digits)) score = 3
      for (const part of [p.firstName.toLowerCase(), p.lastName.toLowerCase()]) {
        if (part[0] !== token[0]) continue
        const dist = editDistance(token, part)
        if (dist === 0) score = Math.max(score, 2)
        else if (dist <= nameThreshold(part.length)) score = Math.max(score, 1)
      }
      if (score > 0) {
        nameTokens.add(i)
        scores.set(p.id, (scores.get(p.id) ?? 0) + score)
      }
    })
  })

  const top = Math.max(0, ...scores.values())
  const matched = top > 0 ? patients.filter((p) => scores.get(p.id) === top) : []

  const concepts = new Set<Concept>()
  tokens.forEach((token, i) => {
    if (nameTokens.has(i)) return
    const concept = matchKeyword(token)
    if (concept && concept !== 'filler') concepts.add(concept)
  })
  if (tokens.includes('howmany')) concepts.add('count')

  return { tokens, concepts, patients: matched, pronoun: tokens.some((t) => PRONOUNS.has(t)) }
}

export interface AnswerTable {
  head: string[]
  rows: string[][]
}

export interface AnswerLink {
  label: string
  href: string
}

export interface AssistantAnswer {
  text: string
  table?: AnswerTable
  links?: AnswerLink[]
  suggestions?: string[]
  patientId?: string | null
  intent: string
}

export interface AssistantState {
  patients: Patient[]
  cases: DemoCase[]
}

const caseLink = (c: DemoCase, step: StepId | null, label: string): AnswerLink => ({
  label,
  href: step ? `/dashboard/cases/${c.id}?step=${step}` : `/dashboard/cases/${c.id}`,
})

const plural = (n: number, word: string, many = `${word}s`): string => `${n} ${n === 1 ? word : many}`

const nameOf = (state: AssistantState, c: DemoCase): string => {
  const p = state.patients.find((x) => x.id === c.patientId)
  return p ? fullName(p) : 'Unknown'
}

export const SUGGESTIONS = [
  'How many appointments do we have?',
  'How many claims were denied?',
  'How many accounts are reconciled?',
  'Has the ERA arrived for James Carter?',
  'Show the EOB for this patient',
  'What is the patient estimate for Maria Gonzalez?',
  'Medical coding for Robert Nguyen',
  'Eligibility of Emily Thompson',
]

const patientAnswer = (state: AssistantState, p: Patient, concepts: Set<Concept>): AssistantAnswer => {
  const cases = state.cases.filter((c) => c.patientId === p.id)
  const name = fullName(p)
  const base = { patientId: p.id }
  const c = cases[0]
  if (!c) {
    return {
      ...base,
      intent: 'patient.none',
      text: `${name} (${p.mrn}) is registered with ${p.insurance.payerName} but has no appointments yet, so there is no eligibility, coding, claim, ERA or EOB to report.`,
      links: [{ label: 'Schedule appointment', href: `/dashboard/appointments/new?patientId=${p.id}` }],
    }
  }
  const has = (k: Concept) => concepts.has(k)

  if (has('denied')) {
    const d = cases.find((x) => x.denial)
    if (!d?.denial) return { ...base, intent: 'patient.denial', text: `No claims for ${name} have been denied. ${c.claim ? `Latest claim ${c.claim.claimId} is ${c.era ? 'paid' : 'in process'}.` : 'No claim has been created yet.'}` }
    return {
      ...base,
      intent: 'patient.denial',
      text: `${name}'s claim ${d.claim?.claimId} was denied ${d.denial.code} (${d.denial.reason}) on ${formatDate(d.denial.deniedAt)}. ${d.denial.resolvedAt ? `Resolved: ${d.denial.resolution}.` : `Still open — remark ${d.denial.remark}. The AR caller agent can call ${p.insurance.payerName} to fix it.`}`,
      links: [d.denial.resolvedAt ? caseLink(d, 'status', 'Open claim status') : { label: 'Call payer with AR agent', href: `/dashboard/ar/call/${d.id}` }],
    }
  }
  if (has('eob')) {
    const e = cases.find((x) => x.eob)
    if (!e?.eob || !e.era) return { ...base, intent: 'patient.eob', text: `No EOB has been received for ${name} yet. Their latest encounter is at step ${stepMeta(currentStep(c)).number} (${stepMeta(currentStep(c)).short}).`, links: [caseLink(c, null, 'Open encounter')] }
    return {
      ...base,
      intent: 'patient.eob',
      text: `Yes — the EOB for ${name} (${e.eob.documentId}) was received on ${formatDateTime(e.eob.receivedAt)}. ${p.insurance.payerName} paid ${money(e.era.totalPaid)} and the patient may owe ${money(e.era.patientResponsibility)}. ${e.eob.viewedAt ? 'It has been reviewed.' : 'It has not been reviewed yet.'}`,
      links: [caseLink(e, 'eob', 'View EOB / download PDF')],
    }
  }
  if (has('era')) {
    const e = cases.find((x) => x.era)
    if (!e?.era) return { ...base, intent: 'patient.era', text: `The ERA has not arrived for ${name} yet. ${c.claim?.submittedAt ? `Claim ${c.claim.claimId} was submitted ${formatDate(c.claim.submittedAt)} and is ${isDenialOpen(c) ? `denied (${c.denial?.code})` : 'still in process'}.` : 'The claim has not been submitted yet.'}`, links: [caseLink(c, null, 'Open encounter')] }
    return {
      ...base,
      intent: 'patient.era',
      text: `Yes — the ERA (835) for ${name} arrived ${formatDateTime(e.era.receivedAt)}. ${p.insurance.payerName} paid ${money(e.era.totalPaid)} by ACH trace ${e.era.checkNumber}; contractual adjustment ${money(e.era.contractualAdjustment)}, patient responsibility ${money(e.era.patientResponsibility)}.`,
      table: { head: ['Service', 'Billed', 'Allowed', 'Paid'], rows: e.era.lines.map((l) => [l.code, money(l.charge), money(l.allowed), money(l.paid)]) },
      links: [caseLink(e, 'era', 'Open ERA')],
    }
  }
  if (has('priorauth')) {
    if (!paRequired(c)) return { ...base, intent: 'patient.pa', text: `Prior authorization is not required for ${name}'s ${visitTypeById(c.appointment.visitType).short} — emergency services are exempt.` }
    const pa = c.priorAuth
    return {
      ...base,
      intent: 'patient.pa',
      text: pa
        ? `Prior auth for ${name}: ${pa.status === 'approved' ? `approved, auth ${pa.authNumber}, valid ${pa.validFrom} to ${pa.validTo}` : `submitted ${formatDateTime(pa.submittedAt ?? '')}, pending review`} (via ${pa.method === 'portal' ? 'payer web portal' : 'X12 278'}).`
        : `Prior authorization is required for ${name} (CPT 50010) but has not been submitted yet.`,
      links: [caseLink(c, 'eligibility', 'Open prior auth')],
    }
  }
  if (has('call')) {
    const calls = cases.flatMap((x) => x.arCalls)
    if (!calls.length) return { ...base, intent: 'patient.calls', text: `The AR caller agent has not called about ${name} yet.`, links: c.claim?.submittedAt ? [{ label: 'Start AR call', href: `/dashboard/ar/call/${c.id}` }] : [] }
    return { ...base, intent: 'patient.calls', text: `${plural(calls.length, 'AR call')} for ${name}. Latest on ${formatDateTime(calls[0].startedAt)} (ref ${calls[0].referenceNumber}): ${calls[0].outcome}${calls[0].actionTaken ? ` Action: ${calls[0].actionTaken}.` : ''}` }
  }
  if (has('coding')) {
    const k = cases.find((x) => x.coding)
    if (!k?.coding) return { ...base, intent: 'patient.coding', text: `${name}'s encounter has not been coded yet — it is at step ${stepMeta(currentStep(c)).number} (${stepMeta(currentStep(c)).short}).`, links: [caseLink(c, null, 'Open encounter')] }
    return {
      ...base,
      intent: 'patient.coding',
      text: `Medical coding for ${name} (${visitTypeById(k.appointment.visitType).short}): ${k.coding.procedures.length} procedure lines, ${k.coding.diagnoses.length} diagnoses, total charges ${money(totalCharges(k.coding))}. ${k.coding.approvedAt ? 'Approved by the coder.' : 'Waiting for coder approval.'} Diagnoses: ${k.coding.diagnoses.map((d) => `${d.code} ${d.description}`).join('; ')}.`,
      table: { head: ['Code', 'Mod', 'Units', 'Description', 'Charge'], rows: k.coding.procedures.map((x) => [x.code, x.modifiers.join(',') || '—', String(x.units), x.description, money(x.charge)]) },
      links: [caseLink(k, 'coding', 'Open coding')],
    }
  }
  if (has('estimate') || (has('count') && has('paid'))) {
    const e = cases.find((x) => x.estimate)
    if (!e?.estimate) return { ...base, intent: 'patient.estimate', text: `No patient estimate exists for ${name} yet — it is created after coding is approved.`, links: [caseLink(c, null, 'Open encounter')] }
    const est = e.estimate
    return {
      ...base,
      intent: 'patient.estimate',
      text: `Patient estimate for ${name}: the patient pays ${money(est.patientResponsibility)} and ${p.insurance.payerName} is expected to pay ${money(est.insurancePays)} on ${money(est.totalCharges)} of charges (allowed ${money(est.allowedAmount)}). ${est.sharedWithPatient ? 'The estimate was sent to the patient.' : 'Not yet sent to the patient.'}`,
      table: {
        head: ['Component', 'Amount'],
        rows: [
          ['Copay', money(est.copayAmount)],
          ['Deductible', money(est.deductibleApplied)],
          ['Coinsurance', money(est.coinsuranceAmount)],
          ['Contractual adjustment', money(est.contractualAdjustment)],
        ],
      },
      links: [caseLink(e, 'estimate', 'Open estimate')],
    }
  }
  if (has('eligibility')) {
    const el = c.eligibility
    if (!el) return { ...base, intent: 'patient.eligibility', text: `Eligibility for ${name} has not been run yet. It runs automatically when you open the encounter.`, links: [caseLink(c, 'eligibility', 'Run eligibility')] }
    return {
      ...base,
      intent: 'patient.eligibility',
      text: `${name} is eligible — ${p.insurance.payerName} (${p.insurance.planName}) coverage is active, member ${p.insurance.memberId}. Deductible ${money(el.deductibleMet)} of ${money(el.deductible)} met, coinsurance ${el.coinsurancePct}%, ER copay ${money(el.copay)}. Prior auth ${paRequired(c) ? (c.priorAuth?.status === 'approved' ? `approved (${c.priorAuth.authNumber})` : 'required') : 'not required'}. Verified ${formatDateTime(el.checkedAt)}.`,
      links: [caseLink(c, 'eligibility', 'Open eligibility')],
    }
  }
  if (has('note')) {
    const n = cases.find((x) => x.note)
    if (!n?.note) return { ...base, intent: 'patient.note', text: `No clinical note has been generated for ${name} yet.`, links: [caseLink(c, null, 'Open encounter')] }
    return { ...base, intent: 'patient.note', text: `${name}'s ${n.note.title.toLowerCase()} was generated ${formatDateTime(n.note.generatedAt)} from a ${n.transcript?.length ?? 0}-utterance transcript and is ${n.note.signedAt ? `signed (${formatDateTime(n.note.signedAt)})` : 'still a draft awaiting signature'}.`, links: [caseLink(n, 'note', 'Open clinical note')] }
  }
  if (has('reconcile') || has('balance')) {
    const r = cases.find((x) => x.era)
    if (!r?.era) return { ...base, intent: 'patient.reconcile', text: `${name}'s account can't be reconciled yet — no ERA has been received.` }
    const rec = r.reconciliation
    const bal = round2(r.era.totalCharge - (rec?.postedAt ? r.era.totalPaid + r.era.contractualAdjustment : 0) - (rec?.patientPaidAt ? r.era.patientResponsibility : 0))
    return {
      ...base,
      intent: 'patient.reconcile',
      text: rec?.closedAt ? `${name}'s account is reconciled — closed ${formatDateTime(rec.closedAt)} with a ${money(0)} balance.` : `${name}'s account is not reconciled yet. Current balance ${money(bal)}.`,
      links: [caseLink(r, 'reconciliation', 'Open reconciliation')],
    }
  }
  if (has('appointment')) {
    return {
      ...base,
      intent: 'patient.appointments',
      text: `${name} has ${plural(cases.length, 'appointment')}.`,
      table: { head: ['Encounter', 'Date', 'Visit', 'Stage'], rows: cases.map((x) => [x.encounterNumber, `${x.appointment.date} ${x.appointment.time}`, visitTypeById(x.appointment.visitType).short, isCaseClosed(x) ? 'Reconciled' : stepMeta(currentStep(x)).short]) },
      links: cases.map((x) => caseLink(x, null, `Open ${x.encounterNumber}`)),
    }
  }
  const step = stepMeta(currentStep(c))
  return {
    ...base,
    intent: 'patient.status',
    text: `${name} (${p.mrn}, ${p.insurance.payerName}) — ${visitTypeById(c.appointment.visitType).short} on ${c.appointment.date}. ${isCaseClosed(c) ? 'All 15 steps are complete and the account is reconciled.' : `${completedCount(c)} of 15 steps complete; now on step ${step.number}, ${step.label}.`}${c.claim ? ` Claim ${c.claim.claimId} (${money(c.claim.totalCharge)}) is ${isDenialOpen(c) ? `denied ${c.denial?.code}` : c.era ? 'paid' : c.claim.submittedAt ? 'submitted' : 'created'}.` : ''}`,
    links: [caseLink(c, null, 'Open encounter')],
  }
}

const NEEDS_PATIENT: Concept[] = ['eob', 'era', 'coding', 'estimate', 'eligibility', 'priorauth', 'note', 'denied', 'reconcile', 'call', 'balance', 'status', 'appointment', 'claim']

const globalAnswer = (state: AssistantState, concepts: Set<Concept>): AssistantAnswer | null => {
  const { cases, patients } = state
  const has = (k: Concept) => concepts.has(k)
  const today = new Date().toISOString().slice(0, 10)

  if (has('denied')) {
    const d = cases.filter((c) => c.denial)
    const open = d.filter(isDenialOpen)
    return {
      intent: 'global.denied',
      text: `${plural(d.length, 'claim')} ${d.length === 1 ? 'has' : 'have'} been denied by payers — ${open.length} still open and ${d.length - open.length} resolved. The Denial Prevention Agent predicted no denials on new claims.`,
      table: { head: ['Patient', 'Claim', 'Code', 'Reason', 'State'], rows: d.map((c) => [nameOf(state, c), c.claim?.claimId ?? '', c.denial?.code ?? '', c.denial?.remark ?? '', isDenialOpen(c) ? 'Open' : 'Resolved']) },
      links: [{ label: 'Open AR caller worklist', href: '/dashboard/ar' }],
    }
  }
  if (has('priorauth')) {
    const pa = cases.filter(paRequired)
    const approved = pa.filter((c) => c.priorAuth?.status === 'approved')
    return {
      intent: 'global.pa',
      text: `${plural(pa.length, 'encounter')} need${pa.length === 1 ? 's' : ''} prior authorization — ${approved.length} approved, ${pa.length - approved.length} pending.`,
      table: { head: ['Patient', 'Request', 'Status', 'Auth #'], rows: pa.map((c) => [nameOf(state, c), c.priorAuth?.requestId ?? '—', c.priorAuth?.status ?? 'not started', c.priorAuth?.authNumber ?? '—']) },
      links: [{ label: 'Open prior authorization', href: '/dashboard/prior-auth' }],
    }
  }
  if (has('call')) {
    const calls = cases.flatMap((c) => c.arCalls.map((call) => ({ call, c })))
    return {
      intent: 'global.calls',
      text: `The AR caller agent has made ${plural(calls.length, 'call')}. ${cases.filter(isDenialOpen).length} denied claims are waiting for a payer call.`,
      table: calls.length ? { head: ['Patient', 'When', 'Reference', 'Action'], rows: calls.map(({ call, c }) => [nameOf(state, c), formatDateTime(call.startedAt), call.referenceNumber, call.actionTaken ?? 'Pending']) } : undefined,
      links: [{ label: 'Open AR caller worklist', href: '/dashboard/ar' }],
    }
  }
  if (has('eob')) {
    const e = cases.filter((c) => c.eob)
    return {
      intent: 'global.eob',
      text: `${plural(e.length, 'EOB')} received — ${e.filter((c) => !c.eob?.viewedAt).length} not yet reviewed.`,
      table: { head: ['Patient', 'Document', 'Plan paid', 'Patient owes'], rows: e.map((c) => [nameOf(state, c), c.eob?.documentId ?? '', money(c.era?.totalPaid ?? 0), money(c.era?.patientResponsibility ?? 0)]) },
      links: [{ label: 'Open EOBs', href: '/dashboard/eob' }],
    }
  }
  if (has('era')) {
    const e = cases.filter((c) => c.era)
    return {
      intent: 'global.era',
      text: `${plural(e.length, 'ERA')} received, totalling ${money(e.reduce((s, c) => s + (c.era?.totalPaid ?? 0), 0))} in insurance payments.`,
      table: { head: ['Patient', 'Payer', 'Paid', 'Received'], rows: e.map((c) => [nameOf(state, c), patients.find((p) => p.id === c.patientId)?.insurance.payerName ?? '', money(c.era?.totalPaid ?? 0), formatDate(c.era?.receivedAt ?? '')]) },
      links: [{ label: 'Open remittances', href: '/dashboard/remittances' }],
    }
  }
  if (has('reconcile')) {
    const withEra = cases.filter((c) => c.era)
    const done = withEra.filter(isCaseClosed)
    return {
      intent: 'global.reconcile',
      text: `${plural(done.length, 'account')} ${done.length === 1 ? 'is' : 'are'} fully reconciled; ${withEra.length - done.length} with an ERA still need reconciliation.`,
      table: { head: ['Patient', 'Encounter', 'State'], rows: withEra.map((c) => [nameOf(state, c), c.encounterNumber, isCaseClosed(c) ? 'Reconciled' : 'Open']) },
      links: [{ label: 'Open reconciliation', href: '/dashboard/reconciliation' }],
    }
  }
  if (has('estimate')) {
    const e = cases.filter((c) => c.estimate)
    return {
      intent: 'global.estimate',
      text: `${plural(e.length, 'patient estimate')}: patients owe ${money(e.reduce((s, c) => s + (c.estimate?.patientResponsibility ?? 0), 0))} in total and payers are expected to pay ${money(e.reduce((s, c) => s + (c.estimate?.insurancePays ?? 0), 0))}.`,
      table: { head: ['Patient', 'Patient pays', 'Insurance pays'], rows: e.map((c) => [nameOf(state, c), money(c.estimate?.patientResponsibility ?? 0), money(c.estimate?.insurancePays ?? 0)]) },
      links: [{ label: 'Open estimates', href: '/dashboard/estimates' }],
    }
  }
  if (has('coding')) {
    const k = cases.filter((c) => c.coding)
    const pending = k.filter((c) => !c.coding?.approvedAt)
    return {
      intent: 'global.coding',
      text: `${plural(k.length, 'encounter')} coded — ${pending.length} waiting for coder approval${pending.length ? ` (${pending.map((c) => nameOf(state, c)).join(', ')})` : ''}.`,
      links: [{ label: 'Open medical coding', href: '/dashboard/coding' }],
    }
  }
  if (has('eligibility')) {
    const v = cases.filter((c) => c.eligibility)
    return { intent: 'global.eligibility', text: `Eligibility verified for ${plural(v.length, 'encounter')} — all active coverage. ${cases.length - v.length} pending.`, links: [{ label: 'Open eligibility', href: '/dashboard/eligibility' }] }
  }
  if (has('note')) {
    const n = cases.filter((c) => c.note)
    return { intent: 'global.note', text: `${plural(n.length, 'clinical note')} generated — ${n.filter((c) => c.note?.signedAt).length} signed, ${n.filter((c) => !c.note?.signedAt).length} drafts.`, links: [{ label: 'Open documentation', href: '/dashboard/documentation' }] }
  }
  if (has('balance')) {
    const open = cases.filter((c) => c.claim?.submittedAt && !c.era)
    return { intent: 'global.balance', text: `Open AR is ${money(open.reduce((s, c) => s + (c.claim?.totalCharge ?? 0), 0))} across ${plural(open.length, 'unpaid claim')}.`, links: [{ label: 'Open AR caller worklist', href: '/dashboard/ar' }] }
  }
  if (has('paid')) {
    const ins = cases.reduce((s, c) => s + (c.reconciliation?.postedAt ? (c.era?.totalPaid ?? 0) : 0), 0)
    const pt = cases.reduce((s, c) => s + (c.reconciliation?.patientPaidAt ? (c.era?.patientResponsibility ?? 0) : 0), 0)
    return { intent: 'global.paid', text: `Collected ${money(ins + pt)} so far — ${money(ins)} from insurance and ${money(pt)} from patients. ${plural(cases.filter((c) => c.era).length, 'claim')} paid by payers.` }
  }
  if (has('claim') || has('submitted')) {
    const cl = cases.filter((c) => c.claim)
    const sub = cl.filter((c) => c.claim?.submittedAt)
    return {
      intent: 'global.claims',
      text: `${plural(cl.length, 'claim')} created: ${sub.length} submitted, ${cl.filter((c) => c.era).length} paid, ${cl.filter(isDenialOpen).length} denied (open), ${sub.filter((c) => !c.era && !isDenialOpen(c)).length} in process.`,
      links: [{ label: 'Open claims', href: '/dashboard/claims' }],
    }
  }
  if (has('appointment')) {
    const todays = cases.filter((c) => c.appointment.date === today)
    return {
      intent: 'global.appointments',
      text: has('today') ? `${plural(todays.length, 'appointment')} today.` : `${plural(cases.length, 'appointment')} in total — ${todays.length} today, ${cases.filter(isCaseClosed).length} fully reconciled.`,
      table: { head: ['Patient', 'Date', 'Visit', 'Stage'], rows: (has('today') ? todays : cases).map((c) => [nameOf(state, c), `${c.appointment.date} ${c.appointment.time}`, visitTypeById(c.appointment.visitType).short, isCaseClosed(c) ? 'Reconciled' : stepMeta(currentStep(c)).short]) },
      links: [{ label: 'Open appointments', href: '/dashboard/appointments' }],
    }
  }
  if (has('patient')) {
    return {
      intent: 'global.patients',
      text: `${plural(patients.length, 'patient')} registered.`,
      table: { head: ['Patient', 'MRN', 'Payer'], rows: patients.map((p) => [fullName(p), p.mrn, p.insurance.payerName]) },
      links: [{ label: 'Open patients', href: '/dashboard/patients' }],
    }
  }
  if (has('status') || has('pending')) {
    const open = cases.filter((c) => !isCaseClosed(c))
    return {
      intent: 'global.pipeline',
      text: `${plural(open.length, 'open encounter')} in the pipeline.`,
      table: { head: ['Step', 'Encounters'], rows: STEPS.map((s) => [`${s.number}. ${s.short}`, String(open.filter((c) => currentStep(c) === s.id).length)]).filter((r) => r[1] !== '0') },
    }
  }
  return null
}

export const answerQuestion = (question: string, state: AssistantState, lastPatientId: string | null): AssistantAnswer => {
  const parsed = parseQuestion(question, state.patients)
  const { concepts } = parsed

  if (parsed.patients.length > 1) {
    return {
      intent: 'clarify.ambiguous',
      text: `I found ${parsed.patients.length} patients matching that name. Which one did you mean?`,
      suggestions: parsed.patients.map((p) => `${question.replace(/\?$/, '')} — ${fullName(p)} ${p.mrn}`),
    }
  }

  const contextPatient = lastPatientId ? state.patients.find((p) => p.id === lastPatientId) ?? null : null
  const explicit = parsed.patients[0] ?? null
  const needsPatient = NEEDS_PATIENT.some((k) => concepts.has(k))
  const isCount = concepts.has('count') || concepts.has('list')

  if (explicit) return patientAnswer(state, explicit, concepts)
  if (parsed.pronoun && !isCount && (needsPatient || concepts.size === 0)) {
    if (contextPatient) return patientAnswer(state, contextPatient, concepts)
    return {
      intent: 'clarify.patient',
      text: 'Which patient do you mean? Mention a name or MRN, for example:',
      suggestions: state.patients.slice(0, 4).map((p) => `${question.replace(/\?$/, '')} for ${fullName(p)}`),
    }
  }

  const global = globalAnswer(state, concepts)
  if (global) return global

  if (concepts.has('help') || concepts.size === 0) {
    return {
      intent: concepts.has('help') ? 'help' : 'fallback',
      text: concepts.has('help')
        ? 'I can answer questions about the demo data — appointments, eligibility, prior auth, coding, estimates, claims, denials, AR calls, ERAs, EOBs and reconciliation, overall or for one patient. Try one of these:'
        : "I didn't catch that. Ask about a patient by name, or about appointments, eligibility, coding, estimates, claims, denials, ERAs, EOBs or reconciliation. For example:",
      suggestions: SUGGESTIONS,
    }
  }
  return { intent: 'fallback', text: "I couldn't match that to the demo data. Try one of these:", suggestions: SUGGESTIONS }
}
