import { paRequired } from './engine'
import { useDemoStore } from './store'
import type { DemoCase, StepId } from './types'

export interface AutopilotAction {
  step: StepId
  label: string
  run: () => void
}

export const nextAutopilotAction = (caseId: string): AutopilotAction | null => {
  const s = useDemoStore.getState()
  const c: DemoCase | undefined = s.cases.find((x) => x.id === caseId)
  if (!c) return null
  const a = (step: StepId, label: string, run: () => void): AutopilotAction => ({ step, label, run })
  if (!c.eligibility) return a('eligibility', 'Verifying eligibility', () => s.runEligibility(caseId))
  if (paRequired(c) && !c.priorAuth) return a('eligibility', 'Submitting prior authorization', () => s.submitPriorAuth(caseId, 'portal'))
  if (paRequired(c) && c.priorAuth?.status !== 'approved') return a('eligibility', 'Awaiting prior auth approval', () => s.approvePriorAuthFor(caseId))
  if (!c.audio) return a('audio', 'Uploading encounter audio', () => s.uploadAudio(caseId, null, null))
  if (!c.transcript) return a('transcription', 'Transcribing', () => s.transcribe(caseId))
  if (!c.note) return a('note', 'Generating clinical note', () => s.generateNote(caseId))
  if (!c.note.signedAt) return a('note', 'Signing note', () => s.signNote(caseId))
  if (!c.coding) return a('coding', 'Coding encounter', () => s.runCoding(caseId))
  if (!c.coding.approvedAt) return a('coding', 'Approving codes', () => s.approveCoding(caseId))
  if (!c.estimate) return a('estimate', 'Calculating patient estimate', () => s.createEstimate(caseId))
  if (!c.estimate.sharedWithPatient) return a('estimate', 'Sending estimate to patient', () => s.shareEstimate(caseId))
  if (!c.denialCheck) return a('denial', 'Running denial prevention', () => s.runDenialCheck(caseId))
  if (!c.claim) return a('claim', 'Creating claim draft', () => s.createClaim(caseId))
  if (!c.claim.finalizedAt) return a('claim', 'Checking claim & marking ready', () => s.finalizeClaim(caseId))
  if (!c.claim.submittedAt) return a('submission', 'Submitting claim', () => s.submitClaim(caseId, 'edi', null))
  if (c.denial && !c.denial.resolvedAt) return null
  if (c.statusEvents.length < 4) return a('status', 'Checking claim status', () => s.advanceStatus(caseId))
  if (!c.era) return a('era', 'Receiving ERA', () => s.advanceStatus(caseId))
  if (!c.era.reviewedAt) return a('era', 'Reviewing ERA', () => s.reviewEra(caseId))
  if (!c.eob) return a('eob', 'Receiving EOB', () => s.advanceStatus(caseId))
  if (!c.eob.viewedAt) return a('eob', 'Reviewing EOB', () => s.viewEob(caseId))
  if (!c.reconciliation) return a('reconciliation', 'Posting insurance payment', () => s.postPayment(caseId))
  if (!c.reconciliation.patientPaidAt) return a('reconciliation', 'Collecting patient payment', () => s.collectPatientPayment(caseId, 'Visa •••• 4242 (card on file)'))
  if (!c.reconciliation.depositMatchedAt) return a('reconciliation', 'Matching bank deposit', () => s.matchDeposit(caseId))
  if (!c.reconciliation.closedAt) return a('reconciliation', 'Closing account', () => s.closeAccount(caseId))
  return null
}
