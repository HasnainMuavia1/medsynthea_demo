export type StepId =
  | 'registration'
  | 'appointment'
  | 'eligibility'
  | 'audio'
  | 'transcription'
  | 'note'
  | 'coding'
  | 'estimate'
  | 'denial'
  | 'claim'
  | 'submission'
  | 'status'
  | 'era'
  | 'eob'
  | 'reconciliation'

export type Sex = 'Male' | 'Female'

export type TemplateId =
  | 'clinic-rlq-pain'
  | 'renal-exploration'
  | 'er-viral-syndrome'
  | 'er-chest-pain'

export interface InsurancePlan {
  payerId: string
  payerName: string
  planName: string
  memberId: string
  groupNumber: string
  subscriberRelation: 'Self' | 'Spouse' | 'Child'
}

export interface Patient {
  id: string
  mrn: string
  firstName: string
  lastName: string
  dob: string
  sex: Sex
  phone: string
  email: string
  address: string
  city: string
  state: string
  zip: string
  insurance: InsurancePlan
  createdAt: string
}

export interface Provider {
  id: string
  name: string
  credentials: string
  specialty: string
  npi: string
}

export interface Appointment {
  date: string
  time: string
  visitType: TemplateId
  providerId: string
  location: string
  reason: string
}

export interface BenefitLine {
  label: string
  inNetwork: string
  outOfNetwork: string
}

export interface Eligibility {
  checkedAt: string
  status: 'Active'
  traceNumber: string
  planBegin: string
  planEnd: string
  deductible: number
  deductibleMet: number
  oopMax: number
  oopMet: number
  coinsurancePct: number
  copay: number
  priorAuthRequired: boolean
  benefits: BenefitLine[]
}

export interface AudioFile {
  fileName: string
  sizeKb: number
  durationSec: number
  uploadedAt: string
  source: 'upload' | 'sample'
}

export interface TranscriptLine {
  speaker: 'Provider' | 'Patient' | 'Nurse'
  at: string
  text: string
}

export interface NoteSection {
  heading: string
  lines: string[]
}

export interface ClinicalNote {
  title: string
  generatedAt: string
  signedAt: string | null
  sections: NoteSection[]
}

export interface ProcedureLine {
  code: string
  kind: 'CPT' | 'HCPCS'
  description: string
  modifiers: string[]
  units: number
  charge: number
  dxPointers: number[]
  confidence: number
}

export interface DiagnosisLine {
  code: string
  description: string
  confidence: number
}

export interface Coding {
  codedAt: string
  /** Set when the codes were read from an uploaded clinical note instead of the signed note. */
  sourceNote?: { fileName: string; uploadedAt: string } | null
  procedures: ProcedureLine[]
  diagnoses: DiagnosisLine[]
  approvedAt: string | null
}

export interface Estimate {
  createdAt: string
  totalCharges: number
  allowedAmount: number
  contractualAdjustment: number
  deductibleApplied: number
  coinsuranceAmount: number
  copayAmount: number
  patientResponsibility: number
  insurancePays: number
  sharedWithPatient: boolean
}

export interface DenialCheckItem {
  label: string
  detail: string
}

export interface DenialCheck {
  ranAt: string
  riskScore: number
  denialPredicted: false
  checks: DenialCheckItem[]
}

export type SubmissionMethod = 'edi' | 'portal'

export interface PriorAuth {
  status: 'draft' | 'submitted' | 'approved'
  method: SubmissionMethod
  requestId: string
  authNumber: string | null
  submittedAt: string | null
  approvedAt: string | null
  validFrom: string
  validTo: string
  serviceCode: string
  justification: string
}

export type DenialCode = 'CO-16' | 'CO-252'

export interface ClaimDenial {
  code: DenialCode
  reason: string
  remark: string
  deniedAt: string
  resolution: string | null
  resolvedAt: string | null
}

export interface ArCallLine {
  speaker: 'IVR' | 'Agent' | 'Rep' | 'System'
  text: string
}

export interface ArCall {
  id: string
  startedAt: string
  durationSec: number
  payerPhone: string
  repName: string
  referenceNumber: string
  outcome: string
  actionTaken: string | null
  transcript: ArCallLine[]
}

export interface Claim {
  claimId: string
  payerClaimControl: string | null
  createdAt: string
  scrubbedAt: string
  submittedAt: string | null
  clearinghouse: string
  batchId: string | null
  totalCharge: number
  liveTracking: boolean
  submissionMethod: SubmissionMethod
  portalConfirmation: string | null
  checkedAt: string | null
  finalizedAt: string | null
  revision: number
}

export type ClaimStatusCode = 'accepted_999' | 'accepted_277ca' | 'in_adjudication' | 'paid'

export interface ClaimStatusEvent {
  code: ClaimStatusCode
  label: string
  detail: string
  at: string
}

export interface EraServiceLine {
  code: string
  modifiers: string[]
  units: number
  charge: number
  allowed: number
  paid: number
  adjustments: { group: 'CO' | 'PR'; reason: string; amount: number }[]
}

export interface Era {
  receivedAt: string
  checkNumber: string
  paymentMethod: 'ACH'
  paymentDate: string
  totalCharge: number
  totalPaid: number
  patientResponsibility: number
  contractualAdjustment: number
  lines: EraServiceLine[]
  reviewedAt: string | null
}

export interface Eob {
  receivedAt: string
  documentId: string
  viewedAt: string | null
}

export interface Reconciliation {
  postedAt: string | null
  patientPaidAt: string | null
  patientPaymentMethod: string | null
  depositMatchedAt: string | null
  closedAt: string | null
}

export interface DemoCase {
  id: string
  encounterNumber: string
  patientId: string
  appointment: Appointment
  createdAt: string
  eligibility: Eligibility | null
  audio: AudioFile | null
  transcript: TranscriptLine[] | null
  note: ClinicalNote | null
  coding: Coding | null
  estimate: Estimate | null
  denialCheck: DenialCheck | null
  claim: Claim | null
  statusEvents: ClaimStatusEvent[]
  era: Era | null
  eob: Eob | null
  reconciliation: Reconciliation | null
  priorAuth: PriorAuth | null
  denial: ClaimDenial | null
  arCalls: ArCall[]
}

export type NotificationKind =
  | 'eligibility'
  | 'note'
  | 'coding'
  | 'claim'
  | 'status'
  | 'era'
  | 'eob'
  | 'payment'
  | 'patient'
  | 'priorauth'
  | 'denial'
  | 'ar'

export interface DemoNotification {
  id: string
  kind: NotificationKind
  title: string
  message: string
  at: string
  read: boolean
  caseId: string | null
  step: StepId | null
}

export interface PatientDraft {
  firstName: string
  lastName: string
  dob: string
  sex: Sex
  phone: string
  email: string
  address: string
  city: string
  state: string
  zip: string
  payerId: string
  memberId: string
  groupNumber: string
  subscriberRelation: InsurancePlan['subscriberRelation']
}

export interface AppointmentDraft {
  patientId: string
  date: string
  time: string
  visitType: TemplateId
  providerId: string
  reason: string
}
