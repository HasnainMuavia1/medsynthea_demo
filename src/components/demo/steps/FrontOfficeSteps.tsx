'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { FileAudio, Mic, ShieldCheck, Upload } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { Badge } from '@/components/shared/Badge'
import { AgentProgress, DoneBanner, KeyValueGrid, useFakeRun } from '@/components/demo/DemoUi'
import { ageFrom, formatDate, formatDateTime, formatDuration, fullName, isStepDone, money, paRequired, usDob } from '@/demo/engine'
import { PRACTICE, payerById, providerById, visitTypeById } from '@/demo/reference'
import { useDemoStore } from '@/demo/store'
import { ui } from '@/styles/ui'
import { cn } from '@/utils'
import { PriorAuthPanel } from '@/components/demo/PriorAuthPanel'
import { ContinueButton, MiniTable, PanelShell, RawBlock, type StepPanelProps } from './shared'

export const RegistrationStep = ({ c, patient, goTo }: StepPanelProps) => (
  <PanelShell step="registration" actions={<ContinueButton from="registration" goTo={goTo} />}>
    <DoneBanner title={`${fullName(patient)} is registered`} detail={`${patient.mrn} · registered ${formatDateTime(patient.createdAt)}`} />
    <KeyValueGrid
      columns={4}
      items={[
        { label: 'Date of birth', value: `${usDob(patient.dob)} (${ageFrom(patient.dob)} y)` },
        { label: 'Sex', value: patient.sex },
        { label: 'Phone', value: patient.phone },
        { label: 'Email', value: patient.email || '—' },
        { label: 'Address', value: `${patient.address}, ${patient.city}, ${patient.state} ${patient.zip}` },
        { label: 'Payer', value: patient.insurance.payerName },
        { label: 'Member ID', value: <span className="font-mono">{patient.insurance.memberId}</span> },
        { label: 'Group', value: <span className="font-mono">{patient.insurance.groupNumber}</span> },
      ]}
    />
    <div>
      <Button href={`/dashboard/patients/${c.patientId}`} variant="outline" size="sm">
        Open patient profile
      </Button>
    </div>
  </PanelShell>
)

export const AppointmentStep = ({ c, goTo }: StepPanelProps) => {
  const { appointment } = c
  const provider = providerById(appointment.providerId)
  return (
    <PanelShell step="appointment" actions={<ContinueButton from="appointment" goTo={goTo} />}>
      <DoneBanner title="Appointment booked" detail={`${formatDate(`${appointment.date}T12:00:00`)} at ${appointment.time} · ${appointment.location}`} />
      <KeyValueGrid
        columns={3}
        items={[
          { label: 'Encounter #', value: <span className="font-mono">{c.encounterNumber}</span> },
          { label: 'Visit type', value: visitTypeById(appointment.visitType).label },
          { label: 'Provider', value: `Dr. ${provider.name}, ${provider.credentials}` },
          { label: 'Specialty', value: provider.specialty },
          { label: 'Rendering NPI', value: <span className="font-mono">{provider.npi}</span> },
          { label: 'Facility', value: PRACTICE.name },
          { label: 'Reason for visit', value: appointment.reason },
        ]}
      />
    </PanelShell>
  )
}

const ELIGIBILITY_STAGES = ['Building X12 270 inquiry…', 'Sending to payer through Stedi clearinghouse…', 'Parsing 271 benefits response…', 'Verifying demographics and plan dates…']

const Accumulator = ({ label, met, total }: { label: string; met: number; total: number }) => {
  const pct = total > 0 ? Math.min(100, (met / total) * 100) : 100
  return (
    <div className={cn(ui.surface.card, 'p-3')}>
      <div className="flex items-baseline justify-between gap-2">
        <span className={ui.typography.label}>{label}</span>
        <span className="text-xs text-muted-foreground">{total > 0 ? `${money(total - met)} remaining` : 'N/A'}</span>
      </div>
      <div className="mt-1.5 text-sm font-semibold text-foreground">
        {money(met)} <span className="font-normal text-muted-foreground">of {money(total)}</span>
      </div>
      <div className={cn(ui.progress.track, 'mt-2')}>
        <div className={ui.progress.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export const EligibilityStep = ({ c, patient, goTo }: StepPanelProps) => {
  const runEligibility = useDemoStore((s) => s.runEligibility)
  const run = useFakeRun(2800, ELIGIBILITY_STAGES)
  const [showRaw, setShowRaw] = useState(false)
  const started = useRef(false)
  const { eligibility } = c
  const payer = payerById(patient.insurance.payerId)

  useEffect(() => {
    if (eligibility || started.current) return
    started.current = true
    run.start(() => runEligibility(c.id))
  }, [eligibility, run, runEligibility, c.id])

  return (
    <PanelShell
      step="eligibility"
      actions={
        eligibility ? (
          <Fragment>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowRaw((v) => !v)}>
              {showRaw ? 'Hide' : 'View'} 271 response
            </Button>
            <ContinueButton from="eligibility" goTo={goTo} disabled={!isStepDone(c, 'eligibility')} />
          </Fragment>
        ) : null
      }
    >
      <AgentProgress run={run} agent="Eligibility Agent" />
      {eligibility ? (
        <Fragment>
          <DoneBanner
            title={`Coverage verified — ${payer.name} is active`}
            detail={`Checked ${formatDateTime(eligibility.checkedAt)} · trace ${eligibility.traceNumber} · ${paRequired(c) ? 'prior authorization required for CPT 50010' : 'no prior authorization required'}`}
          />
          <KeyValueGrid
            columns={4}
            items={[
              { label: 'Status', value: <Badge tone="green" density="fit" dot>Active coverage</Badge> },
              { label: 'Plan', value: payer.planName },
              { label: 'Plan period', value: `${formatDate(`${eligibility.planBegin}T12:00:00`)} – ${formatDate(`${eligibility.planEnd}T12:00:00`)}` },
              { label: 'Member', value: `${fullName(patient)} · ${patient.insurance.memberId}` },
              { label: 'Coinsurance', value: `${eligibility.coinsurancePct}%` },
              { label: 'ER copay', value: money(eligibility.copay) },
              { label: 'Network', value: 'In-network (PPO tier 1)' },
              { label: 'Prior auth', value: paRequired(c) ? (c.priorAuth?.status === 'approved' ? `Approved · ${c.priorAuth.authNumber}` : 'Required') : 'Not required' },
            ]}
          />
          <PriorAuthPanel c={c} patient={patient} />
          <div className="grid grid-cols-1 gap-3 @xl:grid-cols-2">
            <Accumulator label="Individual deductible" met={eligibility.deductibleMet} total={eligibility.deductible} />
            <Accumulator label="Out-of-pocket maximum" met={eligibility.oopMet} total={eligibility.oopMax} />
          </div>
          <MiniTable head={['Service category', 'In-network', 'Out-of-network']} rows={eligibility.benefits.map((b) => [b.label, b.inNetwork, b.outOfNetwork])} />
          {showRaw ? (
            <RawBlock
              text={[
                `ISA*00*          *00*          *ZZ*${payer.payerIdCode.padEnd(15)}*ZZ*MEDSYNTHEA     *${eligibility.checkedAt.slice(2, 10).replace(/-/g, '')}*1200*^*00501*000000917*0*P*:~`,
                'GS*HB*' + payer.payerIdCode + '*MEDSYNTHEA*20260101*1200*917*X*005010X279A1~',
                'ST*271*0001*005010X279A1~',
                `BHT*0022*11*${eligibility.traceNumber}*20260101*1200~`,
                `NM1*PR*2*${payer.name.toUpperCase()}*****PI*${payer.payerIdCode}~`,
                `NM1*1P*2*${PRACTICE.name.toUpperCase()}*****XX*${PRACTICE.groupNpi}~`,
                `NM1*IL*1*${patient.lastName.toUpperCase()}*${patient.firstName.toUpperCase()}****MI*${patient.insurance.memberId}~`,
                `DMG*D8*${patient.dob.replace(/-/g, '')}*${patient.sex === 'Male' ? 'M' : 'F'}~`,
                `EB*1*IND*30**${payer.planName.toUpperCase()}~`,
                `EB*C*IND*30***23*${eligibility.deductible}~`,
                `EB*C*IND*30***29*${eligibility.deductible - eligibility.deductibleMet}~`,
                `EB*A*IND*86***27**${eligibility.coinsurancePct / 100}~`,
                `EB*B*IND*86***27*${eligibility.copay}~`,
                `EB*G*IND*30***23*${eligibility.oopMax}~`,
                'SE*14*0001~',
              ].join('\n')}
            />
          ) : null}
        </Fragment>
      ) : null}
    </PanelShell>
  )
}

const WAVE = Array.from({ length: 72 }, (_, i) => 18 + Math.round(Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23)) * 70))

const Waveform = () => (
  <div className="flex h-14 items-center gap-0.5" aria-hidden>
    {WAVE.map((h, i) => (
      <span key={i} className="w-1 rounded-full bg-primary/60" style={{ height: `${h}%` }} />
    ))}
  </div>
)

const UPLOAD_STAGES = ['Uploading encrypted audio…', 'Verifying checksum…', 'Normalizing audio (16 kHz mono)…']

export const AudioStep = ({ c, goTo }: StepPanelProps) => {
  const uploadAudio = useDemoStore((s) => s.uploadAudio)
  const run = useFakeRun(2200, UPLOAD_STAGES)
  const inputRef = useRef<HTMLInputElement>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const { audio } = c
  const visit = visitTypeById(c.appointment.visitType)

  useEffect(() => () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl)
  }, [objectUrl])

  const handleFile = (file: File | null) => {
    if (!file) return
    setObjectUrl(URL.createObjectURL(file))
    run.start(() => uploadAudio(c.id, file.name, Math.round(file.size / 1024)))
  }

  return (
    <PanelShell step="audio" actions={audio ? <ContinueButton from="audio" goTo={goTo} /> : null}>
      <AgentProgress run={run} agent="Capture Agent" />
      {audio ? (
        <Fragment>
          <DoneBanner title="Encounter audio uploaded" detail={`${audio.fileName} · ${formatDuration(audio.durationSec)} · ${(audio.sizeKb / 1024).toFixed(1)} MB · ${formatDateTime(audio.uploadedAt)}`} />
          <div className={cn(ui.surface.card, 'flex items-center gap-4 p-4')}>
            <div className={ui.surface.iconBoxAccent}>
              <FileAudio className="size-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">{audio.fileName}</div>
              <div className="text-xs text-muted-foreground">
                {audio.source === 'sample' ? 'Ambient recording from exam room device' : 'Uploaded by user'} · AES-256 encrypted at rest
              </div>
              <Waveform />
            </div>
            <div className="font-mono text-sm text-muted-foreground">{formatDuration(audio.durationSec)}</div>
          </div>
          {objectUrl ? <audio controls src={objectUrl} className="w-full" /> : null}
        </Fragment>
      ) : run.running ? null : (
        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border bg-secondary/30 px-6 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-pill-green-bg text-primary">
            <Upload className="size-5" aria-hidden />
          </div>
          <div className="text-sm font-semibold text-foreground">Upload the encounter recording</div>
          <div className="max-w-md text-xs text-muted-foreground">
            MP3, M4A, WAV or WEBM — or use the exam room recording for this {visit.short} encounter.
          </div>
          <input ref={inputRef} type="file" accept="audio/*" className="sr-only" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
          <div className="flex gap-2">
            <Button type="button" variant="primary" size="sm" onClick={() => inputRef.current?.click()}>
              <Upload className="size-3.5" aria-hidden />
              Choose audio file
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => run.start(() => uploadAudio(c.id, null, null))}>
              <Mic className="size-3.5" aria-hidden />
              Use exam room recording
            </Button>
          </div>
        </div>
      )}
    </PanelShell>
  )
}

const TRANSCRIBE_STAGES = ['Speech-to-text (medical vocabulary)…', 'Separating speakers…', 'Aligning timestamps…', 'Redacting non-clinical chatter…']

const SPEAKER_TONE = { Provider: 'green', Patient: 'blue', Nurse: 'purple' } as const

export const TranscriptionStep = ({ c, goTo }: StepPanelProps) => {
  const transcribe = useDemoStore((s) => s.transcribe)
  const run = useFakeRun(3000, TRANSCRIBE_STAGES)
  const { transcript, audio } = c
  const words = transcript?.reduce((n, l) => n + l.text.split(/\s+/).length, 0) ?? 0

  return (
    <PanelShell
      step="transcription"
      actions={
        transcript ? (
          <ContinueButton from="transcription" goTo={goTo} />
        ) : (
          <Button type="button" variant="primary" size="sm" disabled={run.running} isLoading={run.running} onClick={() => run.start(() => transcribe(c.id))}>
            Transcribe recording
          </Button>
        )
      }
    >
      <AgentProgress run={run} agent="Transcription Agent" />
      {transcript ? (
        <Fragment>
          <DoneBanner title="Transcript ready" detail={`${transcript.length} utterances · ${words} words · ${new Set(transcript.map((t) => t.speaker)).size} speakers · 97.8% confidence`} />
          <div className="flex max-h-panel-scroll-lg flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
            {transcript.map((line, i) => (
              <div key={i} className="flex gap-3 rounded-card border border-border bg-card p-3">
                <span className="w-10 shrink-0 pt-0.5 font-mono text-2xs text-muted-foreground">{line.at}</span>
                <div className="min-w-0">
                  <Badge tone={SPEAKER_TONE[line.speaker]} density="fit">
                    {line.speaker}
                  </Badge>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">{line.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Fragment>
      ) : run.running ? null : (
        <div className="flex items-center gap-3 rounded-card border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden />
          Ready to transcribe {audio ? `${audio.fileName} (${formatDuration(audio.durationSec)})` : 'the recording'}. Audio is processed in a HIPAA-compliant environment.
        </div>
      )}
    </PanelShell>
  )
}
