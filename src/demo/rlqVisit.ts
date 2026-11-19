import type { DiagnosisLine, NoteSection, ProcedureLine, TranscriptLine } from './types'
import { RLQ_VISIT_TRANSCRIPT } from './rlqVisitTranscript'

/**
 * The recorded office visit (demo audio.mp3): right lower quadrant abdominal pain.
 * Transcript, note and codes are fixed so every upload shows the same result.
 * Note text is copied from the signed note ("rizwan note SOAP.pdf"), including its amendment.
 */

export interface RlqHeader {
  patientName: string
  dob: string
  mrn: string
  dateOfService: string
  physician: string
}

export const rlqTranscript = (): TranscriptLine[] => RLQ_VISIT_TRANSCRIPT.map((line) => ({ ...line }))

export const rlqSections = (h: RlqHeader): NoteSection[] => [
  {
    heading: 'Encounter',
    lines: [
      `PATIENT NAME: ${h.patientName}`,
      `DOB: ${h.dob}`,
      `MRN / FIN: ${h.mrn}`,
      `DATE OF SERVICE: ${h.dateOfService}`,
      `ATTENDING PHYSICIAN: ${h.physician}`,
      'STATUS: Amended',
    ],
  },
  {
    heading: 'Subjective',
    lines: [
      'CC: Right lower abdominal pain x approximately 1 week.',
      'HPI: Patient presents with a approximately 1-week history of right lower quadrant abdominal pain. Onset was sudden and not associated with food intake. Pain is sharp in character, localized to the right lower quadrant without radiation. Denies nausea, vomiting, fevers, or chills. Reports decreased appetite; eating less than usual due to discomfort and a sensation of early fullness with meals. Also reports decreased fluid intake over the same period. Bowel movements have changed from daily to approximately every other day, representing an acute change from baseline. Denies blood in stool, melena, or stool discoloration. Denies weight loss, night sweats, or fatigue. No prior episodes of similar pain. Denies vomiting after eating.',
      'PMH:',
      '• No history of diabetes',
      '• No history of hypertension',
      'Medications:',
      '• Multivitamin (OTC, dose/frequency not specified)',
      '• No prescription medications',
      'Allergies: Not discussed.',
      'Family History:',
      '• Father: deceased (non-medical cause)',
      '• Mother: alive',
      '• Possible cardiac history in family (details unknown to patient)',
      'Social History:',
      '• Tobacco: former smoker; currently vapes occasionally',
      '• Alcohol: former drinker, quit',
      'ROS:',
      '• Constitutional: denies fevers, chills, weight loss, night sweats, fatigue',
      '• GI: right lower quadrant abdominal pain x 1 week (sharp, non-radiating); decreased appetite; early satiety with discomfort; decreased oral fluid intake; decreased bowel movement frequency (every other day vs. daily at baseline); denies nausea, vomiting, hematochezia, melena, stool discoloration',
      '• All other systems: not reviewed',
    ],
  },
  {
    heading: 'Objective',
    lines: [
      'Vital signs: Not documented.',
      'Physical Exam:',
      '• ENT: Mucous membranes dry. Oropharynx not moist. Ears unremarkable. Eyes unremarkable.',
      '• Cardiovascular: Heart sounds unremarkable.',
      '• Respiratory: Lungs sound normal on auscultation.',
      '• Abdomen: Tenderness to palpation in the right lower quadrant. Pain does not radiate on palpation. Bowel sounds present and normal. Remainder of abdominal exam described as benign.',
      'Labs/Imaging: None obtained at this visit.',
    ],
  },
  {
    heading: 'Assessment',
    lines: [
      '1. Right lower quadrant abdominal pain, unspecified - acute onset, approximately 1 week duration, sharp, non-radiating, with associated decreased oral intake, early satiety, and decreased bowel movement frequency; exam notable for RLQ tenderness with benign overall abdominal exam and active bowel sounds. Query: etiology (constipation vs. other intra-abdominal pathology)?',
      '2. Decreased bowel movement frequency - acute change from daily to every other day; clinician plans to regularize bowel movements with diet and fluids.',
      '3. Decreased oral intake - reduced food and fluid intake over the past week; mucous membranes dry on exam (clinician: probably not eating or drinking as you should).',
    ],
  },
  {
    heading: 'Plan',
    lines: [
      '1. Right lower quadrant abdominal pain / decreased bowel movement frequency:',
      '• Conservative management at this time; CT scan deferred given benign exam findings and risk-benefit discussion regarding radiation exposure with patient, who was agreeable to conservative approach.',
      '• Dietary modification: increase fiber intake.',
      '• Increase fluid intake.',
      '• Labs: clinician stated labs should probably be obtained; specific labs not specified.',
      '• Return precautions: patient instructed to return if pain worsens; CT abdomen/pelvis to be ordered at that visit if symptoms have not improved or have worsened.',
      '• Follow-up: return to clinic in approximately 1 week.',
      '2. Decreased oral intake / mild dehydration:',
      '• Increase fluid intake as above.',
      '• Dietary modification as above.',
      'Counseling: Clinician discussed risk-benefit of CT scan (radiation exposure) with patient and rationale for conservative treatment first. Patient verbalized understanding and agreement with plan.',
    ],
  },
  {
    heading: 'Amendment (Addendum)',
    lines: [
      'Reason: Correction after transcript verification: dehydration was not diagnosed by the clinician.',
      "Correction: Plan item 2 heading corrected from 'Decreased oral intake / mild dehydration' to 'Decreased oral intake'. The clinician documented dry mucous membranes and reduced food/fluid intake but did not diagnose dehydration (see Assessment item 3).",
    ],
  },
]

export const RLQ_PROCEDURES: ProcedureLine[] = [
  {
    code: '99213',
    kind: 'CPT',
    description: 'Office/outpatient visit, established patient, low MDM',
    modifiers: [],
    units: 1,
    // CY2026 Medicare Physician Fee Schedule, national non-facility amount for 99213.
    charge: 95.19,
    dxPointers: [1, 2, 3, 4],
    confidence: 0.86,
  },
]

export const RLQ_DIAGNOSES: DiagnosisLine[] = [
  { code: 'R10.31', description: 'Right lower quadrant pain', confidence: 0.96 },
  { code: 'R68.81', description: 'Early satiety', confidence: 0.93 },
  { code: 'R19.4', description: 'Change in bowel habit', confidence: 0.92 },
  { code: 'R68.2', description: 'Dry mouth, unspecified', confidence: 0.84 },
]
