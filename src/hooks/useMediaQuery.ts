'use client'

import { useSyncExternalStore } from 'react'

export const useMediaQuery = (query: string, serverValue = true) =>
  useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => serverValue
  )

export const useIsDesktop = () => useMediaQuery('(min-width: 64rem)')
