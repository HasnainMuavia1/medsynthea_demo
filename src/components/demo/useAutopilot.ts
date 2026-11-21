'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { nextAutopilotAction, type AutopilotMode } from '@/demo/autopilot'
import { setToastsMuted } from '@/demo/store'
import type { StepId } from '@/demo/types'

const STEP_DELAY_MS = 1400
const BETWEEN_STEPS_MS = 350

export interface Autopilot {
  running: boolean
  mode: AutopilotMode | null
  label: string
  start: (mode: AutopilotMode) => void
  stop: () => void
}

export const useAutopilot = (caseId: string, goTo: (step: StepId) => void): Autopilot => {
  const [mode, setMode] = useState<AutopilotMode | null>(null)
  const [label, setLabel] = useState('')
  const timer = useRef<number | null>(null)
  // Each start() gets a new run id; any timer from an older run sees a mismatch and does nothing.
  const runId = useRef(0)
  const goToRef = useRef(goTo)
  goToRef.current = goTo

  const clearTimer = () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = null
  }

  const stop = useCallback(() => {
    runId.current += 1
    clearTimer()
    setToastsMuted(false)
    setMode(null)
    setLabel('')
  }, [])

  const start = useCallback(
    (nextMode: AutopilotMode) => {
      runId.current += 1
      const id = runId.current
      clearTimer()
      setToastsMuted(true)
      setMode(nextMode)

      const tick = () => {
        if (id !== runId.current) return
        const action = nextAutopilotAction(caseId, nextMode)
        if (!action) {
          stop()
          return
        }
        setLabel(action.label)
        goToRef.current(action.step)
        timer.current = window.setTimeout(() => {
          if (id !== runId.current) return
          action.run()
          timer.current = window.setTimeout(tick, BETWEEN_STEPS_MS)
        }, STEP_DELAY_MS)
      }
      tick()
    },
    [caseId, stop]
  )

  // Leaving the encounter (or switching to another one) always stops autopilot.
  useEffect(() => stop, [caseId, stop])

  return { running: mode !== null, mode, label, start, stop }
}

const AutopilotContext = createContext<Autopilot | null>(null)
export const AutopilotProvider = AutopilotContext.Provider
export const useAutopilotControls = (): Autopilot | null => useContext(AutopilotContext)
