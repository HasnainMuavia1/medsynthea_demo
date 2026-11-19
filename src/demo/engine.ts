import { PRACTICE, STEPS, payerById, providerById, visitTypeById } from './reference'
import { TEMPLATES } from './templates'
import type {
  AudioFile,
  Claim,
  ClaimDenial,
  DenialCode,
  PriorAuth,
  SubmissionMethod,
  ClaimStatusEvent,
  ClinicalNote,
  Coding,
  DemoCase,
  DenialCheck,
  Eligibility,
  Eob,
  Era,
  EraServiceLine,
  Estimate,
  Patient,
  StepId,
  TranscriptLine,
} from './types'

const DIGITS = '0123456789'
const ALNUM = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789'

export const randomFrom = (alphabet: string, length: number): string =>
  Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')

export const newId = (prefix: string): string => `${prefix}_${randomFrom(ALNUM, 10).toLowerCase()}`

export const round2 = (value: number): number => Math.round(value * 100) / 100 || 0

export const money = (value: number): string =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export const formatDate = (iso: string): string => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const formatDateTime = (iso: string): string => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
}

export const formatRelative = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export const formatDuration = (sec: number): string =>
  `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`

export const todayIso = (): string => new Date().toISOString().slice(0, 10)

export const usDob = (iso: string): string => {
  const [y, m, d] = iso.split('-')
  return y && m && d ? `${m}/${d}/${y}` : iso
}

export const ageFrom = (dobIso: string, at: Date = new Date()): number => {
  const dob = new Date(dobIso)
  let age = at.getFullYear() - dob.getFullYear()
  const beforeBirthday =
    at.getMonth() < dob.getMonth() ||
    (at.getMonth() === dob.getMonth() && at.getDate() < dob.getDate())
  if (beforeBirthday) age -= 1
  return age
}

export const fullName = (p: Pick<Patient, 'firstName' | 'lastName'>): string =>
  `${p.firstName} ${p.lastName}`

export const newMrn = (): string => `MRN-${randomFrom(DIGITS, 7)}`
export const newMemberId = (prefix: string): string =>
  `${prefix.slice(0, 3).toUpperCase()}${randomFrom(DIGITS, 9)}`

export const totalCharges = (coding: Coding): number =>
  round2(coding.procedures.reduce((sum, p) => sum + p.charge, 0))

const longDate = (iso: string): string =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

export const paRequired = (c: Pick<DemoCase, 'appointment'>): boolean => c.appointment.visitType === 'renal-exploration'

export const isDenialOpen = (c: DemoCase): boolean => c.denial !== null && c.denial.resolvedAt === null

const addDays = (iso: string, days: number): string => {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export const buildPriorAuth = (c: DemoCase, method: SubmissionMethod, at: string): PriorAuth => ({
  status: 'submitted',
  method,
  requestId: `PA-${randomFrom(DIGITS, 8)}`,
  authNumber: null,
  submittedAt: at,
  approvedAt: null,
  validFrom: c.appointment.date,
  validTo: addDays(c.appointment.date, 60),
  serviceCode: '50010',
  justification:
    'Blunt left flank trauma with CT-confirmed left perirenal hematoma, persistent flank pain and falling hematocrit. Equivocal imaging for active extravasation; open retroperitoneal exploration indicated to confirm renal vascular integrity and rule out urinary extravasation.',
})

export const approvePriorAuth = (pa: PriorAuth, at: string): PriorAuth => ({
  ...pa,
  status: 'approved',
  approvedAt: at,
  authNumber: `AUTH${randomFrom(DIGITS, 9)}`,
})

export const DENIALS: Record<DenialCode, { reason: string; remark: string; fix: string }> = {
  'CO-16': {
    reason: 'Claim lacks information or has submission/billing error(s)',
    remark: 'MA27 — Subscriber date of birth does not match payer records',
    fix: 'Correct the subscriber date of birth and submit a corrected claim (frequency code 7)',
  },
  'CO-252': {
    reason: 'An attachment/other documentation is required to adjudicate this claim',
    remark: 'M127 — Missing patient medical record for this service',
    fix: 'Upload the signed clinical note through the payer portal for reconsideration',
  },
}

export const buildDenial = (code: DenialCode, at: string): ClaimDenial => ({
  code,
  reason: DENIALS[code].reason,
  remark: DENIALS[code].remark,
  deniedAt: at,
  resolution: null,
  resolvedAt: null,
})

export const daysSince = (iso: string): number => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000))

export const buildEligibility = (patient: Patient, at: string): Eligibility => {
  const payer = payerById(patient.insurance.payerId)
  const year = new Date(at).getFullYear()
  return {
    checkedAt: at,
    status: 'Active',
    traceNumber: `TRN-${randomFrom(DIGITS, 10)}`,
    planBegin: `${year}-01-01`,
    planEnd: `${year}-12-31`,
    deductible: payer.deductible,
    deductibleMet: payer.deductibleMet,
    oopMax: payer.oopMax,
    oopMet: payer.oopMet,
    coinsurancePct: payer.coinsurancePct,
    copay: payer.erCopay,
    priorAuthRequired: false,
    benefits: [
      { label: 'Emergency room services', inNetwork: `$${payer.erCopay} copay, then ${payer.coinsurancePct}%`, outOfNetwork: `$${payer.erCopay} copay, then ${payer.coinsurancePct}%` },
      { label: 'Surgical services (facility)', inNetwork: `${payer.coinsurancePct}% after deductible`, outOfNetwork: '50% after deductible' },
      { label: 'Diagnostic lab', inNetwork: `${payer.coinsurancePct}% after deductible`, outOfNetwork: '40% after deductible' },
      { label: 'Diagnostic imaging (X-ray)', inNetwork: `${payer.coinsurancePct}% after deductible`, outOfNetwork: '40% after deductible' },
      { label: 'Injectable drugs (HCPCS J-codes)', inNetwork: 'Covered', outOfNetwork: '40% after deductible' },
    ],
  }
}

export const buildAudio = (
  c: DemoCase,
  fileName: string | null,
  sizeKb: number | null,
  at: string
): AudioFile => {
  const visit = visitTypeById(c.appointment.visitType)
  return {
    fileName: fileName ?? `${c.encounterNumber.toLowerCase()}-ambient.m4a`,
    sizeKb: sizeKb ?? Math.round(visit.durationSec * 15.6),
    durationSec: visit.durationSec,
    uploadedAt: at,
    source: fileName ? 'upload' : 'sample',
  }
}

const noteContext = (c: DemoCase, patient: Patient) => ({
  patient: { ...patient, dob: usDob(patient.dob) },
  provider: providerById(c.appointment.providerId),
  age: ageFrom(patient.dob, new Date(`${c.appointment.date}T12:00:00`)),
  dateOfService: longDate(c.appointment.date),
})

export const buildTranscript = (c: DemoCase, patient: Patient): TranscriptLine[] =>
  TEMPLATES[c.appointment.visitType].transcript(noteContext(c, patient))

export const buildNote = (c: DemoCase, patient: Patient, at: string): ClinicalNote => {
  const template = TEMPLATES[c.appointment.visitType]
  return {
    title: template.title,
    generatedAt: at,
    signedAt: null,
    sections: template.sections(noteContext(c, patient)),
  }
}

export const buildCoding = (c: DemoCase, at: string): Coding => {
  const template = TEMPLATES[c.appointment.visitType]
  return {
    codedAt: at,
    procedures: template.procedures.map((p) => ({ ...p, modifiers: [...p.modifiers] })),
    diagnoses: template.diagnoses.map((d) => ({ ...d })),
    approvedAt: null,
  }
}

export const buildEstimate = (c: DemoCase, patient: Patient, at: string): Estimate => {
  const payer = payerById(patient.insurance.payerId)
  const charges = c.coding ? totalCharges(c.coding) : 0
  const allowed = round2(charges * payer.allowedRatio)
  const isEr = c.appointment.visitType !== 'renal-exploration'
  const copay = Math.min(isEr ? payer.erCopay : payer.surgeryCopay, allowed)
  const deductibleRemaining = Math.max(0, payer.deductible - payer.deductibleMet)
  const deductibleApplied = round2(Math.min(deductibleRemaining, allowed - copay))
  const coinsurance = round2((allowed - copay - deductibleApplied) * (payer.coinsurancePct / 100))
  let patientTotal = round2(copay + deductibleApplied + coinsurance)
  if (payer.oopMax > 0) patientTotal = Math.min(patientTotal, round2(payer.oopMax - payer.oopMet))
  const scale = copay + deductibleApplied + coinsurance > 0 ? patientTotal / (copay + deductibleApplied + coinsurance) : 0
  return {
    createdAt: at,
    totalCharges: charges,
    allowedAmount: allowed,
    contractualAdjustment: round2(charges - allowed),
    deductibleApplied: round2(deductibleApplied * scale),
    coinsuranceAmount: round2(coinsurance * scale),
    copayAmount: round2(copay * scale),
    patientResponsibility: patientTotal,
    insurancePays: round2(allowed - patientTotal),
    sharedWithPatient: false,
  }
}

export const buildDenialCheck = (c: DemoCase, patient: Patient, at: string): DenialCheck => {
  const payer = payerById(patient.insurance.payerId)
  const hasMod25 = c.coding?.procedures.some((p) => p.modifiers.includes('25')) ?? false
  return {
    ranAt: at,
    riskScore: 4 + Math.floor(Math.random() * 5),
    denialPredicted: false,
    checks: [
      { label: 'Eligibility & coverage active', detail: `${payer.name} · ${payer.planName} active on date of service` },
      { label: 'Demographics match payer file', detail: 'Name, DOB and member ID match the 271 response' },
      { label: 'NCCI / PTP edits', detail: 'No procedure-to-procedure conflicts across billed lines' },
      { label: 'Medically unlikely edits (MUE)', detail: 'All units within payer MUE limits' },
      {
        label: 'Modifier validation',
        detail: hasMod25 ? 'Modifier 25 supported by separately identifiable E/M' : 'Modifiers consistent with documentation',
      },
      { label: 'Diagnosis-to-procedure linkage', detail: 'Every line points to a supporting ICD-10-CM code' },
      { label: 'Prior authorization', detail: 'Not required for this service and payer' },
      { label: 'Duplicate claim check', detail: 'No prior claim for this patient, provider and date of service' },
      { label: 'Timely filing', detail: 'Within payer filing limit (well under 90 days)' },
      { label: 'Payer-specific rules', detail: `${payer.name} edit library — 0 hits` },
    ],
  }
}

export const buildClaim = (c: DemoCase, at: string): Claim => ({
  claimId: `CLM-${randomFrom(DIGITS, 8)}`,
  payerClaimControl: null,
  createdAt: at,
  scrubbedAt: at,
  submittedAt: null,
  clearinghouse: PRACTICE.clearinghouse,
  batchId: null,
  totalCharge: c.coding ? totalCharges(c.coding) : 0,
  liveTracking: false,
  submissionMethod: 'edi',
  portalConfirmation: null,
  checkedAt: null,
  finalizedAt: null,
  revision: 0,
})

export const STATUS_SEQUENCE: Omit<ClaimStatusEvent, 'at'>[] = [
  { code: 'accepted_999', label: '999 accepted', detail: 'Clearinghouse accepted the 837P file — no syntax errors.' },
  { code: 'accepted_277ca', label: '277CA accepted by payer', detail: 'Payer acknowledged the claim and assigned a claim control number.' },
  { code: 'in_adjudication', label: 'In adjudication', detail: 'Claim is in the payer adjudication queue (status A2 / category 20).' },
  { code: 'paid', label: 'Finalized — paid', detail: 'Payer finalized the claim for payment (status F1). Remittance to follow.' },
]

export const buildEra = (c: DemoCase, at: string): Era => {
  const est = c.estimate
  const coding = c.coding
  if (!est || !coding) throw new Error('ERA requires coding and estimate')
  const ratio = est.totalCharges > 0 ? est.allowedAmount / est.totalCharges : 0
  const prParts = [
    { reason: '3', label: 'copay', amount: est.copayAmount },
    { reason: '1', label: 'deductible', amount: est.deductibleApplied },
    { reason: '2', label: 'coinsurance', amount: est.coinsuranceAmount },
  ]
  const lines: EraServiceLine[] = []
  let allowedLeft = est.allowedAmount
  const prLeft = prParts.map((p) => p.amount)
  coding.procedures.forEach((p, i) => {
    const last = i === coding.procedures.length - 1
    const allowed = last ? round2(allowedLeft) : round2(p.charge * ratio)
    allowedLeft = round2(allowedLeft - allowed)
    const share = est.allowedAmount > 0 ? allowed / est.allowedAmount : 0
    const adjustments: EraServiceLine['adjustments'] = []
    const co = round2(p.charge - allowed)
    if (co > 0) adjustments.push({ group: 'CO', reason: '45', amount: co })
    let prTotal = 0
    prParts.forEach((part, idx) => {
      const amount = last ? round2(prLeft[idx]) : round2(part.amount * share)
      prLeft[idx] = round2(prLeft[idx] - amount)
      if (amount > 0) {
        adjustments.push({ group: 'PR', reason: part.reason, amount })
        prTotal += amount
      }
    })
    lines.push({
      code: p.code,
      modifiers: p.modifiers,
      units: p.units,
      charge: p.charge,
      allowed,
      paid: round2(allowed - prTotal),
      adjustments,
    })
  })
  const paymentDate = new Date(at)
  return {
    receivedAt: at,
    checkNumber: `EFT${randomFrom(DIGITS, 9)}`,
    paymentMethod: 'ACH',
    paymentDate: paymentDate.toISOString().slice(0, 10),
    totalCharge: est.totalCharges,
    totalPaid: round2(lines.reduce((s, l) => s + l.paid, 0)),
    patientResponsibility: est.patientResponsibility,
    contractualAdjustment: est.contractualAdjustment,
    lines,
    reviewedAt: null,
  }
}

export const buildEob = (at: string): Eob => ({
  receivedAt: at,
  documentId: `EOB-${randomFrom(DIGITS, 10)}`,
  viewedAt: null,
})

export const CARC_LABELS: Record<string, string> = {
  'CO-45': 'Charge exceeds fee schedule / contracted rate',
  'PR-1': 'Deductible amount',
  'PR-2': 'Coinsurance amount',
  'PR-3': 'Co-payment amount',
}

export const isStepDone = (c: DemoCase, step: StepId): boolean => {
  switch (step) {
    case 'registration':
    case 'appointment':
      return true
    case 'eligibility':
      return c.eligibility !== null && (!paRequired(c) || c.priorAuth?.status === 'approved')
    case 'audio':
      return c.audio !== null
    case 'transcription':
      return c.transcript !== null
    case 'note':
      return c.note?.signedAt != null
    case 'coding':
      return c.coding?.approvedAt != null
    case 'estimate':
      return c.estimate !== null
    case 'denial':
      return c.denialCheck !== null
    case 'claim':
      return c.claim?.finalizedAt != null
    case 'submission':
      return c.claim?.submittedAt != null
    case 'status':
      return c.statusEvents.some((e) => e.code === 'paid') && (!c.denial || c.denial.resolvedAt !== null)
    case 'era':
      return c.era?.reviewedAt != null
    case 'eob':
      return c.eob?.viewedAt != null
    case 'reconciliation':
      return c.reconciliation?.closedAt != null
  }
}

export const currentStep = (c: DemoCase): StepId =>
  STEPS.find((s) => !isStepDone(c, s.id))?.id ?? 'reconciliation'

export const completedCount = (c: DemoCase): number =>
  STEPS.filter((s) => isStepDone(c, s.id)).length

export const isCaseClosed = (c: DemoCase): boolean => isStepDone(c, 'reconciliation')

export const stageLabel = (c: DemoCase): string => {
  if (isCaseClosed(c)) return 'Reconciled'
  const step = STEPS.find((s) => s.id === currentStep(c))
  return step ? step.short : 'In progress'
}
