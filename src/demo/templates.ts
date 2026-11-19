import type {
  DiagnosisLine,
  NoteSection,
  Patient,
  ProcedureLine,
  Provider,
  TemplateId,
  TranscriptLine,
} from './types'
import { RLQ_DIAGNOSES, RLQ_PROCEDURES, rlqSections, rlqTranscript } from './rlqVisit'

export interface NoteContext {
  patient: Patient
  provider: Provider
  age: number
  dateOfService: string
}

interface ClinicalTemplate {
  title: string
  transcript: (ctx: NoteContext) => TranscriptLine[]
  sections: (ctx: NoteContext) => NoteSection[]
  procedures: ProcedureLine[]
  diagnoses: DiagnosisLine[]
}

const pronoun = (patient: Patient) => (patient.sex === 'Male' ? 'male' : 'female')

const header = (ctx: NoteContext, arrival: string): NoteSection => ({
  heading: 'Encounter',
  lines: [
    `PATIENT NAME: ${ctx.patient.firstName} ${ctx.patient.lastName}`,
    `DOB: ${ctx.patient.dob}`,
    `MRN / FIN: ${ctx.patient.mrn}`,
    `DATE OF SERVICE: ${ctx.dateOfService}`,
    `TIME OF ARRIVAL: ${arrival}`,
    `ATTENDING PHYSICIAN: ${ctx.provider.name}, ${ctx.provider.credentials}`,
  ],
})

const ER_VIRAL: ClinicalTemplate = {
  title: 'Freestanding Emergency Room Progress Note',
  transcript: ({ patient, provider }) => [
    {
      speaker: 'Provider',
      at: '00:04',
      text: `Hi ${patient.firstName}, I'm Dr. ${provider.name.split(' ')[1]}. What brings you in today?`,
    },
    {
      speaker: 'Patient',
      at: '00:09',
      text: "I've had a fever and this cough for about two days, and my whole body aches. It's getting worse.",
    },
    { speaker: 'Provider', at: '00:21', text: 'Is the cough bringing anything up? Any phlegm?' },
    {
      speaker: 'Patient',
      at: '00:25',
      text: "No, it's dry. I've been nauseous too, but I haven't thrown up.",
    },
    {
      speaker: 'Provider',
      at: '00:34',
      text: 'Any shortness of breath, chest pain, burning with urination or belly pain? Any recent travel?',
    },
    { speaker: 'Patient', at: '00:42', text: 'No, none of that. No travel.' },
    {
      speaker: 'Nurse',
      at: '01:10',
      text: 'Vitals: BP 122 over 78, heart rate 98, resp 18, temp 101.4, sat 97 percent on room air.',
    },
    {
      speaker: 'Provider',
      at: '02:31',
      text: "Lungs are clear on both sides, heart is regular. You're tender in the muscles of your arms and legs but no joint swelling.",
    },
    {
      speaker: 'Provider',
      at: '03:05',
      text: "I'm ordering a CBC, CMP, urinalysis and a two-view chest X-ray. We'll start a liter of lactated Ringer's and give Zofran for the nausea, Toradol for the fever and a small dose of morphine for the aches.",
    },
    {
      speaker: 'Nurse',
      at: '04:12',
      text: '18-gauge in the right AC, LR running at 14:00. Zofran 4 IV push at 14:05, Toradol 30 at 14:15, morphine 4 at 14:25.',
    },
    {
      speaker: 'Provider',
      at: '09:48',
      text: 'White count is mildly up at 11.2, chemistries and UA are normal, and the chest X-ray is clear. This looks like an acute viral syndrome.',
    },
    {
      speaker: 'Patient',
      at: '10:20',
      text: 'I feel a lot better now. The pain is maybe a two out of ten.',
    },
    {
      speaker: 'Provider',
      at: '11:02',
      text: "Great. Temp is down to 98.6. You can go home — rest, push fluids, Tylenol 500 every six hours as needed, and follow up with your primary doctor in two to three days. Come back if you get short of breath, chest pain or can't keep fluids down.",
    },
  ],
  sections: (ctx) => [
    header(ctx, '13:50'),
    {
      heading: 'Subjective / History of Present Illness (HPI)',
      lines: [
        `The patient is a ${ctx.age}-year-old ${pronoun(ctx.patient)} who presents to the Freestanding Emergency Department complaining of acute onset of fever, persistent cough, generalized severe body aches, and associated malaise. Symptoms began approximately 2 days ago and have progressively worsened. The cough is non-productive. The patient reports accompanying nausea and generalized discomfort. Denies shortness of breath, chest pain, dysuria, abdominal pain, or recent foreign travel.`,
      ],
    },
    {
      heading: 'Review of Systems (ROS)',
      lines: [
        '• Constitutional: Positive for fever, chills, diaphoresis, severe generalized body aches, and fatigue.',
        '• Respiratory: Positive for cough. Negative for acute respiratory distress or hemoptysis.',
        '• Gastrointestinal: Positive for nausea. Negative for vomiting, diarrhea, or localized abdominal pain.',
        '• Genitourinary: Negative for dysuria, frequency, or hematuria.',
        '• Neurological: Negative for focal numbness, weakness, or headache.',
      ],
    },
    {
      heading: 'Objective / Physical Examination',
      lines: [
        'Vital signs — BP: 122/78 mmHg | HR: 98 bpm | RR: 18 breaths/min | Temp: 101.4 °F (38.6 °C) | SpO2: 97% on ambient air.',
        '• General: Moderate acute discomfort secondary to fever and generalized body aches. Alert, oriented x 4.',
        '• HEENT: Normocephalic, atraumatic. Sclera anicteric, mucous membranes moist. Oropharynx clear without exudate.',
        '• Cardiovascular: Regular rate and rhythm. S1 and S2 present. No murmurs, rubs, or gallops.',
        '• Respiratory: Clear to auscultation bilaterally. Symmetrical chest expansion. No focal wheezing, rales, or rhonchi.',
        '• Abdomen: Soft, non-tender, non-distended. Bowel sounds active in all 4 quadrants.',
        '• Musculoskeletal: Diffuse muscular tenderness in upper and lower extremities without joint effusion or erythema.',
        '• Neurological: Non-focal. Cranial nerves II–XII grossly intact.',
        '• Skin: Warm, flushed, dry. Turgor normal. No rash or cyanosis.',
      ],
    },
    {
      heading: 'Diagnostic Results',
      lines: [
        '• CBC with differential — WBC: 11.2 x10^3/uL (mild leukocytosis) | Hgb: 14.2 g/dL | Hct: 42.1% | Plt: 245 x10^3/uL.',
        '• CMP — Na 138 | K 4.1 | Cl 102 | CO2 24 | BUN 14 | Cr 0.9 | Glucose 104 | LFTs WNL.',
        '• Urinalysis with microscopy — Spec Grav 1.020 | pH 6.0 | Leuks (−), Nitrites (−), Protein (−), Micro 0–2 WBC/hpf.',
        '• Chest X-ray 2 views — Clear lung fields without focal consolidation, pleural effusion, or pneumothorax. Cardiomediastinal silhouette normal.',
      ],
    },
    {
      heading: 'Timed IV Infusion & Injection Log',
      lines: [
        "• Right AC — Lactated Ringer's 1000 mL (primary hydration) 14:00–14:50 · 50 mins",
        "• Right AC — Lactated Ringer's 1000 mL (continuous hydration, add'l) 14:50–15:25 · 35 mins",
        '• Y-site port — Ondansetron (Zofran) 4 mg IV push (initial drug) 14:05–14:07 · 2 mins',
        '• Y-site port — Ketorolac (Toradol) 30 mg IV push (sequential drug #1) 14:15–14:18 · 3 mins',
        '• Y-site port — Morphine sulfate 4 mg IV push (sequential drug #2) 14:25–14:28 · 3 mins',
      ],
    },
    {
      heading: 'Nursing & ED Course',
      lines: [
        "• 14:00: Peripheral 18G IV line established in right antecubital fossa. Lactated Ringer's 1000 mL initiated via pump.",
        '• 14:05: Ondansetron 4 mg IV push over 2 minutes via Y-site port for nausea. No adverse reaction.',
        '• 14:15: Ketorolac 30 mg IV push over 3 minutes for fever and systemic anti-inflammatory effect. Site clear, no infiltration.',
        '• 14:25: Morphine sulfate 4 mg IV push over 3 minutes for severe body aches. Vitals and pulse oximetry continuously monitored.',
        '• 14:50: Initial 50 minutes of primary hydration completed. Infusion continuing.',
        '• 15:25: Infusion completed (total 85 minutes). IV flushed and converted to saline lock. Pain decreased from 8/10 to 2/10, nausea resolved, vital signs stable.',
      ],
    },
    {
      heading: 'Assessment & Plan',
      lines: [
        '• Acute viral syndrome / upper respiratory tract infection with fever, cough, and myalgias.',
        '• Dehydration risk secondary to pyrexia.',
        '• Disposition: Re-evaluated after IV hydration and medications with marked improvement. Discharge vitals: Temp 98.6 °F, HR 76 bpm, BP 118/74 mmHg, SpO2 98% on room air. Discharged home in stable condition.',
        '• Discharge instructions: rest, aggressive oral hydration; acetaminophen 500 mg PO every 6 hours PRN; return precautions reviewed; follow up with PCP in 2–3 days.',
      ],
    },
  ],
  procedures: [
    {
      code: '99284',
      kind: 'CPT',
      description: 'Emergency department visit, moderate medical decision making',
      modifiers: ['25'],
      units: 1,
      charge: 1250,
      dxPointers: [1, 2, 3],
      confidence: 0.96,
    },
    {
      code: '96374',
      kind: 'CPT',
      description: 'IV push, single or initial substance/drug',
      modifiers: [],
      units: 1,
      charge: 310,
      dxPointers: [5],
      confidence: 0.97,
    },
    {
      code: '96375',
      kind: 'CPT',
      description: 'IV push, each additional sequential new substance/drug',
      modifiers: [],
      units: 2,
      charge: 290,
      dxPointers: [3, 4],
      confidence: 0.95,
    },
    {
      code: '96361',
      kind: 'CPT',
      description: 'IV infusion, hydration; each additional hour',
      modifiers: [],
      units: 1,
      charge: 185,
      dxPointers: [3],
      confidence: 0.91,
    },
    {
      code: '85025',
      kind: 'CPT',
      description: 'Complete blood count (CBC) with automated differential',
      modifiers: [],
      units: 1,
      charge: 68,
      dxPointers: [3],
      confidence: 0.99,
    },
    {
      code: '80053',
      kind: 'CPT',
      description: 'Comprehensive metabolic panel',
      modifiers: [],
      units: 1,
      charge: 112,
      dxPointers: [3],
      confidence: 0.99,
    },
    {
      code: '81001',
      kind: 'CPT',
      description: 'Urinalysis, automated, with microscopy',
      modifiers: [],
      units: 1,
      charge: 45,
      dxPointers: [3],
      confidence: 0.98,
    },
    {
      code: '71046',
      kind: 'CPT',
      description: 'Radiologic examination, chest; 2 views',
      modifiers: [],
      units: 1,
      charge: 265,
      dxPointers: [1],
      confidence: 0.98,
    },
    {
      code: 'J2405',
      kind: 'HCPCS',
      description: 'Injection, ondansetron HCl, per 1 mg',
      modifiers: [],
      units: 4,
      charge: 32,
      dxPointers: [5],
      confidence: 0.97,
    },
    {
      code: 'J1885',
      kind: 'HCPCS',
      description: 'Injection, ketorolac tromethamine, per 15 mg',
      modifiers: [],
      units: 2,
      charge: 24,
      dxPointers: [3],
      confidence: 0.97,
    },
    {
      code: 'J2270',
      kind: 'HCPCS',
      description: 'Injection, morphine sulfate, up to 10 mg',
      modifiers: [],
      units: 1,
      charge: 22,
      dxPointers: [4],
      confidence: 0.96,
    },
    {
      code: 'J7120',
      kind: 'HCPCS',
      description: "Ringer's lactate infusion, up to 1000 cc",
      modifiers: [],
      units: 1,
      charge: 48,
      dxPointers: [3],
      confidence: 0.95,
    },
  ],
  diagnoses: [
    { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', confidence: 0.95 },
    { code: 'B34.9', description: 'Viral infection, unspecified', confidence: 0.92 },
    { code: 'R50.9', description: 'Fever, unspecified', confidence: 0.9 },
    { code: 'M79.10', description: 'Myalgia, unspecified site', confidence: 0.9 },
    { code: 'R11.0', description: 'Nausea', confidence: 0.93 },
  ],
}

const ER_CHEST: ClinicalTemplate = {
  title: 'Freestanding Emergency Room Progress Note',
  transcript: ({ patient, provider }) => [
    {
      speaker: 'Provider',
      at: '00:03',
      text: `${patient.firstName}, I'm Dr. ${provider.name.split(' ')[1]}. Tell me about the chest pain.`,
    },
    {
      speaker: 'Patient',
      at: '00:08',
      text: 'It started about an hour and a half ago while I was sitting down. It feels like a heavy pressure right here, and it goes up into my jaw and left shoulder.',
    },
    { speaker: 'Provider', at: '00:22', text: 'How bad is it, zero to ten?' },
    { speaker: 'Patient', at: '00:25', text: "About an eight. I'm sweaty and a little sick to my stomach." },
    {
      speaker: 'Provider',
      at: '00:33',
      text: 'Any fainting, shortness of breath or fever? Any history of heart problems?',
    },
    {
      speaker: 'Patient',
      at: '00:40',
      text: 'No fainting or fever. I have high blood pressure and high cholesterol.',
    },
    {
      speaker: 'Nurse',
      at: '01:02',
      text: 'BP 158 over 94, heart rate 92, resp 20, temp 98.6, sat 96 on room air. Aspirin 325 chewed at 18:15.',
    },
    {
      speaker: 'Provider',
      at: '02:14',
      text: 'ECG shows sinus rhythm with mild T-wave inversions in V4 through V6, no ST elevation. Let us get a point-of-care troponin, CBC, CMP and a chest X-ray.',
    },
    {
      speaker: 'Nurse',
      at: '03:20',
      text: 'IV 18 gauge left AC at 18:20, nitro 0.4 sublingual times two. Morphine 2 IV push at 18:25, Zofran 4 IV push at 18:35.',
    },
    {
      speaker: 'Provider',
      at: '11:40',
      text: 'Initial troponin is 0.02, normal. Labs are within normal limits and the chest X-ray shows no cardiomegaly or edema.',
    },
    { speaker: 'Patient', at: '13:10', text: 'The pain is completely gone now.' },
    {
      speaker: 'Provider',
      at: '14:02',
      text: "That's good, but with these ECG changes I'm concerned about unstable angina. We're transferring you by EMS to the tertiary center for observation, serial troponins and a cardiac cath evaluation.",
    },
  ],
  sections: (ctx) => [
    header(ctx, '18:10'),
    {
      heading: 'Subjective / HPI',
      lines: [
        `A ${ctx.age}-year-old ${pronoun(ctx.patient)} presents with acute retrosternal chest pressure radiating to the left jaw and shoulder, initiating 1.5 hours prior to arrival while at rest. Describes pain as 8/10 heaviness accompanied by diaphoresis and mild nausea. Denies syncope, shortness of breath, or fever. History of hypertension and dyslipidemia.`,
      ],
    },
    {
      heading: 'Objective / Physical Examination',
      lines: [
        '• Vitals: BP 158/94 mmHg | HR 92 bpm | RR 20 breaths/min | Temp 98.6 °F | SpO2 96% room air.',
        '• Exam: Diaphoretic, anxious. Regular heart rhythm, S1/S2 normal, no murmurs. Lungs clear to auscultation bilaterally. Chest wall non-tender to palpation.',
      ],
    },
    {
      heading: 'Diagnostics',
      lines: [
        '• 12-lead ECG: Normal sinus rhythm, mild T-wave inversions in V4–V6. No ST-segment elevation.',
        '• Troponin I: Initial 0.02 ng/mL (normal) — rapid CLIA-waived point-of-care test.',
        '• CBC / CMP: Within normal limits.',
        '• Chest X-ray 2 views: No cardiomegaly or pulmonary edema.',
      ],
    },
    {
      heading: 'Timed IV Infusion & Injection Log',
      lines: [
        '• Left AC — Normal saline 0.9% 1000 mL (KVO access) 18:20–19:45 · 85 mins',
        '• Y-site port — Morphine sulfate 2 mg IV push (initial drug) 18:25–18:28 · 3 mins',
        '• Y-site port — Ondansetron (Zofran) 4 mg IV push (sequential #1) 18:35–18:37 · 2 mins',
      ],
    },
    {
      heading: 'Nursing & ED Course',
      lines: [
        '• 18:15: Aspirin 325 mg PO chewed immediately.',
        '• 18:20: IV 18G established in left AC; sublingual nitroglycerin 0.4 mg x2 with moderate pain relief.',
        '• 18:25: Morphine 2 mg IV push for persistent 6/10 pain.',
        '• 18:35: Ondansetron 4 mg IV push for accompanying nausea.',
        '• 19:30: Serial ECG unchanged. Chest pain completely resolved (0/10). Arranged transfer for observation and serial troponins.',
      ],
    },
    {
      heading: 'Assessment & Plan',
      lines: [
        '• Primary diagnosis: Unstable angina.',
        '• Essential hypertension; dyslipidemia.',
        '• Disposition: Transferred to tertiary care hospital via EMS for inpatient observation and cardiac catheterization evaluation.',
      ],
    },
  ],
  procedures: [
    {
      code: '99285',
      kind: 'CPT',
      description: 'Emergency department visit, high medical decision making',
      modifiers: ['25'],
      units: 1,
      charge: 1850,
      dxPointers: [1, 2, 3],
      confidence: 0.95,
    },
    {
      code: '93000',
      kind: 'CPT',
      description: 'Electrocardiogram, routine, 12 leads, with interpretation and report',
      modifiers: [],
      units: 1,
      charge: 210,
      dxPointers: [1],
      confidence: 0.97,
    },
    {
      code: '84484',
      kind: 'CPT',
      description: 'Troponin, quantitative',
      modifiers: ['QW'],
      units: 1,
      charge: 85,
      dxPointers: [1],
      confidence: 0.96,
    },
    {
      code: '85025',
      kind: 'CPT',
      description: 'Complete blood count (CBC) with automated differential',
      modifiers: [],
      units: 1,
      charge: 68,
      dxPointers: [1],
      confidence: 0.99,
    },
    {
      code: '80053',
      kind: 'CPT',
      description: 'Comprehensive metabolic panel',
      modifiers: [],
      units: 1,
      charge: 112,
      dxPointers: [1],
      confidence: 0.99,
    },
    {
      code: '71046',
      kind: 'CPT',
      description: 'Radiologic examination, chest; 2 views',
      modifiers: [],
      units: 1,
      charge: 265,
      dxPointers: [1],
      confidence: 0.98,
    },
    {
      code: '96374',
      kind: 'CPT',
      description: 'IV push, single or initial substance/drug',
      modifiers: [],
      units: 1,
      charge: 310,
      dxPointers: [1],
      confidence: 0.96,
    },
    {
      code: '96375',
      kind: 'CPT',
      description: 'IV push, each additional sequential new substance/drug',
      modifiers: [],
      units: 1,
      charge: 145,
      dxPointers: [1],
      confidence: 0.95,
    },
    {
      code: 'J2270',
      kind: 'HCPCS',
      description: 'Injection, morphine sulfate, up to 10 mg',
      modifiers: [],
      units: 1,
      charge: 22,
      dxPointers: [1],
      confidence: 0.96,
    },
    {
      code: 'J2405',
      kind: 'HCPCS',
      description: 'Injection, ondansetron HCl, per 1 mg',
      modifiers: [],
      units: 4,
      charge: 32,
      dxPointers: [1],
      confidence: 0.97,
    },
  ],
  diagnoses: [
    { code: 'I20.0', description: 'Unstable angina', confidence: 0.94 },
    { code: 'I10', description: 'Essential (primary) hypertension', confidence: 0.97 },
    { code: 'E78.5', description: 'Hyperlipidemia, unspecified', confidence: 0.95 },
  ],
}

const RENAL: ClinicalTemplate = {
  title: 'Operative Report',
  transcript: ({ patient, provider }) => [
    {
      speaker: 'Provider',
      at: '00:05',
      text: `Time-out: ${patient.firstName} ${patient.lastName}, left renal exploration, left flank marked, consent signed. Dr. ${provider.name.split(' ')[1]} attending.`,
    },
    {
      speaker: 'Nurse',
      at: '00:18',
      text: 'General endotracheal anesthesia induced. Right lateral decubitus, table flexed. Left flank prepped and draped.',
    },
    {
      speaker: 'Provider',
      at: '02:40',
      text: 'Subcostal flank incision from the posterior axillary line toward the rectus sheath. Dividing external oblique, internal oblique and transversus with cautery.',
    },
    {
      speaker: 'Provider',
      at: '06:15',
      text: "Entering the retroperitoneum extraperitoneally, peritoneum reflected medially. Gerota's fascia incised. Moderate non-expanding perirenal hematoma — evacuating with suction and irrigation.",
    },
    {
      speaker: 'Provider',
      at: '11:32',
      text: 'Kidney fully mobilized. Small superficial capsular tear under one centimeter at the lower pole, no active arterial bleeding. Renal artery, vein and ureter intact. No urine extravasation, no collecting system injury.',
    },
    {
      speaker: 'Provider',
      at: '15:04',
      text: 'Warm saline irrigation. Surgicel over the lower pole tear. Hemostasis is excellent. No nephrorrhaphy or nephrectomy needed.',
    },
    {
      speaker: 'Provider',
      at: '18:47',
      text: "19 French JP drain at the lower pole through a separate stab incision. Gerota's loosely closed, muscle in layers with 0-PDS, 3-0 Vicryl subcutaneous, staples to skin.",
    },
    {
      speaker: 'Nurse',
      at: '20:30',
      text: 'EBL 140 mL. 1,100 mL crystalloid, no blood products. Counts correct.',
    },
    {
      speaker: 'Provider',
      at: '21:05',
      text: 'Post-op: CBC every 8 hours, strict I&O, JP output daily, ambulate post-op day one, follow-up in 10 to 14 days with renal ultrasound.',
    },
  ],
  sections: (ctx) => [
    {
      heading: 'Procedure Summary',
      lines: [
        `PATIENT: ${ctx.patient.firstName} ${ctx.patient.lastName} · DOB ${ctx.patient.dob} · MRN ${ctx.patient.mrn}`,
        `DATE OF SERVICE: ${ctx.dateOfService}`,
        'PREOPERATIVE DIAGNOSIS: Blunt flank trauma with CT evidence of left retroperitoneal hematoma and suspected left renal laceration.',
        "POSTOPERATIVE DIAGNOSIS: Left retroperitoneal/perirenal hematoma, intact Gerota's fascia, no active arterial renal hemorrhage or deep parenchymal collecting system disruption.",
        'PROCEDURE PERFORMED: Left renal exploration via retroperitoneal flank approach, not necessitating other specific procedure.',
        `SURGEON: ${ctx.provider.name}, ${ctx.provider.credentials}`,
        'ASSISTANT: Elena Brooks, MD',
        'ANESTHESIA: General endotracheal anesthesia.',
        'ESTIMATED BLOOD LOSS: 140 mL.',
        'FLUIDS / TRANSFUSION: 1,100 mL crystalloid; no blood products administered.',
        'DRAINS: 19-Fr Jackson-Pratt (JP) suction drain placed in the left retroperitoneal space.',
      ],
    },
    {
      heading: 'Indication for Procedure',
      lines: [
        `The patient is a ${ctx.age}-year-old individual who sustained blunt force trauma to the left flank. Admission CT imaging demonstrated a substantial left perirenal hematoma with suspicion of a high-grade renal laceration or vascular injury. Due to persistent left flank pain, drop in hematocrit, and equivocal radiological findings regarding active parenchymal extravasation, open surgical retroperitoneal exploration of the left kidney was indicated to ensure vascular integrity and rule out active urinary extravasation. Written informed consent was obtained.`,
      ],
    },
    {
      heading: 'Procedure in Detail',
      lines: [
        'After successful induction of general endotracheal anesthesia, the patient was positioned in the right lateral decubitus position with the table flexed to widen the left costoiliac space. The left flank was prepped and draped in standard sterile fashion.',
        '• Incision & exposure: A standard subcostal flank incision was made extending from the posterior axillary line toward the rectus sheath. The external oblique, internal oblique, and transversus abdominis muscles were sequentially divided using electrocautery.',
        "• Retroperitoneal mobilization & exploration: The retroperitoneal space was entered extraperitoneally, reflecting the peritoneal sac medially. Gerota's fascia was identified and incised longitudinally. A moderate non-expanding perirenal hematoma was identified and carefully evacuated using gentle suction and irrigation.",
        '• Renal assessment: The left kidney was completely mobilized and inspected on all surfaces. A minor superficial cortical contusion/capsular tear (<1 cm) was identified at the lower pole with no active arterial bleeding. The main left renal artery, renal vein, and ureter were directly visualized and found to be fully intact. No urine extravasation, major parenchymal disruption, or collecting system injury was identified.',
        '• Hemostasis & closure: Copious warm saline irrigation was performed. Topical hemostatic agents (oxidized regenerated cellulose) were applied over the superficial lower pole capsular tear. Excellent dry hemostasis was verified. No arterial ligation, partial/total nephrectomy, nephrorrhaphy, or pyeloplasty was required.',
        "• Drainage & layered closure: A 19-Fr Jackson-Pratt drain was positioned adjacent to the lower pole and brought out through a separate stab incision. Gerota's fascia was loosely reapproximated. The flank musculature was closed in layers using 0-PDS; subcutaneous tissues with 3-0 Vicryl; skin with surgical staples.",
      ],
    },
    {
      heading: 'Postoperative Plan / Follow-up',
      lines: [
        '• Monitoring: Serial CBC every 8 hours; continuous vital sign and urine output monitoring.',
        '• Drain care: JP output recorded daily; removal when output drops below 30 mL/24 hours.',
        '• Mobilization: Early ambulation starting postop day 1; incentive spirometry.',
        '• Follow-up: Outpatient visit in 10–14 days for wound inspection, staple removal, and repeat renal ultrasound.',
      ],
    },
  ],
  procedures: [
    {
      code: '50010',
      kind: 'CPT',
      description: 'Renal exploration, not necessitating other specific procedures',
      modifiers: ['LT'],
      units: 1,
      charge: 4850,
      dxPointers: [1, 2, 3],
      confidence: 0.94,
    },
    {
      code: '99223',
      kind: 'CPT',
      description: 'Initial hospital inpatient care, high MDM (decision for surgery)',
      modifiers: ['57'],
      units: 1,
      charge: 640,
      dxPointers: [1, 3],
      confidence: 0.88,
    },
  ],
  diagnoses: [
    { code: 'S37.022A', description: 'Minor laceration of left kidney, initial encounter', confidence: 0.91 },
    { code: 'S37.012A', description: 'Minor contusion of left kidney, initial encounter', confidence: 0.9 },
    { code: 'D62', description: 'Acute posthemorrhagic anemia', confidence: 0.84 },
  ],
}

const CLINIC_RLQ: ClinicalTemplate = {
  title: 'Clinical note',
  transcript: rlqTranscript,
  sections: (ctx) =>
    rlqSections({
      patientName: `${ctx.patient.firstName} ${ctx.patient.lastName}`,
      dob: ctx.patient.dob,
      mrn: ctx.patient.mrn,
      dateOfService: ctx.dateOfService,
      physician: `${ctx.provider.name}, ${ctx.provider.credentials}`,
    }),
  procedures: RLQ_PROCEDURES,
  diagnoses: RLQ_DIAGNOSES,
}

export const TEMPLATES: Record<TemplateId, ClinicalTemplate> = {
  'clinic-rlq-pain': CLINIC_RLQ,
  'er-viral-syndrome': ER_VIRAL,
  'er-chest-pain': ER_CHEST,
  'renal-exploration': RENAL,
}
