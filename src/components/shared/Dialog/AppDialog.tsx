'use client'

import { createContext, useContext, useId, useLayoutEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { cn } from '@/utils'
import { ui } from '@/styles/ui'

const APP_DIALOG_SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
} as const

const AppDialogHostOpenContext = createContext(true)

export const useAppDialogHostOpen = (): boolean => {
  return useContext(AppDialogHostOpenContext)
}

export const AppDialogActions = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  return (
    <div
      className={cn('flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-2', className)}
    >
      {children}
    </div>
  )
}

const lockBodyScroll = () => {
  const scrollY = window.scrollY
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'

  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`
  }

  return scrollY
}

const unlockBodyScroll = (scrollY: number) => {
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.width = ''
  document.body.style.paddingRight = ''
  window.scrollTo(0, scrollY)
}

export const AppDialog = ({
  open,
  title,
  description,
  supportingText,
  icon,
  headerActions,
  children,
  footer,
  onClose,
  closeOnBackdrop = true,
  showCloseButton,
  closeDisabled = false,
  role = 'dialog',
  size = 'lg',
}: AppDialogProps) => {
  const canDismiss = Boolean(onClose) && !closeDisabled
  const backdropCloses = closeOnBackdrop && canDismiss
  const renderClose = (showCloseButton ?? Boolean(onClose)) && Boolean(onClose)

  useLayoutEffect(() => {
    if (!open) return

    const scrollY = lockBodyScroll()
    return () => unlockBodyScroll(scrollY)
  }, [open])

  const idBase = useId()
  const titleId = `${idBase}-title`
  const descriptionId = `${idBase}-description`
  const headerEnd =
    headerActions || renderClose ? (
      <div className="flex shrink-0 items-start gap-2">
        {headerActions}
        {renderClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onClose?.('dismiss')}
            disabled={closeDisabled}
            className="size-10 rounded-full border border-border hover:border-primary/40"
            aria-label="Close dialog"
          >
            <X className="size-4" aria-hidden />
          </Button>
        ) : null}
      </div>
    ) : null

  // Keep children mounted while closed so backdrop dismiss can preserve draft form state.
  // Host-open context closes portaled Select / date menus (they render on document.body).
  return (
    <AppDialogHostOpenContext.Provider value={open}>
      <div
        className={cn(
          'fixed inset-0 z-160 flex items-center justify-center overflow-hidden p-4',
          !open && 'hidden'
        )}
        aria-hidden={!open}
      >
        <div
          className={cn('absolute inset-0', ui.surface.modalBackdrop)}
          onClick={backdropCloses ? () => onClose?.('backdrop') : undefined}
        />
        <div
          role={role}
          aria-modal={open ? true : undefined}
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          className={cn(
            ui.surface.modalPanel,
            ui.surface.modalPanelScroll,
            'rounded-xl border border-border bg-card shadow-xl',
            APP_DIALOG_SIZE_CLASSES[size]
          )}
        >
          <div className="sticky top-0 z-1 flex items-start gap-4 bg-card px-5 pt-5 sm:px-6 sm:pt-6">
            {icon ? <div className="mt-0.5 shrink-0">{icon}</div> : null}
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <h3
                    id={titleId}
                    className={cn(ui.typography.heroTitle, 'break-words [overflow-wrap:anywhere]')}
                  >
                    {title}
                  </h3>
                  {description ? (
                    <div
                      id={descriptionId}
                      className={cn(
                        ui.typography.sectionDescription,
                        'max-w-none whitespace-normal break-words [overflow-wrap:anywhere]'
                      )}
                    >
                      {description}
                    </div>
                  ) : null}
                </div>
                {headerEnd}
              </div>
              {supportingText ? <div className="mt-2">{supportingText}</div> : null}
            </div>
          </div>
          {children ? <div className="mt-4 px-5 sm:px-6">{children}</div> : null}
          {footer ? (
            <div className="sticky bottom-0 z-1 mt-5 border-t border-border bg-card px-5 py-4 sm:px-6">
              {footer}
            </div>
          ) : (
            <div className="h-5 sm:h-6" aria-hidden />
          )}
        </div>
      </div>
    </AppDialogHostOpenContext.Provider>
  )
}

export type AppDialogCloseReason = 'backdrop' | 'dismiss'

/** sm: confirmations · md: short forms · lg: multi-section forms (default) · xl: wide tables. */
export type AppDialogSize = keyof typeof APP_DIALOG_SIZE_CLASSES

interface AppDialogProps {
  open: boolean
  title: ReactNode
  description?: ReactNode
  supportingText?: ReactNode
  icon?: ReactNode
  headerActions?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  onClose?: (reason?: AppDialogCloseReason) => void
  closeOnBackdrop?: boolean
  /**
   * Circular header close (org-create style). Default true when `onClose` is set.
   * Calls `onClose('dismiss')`.
   */
  showCloseButton?: boolean
  closeDisabled?: boolean
  role?: 'dialog' | 'alertdialog'
  size?: AppDialogSize
}
