'use client'

import { useEffect, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import {
  AppDialog,
  AppDialogActions,
  type AppDialogCloseReason,
  type AppDialogSize,
} from '@/components/shared/Dialog/AppDialog'
import { ui } from '@/styles/ui'
import { cn } from '@/utils'

export const ConfirmActionToneIcon = ({ tone }: ConfirmActionToneIconProps) => {
  return (
    <div
      className={cn(
        'flex size-11 items-center justify-center rounded-2xl',
        tone === 'destructive' ? 'bg-pill-red-bg text-destructive' : 'bg-pill-green-bg text-primary'
      )}
    >
      <AlertTriangle className="size-5" aria-hidden />
    </div>
  )
}

export const ConfirmActionDialog = ({
  open,
  title,
  description,
  icon,
  role = 'dialog',
  size = 'sm',
  isPending = false,
  confirmLabel,
  pendingLabel,
  cancelLabel = 'Cancel',
  destructive = false,
  confirmDisabled = false,
  cancelAutoFocus = false,
  onConfirm,
  onClose,
  children,
  bodyClassName,
}: ConfirmActionDialogProps) => {
  const showConfirm = Boolean(onConfirm) && confirmLabel != null

  useEffect(() => {
    if (!open) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose('dismiss')
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  return (
    <AppDialog
      open={open}
      role={role}
      title={title}
      description={description}
      icon={icon}
      onClose={onClose}
      closeDisabled={isPending}
      size={size}
      footer={
        <AppDialogActions>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => onClose('dismiss')}
            disabled={isPending}
            autoFocus={cancelAutoFocus || undefined}
          >
            {cancelLabel}
          </Button>
          {showConfirm ? (
            <Button
              type="button"
              variant={destructive ? 'destructive' : 'primary'}
              size="md"
              onClick={onConfirm}
              disabled={isPending || confirmDisabled}
              isLoading={isPending}
            >
              {isPending && pendingLabel ? pendingLabel : confirmLabel}
            </Button>
          ) : null}
        </AppDialogActions>
      }
    >
      {children ? <div className={bodyClassName ?? ui.layout.dialogForm}>{children}</div> : null}
    </AppDialog>
  )
}

export interface ConfirmActionToneIconProps {
  tone: 'destructive' | 'primary'
}

export interface ConfirmActionDialogProps {
  open: boolean
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  role?: 'dialog' | 'alertdialog'
  size?: AppDialogSize
  isPending?: boolean
  confirmLabel?: ReactNode
  pendingLabel?: ReactNode
  cancelLabel?: ReactNode
  destructive?: boolean
  confirmDisabled?: boolean
  cancelAutoFocus?: boolean
  onConfirm?: () => void
  onClose: (reason?: AppDialogCloseReason) => void
  children?: ReactNode
  bodyClassName?: string
}
