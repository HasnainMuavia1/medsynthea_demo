import { useEffect, useState } from 'react'

/** Delay overlay/global loaders only. Do not use this to gate replace-mode children. */
export const useDelayedLoading = (isLoading: boolean, delayMs = 280) => {
  const [elapsed, setElapsed] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      // Defer clear so we never call setState synchronously inside the effect body.
      const clear = window.setTimeout(() => setElapsed(false), 0)
      return () => window.clearTimeout(clear)
    }

    const timer = window.setTimeout(() => setElapsed(true), delayMs)
    return () => window.clearTimeout(timer)
  }, [isLoading, delayMs])

  return isLoading && elapsed
}

/**
 * Keeps loading UI visible for the whole active phase (e.g. job polling).
 * While `active` is true, show immediately; after it flips off, hold briefly then hide.
 */
export const useSustainedLoading = (active: boolean, releaseDelayMs = 350) => {
  const [holdAfterActive, setHoldAfterActive] = useState(false)

  useEffect(() => {
    if (active) {
      const arm = window.setTimeout(() => setHoldAfterActive(true), 0)
      return () => window.clearTimeout(arm)
    }

    const release = window.setTimeout(() => setHoldAfterActive(false), releaseDelayMs)
    return () => window.clearTimeout(release)
  }, [active, releaseDelayMs])

  return active || holdAfterActive
}
