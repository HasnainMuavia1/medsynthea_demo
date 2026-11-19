'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { nextAutopilotAction } from '@/demo/autopilot'
import type { StepId } from '@/demo/types'

const STEP_DELAY_MS = 1400

export interface Autopilot {
  running: boolean
  label: string
  start: () => void
  stop: () => void
}

export const useAutopilot = (caseId: string, goTo: (step: StepId) => void): Autopilot => {
  const [running, setRunning] = useState(false)
  const [label, setLabel] = useState('')
  const timer = useRef<number | null>(null)
  const goToRef = useRef(goTo)
  goToRef.current = goTo

  const stop = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = null
    setRunning(false)
    setLabel('')
  }, [])

  const tick = useCallback(() => {
    const action = nextAutopilotAction(caseId)
    if (!action) {
      stop()
      return
    }
    setLabel(action.label)
    goToRef.current(action.step)
    timer.current = window.setTimeout(() => {
      action.run()
      timer.current = window.setTimeout(tick, 350)
    }, STEP_DELAY_MS)
  }, [caseId, stop])

  const start = useCallback(() => {
    setRunning(true)
    tick()
  }, [tick])

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current)
  }, [])

  return { running, label, start, stop }
}
