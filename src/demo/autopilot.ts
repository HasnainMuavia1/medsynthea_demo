import { STATUS_SEQUENCE, isDenialOpen, paRequired } from './engine'
import { useDemoStore } from './store'
import type { DemoCase, StepId } from './types'

export interface AutopilotAction {
  step: StepId
  label: string
  run: () => void
}

/**
 * - `workflow`: every step the practice controls, ending with claim submission.
 * - `payer`: the three steps that in real life wait on the clearinghouse and payer
 *   (claim status, ERA, EOB). Run only on request, as a hypothetical walkthrough.
 */
export type AutopilotMode = 'workflow' | 'payer'

/** Remaining payer steps this demo can simulate after submission. */
export const PAYER_STEPS: StepId[] = ['status', 'era', 'eob']

/** Claim is submitted and still waiting on the clearinghouse / payer (no EOB yet, no open denial). */
export const isAwaitingPayer = (c: DemoCase): boolean => Boolean(c.claim?.submittedAt) && !c.eob && !isDenialOpen(c)

const action = (step: StepId, label: string, run: () => void): AutopilotAction => ({ step, label, run })

const workflowAction = (c: DemoCase): AutopilotAction | null => {
  const s = useDemoStore.getState()
  const id = c.id
  if (!c.eligibility) return action('eligibility', 'Verifying eligibility', () => s.runEligibility(id))
  if (paRequired(c) && !c.priorAuth) return action('eligibility', 'Submitting prior authorization', () => s.submitPriorAuth(id, 'portal'))
  if (paRequired(c) && c.priorAuth?.status !== 'approved') return action('eligibility', 'Awaiting prior auth approval', () => s.approvePriorAuthFor(id))
  if (!c.audio) return action('audio', 'Uploading encounter audio', () => s.uploadAudio(id, null, null))
  if (!c.transcript) return action('transcription', 'Transcribing', () => s.transcribe(id))
  if (!c.note) return action('note', 'Generating clinical note', () => s.generateNote(id))
  if (!c.note.signedAt) return action('note', 'Signing note', () => s.signNote(id))
  if (!c.coding) return action('coding', 'Coding encounter', () => s.runCoding(id))
  if (!c.coding.approvedAt) return action('coding', 'Approving codes', () => s.approveCoding(id))
  if (!c.estimate) return action('estimate', 'Calculating patient estimate', () => s.createEstimate(id))
  if (!c.estimate.sharedWithPatient) return action('estimate', 'Sending estimate to patient', () => s.shareEstimate(id))
  if (!c.denialCheck) return action('denial', 'Running denial prevention', () => s.runDenialCheck(id))
  if (!c.claim) return action('claim', 'Creating claim draft', () => s.createClaim(id))
  if (!c.claim.finalizedAt) return action('claim', 'Checking claim & marking ready', () => s.finalizeClaim(id))
  if (!c.claim.submittedAt) return action('submission', 'Submitting claim', () => s.submitClaim(id, 'edi', null))
  // Stop here: ERA / EOB only arrive after clearinghouse and payer confirmation.
  return null
}

const payerAction = (c: DemoCase): AutopilotAction | null => {
  const s = useDemoStore.getState()
  const id = c.id
  if (!c.claim?.submittedAt || isDenialOpen(c)) return null
  if (c.statusEvents.length < STATUS_SEQUENCE.length) return action('status', 'Receiving claim status', () => s.advanceStatus(id))
  if (!c.era) return action('era', 'Receiving ERA (835)', () => s.advanceStatus(id))
  if (!c.era.reviewedAt) return action('era', 'Reviewing ERA', () => s.reviewEra(id))
  if (!c.eob) return action('eob', 'Receiving EOB', () => s.advanceStatus(id))
  if (!c.eob.viewedAt) return action('eob', 'Reviewing EOB', () => s.viewEob(id))
  return null
}

export const nextAutopilotAction = (caseId: string, mode: AutopilotMode): AutopilotAction | null => {
  const c = useDemoStore.getState().cases.find((x) => x.id === caseId)
  if (!c) return null
  return mode === 'workflow' ? workflowAction(c) : payerAction(c)
}
