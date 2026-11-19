'use client'

import { useCallback } from 'react'
import type { AppDialogCloseReason } from './AppDialog'

type Options = {
  isPending?: boolean
  onDismissReset?: () => void
}

/**
 * Dialog close helper: backdrop keeps draft; dismiss runs reset then parent `onClose`.
 * Parent `onClose` may accept an optional reason (edit dialogs clear entity only on dismiss).
 */
export const useAppDialogClose = (
  onClose: (reason?: AppDialogCloseReason) => void,
  options: Options = {}
) => {
  const { isPending = false, onDismissReset } = options

  return useCallback(
    (reason: AppDialogCloseReason = 'dismiss') => {
      if (isPending) return
      if (reason === 'dismiss') onDismissReset?.()
      onClose(reason)
    },
    [isPending, onClose, onDismissReset]
  )
}
