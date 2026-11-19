import {
  STATUS_SEQUENCE,
  approvePriorAuth,
  buildDenial,
  buildPriorAuth,
  paRequired,
  buildAudio,
  buildClaim,
  buildCoding,
  buildDenialCheck,
  buildEligibility,
  buildEob,
  buildEra,
  buildEstimate,
  buildNote,
  buildTranscript,
  fullName,
  money,
  newMemberId,
  randomFrom,
} from './engine'
import { payerById, visitTypeById } from './reference'
import type { DemoCase, DemoNotification, Patient, StepId, TemplateId } from './types'

const DAY = 86400000

const isoAgo = (days: number, minutes = 0): string =>
  new Date(Date.now() - days * DAY + minutes * 60000).toISOString()

const dateAgo = (days: number): string => isoAgo(days).slice(0, 10)

interface SeedPatient {
  firstName: string
  lastName: string
  dob: string
  sex: Patient['sex']
  payerId: string
  city: string
  street: string
  zip: string
  createdDaysAgo: number
}

const SEED_PATIENTS: SeedPatient[] = [
  { firstName: 'Maria', lastName: 'Gonzalez', dob: '1987-03-14', sex: 'Female', payerId: 'aetna', city: 'Austin', street: '1804 Barton Springs Rd', zip: '78704', createdDaysAgo: 12 },
  { firstName: 'James', lastName: 'Carter', dob: '1971-07-22', sex: 'Male', payerId: 'bcbstx', city: 'Round Rock', street: '552 Sunrise Rd', zip: '78664', createdDaysAgo: 9 },
  { firstName: 'Aisha', lastName: 'Rahman', dob: '1993-11-02', sex: 'Female', payerId: 'uhc', city: 'Pflugerville', street: '219 Pecan St', zip: '78660', createdDaysAgo: 6 },
  { firstName: 'Robert', lastName: 'Nguyen', dob: '1958-01-30', sex: 'Male', payerId: 'medicare', city: 'Austin', street: '7710 Burnet Rd', zip: '78757', createdDaysAgo: 3 },
  { firstName: 'Emily', lastName: 'Thompson', dob: '2001-06-18', sex: 'Female', payerId: 'cigna', city: 'Cedar Park', street: '1450 Whitestone Blvd', zip: '78613', createdDaysAgo: 1 },
  { firstName: 'David', lastName: 'Kim', dob: '1980-09-09', sex: 'Male', payerId: 'aetna', city: 'Austin', street: '3300 Guadalupe St', zip: '78705', createdDaysAgo: 0 },
  { firstName: 'Kevin', lastName: 'Brooks', dob: '1969-02-11', sex: 'Male', payerId: 'uhc', city: 'Georgetown', street: '88 Williams Dr', zip: '78628', createdDaysAgo: 30 },
  { firstName: 'Sarah', lastName: 'Lin', dob: '1984-08-27', sex: 'Female', payerId: 'bcbstx', city: 'Austin', street: '5100 Airport Blvd', zip: '78751', createdDaysAgo: 26 },
  { firstName: 'Rizwan', lastName: 'Khan', dob: '1990-04-12', sex: 'Male', payerId: 'bcbstx', city: 'Austin', street: '2601 S Lamar Blvd', zip: '78704', createdDaysAgo: 0 },
]

const toPatient = (s: SeedPatient, i: number): Patient => {
  const payer = payerById(s.payerId)
  return {
    id: `pat_seed${i + 1}`,
    mrn: `MRN-${String(4410230 + i * 117).padStart(7, '0')}`,
    firstName: s.firstName,
    lastName: s.lastName,
    dob: s.dob,
    sex: s.sex,
    phone: `(512) 555-0${String(110 + i * 7)}`,
    email: `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}@example.com`,
    address: s.street,
    city: s.city,
    state: 'TX',
    zip: s.zip,
    insurance: {
      payerId: payer.id,
      payerName: payer.name,
      planName: payer.planName,
      memberId: newMemberId(payer.id),
      groupNumber: `GRP-${randomFrom('0123456789', 6)}`,
      subscriberRelation: 'Self',
    },
    createdAt: isoAgo(s.createdDaysAgo),
  }
}

const emptyCase = (
  id: string,
  patient: Patient,
  visitType: TemplateId,
  daysAgo: number,
  time: string
): DemoCase => {
  const visit = visitTypeById(visitType)
  return {
    id,
    encounterNumber: `ENC-${randomFrom('0123456789', 6)}`,
    patientId: patient.id,
    appointment: {
      date: dateAgo(daysAgo),
      time,
      visitType,
      providerId: visit.defaultProviderId,
      location: visit.location,
      reason: visit.defaultReason,
    },
    createdAt: isoAgo(daysAgo + 1),
    eligibility: null,
    audio: null,
    transcript: null,
    note: null,
    coding: null,
    estimate: null,
    denialCheck: null,
    claim: null,
    statusEvents: [],
    era: null,
    eob: null,
    reconciliation: null,
    priorAuth: null,
    denial: null,
    arCalls: [],
  }
}

const ORDER: StepId[] = [
  'eligibility',
  'audio',
  'transcription',
  'note',
  'coding',
  'estimate',
  'denial',
  'claim',
  'submission',
  'status',
  'era',
  'eob',
  'reconciliation',
]

const advanceTo = (c: DemoCase, patient: Patient, through: StepId, daysAgo: number): DemoCase => {
  let next = { ...c }
  const at = (m: number) => isoAgo(daysAgo, m)
  for (const step of ORDER) {
    switch (step) {
      case 'eligibility':
        next.eligibility = { ...buildEligibility(patient, at(-60)), priorAuthRequired: paRequired(next) }
        if (paRequired(next)) next.priorAuth = approvePriorAuth(buildPriorAuth(next, 'portal', isoAgo(daysAgo + 3)), isoAgo(daysAgo + 2))
        break
      case 'audio':
        next.audio = buildAudio(next, null, null, at(30))
        break
      case 'transcription':
        next.transcript = buildTranscript(next, patient)
        break
      case 'note':
        next.note = { ...buildNote(next, patient, at(45)), signedAt: at(70) }
        break
      case 'coding':
        next.coding = { ...buildCoding(next, at(90)), approvedAt: at(110) }
        break
      case 'estimate':
        next.estimate = { ...buildEstimate(next, patient, at(120)), sharedWithPatient: true }
        break
      case 'denial':
        next.denialCheck = buildDenialCheck(next, patient, at(125))
        break
      case 'claim':
        next.claim = { ...buildClaim(next, at(130)), checkedAt: at(131), finalizedAt: at(132), revision: 1 }
        break
      case 'submission':
        next.claim = next.claim && {
          ...next.claim,
          submittedAt: at(135),
          batchId: `BATCH-${randomFrom('0123456789', 6)}`,
        }
        break
      case 'status':
        next.statusEvents = STATUS_SEQUENCE.map((e, i) => ({ ...e, at: isoAgo(daysAgo - 1 - i) }))
        next.claim = next.claim && { ...next.claim, payerClaimControl: `PCN${randomFrom('0123456789', 11)}` }
        break
      case 'era':
        next.era = { ...buildEra(next, isoAgo(daysAgo - 5)), reviewedAt: isoAgo(daysAgo - 5, 30) }
        next.eob = buildEob(isoAgo(daysAgo - 5, 5))
        break
      case 'eob':
        next.eob = next.eob && { ...next.eob, viewedAt: isoAgo(daysAgo - 5, 40) }
        break
      case 'reconciliation':
        next.reconciliation = {
          postedAt: isoAgo(daysAgo - 5, 60),
          patientPaidAt: isoAgo(daysAgo - 6),
          patientPaymentMethod: 'Visa •••• 4242',
          depositMatchedAt: isoAgo(daysAgo - 6, 30),
          closedAt: isoAgo(daysAgo - 6, 35),
        }
        break
    }
    if (step === through) break
  }
  next = { ...next }
  return next
}

export interface SeedState {
  patients: Patient[]
  cases: DemoCase[]
  notifications: DemoNotification[]
}

export const buildSeed = (): SeedState => {
  const patients = SEED_PATIENTS.map(toPatient)
  const [maria, james, aisha, robert, emily, , kevin, sarah, rizwan] = patients

  const c1 = advanceTo(emptyCase('case_seed1', maria, 'er-viral-syndrome', 10, '13:50'), maria, 'reconciliation', 10)
  const c2Base = advanceTo(emptyCase('case_seed2', james, 'er-chest-pain', 7, '18:10'), james, 'status', 7)
  const c2: DemoCase = {
    ...c2Base,
    era: buildEra(c2Base, isoAgo(0, -95)),
    eob: buildEob(isoAgo(0, -90)),
  }
  const c3Base = advanceTo(emptyCase('case_seed3', aisha, 'er-viral-syndrome', 4, '10:20'), aisha, 'submission', 4)
  const c3: DemoCase = {
    ...c3Base,
    statusEvents: STATUS_SEQUENCE.slice(0, 2).map((e, i) => ({ ...e, at: isoAgo(3 - i) })),
    claim: c3Base.claim && { ...c3Base.claim, payerClaimControl: `PCN${randomFrom('0123456789', 11)}` },
  }
  const c4Base = advanceTo(emptyCase('case_seed4', robert, 'renal-exploration', 2, '07:30'), robert, 'note', 2)
  const c4: DemoCase = { ...c4Base, coding: buildCoding(c4Base, isoAgo(1)) }
  const c5 = emptyCase('case_seed5', emily, 'er-chest-pain', 0, '16:40')
  // Office visit with Dr. Tom Advert, booked and waiting at the first step (eligibility).
  const c8 = emptyCase('case_rizwan', rizwan, 'clinic-rlq-pain', 0, '11:30')
  const denied = (id: string, p: Patient, visit: TemplateId, daysAgo: number, time: string, code: 'CO-16' | 'CO-252'): DemoCase => {
    const base = advanceTo(emptyCase(id, p, visit, daysAgo, time), p, 'submission', daysAgo)
    return {
      ...base,
      statusEvents: STATUS_SEQUENCE.slice(0, 2).map((e, i) => ({ ...e, at: isoAgo(daysAgo - 1 - i) })),
      claim: base.claim && { ...base.claim, payerClaimControl: `PCN${randomFrom('0123456789', 11)}` },
      denial: buildDenial(code, isoAgo(daysAgo - 9)),
    }
  }
  const c6 = denied('case_seed6', kevin, 'er-chest-pain', 24, '21:15', 'CO-16')
  const c7 = denied('case_seed7', sarah, 'renal-exploration', 21, '09:00', 'CO-252')

  const n = (
    id: string,
    kind: DemoNotification['kind'],
    title: string,
    message: string,
    at: string,
    caseId: string | null,
    step: StepId | null,
    read: boolean
  ): DemoNotification => ({ id, kind, title, message, at, caseId, step, read })

  const notifications: DemoNotification[] = [
    n('ntf_s1', 'eob', 'EOB available', `${payerById(james.insurance.payerId).name} EOB for ${fullName(james)} is ready to view.`, isoAgo(0, -90), 'case_seed2', 'eob', false),
    n('ntf_s2', 'era', 'ERA received (835)', `${money(c2.era?.totalPaid ?? 0)} remittance received for ${fullName(james)} — claim ${c2.claim?.claimId}.`, isoAgo(0, -95), 'case_seed2', 'era', false),
    n('ntf_s3', 'status', 'Claim accepted by payer (277CA)', `${fullName(aisha)} · ${c3.claim?.claimId} acknowledged by ${aisha.insurance.payerName}.`, isoAgo(2), 'case_seed3', 'status', true),
    n('ntf_s4', 'coding', 'Coding ready for review', `${fullName(robert)} · ${c4.coding?.procedures.length} procedure lines suggested by the Coding Agent.`, isoAgo(1), 'case_seed4', 'coding', true),
    n('ntf_s5', 'payment', 'Account reconciled', `${fullName(maria)} — balance $0.00, deposit matched to ERA.`, isoAgo(4), 'case_seed1', 'reconciliation', true),
  ]

  notifications.push(
    n('ntf_s6', 'denial', 'Claim denied (CO-16)', `${fullName(kevin)} · ${c6.claim?.claimId} — subscriber DOB mismatch. AR caller recommended.`, isoAgo(15), 'case_seed6', 'status', true),
    n('ntf_s7', 'denial', 'Claim denied (CO-252)', `${fullName(sarah)} · ${c7.claim?.claimId} — medical records requested. AR caller recommended.`, isoAgo(12), 'case_seed7', 'status', true)
  )
  return { patients, cases: [c8, c5, c4, c3, c2, c7, c6, c1], notifications }
}
