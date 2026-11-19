'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Bot, CheckCircle2, FileX, Headphones, Loader2, Mic, MicOff, Pause, Phone, PhoneCall, PhoneOff, SkipForward, User } from 'lucide-react'
import { RcmPage } from '@/components/ui/Rcm/RcmLayout'
import { Button } from '@/components/shared/Button'
import { Badge } from '@/components/shared/Badge'
import { AgentProgress, DoneBanner, EmptyHint, KeyValueGrid, SectionCard, useFakeRun } from '@/components/demo/DemoUi'
import { WebPortalSubmission } from '@/components/demo/WebPortalSubmission'
import { caseHref } from '@/components/demo/caseLinks'
import { buildCallScript, type ArAction, type ScriptLine } from '@/demo/arScripts'
import { formatDuration, fullName, money, newId } from '@/demo/engine'
import { payerById } from '@/demo/reference'
import { useCase, useDemoStore, usePatient } from '@/demo/store'
import { ui } from '@/styles/ui'
import { cn } from '@/utils'

const SPEEDS = [1, 2, 4] as const
type Speed = (typeof SPEEDS)[number]
type Phase = 'ready' | 'live' | 'ended'

const SPEAKER_STYLE: Record<ScriptLine['speaker'], { label: string; tone: string; icon: typeof Bot }> = {
  IVR: { label: 'Payer IVR', tone: ui.tone.gray, icon: Phone },
  Agent: { label: 'MedSynthea AR agent', tone: ui.tone.green, icon: Bot },
  Rep: { label: 'Payer representative', tone: ui.tone.blue, icon: User },
  System: { label: 'System', tone: ui.tone.yellow, icon: PhoneCall },
}

const WAVE_BARS = Array.from({ length: 28 }, (_, i) => i)

const CallPage = () => {
  const { caseId } = useParams<{ caseId: string }>()
  const c = useCase(caseId)
  const patient = usePatient(c?.patientId ?? null)
  const logArCall = useDemoStore((s) => s.logArCall)
  const resolveDenial = useDemoStore((s) => s.resolveDenial)
  const expediteClaim = useDemoStore((s) => s.expediteClaim)
  const scheduleFollowUp = useDemoStore((s) => s.scheduleFollowUp)

  const script = useMemo(() => (c && patient ? buildCallScript(c, patient) : null), [c?.id, patient?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const [phase, setPhase] = useState<Phase>('ready')
  const [lineIndex, setLineIndex] = useState(0)
  const [chars, setChars] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [speed, setSpeed] = useState<Speed>(2)
  const [muted, setMuted] = useState(false)
  const [actionDone, setActionDone] = useState<string | null>(null)
  const [portalAction, setPortalAction] = useState(false)
  const run = useFakeRun(2200, ['Building corrected 837P (frequency code 7)…', 'Correcting subscriber DOB…', 'Transmitting to clearinghouse…'])
  const logged = useRef(false)
  const scroller = useRef<HTMLDivElement>(null)

  const lines = script?.lines ?? []
  const current = lines[lineIndex]

  useEffect(() => {
    if (phase !== 'live') return
    const t = window.setInterval(() => setElapsed((e) => e + 1), 1000 / speed)
    return () => window.clearInterval(t)
  }, [phase, speed])

  useEffect(() => {
    if (phase !== 'live' || !current) return
    let t: number
    if (chars < current.text.length) {
      t = window.setTimeout(() => setChars((n) => Math.min(current.text.length, n + 3)), 22 / speed)
    } else {
      t = window.setTimeout(() => {
        if (lineIndex + 1 >= lines.length) setPhase('ended')
        else {
          setLineIndex((i) => i + 1)
          setChars(0)
        }
      }, ((current.pauseMs ?? 450) + (current.hold ? 600 : 0)) / speed)
    }
    return () => window.clearTimeout(t)
  }, [phase, current, chars, lineIndex, lines.length, speed])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [lineIndex, chars])

  useEffect(() => {
    if (phase !== 'ended' || logged.current || !script || !c) return
    logged.current = true
    logArCall(c.id, {
      id: newId('call'),
      startedAt: new Date().toISOString(),
      durationSec: Math.max(elapsed, 95),
      payerPhone: script.payerPhone,
      repName: script.repName,
      referenceNumber: script.referenceNumber,
      outcome: script.outcome,
      actionTaken: null,
      transcript: script.lines.map(({ speaker, text }) => ({ speaker, text })),
    })
  }, [phase, script, c, elapsed, logArCall])

  if (!c || !patient || !script) {
    return (
      <RcmPage>
        <EmptyHint icon={FileX} title="Claim not found" action={<Button href="/dashboard/ar" variant="outline" size="sm">Back to AR worklist</Button>} />
      </RcmPage>
    )
  }

  const payer = payerById(patient.insurance.payerId)
  const shown = phase === 'ready' ? [] : lines.slice(0, phase === 'ended' ? lines.length : lineIndex + 1)
  const extracted = shown
    .filter((l, i) => phase === 'ended' || i < lineIndex || chars >= l.text.length)
    .flatMap((l) => l.extract ?? [])
  const speaker = phase === 'live' ? current?.speaker : null
  const status =
    phase === 'ready' ? 'Ready to dial' : phase === 'ended' ? 'Call ended' : current?.speaker === 'System' ? 'Dialing…' : current?.hold ? 'On hold' : shown.some((l) => l.speaker === 'Rep') ? 'Connected — representative' : 'Navigating IVR'

  const takeAction = (action: ArAction) => {
    if (action.id === 'corrected_claim') {
      run.start(() => {
        resolveDenial(c.id, 'Corrected claim submitted (frequency code 7) with corrected subscriber DOB')
        setActionDone('Corrected claim submitted — status tracking resumed. Watch the notifications for payment.')
      })
    } else if (action.id === 'portal_records') {
      setPortalAction(true)
    } else if (action.id === 'expedite') {
      expediteClaim(c.id)
      setActionDone('Expedite confirmed — live status tracking resumed. Payment should post shortly.')
    } else {
      scheduleFollowUp(c.id, 'in 7 days')
      setActionDone('Follow-up call scheduled in 7 days.')
    }
  }

  return (
    <RcmPage>
      <Button href="/dashboard/ar" variant="link" size="sm" className={ui.interact.backLink}>
        <ArrowLeft className="size-3.5" aria-hidden />
        AR worklist
      </Button>
      <div className="mt-2 grid grid-cols-1 items-start gap-4 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_minmax(0,17rem)]">
        <div className="flex flex-col gap-3">
          <div className={cn(ui.surface.card, 'flex flex-col items-center gap-3 p-5 text-center')}>
            <div className={cn('relative flex size-20 items-center justify-center rounded-full border-2', phase === 'live' ? 'border-primary bg-primary/10' : 'border-border bg-secondary')}>
              {phase === 'live' ? <span className="absolute inset-0 animate-ping rounded-full border-2 border-primary/30" aria-hidden /> : null}
              <Headphones className={cn('size-8', phase === 'live' ? 'text-primary' : 'text-muted-foreground')} aria-hidden />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{payer.name}</div>
              <div className="font-mono text-xs text-muted-foreground">{script.payerPhone}</div>
            </div>
            <Badge tone={phase === 'live' ? 'green' : phase === 'ended' ? 'gray' : 'blue'} density="fit" dot>
              {status}
            </Badge>
            <div className="font-mono text-2xl font-semibold text-foreground">{formatDuration(elapsed)}</div>
            <div className="flex h-10 items-center gap-0.5" aria-hidden>
              {WAVE_BARS.map((i) => (
                <span
                  key={i}
                  className={cn('w-1 rounded-full', phase === 'live' && !current?.hold && !muted ? 'animate-pulse bg-primary' : 'bg-border')}
                  style={{ height: `${phase === 'live' && !current?.hold ? 20 + ((i * 37 + chars * 13) % 80) : 15}%`, animationDelay: `${(i % 7) * 90}ms` }}
                />
              ))}
            </div>
            {speaker ? <div className="text-2xs text-muted-foreground">Speaking: {SPEAKER_STYLE[speaker].label}</div> : null}
            {phase === 'ready' ? (
              <Button type="button" variant="primary" className="w-full" onClick={() => setPhase('live')}>
                <PhoneCall className="size-4" aria-hidden />
                Start call
              </Button>
            ) : phase === 'live' ? (
              <div className="flex w-full flex-col gap-2">
                <div className="flex justify-center gap-2">
                  <Button type="button" variant="outline" size="icon" aria-label={muted ? 'Unmute' : 'Mute'} onClick={() => setMuted((m) => !m)}>
                    {muted ? <MicOff className="size-4" aria-hidden /> : <Mic className="size-4" aria-hidden />}
                  </Button>
                  <Button type="button" variant="outline" size="icon" aria-label="Skip to end of call" onClick={() => setPhase('ended')}>
                    <SkipForward className="size-4" aria-hidden />
                  </Button>
                  <Button type="button" variant="destructive" size="icon" aria-label="End call" onClick={() => setPhase('ended')}>
                    <PhoneOff className="size-4" aria-hidden />
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xs text-muted-foreground">Speed</span>
                  {SPEEDS.map((s) => (
                    <Button key={s} type="button" size="sm" variant={s === speed ? 'primary' : 'outline'} className="h-6 px-2 text-2xs" onClick={() => setSpeed(s)}>
                      {s}×
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <SectionCard title="Claim" icon={PhoneCall}>
            <KeyValueGrid
              columns={2}
              items={[
                { label: 'Patient', value: fullName(patient) },
                { label: 'Claim', value: <span className="font-mono text-xs">{c.claim?.claimId}</span> },
                { label: 'Billed', value: money(c.claim?.totalCharge ?? 0) },
                { label: 'Purpose', value: script.purpose },
              ]}
            />
          </SectionCard>
        </div>

        <section className={cn(ui.surface.card, 'flex min-h-96 flex-col md:min-h-160')}>
          <div className={ui.surface.cardHeader}>
            <div className={ui.surface.iconBoxAccent}>
              <Bot className="size-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className={ui.typography.cardTitle}>Live transcript</div>
              <div className={ui.typography.cardSubtitle}>AR caller agent · {script.purpose}</div>
            </div>
            {phase === 'live' ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                <span className="size-2 animate-pulse rounded-full bg-destructive" aria-hidden />
                LIVE
              </span>
            ) : null}
          </div>
          <div ref={scroller} className="flex max-h-160 flex-1 flex-col gap-2.5 overflow-y-auto p-4 custom-scrollbar" aria-live="polite">
            {phase === 'ready' ? (
              <EmptyHint icon={PhoneCall} title="Ready to call the payer" hint={`The agent will navigate the ${payer.name} phone menu, wait on hold and talk to a representative about ${c.claim?.claimId}.`} />
            ) : null}
            {shown.map((line, i) => {
              const style = SPEAKER_STYLE[line.speaker]
              const Icon = style.icon
              const isCurrent = phase === 'live' && i === lineIndex
              const text = isCurrent ? line.text.slice(0, chars) : line.text
              const mine = line.speaker === 'Agent'
              return (
                <div key={i} className={cn('flex gap-2', mine && 'flex-row-reverse')}>
                  <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full border', style.tone)}>
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                  <div className={cn('max-w-[80%] rounded-card border px-3 py-2', mine ? 'border-pill-green-border bg-pill-green-bg' : 'border-border bg-card')}>
                    <div className="mb-0.5 flex items-center gap-2 text-2xs font-semibold text-muted-foreground">
                      {style.label}
                      {line.dtmf ? <span className="rounded border border-border bg-background px-1 font-mono">DTMF {line.dtmf}</span> : null}
                      {line.hold ? (
                        <span className="inline-flex items-center gap-1 text-warning">
                          <Pause className="size-3" aria-hidden />
                          hold music
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">
                      {text}
                      {isCurrent && chars < line.text.length ? <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-foreground align-middle" /> : null}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <div className="flex flex-col gap-3 md:col-span-2 2xl:col-span-1">
          <SectionCard title="Live extraction" subtitle="Fields captured during the call" icon={CheckCircle2}>
            {extracted.length === 0 ? (
              <div className="text-xs text-muted-foreground">Waiting for call details…</div>
            ) : (
              <dl className="flex flex-col gap-2">
                {extracted.map((e) => (
                  <div key={`${e.label}-${e.value}`} className={cn('rounded-md border px-2.5 py-1.5 animate-in fade-in', ui.tone.green)}>
                    <dt className="text-3xs font-semibold uppercase tracking-wide">{e.label}</dt>
                    <dd className="text-xs font-medium text-foreground">{e.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </SectionCard>
          {phase === 'ended' ? (
            <SectionCard title="Call summary" icon={Bot}>
              <div className="flex flex-col gap-3">
                <p className="text-xs leading-relaxed text-foreground">{script.outcome}</p>
                <div className="font-mono text-2xs text-muted-foreground">Ref {script.referenceNumber} · rep {script.repName}</div>
                {actionDone ? (
                  <Fragment>
                    <DoneBanner title="Action taken" detail={actionDone} />
                    <Button href={caseHref(c.id, 'status')} variant="primary" size="sm">
                      Open claim status
                    </Button>
                  </Fragment>
                ) : portalAction ? null : (
                  <Fragment>
                    <AgentProgress run={run} agent="Claims Agent" />
                    <div className={ui.typography.eyebrow}>Recommended actions</div>
                    {script.actions.map((a) => (
                      <Button
                        key={a.id}
                        type="button"
                        variant={a.primary ? 'primary' : 'outline'}
                        size="auto"
                        disabled={run.running}
                        className="flex h-auto flex-col items-start gap-0.5 px-3 py-2 text-left whitespace-normal"
                        onClick={() => takeAction(a)}
                      >
                        <span className="text-sm font-semibold">{a.label}</span>
                        <span className="text-2xs opacity-80">{a.description}</span>
                      </Button>
                    ))}
                  </Fragment>
                )}
              </div>
            </SectionCard>
          ) : phase === 'live' ? (
            <div className="flex items-center gap-2 rounded-card border border-border bg-card p-3 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Agent is on the call…
            </div>
          ) : null}
        </div>
      </div>
      {portalAction && !actionDone ? (
        <div className="mt-4">
          <SectionCard title="Uploading medical records" subtitle={`${payer.name} portal · claim attachments`} icon={Bot}>
            <WebPortalSubmission
              payerName={payer.name}
              portalUrl={payer.portal}
              formTitle="Claims — attachments & reconsideration"
              fields={[
                { label: 'Payer claim #', value: c.claim?.payerClaimControl ?? '' },
                { label: 'Member ID', value: patient.insurance.memberId },
                { label: 'Call reference', value: script.referenceNumber },
                { label: 'Document type', value: 'Medical record — operative report' },
              ]}
              attachments={[`${c.encounterNumber}-clinical-note.pdf`, 'CT-abdomen-report.pdf']}
              confirmationPrefix="ATTWEB"
              onDone={(conf) => {
                resolveDenial(c.id, `Medical records uploaded via payer portal (confirmation ${conf})`)
                setActionDone(`Records uploaded (confirmation ${conf}). Claim sent back for adjudication.`)
              }}
            />
          </SectionCard>
        </div>
      ) : null}
    </RcmPage>
  )
}

export default CallPage
