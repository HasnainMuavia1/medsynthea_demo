'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  STATUS_SEQUENCE,
  approvePriorAuth,
  buildPriorAuth,
  isDenialOpen,
  paRequired,
  buildAudio,
  buildClaim,
  buildCoding,
  buildCodingFromNote,
  buildDenialCheck,
  buildEligibility,
  buildEob,
  buildEra,
  buildEstimate,
  buildNote,
  buildTranscript,
  fullName,
  money,
  newId,
  newMemberId,
  newMrn,
  randomFrom,
} from './engine'
import { DEMO_ACCOUNT, payerById, visitTypeById } from './reference'
import { buildSeed } from './seed'
import type {
  ArCall,
  SubmissionMethod,
  AppointmentDraft,
  DemoCase,
  DemoNotification,
  NotificationKind,
  Patient,
  PatientDraft,
  StepId,
} from './types'

interface ToastItem {
  id: string
  title: string
  message: string
  caseId: string | null
  step: StepId | null
}

interface DemoState {
  authed: boolean
  patients: Patient[]
  cases: DemoCase[]
  notifications: DemoNotification[]
  toasts: ToastItem[]
  login: (email: string, password: string) => boolean
  logout: () => void
  resetDemo: () => void
  registerPatient: (draft: PatientDraft) => Patient
  createAppointment: (draft: AppointmentDraft) => DemoCase
  runEligibility: (caseId: string) => void
  uploadAudio: (caseId: string, fileName: string | null, sizeKb: number | null) => void
  transcribe: (caseId: string) => void
  generateNote: (caseId: string) => void
  signNote: (caseId: string) => void
  runCoding: (caseId: string) => void
  codeFromNote: (caseId: string, fileName: string) => void
  approveCoding: (caseId: string) => void
  setProcedureUnits: (caseId: string, index: number, units: number) => void
  removeProcedure: (caseId: string, index: number) => void
  createEstimate: (caseId: string) => void
  shareEstimate: (caseId: string) => void
  runDenialCheck: (caseId: string) => void
  createClaim: (caseId: string) => void
  checkClaim: (caseId: string) => void
  finalizeClaim: (caseId: string) => void
  submitClaim: (caseId: string, method: SubmissionMethod, confirmation: string | null) => void
  submitPriorAuth: (caseId: string, method: SubmissionMethod) => void
  approvePriorAuthFor: (caseId: string) => void
  logArCall: (caseId: string, call: ArCall) => void
  resolveDenial: (caseId: string, resolution: string) => void
  expediteClaim: (caseId: string) => void
  scheduleFollowUp: (caseId: string, when: string) => void
  advanceStatus: (caseId: string) => void
  reviewEra: (caseId: string) => void
  viewEob: (caseId: string) => void
  postPayment: (caseId: string) => void
  collectPatientPayment: (caseId: string, method: string) => void
  matchDeposit: (caseId: string) => void
  closeAccount: (caseId: string) => void
  markRead: (id: string) => void
  markAllRead: () => void
  toggleRead: (id: string) => void
  removeNotification: (id: string) => void
  dismissToast: (id: string) => void
}

const now = () => new Date().toISOString()

const STORAGE_KEY = 'medsynthea-demo-state-v4'

const SERVER_STORAGE: Storage = {
  length: 0,
  clear: () => {},
  getItem: () => null,
  key: () => null,
  removeItem: () => {},
  setItem: () => {},
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => {
      const patientOf = (c: DemoCase): Patient => {
        const p = get().patients.find((x) => x.id === c.patientId)
        if (!p) throw new Error(`Patient ${c.patientId} missing`)
        return p
      }

      const caseOf = (caseId: string): DemoCase => {
        const c = get().cases.find((x) => x.id === caseId)
        if (!c) throw new Error(`Case ${caseId} missing`)
        return c
      }

      const patch = (caseId: string, fn: (c: DemoCase, p: Patient) => Partial<DemoCase>) => {
        const c = caseOf(caseId)
        const changes = fn(c, patientOf(c))
        set((s) => ({ cases: s.cases.map((x) => (x.id === caseId ? { ...x, ...changes } : x)) }))
      }

      const notify = (
        kind: NotificationKind,
        title: string,
        message: string,
        caseId: string | null,
        step: StepId | null
      ) => {
        const id = newId('ntf')
        const item: DemoNotification = { id, kind, title, message, at: now(), read: false, caseId, step }
        set((s) => ({
          notifications: [item, ...s.notifications],
          toasts: [...s.toasts, { id, title, message, caseId, step }].slice(-3),
        }))
      }

      return {
        authed: false,
        ...buildSeed(),
        toasts: [],

        login: (email, password) => {
          const ok =
            email.trim().toLowerCase() === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password
          if (ok) set({ authed: true })
          return ok
        },

        logout: () => set({ authed: false, toasts: [] }),

        resetDemo: () => set({ ...buildSeed(), toasts: [] }),

        registerPatient: (draft) => {
          const payer = payerById(draft.payerId)
          const patient: Patient = {
            id: newId('pat'),
            mrn: newMrn(),
            firstName: draft.firstName.trim(),
            lastName: draft.lastName.trim(),
            dob: draft.dob,
            sex: draft.sex,
            phone: draft.phone,
            email: draft.email,
            address: draft.address,
            city: draft.city,
            state: draft.state,
            zip: draft.zip,
            insurance: {
              payerId: payer.id,
              payerName: payer.name,
              planName: payer.planName,
              memberId: draft.memberId.trim() || newMemberId(payer.id),
              groupNumber: draft.groupNumber.trim() || `GRP-${randomFrom('0123456789', 6)}`,
              subscriberRelation: draft.subscriberRelation,
            },
            createdAt: now(),
          }
          set((s) => ({ patients: [patient, ...s.patients] }))
          notify(
            'patient',
            'Patient registered',
            `${fullName(patient)} (${patient.mrn}) added with ${payer.name}.`,
            null,
            null
          )
          return patient
        },

        createAppointment: (draft) => {
          const visit = visitTypeById(draft.visitType)
          const c: DemoCase = {
            id: newId('case'),
            encounterNumber: `ENC-${randomFrom('0123456789', 6)}`,
            patientId: draft.patientId,
            appointment: {
              date: draft.date,
              time: draft.time,
              visitType: draft.visitType,
              providerId: draft.providerId,
              location: visit.location,
              reason: draft.reason || visit.defaultReason,
            },
            createdAt: now(),
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
          set((s) => ({ cases: [c, ...s.cases] }))
          const p = patientOf(c)
          notify(
            'patient',
            'Appointment scheduled',
            `${fullName(p)} · ${visit.short} on ${draft.date} at ${draft.time}.`,
            c.id,
            'eligibility'
          )
          return c
        },

        runEligibility: (caseId) => {
          if (caseOf(caseId).eligibility) return
          patch(caseId, (c, p) => ({ eligibility: { ...buildEligibility(p, now()), priorAuthRequired: paRequired(c) } }))
          const c = caseOf(caseId)
          const p = patientOf(c)
          notify(
            'eligibility',
            'Eligibility verified',
            `${fullName(p)} — ${p.insurance.payerName} coverage active. ${paRequired(c) ? 'Prior authorization required for CPT 50010.' : 'No prior auth required.'}`,
            caseId,
            'eligibility'
          )
        },

        uploadAudio: (caseId, fileName, sizeKb) =>
          patch(caseId, (c) => ({ audio: buildAudio(c, fileName, sizeKb, now()) })),

        transcribe: (caseId) => patch(caseId, (c, p) => ({ transcript: buildTranscript(c, p) })),

        generateNote: (caseId) => {
          patch(caseId, (c, p) => ({ note: buildNote(c, p, now()) }))
          const p = patientOf(caseOf(caseId))
          notify('note', 'Clinical note drafted', `Documentation Agent drafted the note for ${fullName(p)}.`, caseId, 'note')
        },

        signNote: (caseId) =>
          patch(caseId, (c) => ({ note: c.note && { ...c.note, signedAt: now() } })),

        codeFromNote: (caseId, fileName) => {
          patch(caseId, () => ({ coding: buildCodingFromNote(fileName, now()) }))
          const p = patientOf(caseOf(caseId))
          notify('coding', 'Codes read from uploaded note', `Coding Agent coded ${fileName} for ${fullName(p)}.`, caseId, 'coding')
        },

        runCoding: (caseId) => {
          patch(caseId, (c) => ({ coding: buildCoding(c, now()) }))
          const c = caseOf(caseId)
          notify(
            'coding',
            'Codes suggested',
            `${fullName(patientOf(c))} · ${c.coding?.procedures.length ?? 0} procedure lines, ${c.coding?.diagnoses.length ?? 0} diagnoses.`,
            caseId,
            'coding'
          )
        },

        approveCoding: (caseId) =>
          patch(caseId, (c) => ({ coding: c.coding && { ...c.coding, approvedAt: now() } })),

        setProcedureUnits: (caseId, index, units) =>
          patch(caseId, (c) => {
            if (!c.coding || c.coding.approvedAt || units < 1) return {}
            const procedures = c.coding.procedures.map((p, i) =>
              i === index ? { ...p, units, charge: Math.round((p.charge / p.units) * units * 100) / 100 } : p
            )
            return { coding: { ...c.coding, procedures } }
          }),

        removeProcedure: (caseId, index) =>
          patch(caseId, (c) => {
            if (!c.coding || c.coding.approvedAt || c.coding.procedures.length <= 1) return {}
            return { coding: { ...c.coding, procedures: c.coding.procedures.filter((_, i) => i !== index) } }
          }),

        createEstimate: (caseId) => patch(caseId, (c, p) => ({ estimate: buildEstimate(c, p, now()) })),

        shareEstimate: (caseId) => {
          patch(caseId, (c) => ({ estimate: c.estimate && { ...c.estimate, sharedWithPatient: true } }))
          const c = caseOf(caseId)
          const p = patientOf(c)
          notify(
            'patient',
            'Estimate sent to patient',
            `${fullName(p)} received a ${money(c.estimate?.patientResponsibility ?? 0)} estimate by SMS and email.`,
            caseId,
            'estimate'
          )
        },

        runDenialCheck: (caseId) =>
          patch(caseId, (c, p) => ({ denialCheck: buildDenialCheck(c, p, now()) })),

        createClaim: (caseId) => patch(caseId, (c) => ({ claim: buildClaim(c, now()) })),

        checkClaim: (caseId) => patch(caseId, (c) => ({ claim: c.claim && { ...c.claim, checkedAt: now() } })),

        finalizeClaim: (caseId) => {
          patch(caseId, (c) => ({ claim: c.claim && { ...c.claim, checkedAt: c.claim.checkedAt ?? now(), finalizedAt: now(), revision: c.claim.revision + 1 } }))
          const c = caseOf(caseId)
          notify('claim', 'Claim ready to submit', `${c.claim?.claimId} for ${fullName(patientOf(c))} finalized (revision ${c.claim?.revision}).`, caseId, 'submission')
        },

        submitClaim: (caseId, method, confirmation) => {
          patch(caseId, (c) => ({
            claim: c.claim && {
              ...c.claim,
              submittedAt: now(),
              batchId: method === 'edi' ? `BATCH-${randomFrom('0123456789', 6)}` : null,
              liveTracking: true,
              submissionMethod: method,
              portalConfirmation: confirmation,
            },
          }))
          const c = caseOf(caseId)
          notify(
            'claim',
            'Claim submitted',
            `${c.claim?.claimId} for ${fullName(patientOf(c))} sent to ${patientOf(c).insurance.payerName} via ${method === 'edi' ? 'EDI clearinghouse' : 'payer web portal'} (${money(c.claim?.totalCharge ?? 0)}).`,
            caseId,
            'status'
          )
        },

        advanceStatus: (caseId) => {
          const c = caseOf(caseId)
          if (isDenialOpen(c)) return
          const p = patientOf(c)
          const nextIndex = c.statusEvents.length
          if (nextIndex < STATUS_SEQUENCE.length) {
            const event = { ...STATUS_SEQUENCE[nextIndex], at: now() }
            patch(caseId, (cur) => ({
              statusEvents: [...cur.statusEvents, event],
              claim:
                cur.claim && event.code === 'accepted_277ca'
                  ? { ...cur.claim, payerClaimControl: `PCN${randomFrom('0123456789', 11)}` }
                  : cur.claim,
            }))
            notify('status', `Claim status: ${event.label}`, `${c.claim?.claimId} · ${fullName(p)} — ${event.detail}`, caseId, 'status')
            return
          }
          if (!c.era) {
            patch(caseId, (cur) => ({ era: buildEra(cur, now()) }))
            const era = caseOf(caseId).era
            notify(
              'era',
              'ERA received (835)',
              `${p.insurance.payerName} paid ${money(era?.totalPaid ?? 0)} on ${c.claim?.claimId} for ${fullName(p)}.`,
              caseId,
              'era'
            )
            return
          }
          if (!c.eob) {
            patch(caseId, () => ({ eob: buildEob(now()), claim: c.claim && { ...c.claim, liveTracking: false } }))
            notify('eob', 'EOB available', `Explanation of benefits for ${fullName(p)} is ready to view and download.`, caseId, 'eob')
          }
        },

        submitPriorAuth: (caseId, method) => {
          patch(caseId, (c) => ({ priorAuth: buildPriorAuth(c, method, now()) }))
          const c = caseOf(caseId)
          notify(
            'priorauth',
            'Prior auth submitted',
            `${c.priorAuth?.requestId} for ${fullName(patientOf(c))} sent to ${patientOf(c).insurance.payerName} via ${method === 'edi' ? 'X12 278' : 'payer web portal'}.`,
            caseId,
            'eligibility'
          )
        },

        approvePriorAuthFor: (caseId) => {
          const cur = caseOf(caseId)
          if (!cur.priorAuth || cur.priorAuth.status === 'approved') return
          patch(caseId, (c) => ({ priorAuth: c.priorAuth && approvePriorAuth(c.priorAuth, now()) }))
          const c = caseOf(caseId)
          notify('priorauth', 'Prior auth approved', `${fullName(patientOf(c))} · auth ${c.priorAuth?.authNumber} valid through ${c.priorAuth?.validTo}.`, caseId, 'eligibility')
        },

        logArCall: (caseId, call) => {
          patch(caseId, (c) => ({ arCalls: [call, ...c.arCalls] }))
          const p = patientOf(caseOf(caseId))
          notify('ar', 'AR call completed', `${p.insurance.payerName} · ${fullName(p)} — ${call.outcome.slice(0, 90)}… Ref ${call.referenceNumber}.`, caseId, 'status')
        },

        resolveDenial: (caseId, resolution) => {
          patch(caseId, (c) => ({
            denial: c.denial && { ...c.denial, resolution, resolvedAt: now() },
            statusEvents: c.statusEvents.filter((e) => e.code === 'accepted_999' || e.code === 'accepted_277ca'),
            claim: c.claim && { ...c.claim, liveTracking: true },
            arCalls: c.arCalls.map((call, i) => (i === 0 ? { ...call, actionTaken: resolution } : call)),
          }))
          const c = caseOf(caseId)
          notify('denial', 'Denial resolved', `${fullName(patientOf(c))} · ${c.claim?.claimId} — ${resolution}. Status tracking resumed.`, caseId, 'status')
        },

        expediteClaim: (caseId) => {
          patch(caseId, (c) => ({
            claim: c.claim && { ...c.claim, liveTracking: true },
            arCalls: c.arCalls.map((call, i) => (i === 0 ? { ...call, actionTaken: 'Expedite confirmed — tracking payment' } : call)),
          }))
          const c = caseOf(caseId)
          notify('ar', 'Expedite logged', `${c.claim?.claimId} for ${fullName(patientOf(c))} escalated by payer. Live tracking resumed.`, caseId, 'status')
        },

        scheduleFollowUp: (caseId, when) => {
          patch(caseId, (c) => ({
            arCalls: c.arCalls.map((call, i) => (i === 0 ? { ...call, actionTaken: `Follow-up call scheduled ${when}` } : call)),
          }))
          const c = caseOf(caseId)
          notify('ar', 'Follow-up scheduled', `AR agent will call ${patientOf(c).insurance.payerName} again ${when} about ${c.claim?.claimId}.`, caseId, 'status')
        },

        reviewEra: (caseId) => patch(caseId, (c) => ({ era: c.era && { ...c.era, reviewedAt: now() } })),

        viewEob: (caseId) =>
          patch(caseId, (c) => ({ eob: c.eob && { ...c.eob, viewedAt: c.eob.viewedAt ?? now() } })),

        postPayment: (caseId) => {
          patch(caseId, () => ({
            reconciliation: { postedAt: now(), patientPaidAt: null, patientPaymentMethod: null, depositMatchedAt: null, closedAt: null },
          }))
          const c = caseOf(caseId)
          notify('payment', 'Insurance payment posted', `${money(c.era?.totalPaid ?? 0)} posted to ${fullName(patientOf(c))}'s account.`, caseId, 'reconciliation')
        },

        collectPatientPayment: (caseId, method) =>
          patch(caseId, (c) => ({
            reconciliation: c.reconciliation && { ...c.reconciliation, patientPaidAt: now(), patientPaymentMethod: method },
          })),

        matchDeposit: (caseId) =>
          patch(caseId, (c) => ({ reconciliation: c.reconciliation && { ...c.reconciliation, depositMatchedAt: now() } })),

        closeAccount: (caseId) => {
          patch(caseId, (c) => ({ reconciliation: c.reconciliation && { ...c.reconciliation, closedAt: now() } }))
          const p = patientOf(caseOf(caseId))
          notify('payment', 'Account reconciled', `${fullName(p)} — balance $0.00, encounter closed.`, caseId, 'reconciliation')
        },

        markRead: (id) =>
          set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),

        markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

        toggleRead: (id) =>
          set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n)) })),

        removeNotification: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

        dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      }
    },
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => (typeof window === 'undefined' ? SERVER_STORAGE : window.localStorage)),
      partialize: ({ authed, patients, cases, notifications }) => ({ authed, patients, cases, notifications }),
    }
  )
)

export const usePatient = (id: string | null): Patient | null =>
  useDemoStore((s) => (id ? (s.patients.find((p) => p.id === id) ?? null) : null))

export const useCase = (id: string | null): DemoCase | null =>
  useDemoStore((s) => (id ? (s.cases.find((c) => c.id === id) ?? null) : null))
