'use client'

import { useEffect, useState } from 'react'
import { useDemoStore } from '@/demo/store'

export const useHydrated = (): boolean => {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    if (useDemoStore.persist.hasHydrated()) setHydrated(true)
    return useDemoStore.persist.onFinishHydration(() => setHydrated(true))
  }, [])
  return hydrated
}
