'use client'

import { useState } from 'react'

/** Sync draft when a dialog reopens so local state matches latest props (not mount-time values). */
export const useResetDraftOnOpen = (open: boolean, resetDraft: () => void): void => {
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      resetDraft()
    }
  }
}
