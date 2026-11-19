import {
  Activity,
  BadgeDollarSign,
  CalendarPlus,
  ClipboardCheck,
  FileAudio,
  FileCheck2,
  FileSearch,
  FileText,
  Landmark,
  type LucideIcon,
  MessageSquareText,
  Receipt,
  Scale,
  Send,
  ShieldCheck,
  UserPlus,
} from 'lucide-react'
import type { Provider, StepId, TemplateId } from './types'

export interface PayerProfile {
  id: string
  name: string
  planName: string
  payerIdCode: string
  allowedRatio: number
  deductible: number
  deductibleMet: number
  oopMax: number
  oopMet: number
  coinsurancePct: number
  erCopay: number
  surgeryCopay: number
  officeCopay: number
  phone: string
  portal: string
}

export const PAYERS: PayerProfile[] = [
  {
    id: 'aetna',
    phone: '1-800-555-0144',
    portal: 'provider-portal.example/aetna',
    name: 'Aetna',
    planName: 'Aetna Choice POS II',
    payerIdCode: '60054',
    allowedRatio: 0.62,
    deductible: 1500,
    deductibleMet: 1150,
    oopMax: 6000,
    oopMet: 1480,
    coinsurancePct: 20,
    erCopay: 150,
    surgeryCopay: 0,
    officeCopay: 30,
  },
  {
    id: 'bcbstx',
    phone: '1-800-555-0177',
    portal: 'provider-portal.example/bcbstx',
    name: 'Blue Cross Blue Shield of Texas',
    planName: 'BlueChoice PPO',
    payerIdCode: '84980',
    allowedRatio: 0.58,
    deductible: 2000,
    deductibleMet: 1700,
    oopMax: 7500,
    oopMet: 2210,
    coinsurancePct: 20,
    erCopay: 250,
    surgeryCopay: 0,
    officeCopay: 35,
  },
  {
    id: 'uhc',
    phone: '1-877-555-0142',
    portal: 'provider-portal.example/uhc',
    name: 'UnitedHealthcare',
    planName: 'Choice Plus',
    payerIdCode: '87726',
    allowedRatio: 0.6,
    deductible: 1000,
    deductibleMet: 1000,
    oopMax: 5000,
    oopMet: 2950,
    coinsurancePct: 10,
    erCopay: 200,
    surgeryCopay: 0,
    officeCopay: 30,
  },
  {
    id: 'cigna',
    phone: '1-800-555-0188',
    portal: 'provider-portal.example/cigna',
    name: 'Cigna Healthcare',
    planName: 'Open Access Plus',
    payerIdCode: '62308',
    allowedRatio: 0.57,
    deductible: 2500,
    deductibleMet: 2200,
    oopMax: 8000,
    oopMet: 2600,
    coinsurancePct: 30,
    erCopay: 300,
    surgeryCopay: 0,
    officeCopay: 40,
  },
  {
    id: 'medicare',
    phone: '1-855-555-0132',
    portal: 'provider-portal.example/medicare',
    name: 'Medicare Part B',
    planName: 'Original Medicare',
    payerIdCode: '04412',
    allowedRatio: 0.45,
    deductible: 257,
    deductibleMet: 257,
    oopMax: 0,
    oopMet: 0,
    coinsurancePct: 20,
    erCopay: 0,
    surgeryCopay: 0,
    officeCopay: 0,
  },
]

export const payerById = (id: string): PayerProfile => PAYERS.find((p) => p.id === id) ?? PAYERS[0]

export const PROVIDERS: Provider[] = [
  {
    id: 'prv-4',
    name: 'Adam Advert',
    credentials: 'MD',
    specialty: 'Family Medicine',
    npi: '1467583920',
  },
  {
    id: 'prv-1',
    name: 'Daniel Okafor',
    credentials: 'MD',
    specialty: 'Emergency Medicine',
    npi: '1386749201',
  },
  {
    id: 'prv-2',
    name: 'Priya Raman',
    credentials: 'MD',
    specialty: 'Emergency Medicine',
    npi: '1720458836',
  },
  {
    id: 'prv-3',
    name: 'Marcus Whitfield',
    credentials: 'MD, FACS',
    specialty: 'Urology / Trauma Surgery',
    npi: '1902263347',
  },
]

export const providerById = (id: string): Provider =>
  PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0]

export const PRACTICE = {
  name: 'Lakeside Emergency & Surgical Center',
  shortName: 'Lakeside ER',
  address: '4120 Medical Pkwy, Austin, TX 78756',
  phone: '(512) 555-0142',
  taxId: '74-3920185',
  groupNpi: '1558320947',
  clearinghouse: 'Stedi Clearinghouse',
}

export const DEMO_ACCOUNT = {
  email: 'medsynthea-demo@medsynthea.com',
  password: 'med@1122',
  name: 'Adam Advert',
  role: 'Physician · Family Medicine',
}

export interface VisitTypeMeta {
  id: TemplateId
  label: string
  short: string
  defaultProviderId: string
  defaultReason: string
  location: string
  durationSec: number
}

export const VISIT_TYPES: VisitTypeMeta[] = [
  {
    id: 'clinic-rlq-pain',
    label: 'Office visit — right lower quadrant abdominal pain',
    short: 'Office visit · RLQ abdominal pain',
    defaultProviderId: 'prv-4',
    defaultReason: 'Right lower abdominal pain for about 1 week',
    location: 'Primary Care Clinic — Exam 3',
    durationSec: 582,
  },
  {
    id: 'er-viral-syndrome',
    label: 'Emergency visit — fever, cough & body aches',
    short: 'ER visit · Viral syndrome',
    defaultProviderId: 'prv-1',
    defaultReason: 'Fever, persistent cough and generalized body aches for 2 days',
    location: 'Freestanding ER — Bay 4',
    durationSec: 734,
  },
  {
    id: 'er-chest-pain',
    label: 'Emergency visit — acute chest pain',
    short: 'ER visit · Chest pain',
    defaultProviderId: 'prv-2',
    defaultReason: 'Retrosternal chest pressure radiating to left jaw and shoulder',
    location: 'Freestanding ER — Resus 1',
    durationSec: 912,
  },
  {
    id: 'renal-exploration',
    label: 'Surgery — left renal exploration (blunt flank trauma)',
    short: 'Surgery · Renal exploration',
    defaultProviderId: 'prv-3',
    defaultReason: 'Blunt left flank trauma with retroperitoneal hematoma on CT',
    location: 'Main OR — Suite 2',
    durationSec: 1286,
  },
]

export const visitTypeById = (id: TemplateId): VisitTypeMeta =>
  VISIT_TYPES.find((v) => v.id === id) ?? VISIT_TYPES[0]

export interface StepMeta {
  id: StepId
  number: number
  label: string
  short: string
  description: string
  icon: LucideIcon
  agent: string
}

export const STEPS: StepMeta[] = [
  {
    id: 'registration',
    number: 1,
    label: 'Patient registration',
    short: 'Registration',
    description: 'Demographics and insurance captured in the patient registry.',
    icon: UserPlus,
    agent: 'Intake Agent',
  },
  {
    id: 'appointment',
    number: 2,
    label: 'Appointment scheduling',
    short: 'Appointment',
    description: 'Visit booked with provider, location and visit type.',
    icon: CalendarPlus,
    agent: 'Scheduling Agent',
  },
  {
    id: 'eligibility',
    number: 3,
    label: 'Eligibility & prior auth',
    short: 'Eligibility & PA',
    description: 'Real-time 270/271 benefits check and prior authorization when required.',
    icon: ShieldCheck,
    agent: 'Eligibility Agent',
  },
  {
    id: 'audio',
    number: 4,
    label: 'Encounter audio upload',
    short: 'Audio upload',
    description: 'Ambient recording of the provider–patient encounter.',
    icon: FileAudio,
    agent: 'Capture Agent',
  },
  {
    id: 'transcription',
    number: 5,
    label: 'Transcription',
    short: 'Transcription',
    description: 'Speaker-separated, time-stamped transcript.',
    icon: MessageSquareText,
    agent: 'Transcription Agent',
  },
  {
    id: 'note',
    number: 6,
    label: 'Clinical note generation',
    short: 'Clinical note',
    description: 'Structured clinical documentation drafted from the transcript.',
    icon: FileText,
    agent: 'Documentation Agent',
  },
  {
    id: 'coding',
    number: 7,
    label: 'Medical coding',
    short: 'Coding',
    description: 'CPT, HCPCS and ICD-10-CM codes with modifiers and units.',
    icon: ClipboardCheck,
    agent: 'Coding Agent',
  },
  {
    id: 'estimate',
    number: 8,
    label: 'Patient estimate',
    short: 'Patient estimate',
    description: 'Patient responsibility vs. expected insurance payment.',
    icon: BadgeDollarSign,
    agent: 'Estimate Agent',
  },
  {
    id: 'denial',
    number: 9,
    label: 'Denial prevention',
    short: 'Denial agent',
    description: 'Pre-submission scrub for denial risk.',
    icon: Scale,
    agent: 'Denial Prevention Agent',
  },
  {
    id: 'claim',
    number: 10,
    label: 'Claim creation',
    short: 'Claim',
    description: '837P professional claim built and scrubbed.',
    icon: FileSearch,
    agent: 'Claims Agent',
  },
  {
    id: 'submission',
    number: 11,
    label: 'Claim submission',
    short: 'Submission',
    description: 'Transmitted to the payer through the clearinghouse.',
    icon: Send,
    agent: 'Claims Agent',
  },
  {
    id: 'status',
    number: 12,
    label: 'Claim status',
    short: 'Claim status',
    description: '999 / 277CA acknowledgments and adjudication status.',
    icon: Activity,
    agent: 'Status Agent',
  },
  {
    id: 'era',
    number: 13,
    label: 'ERA received',
    short: 'ERA (835)',
    description: 'Electronic remittance advice from the payer.',
    icon: Receipt,
    agent: 'Remittance Agent',
  },
  {
    id: 'eob',
    number: 14,
    label: 'EOB available',
    short: 'EOB',
    description: 'Explanation of benefits document for the claim.',
    icon: FileCheck2,
    agent: 'Remittance Agent',
  },
  {
    id: 'reconciliation',
    number: 15,
    label: 'Account reconciliation',
    short: 'Reconciliation',
    description: 'Payment posting, patient balance and deposit match.',
    icon: Landmark,
    agent: 'Posting Agent',
  },
]

export const stepMeta = (id: StepId): StepMeta => STEPS.find((s) => s.id === id) ?? STEPS[0]

export const US_STATES = ['TX', 'CA', 'FL', 'NY', 'IL', 'AZ', 'GA', 'NC', 'WA', 'CO']
