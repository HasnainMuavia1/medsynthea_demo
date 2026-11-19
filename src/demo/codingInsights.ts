import type { TemplateId } from './types'

export interface CodingFinding {
  severity: 'LOW' | 'MEDIUM'
  confidence: number
  title: string
  codes: string
  evidence: string
  why: string
  action: string
}

export interface RiskAction {
  title: string
  detail: string
}

export interface DenialPrediction {
  probability: number
  factors: { label: string; impact: 'lowers' | 'raises'; weight: number }[]
}

export interface CodingInsights {
  validationChecks: string[]
  findings: CodingFinding[]
  mitigations: RiskAction[]
  prediction: DenialPrediction
}

const VALIDATION = ['NCCI procedure-to-procedure (PTP) edits', 'Medically unlikely edits (MUE)', 'Modifier usage', 'ICD-10-CM / CPT linkage', 'Age and sex conflicts', 'Units vs. documented time']

export const CODING_INSIGHTS: Record<TemplateId, CodingInsights> = {
  'clinic-rlq-pain': {
    validationChecks: VALIDATION,
    findings: [
      {
        severity: 'LOW',
        confidence: 0.16,
        title: 'Symptom codes used without a definitive diagnosis',
        codes: 'ICD-10-CM R10.31 • R68.81 • R19.4',
        evidence: 'Assessment queries the etiology (constipation vs. other intra-abdominal pathology); no confirmed diagnosis was documented.',
        why: 'When the cause is not established at the visit, coding guidelines call for the documented signs and symptoms.',
        action: 'Keep R10.31 as primary with R68.81 and R19.4 as secondary — supported by the note.',
      },
      {
        severity: 'MEDIUM',
        confidence: 0.34,
        title: 'Dry mouth code supported by exam only',
        codes: 'ICD-10-CM R68.2',
        evidence: 'Exam documents dry mucous membranes; the amendment states dehydration was not diagnosed.',
        why: 'Dehydration (E86.0) would not be supported, so the finding is coded as documented.',
        action: 'R68.2 flagged for coder review; E86.0 intentionally not assigned.',
      },
      {
        severity: 'LOW',
        confidence: 0.22,
        title: 'E/M level supported by low MDM',
        codes: 'CPT 99213',
        evidence: 'One acute uncomplicated problem; CT deferred after a risk-benefit discussion; labs advised; follow-up in 1 week.',
        why: 'Low medical decision making supports 99213 for an established patient office visit.',
        action: 'Confirm the patient is established with the practice; otherwise bill 99203.',
      },
    ],
    mitigations: [
      { title: 'Linked every diagnosis to 99213', detail: 'Diagnosis pointers 1–4 cover the pain, early satiety, bowel change and dry mouth.' },
      { title: 'Followed the amendment', detail: 'Dehydration removed from the plan heading, so E86.0 is not billed.' },
      { title: 'Place of service 11 (office)', detail: 'Office visit billed on POS 11 with the office copay.' },
    ],
    prediction: {
      probability: 4,
      factors: [
        { label: 'Eligibility active and verified', impact: 'lowers', weight: 30 },
        { label: 'Single E/M line with all diagnoses linked', impact: 'lowers', weight: 25 },
        { label: 'Established-patient status needs confirmation', impact: 'raises', weight: 6 },
        { label: 'Payer history: clean office claims', impact: 'lowers', weight: 15 },
      ],
    },
  },
  'er-viral-syndrome': {
    validationChecks: VALIDATION,
    findings: [
      {
        severity: 'LOW',
        confidence: 0.18,
        title: 'E/M billed with same-day infusion services',
        codes: 'CPT 99284 • CPT 96374',
        evidence: 'Note documents a separately identifiable ED evaluation (HPI, 5-system ROS, full exam, labs and imaging ordered) before IV therapy started.',
        why: 'Payers deny E/M on the same day as injections/infusions unless the E/M is significant and separately identifiable.',
        action: 'Modifier 25 is applied to 99284 and supported by the documentation — no change needed.',
      },
      {
        severity: 'LOW',
        confidence: 0.12,
        title: 'Hydration reported as subsequent service',
        codes: 'CPT 96361 • HCPCS J7120',
        evidence: 'IV push (96374) is the initial service; LR hydration ran 14:00–15:25 (85 minutes) per the infusion log.',
        why: 'Hydration can only be an initial service when no higher-hierarchy service was given; billing 96360 here would deny.',
        action: '96361 × 1 is correct for hydration after the initial push. Keep J7120 × 1.',
      },
    ],
    mitigations: [
      { title: 'Applied modifier 25 to 99284', detail: 'Separately identifiable E/M documented before IV therapy.' },
      { title: 'Set infusion hierarchy', detail: 'IV push 96374 initial; 96375 × 2 sequential drugs; hydration moved to 96361.' },
      { title: 'Calculated drug units from doses', detail: 'Ondansetron 4 mg → J2405 × 4; ketorolac 30 mg → J1885 × 2; morphine 4 mg → J2270 × 1.' },
    ],
    prediction: {
      probability: 6,
      factors: [
        { label: 'Eligibility active and verified', impact: 'lowers', weight: 30 },
        { label: 'All lines linked to supporting ICD-10 codes', impact: 'lowers', weight: 25 },
        { label: 'Modifier 25 with same-day procedures', impact: 'raises', weight: 8 },
        { label: 'Payer history: clean ED claims', impact: 'lowers', weight: 15 },
      ],
    },
  },
  'er-chest-pain': {
    validationChecks: VALIDATION,
    findings: [
      {
        severity: 'LOW',
        confidence: 0.21,
        title: 'Point-of-care troponin needs CLIA-waived modifier',
        codes: 'CPT 84484',
        evidence: 'Troponin I documented as a rapid CLIA-waived point-of-care test.',
        why: 'Waived lab tests billed without modifier QW are denied for missing CLIA certification.',
        action: 'Modifier QW is applied to 84484 — no change needed.',
      },
      {
        severity: 'MEDIUM',
        confidence: 0.32,
        title: 'High-complexity E/M (99285) requires supporting MDM',
        codes: 'CPT 99285 • ICD I20.0',
        evidence: 'Acute chest pain with ECG T-wave changes, treatment with nitroglycerin and morphine, and transfer for catheterization evaluation.',
        why: 'Payers down-code 99285 when the note does not show high-risk decision making.',
        action: 'Documentation supports high MDM (decision for transfer / escalation of care). Keep 99285-25.',
      },
    ],
    mitigations: [
      { title: 'Added modifier QW to 84484', detail: 'Point-of-care troponin is CLIA-waived.' },
      { title: 'Excluded KVO saline from billing', detail: 'KVO access line is not a separately billable hydration service.' },
      { title: 'Coded unstable angina instead of chest pain', detail: 'Definitive diagnosis I20.0 replaces symptom code R07.9.' },
    ],
    prediction: {
      probability: 9,
      factors: [
        { label: 'Eligibility active and verified', impact: 'lowers', weight: 30 },
        { label: 'CLIA modifier present on waived test', impact: 'lowers', weight: 15 },
        { label: 'High-level E/M (99285) audit exposure', impact: 'raises', weight: 12 },
        { label: 'Diagnosis supports medical necessity for ECG and troponin', impact: 'lowers', weight: 20 },
      ],
    },
  },
  'renal-exploration': {
    validationChecks: VALIDATION,
    findings: [
      {
        severity: 'MEDIUM',
        confidence: 0.28,
        title: 'Surgical procedure requires prior authorization',
        codes: 'CPT 50010',
        evidence: 'Prior authorization on file for CPT 50010 with matching date of service.',
        why: 'Inpatient surgery without an authorization number is denied CO-197.',
        action: 'Include the authorization number on the claim (box 23 / REF*G1).',
      },
      {
        severity: 'LOW',
        confidence: 0.16,
        title: 'Decision-for-surgery E/M needs modifier 57',
        codes: 'CPT 99223 • CPT 50010',
        evidence: 'Initial hospital evaluation documented the decision to proceed with exploration.',
        why: 'E/M within the global period of a major procedure denies without modifier 57.',
        action: 'Modifier 57 is applied to 99223 — no change needed.',
      },
    ],
    mitigations: [
      { title: 'Applied laterality modifier LT', detail: 'Left kidney documented; LT added to 50010.' },
      { title: 'Applied modifier 57 to 99223', detail: 'E/M resulted in the decision for major surgery.' },
      { title: 'Did not code nephrorrhaphy', detail: 'Note states no nephrorrhaphy, ligation or nephrectomy was performed.' },
    ],
    prediction: {
      probability: 11,
      factors: [
        { label: 'Prior authorization approved', impact: 'lowers', weight: 30 },
        { label: 'Laterality and global-period modifiers present', impact: 'lowers', weight: 15 },
        { label: 'Surgical claims pend for records more often', impact: 'raises', weight: 14 },
        { label: 'Diagnosis-to-procedure linkage complete', impact: 'lowers', weight: 18 },
      ],
    },
  },
}
