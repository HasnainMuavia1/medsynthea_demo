'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowUp, ClipboardList, FileSearch, PanelLeft, PanelLeftClose, Plus, Sparkles, Stethoscope } from 'lucide-react'
import { RcmPage } from '@/components/ui/Rcm/RcmLayout'
import { RcmBadge } from '@/components/ui/Rcm/RcmPrimitives'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input/Input'
import { Textarea } from '@/components/shared/Textarea'
import { BrandMark } from '@/components/ui/Rcm/ai-assistant/BrandMark'
import {
  AssistantThinking,
  AssistantThoughtSummary,
  thinkingDurationMs,
  thinkingSteps,
} from '@/components/demo/AssistantThinking'
import { answerQuestion, type AssistantAnswer } from '@/demo/assistant'
import { currentStep, fullName, isCaseClosed, isDenialOpen, money, paRequired, usDob } from '@/demo/engine'
import { stepMeta } from '@/demo/reference'
import { useDemoStore } from '@/demo/store'
import { ui } from '@/styles/ui'
import { cn } from '@/utils'

interface ChatMessage {
  role: 'user' | 'ai'
  text: string
  answer: AssistantAnswer | null
  shown: number
  thinking: boolean
  /** Thinking trace for assistant replies (absent on chats saved before it existed). */
  steps?: string[]
  thinkMs?: number
  thinkStartedAt?: number
}

interface Chat {
  id: string
  title: string
  updatedAt: string
  messages: ChatMessage[]
  contextPatientId: string | null
}

const STORAGE_KEY = 'medsynthea-demo-chats-v1'
const CHARS_PER_TICK = 3
const TICK_MS = 16

const QUICK_PROMPTS = [
  { id: 'claim-status', label: 'Claim status', prompt: 'How many claims do we have?', icon: ClipboardList },
  { id: 'eligibility', label: 'Eligibility', prompt: 'Eligibility of Emily Thompson', icon: FileSearch },
  { id: 'coding', label: 'Coding', prompt: 'Medical coding for Robert Nguyen', icon: Stethoscope },
  { id: 'denials', label: 'Denials', prompt: 'How many claims were denied?', icon: ClipboardList },
  { id: 'era', label: 'ERA', prompt: 'Has the ERA arrived for James Carter?', icon: FileSearch },
] as const

const newChat = (): Chat => ({ id: `chat_${Date.now()}`, title: 'New chat', updatedAt: new Date().toISOString(), messages: [], contextPatientId: null })

const toMarkdown = (a: AssistantAnswer): string => {
  if (!a.table) return a.text
  const { head, rows } = a.table
  const esc = (s: string) => s.replace(/\|/g, '/')
  return `${a.text}\n\n| ${head.map(esc).join(' | ')} |\n| ${head.map(() => '---').join(' | ')} |\n${rows.map((r) => `| ${r.map(esc).join(' | ')} |`).join('\n')}`
}

const loadChats = (): Chat[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) ? (parsed as Chat[]) : []
  } catch {
    return []
  }
}

const saveChats = (chats: Chat[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats.slice(0, 20)))
  } catch {
    // storage unavailable
  }
}

const streamTarget = (m: ChatMessage): number => m.answer?.text.length ?? m.text.length

const TypingDots = () => (
  <span className="inline-flex items-center gap-1" aria-hidden>
    {[0, 1, 2].map((i) => (
      <span key={i} className="size-1.5 motion-safe:animate-bounce rounded-full bg-muted-foreground [animation-duration:0.9s]" style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </span>
)

const AI_BUBBLE =
  'rounded-bl-sm bg-secondary text-foreground [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_table]:mt-2 [&_table]:w-full [&_table]:border-collapse [&_table]:text-2xs [&_th]:border [&_th]:border-border [&_th]:bg-background/50 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1'

const AiAssistantPage = () => {
  const patients = useDemoStore((s) => s.patients)
  const cases = useDemoStore((s) => s.cases)
  const [chats, setChats] = useState<Chat[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const [historyOpen, setHistoryOpen] = useState(() => typeof window === 'undefined' || window.matchMedia('(min-width: 48rem)').matches)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const first = newChat()
    setChats([first, ...loadChats().filter((c) => c.messages.length)])
    setActiveId(first.id)
  }, [])

  const active = chats.find((c) => c.id === activeId) ?? null
  const messages = active?.messages ?? []
  const busy = messages.some((m) => m.role === 'ai' && (m.thinking || m.shown < streamTarget(m)))

  useEffect(() => {
    if (!busy) return
    const t = window.setInterval(() => {
      setChats((cs) =>
        cs.map((c) =>
          c.id !== activeId
            ? c
            : { ...c, messages: c.messages.map((m) => (m.role === 'ai' && !m.thinking && m.shown < streamTarget(m) ? { ...m, shown: Math.min(streamTarget(m), m.shown + CHARS_PER_TICK) } : m)) }
        )
      )
    }, TICK_MS)
    return () => window.clearInterval(t)
  }, [busy, activeId])

  useEffect(() => {
    if (!busy && chats.length) saveChats(chats.filter((c) => c.messages.length))
  }, [busy, chats])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  const updateActive = (fn: (c: Chat) => Chat) => setChats((cs) => cs.map((c) => (c.id === activeId ? fn(c) : c)))

  const send = (raw?: string) => {
    const q = (raw ?? draft).trim()
    if (!q || !active || busy) return
    const { patients: ps, cases: cs } = useDemoStore.getState()
    const answer = answerQuestion(q, { patients: ps, cases: cs }, active.contextPatientId)
    const text = toMarkdown(answer)
    const steps = thinkingSteps(answer, ps, cs.length)
    const thinkMs = thinkingDurationMs(steps)
    setDraft('')
    updateActive((c) => ({
      ...c,
      title: c.title === 'New chat' ? q.slice(0, 48) : c.title,
      updatedAt: new Date().toISOString(),
      contextPatientId: answer.patientId ?? c.contextPatientId,
      messages: [...c.messages, { role: 'user', text: q, answer: null, shown: q.length, thinking: false }, { role: 'ai', text, answer, shown: 0, thinking: true, steps, thinkMs, thinkStartedAt: Date.now() }],
    }))
    window.setTimeout(() => updateActive((c) => ({ ...c, messages: c.messages.map((m, i) => (i === c.messages.length - 1 ? { ...m, thinking: false } : m)) })), thinkMs)
  }

  const startNewChat = () => {
    const fresh = newChat()
    setChats((cs) => [fresh, ...cs.filter((c) => c.messages.length)])
    setActiveId(fresh.id)
    inputRef.current?.focus()
  }

  const listed = chats.filter((c) => c.messages.length && c.title.toLowerCase().includes(search.trim().toLowerCase()))
  const ctxPatient = patients.find((p) => p.id === active?.contextPatientId) ?? null
  const ctxCase = ctxPatient ? (cases.find((c) => c.patientId === ctxPatient.id) ?? null) : null

  const extracted = useMemo<Record<string, string> | null>(() => {
    if (!ctxPatient) return null
    const base: Record<string, string> = {
      Patient: fullName(ctxPatient),
      MRN: ctxPatient.mrn,
      DOB: usDob(ctxPatient.dob),
      Payer: ctxPatient.insurance.payerName,
      'Member ID': ctxPatient.insurance.memberId,
    }
    if (!ctxCase) return { ...base, Stage: 'No appointment' }
    const step = stepMeta(currentStep(ctxCase))
    return {
      ...base,
      Encounter: ctxCase.encounterNumber,
      Stage: isCaseClosed(ctxCase) ? 'Reconciled' : `${step.number}. ${step.label}`,
      Eligibility: ctxCase.eligibility ? 'Active' : 'Not run',
      'Prior auth': paRequired(ctxCase) ? (ctxCase.priorAuth?.authNumber ?? 'Pending') : 'Not required',
      Claim: ctxCase.claim ? `${ctxCase.claim.claimId} · ${money(ctxCase.claim.totalCharge)}` : '—',
      'Claim status': isDenialOpen(ctxCase) ? `Denied ${ctxCase.denial?.code}` : ctxCase.era ? 'Paid' : ctxCase.claim?.submittedAt ? 'In process' : '—',
      ERA: ctxCase.era ? money(ctxCase.era.totalPaid) : 'Not received',
      EOB: ctxCase.eob ? ctxCase.eob.documentId : 'Not received',
    }
  }, [ctxPatient, ctxCase])

  const hasUser = messages.some((m) => m.role === 'user')
  const canSend = Boolean(draft.trim()) && !busy

  return (
    <RcmPage className="!pb-6">
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_var(--spacing-app-side-panel)]">
        <div className="relative flex h-ai-assistant-panel overflow-hidden rounded-card border border-border bg-card">
          <div className={cn('shrink-0 overflow-hidden transition-[width] duration-[180ms] ease-linear max-md:absolute max-md:inset-y-0 max-md:left-0 max-md:z-10 max-md:shadow-lg', historyOpen ? 'w-chat-history' : 'w-0')} aria-hidden={!historyOpen}>
            {historyOpen ? (
              <nav aria-label="Chat history" className="flex h-full w-chat-history shrink-0 flex-col border-r border-border bg-secondary/40 px-2.5 py-3 max-md:bg-secondary">
                <div className="mb-2 flex items-center gap-1.5">
                  <Button type="button" variant="primary" size="sm" className="h-8 flex-1 gap-1 text-xs" onClick={startNewChat} aria-label="New chat">
                    <Plus className="size-3.5" aria-hidden />
                    New chat
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" aria-label="Hide history" onClick={() => setHistoryOpen(false)}>
                    <PanelLeftClose className="size-4" />
                  </Button>
                </div>
                <Input id="rcm-chat-history-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chats" aria-label="Search chats" className="mb-2 h-8 bg-card px-2.5 text-sm" />
                <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
                  {listed.length === 0 ? (
                    <p className="px-1 py-6 text-center text-xs text-muted-foreground">{search.trim() ? 'No chats match your search.' : 'No chats yet.'}</p>
                  ) : (
                    <>
                      <div className="px-1.5 pb-1 pt-2 text-3xs font-semibold uppercase tracking-wide text-muted-foreground">Recent</div>
                      {listed.map((c) => (
                        <Button
                          key={c.id}
                          type="button"
                          variant="unstyled"
                          size="auto"
                          onClick={() => setActiveId(c.id)}
                          className={cn('flex w-full justify-start rounded-md px-2 py-1.5 text-left text-xs whitespace-normal', c.id === activeId ? 'bg-card font-medium text-foreground shadow-sm' : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground')}
                        >
                          <span className="line-clamp-1">{c.title}</span>
                        </Button>
                      ))}
                    </>
                  )}
                </div>
              </nav>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
              <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" aria-label={historyOpen ? 'Hide history' : 'Show history'} onClick={() => setHistoryOpen((v) => !v)}>
                <PanelLeft className="size-4" />
              </Button>
              <BrandMark className="size-7 rounded-md" />
              <div className="min-w-0 flex-1 truncate text-sm font-semibold">{!active || active.title === 'New chat' ? 'MedSynthea' : active.title}</div>
            </div>

            {!hasUser ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-8">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <BrandMark className="size-10 rounded-lg" />
                    <h1 className={cn(ui.typography.heroTitle, 'normal-case')}>What can I help with?</h1>
                    <p className={cn(ui.typography.heroDescription, 'max-w-md')}>
                      Ask about patients, appointments, eligibility, prior auth, coding, estimates, claims, denials, ERAs, EOBs or reconciliation. Typos are fine.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Suggested prompts">
                    {QUICK_PROMPTS.map((item) => {
                      const Icon = item.icon
                      return (
                        <Button key={item.id} type="button" variant="outline" size="sm" className="h-9 gap-1.5 rounded-full px-3 text-xs font-normal" onClick={() => send(item.prompt)}>
                          <Icon className="size-3.5 shrink-0" aria-hidden />
                          <span className="min-w-0 truncate">{item.label}</span>
                        </Button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="custom-scrollbar flex flex-1 flex-col gap-2.5 overflow-y-auto p-4" data-testid="chat-log">
                {messages.map((m, i) => {
                  const done = m.role === 'ai' && !m.thinking && m.shown >= streamTarget(m)
                  return (
                    <div
                      key={i}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      data-role={m.role === 'ai' ? 'assistant' : 'user'}
                      data-done={m.role === 'ai' ? String(done) : undefined}
                      data-intent={m.answer?.intent}
                    >
                      {m.role === 'ai' && (
                        <span className="mr-2 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-pill-green-bg text-primary">
                          <Sparkles className="size-3" aria-hidden />
                        </span>
                      )}
                      <div className={`max-w-[92%] rounded-lg px-3 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'rounded-br-sm bg-foreground text-background whitespace-pre-wrap' : AI_BUBBLE}`}>
                        {m.role === 'ai' && m.thinking ? (
                          m.steps?.length && m.thinkMs && m.thinkStartedAt ? (
                            <AssistantThinking steps={m.steps} startedAt={m.thinkStartedAt} durationMs={m.thinkMs} />
                          ) : (
                            <span className="inline-flex items-center gap-2" role="status" aria-label="Assistant is thinking">
                              <TypingDots />
                            </span>
                          )
                        ) : m.role === 'ai' ? (
                          <div data-testid="answer-text">
                            {m.steps?.length && m.thinkMs ? <AssistantThoughtSummary steps={m.steps} durationMs={m.thinkMs} /> : null}
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{done ? m.text : m.text.slice(0, m.shown)}</ReactMarkdown>
                          </div>
                        ) : (
                          m.text
                        )}
                        {done && m.answer?.links?.length ? (
                          <div className="mt-2 flex flex-wrap gap-1.5 border-t border-border/60 pt-2">
                            {m.answer.links.map((l) => (
                              <Link
                                key={l.href + l.label}
                                href={l.href}
                                className="inline-flex h-7 items-center rounded-md border border-border bg-card px-2.5 text-xs font-medium text-foreground hover:border-primary/40 hover:text-primary"
                              >
                                {l.label}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                        {done && m.answer?.suggestions?.length ? (
                          <div className="mt-2 flex flex-wrap gap-1.5 border-t border-border/60 pt-2">
                            {m.answer.suggestions.map((s) => (
                              <Button key={s} type="button" variant="outline" size="sm" className="h-auto rounded-full px-2.5 py-1 text-2xs font-normal whitespace-normal" onClick={() => send(s)}>
                                {s}
                              </Button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
                <div ref={endRef} />
              </div>
            )}

            <div className="bg-card/40 p-4">
              <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
                <div className="rounded-3xl border bg-card p-3 shadow-card-sm border-primary/35 focus-within:border-primary/55">
                  <Textarea
                    id="rcm-ai-assistant-draft"
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        send()
                      }
                    }}
                    placeholder="Ask MedSynthea anything about claims, coding, or patients…"
                    aria-label="Message MedSynthea Assistant"
                    className="max-h-36 min-h-14 w-full resize-none border-0 bg-transparent p-1 text-base leading-relaxed outline-none focus:ring-0"
                  />
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-2xs text-muted-foreground">
                      {ctxPatient ? `Talking about ${fullName(ctxPatient)} — “this patient” refers to them` : 'Answers use live workspace data'}
                    </span>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-2xs text-muted-foreground">
                        <kbd className="rounded border border-border bg-muted/50 px-1 py-0.5 font-sans text-3xs">Enter</kbd> to send
                      </span>
                      <Button
                        type="button"
                        variant="unstyled"
                        size="icon"
                        onClick={() => send()}
                        disabled={!canSend}
                        aria-label="Send message"
                        className={cn(
                          'size-9 rounded-full transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-40 disabled:pointer-events-none',
                          canSend ? 'bg-primary text-primary-foreground hover:bg-primary-hover' : 'bg-muted text-muted-foreground'
                        )}
                      >
                        <ArrowUp className="size-4 shrink-0" aria-hidden />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-border bg-card sticky top-17.5">
          <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
            <div className="min-w-0">
              <div className="text-sm font-semibold">Extracted patient{ctxPatient ? ` · ${fullName(ctxPatient)}` : ''}</div>
              <div className="text-xs text-muted-foreground">{ctxPatient ? 'Live from your workspace' : 'Review and confirm before saving'}</div>
            </div>
            {extracted && <RcmBadge tone="blue">98% confident</RcmBadge>}
          </div>
          <div className="p-4">
            {!extracted ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="flex size-10 items-center justify-center rounded-full bg-secondary mx-auto mb-2.5">
                  <Sparkles className="size-4" />
                </div>
                <div className="text-sm font-medium text-foreground">Nothing extracted yet</div>
                <div className="text-xs mt-1">Ask about a patient to see their details here.</div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {Object.entries(extracted).map(([k, v]) => (
                  <div key={k} className="flex gap-2.5 items-start">
                    <div className="w-24 text-2xs uppercase tracking-wide text-muted-foreground pt-1.5 shrink-0">{k}</div>
                    <Input key={`${k}:${v}`} id={`rcm-ai-extracted-${k}`} className="h-7.5 flex-1 bg-card py-0 px-2.5 focus:border-primary" defaultValue={v} aria-label={k} readOnly />
                  </div>
                ))}
                {ctxCase && ctxPatient ? (
                  <div className="flex justify-end gap-2 mt-2">
                    <Button href={`/dashboard/patients/${ctxPatient.id}`} variant="default" size="sm">
                      Patient
                    </Button>
                    <Button href={`/dashboard/cases/${ctxCase.id}`} variant="primary" size="sm">
                      Open encounter
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </RcmPage>
  )
}

export default AiAssistantPage
