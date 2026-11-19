import { DENIALS, daysSince, fullName, money, randomFrom, usDob } from './engine'
import { PRACTICE, payerById } from './reference'
import type { DemoCase, Patient } from './types'

export type ArActionId = 'corrected_claim' | 'portal_records' | 'expedite' | 'follow_up'

export interface ArAction {
  id: ArActionId
  label: string
  description: string
  primary: boolean
}

export interface ScriptLine {
  speaker: 'IVR' | 'Agent' | 'Rep' | 'System'
  text: string
  dtmf?: string
  hold?: boolean
  extract?: { label: string; value: string }[]
  pauseMs?: number
}

export interface CallScript {
  scenario: 'status' | 'CO-16' | 'CO-252'
  purpose: string
  payerPhone: string
  repName: string
  referenceNumber: string
  lines: ScriptLine[]
  outcome: string
  actions: ArAction[]
}

const REPS = ['Danielle', 'Marcus', 'Priya', 'Jordan', 'Angela', 'Tom']

export const buildCallScript = (c: DemoCase, patient: Patient): CallScript => {
  const payer = payerById(patient.insurance.payerId)
  const claim = c.claim
  const repName = REPS[c.id.length % REPS.length]
  const referenceNumber = `REF-${randomFrom('0123456789', 8)}`
  const claimId = claim?.claimId ?? 'unknown'
  const pcn = claim?.payerClaimControl ?? 'pending'
  const amount = money(claim?.totalCharge ?? 0)
  const dos = new Date(`${c.appointment.date}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const scenario: CallScript['scenario'] = c.denial && !c.denial.resolvedAt ? c.denial.code : 'status'

  const opening: ScriptLine[] = [
    { speaker: 'System', text: `Dialing ${payer.name} provider services at ${payer.phone}…`, pauseMs: 700 },
    { speaker: 'IVR', text: `Thank you for calling ${payer.name} provider services. Calls may be recorded. For eligibility, press 1. For claims, press 2.`, pauseMs: 300 },
    { speaker: 'Agent', text: 'Selecting claims.', dtmf: '2' },
    { speaker: 'IVR', text: 'Please enter or say the provider NPI.' },
    { speaker: 'Agent', text: `${PRACTICE.groupNpi.split('').join(' ')}`, dtmf: PRACTICE.groupNpi, extract: [{ label: 'Billing NPI', value: PRACTICE.groupNpi }] },
    { speaker: 'IVR', text: 'Please enter the member ID.' },
    { speaker: 'Agent', text: patient.insurance.memberId, dtmf: patient.insurance.memberId },
    { speaker: 'IVR', text: 'Please hold while we connect you with a claims representative.', hold: true, pauseMs: 1600 },
    { speaker: 'Rep', text: `Thank you for holding, this is ${repName} with ${payer.name} provider services. Who am I speaking with?`, extract: [{ label: 'Representative', value: repName }] },
    { speaker: 'Agent', text: `Hi ${repName}, this is the MedSynthea AR assistant calling on behalf of ${PRACTICE.name}, NPI ${PRACTICE.groupNpi}. I'm calling about a claim for ${fullName(patient)}, date of birth ${usDob(patient.dob)}, date of service ${dos}.` },
    { speaker: 'Rep', text: 'Thank you. Can I have the claim number or the billed amount?' },
    { speaker: 'Agent', text: `Our claim number is ${claimId}, billed amount ${amount}.` },
    { speaker: 'Rep', text: `I have it. Your payer claim number is ${pcn}.`, extract: [{ label: 'Payer claim #', value: pcn }] },
  ]

  if (scenario === 'CO-16') {
    const d = DENIALS['CO-16']
    return {
      scenario,
      purpose: 'Denial follow-up (CO-16)',
      payerPhone: payer.phone,
      repName,
      referenceNumber,
      outcome: `Denied CO-16 because the subscriber date of birth on the claim does not match the payer file. Payer will accept a corrected claim (frequency code 7) within 90 days.`,
      lines: [
        ...opening,
        { speaker: 'Agent', text: 'We received a CO-16 denial. Can you tell me exactly what information is missing?' },
        { speaker: 'Rep', text: `Sure. It denied with remark MA27. The subscriber date of birth on the claim doesn't match what we have on file. Our file shows ${usDob(patient.dob)}.`, extract: [{ label: 'Claim status', value: 'Denied — CO-16' }, { label: 'Denial reason', value: d.remark }] },
        { speaker: 'Agent', text: `Understood. We'll correct the date of birth to ${usDob(patient.dob)}. Can we send a corrected claim electronically, or does it need a reconsideration form?` },
        { speaker: 'Rep', text: 'A corrected claim with frequency code 7 and the original claim number is fine. Timely filing for corrections is 90 days from the denial.', extract: [{ label: 'Next step', value: 'Corrected claim, freq. code 7' }, { label: 'Deadline', value: '90 days from denial' }] },
        { speaker: 'Agent', text: 'Perfect. May I have a call reference number?' },
        { speaker: 'Rep', text: `Your reference number is ${referenceNumber}.`, extract: [{ label: 'Reference #', value: referenceNumber }] },
        { speaker: 'Agent', text: `Thank you ${repName}, that's everything. Have a great day.` },
        { speaker: 'System', text: 'Call ended.' },
      ],
      actions: [
        { id: 'corrected_claim', label: 'Submit corrected claim', description: 'Fix subscriber DOB and resend the 837P with frequency code 7', primary: true },
        { id: 'follow_up', label: 'Schedule follow-up call', description: 'Re-check status in 7 days', primary: false },
      ],
    }
  }

  if (scenario === 'CO-252') {
    const d = DENIALS['CO-252']
    return {
      scenario,
      purpose: 'Denial follow-up (CO-252)',
      payerPhone: payer.phone,
      repName,
      referenceNumber,
      outcome: 'Denied CO-252 — the payer needs the medical record. Upload the signed clinical note through the provider portal; no new claim is needed.',
      lines: [
        ...opening,
        { speaker: 'Agent', text: 'We see a CO-252 denial on this claim. What documentation do you need?' },
        { speaker: 'Rep', text: `It's remark M127 — we need the medical record for date of service ${dos}. The operative report or clinical note will do.`, extract: [{ label: 'Claim status', value: 'Denied — CO-252' }, { label: 'Denial reason', value: d.remark }] },
        { speaker: 'Agent', text: 'Can we upload it through the provider portal instead of faxing?' },
        { speaker: 'Rep', text: 'Yes, upload it in the portal under claim attachments and reference the payer claim number. Review takes about five business days.', extract: [{ label: 'Next step', value: 'Upload records via portal' }, { label: 'Turnaround', value: '~5 business days' }] },
        { speaker: 'Agent', text: 'Great. Could I get a reference number for this call?' },
        { speaker: 'Rep', text: `Of course, it's ${referenceNumber}.`, extract: [{ label: 'Reference #', value: referenceNumber }] },
        { speaker: 'Agent', text: `Thanks ${repName}. Goodbye.` },
        { speaker: 'System', text: 'Call ended.' },
      ],
      actions: [
        { id: 'portal_records', label: 'Upload records via payer portal', description: 'Web submission bot attaches the signed clinical note', primary: true },
        { id: 'follow_up', label: 'Schedule follow-up call', description: 'Re-check status in 5 business days', primary: false },
      ],
    }
  }

  const age = claim?.submittedAt ? daysSince(claim.submittedAt) : 0
  return {
    scenario,
    purpose: 'Claim status follow-up',
    payerPhone: payer.phone,
    repName,
    referenceNumber,
    outcome: `Claim is in process (${age} days since submission) with no missing information. The representative escalated it for expedited processing.`,
    lines: [
      ...opening,
      { speaker: 'Agent', text: `The claim has been pending for ${age} days. Can you tell me the current status?` },
      { speaker: 'Rep', text: "It's in process. Nothing is pended for information, it's just in the adjudication queue.", extract: [{ label: 'Claim status', value: 'In process — no info needed' }] },
      { speaker: 'Agent', text: 'Since it is past your standard turnaround, can it be escalated for processing?' },
      { speaker: 'Rep', text: "I can send it to the expedite queue. It should finalize within 48 hours and pay on the next check run.", extract: [{ label: 'Next step', value: 'Expedite requested' }, { label: 'Expected payment', value: 'Within 48 hours' }] },
      { speaker: 'Agent', text: 'Please do. May I have a reference number?' },
      { speaker: 'Rep', text: `Sure, reference ${referenceNumber}.`, extract: [{ label: 'Reference #', value: referenceNumber }] },
      { speaker: 'Agent', text: `Thank you ${repName}, have a good day.` },
      { speaker: 'System', text: 'Call ended.' },
    ],
    actions: [
      { id: 'expedite', label: 'Confirm expedite & track payment', description: 'Log the escalation and resume live status tracking', primary: true },
      { id: 'follow_up', label: 'Schedule follow-up call', description: 'Re-check status in 48 hours', primary: false },
    ],
  }
}
