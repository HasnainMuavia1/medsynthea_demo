import React, { useState, useRef, forwardRef, useId } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils'

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, children, className, containerClassName, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false)
    const [coords, setCoords] = useState({ x: 0, y: 0 })
    const tooltipRef = useRef<HTMLDivElement>(null)
    const tooltipId = useId()

    const handleMouseMove = (e: React.MouseEvent) => {
      const padding = 16
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      let x = e.clientX
      let y = e.clientY

      if (tooltipRef.current) {
        const tooltipRect = tooltipRef.current.getBoundingClientRect()
        const width = tooltipRect.width
        const height = tooltipRect.height

        if (x + width + padding > windowWidth) {
          if (x - width - padding > padding) {
            x = x - width - padding
          } else {
            x = Math.max(padding, windowWidth - width - padding)
          }
        } else {
          x = x + padding
        }

        if (y + height + padding > windowHeight) {
          y = Math.max(padding, y - height - padding)
        } else {
          y = y + padding
        }
      } else {
        x += 10
        y += 10
      }

      setCoords({ x, y })
    }

    const showTooltip = (e: React.MouseEvent | React.FocusEvent) => {
      setIsVisible(true)
      if ('clientX' in e) {
        handleMouseMove(e as React.MouseEvent)
      } else {
        // Fallback for keyboard focus
        const target = e.target as HTMLElement
        const rect = target.getBoundingClientRect()
        setCoords({ x: rect.left + rect.width / 2, y: rect.bottom + 10 })
      }
    }

    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center outline-none', containerClassName)}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setIsVisible(false)}
        onMouseMove={handleMouseMove}
        onFocus={showTooltip}
        onBlur={() => setIsVisible(false)}
        aria-describedby={isVisible ? tooltipId : undefined}
        {...props}
      >
        {children}
        {typeof document !== 'undefined'
          ? createPortal(
              <AnimatePresence>
                {isVisible && (
                  <motion.div
                    id={tooltipId}
                    role="tooltip"
                    ref={tooltipRef}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    style={{
                      position: 'fixed',
                      top: coords.y,
                      left: coords.x,
                      pointerEvents: 'none',
                    }}
                    className={cn(
                      'px-3 py-2',
                      'bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl',
                      'text-3xs font-medium text-foreground whitespace-normal z-9999',
                      'max-w-75 leading-relaxed break-words overflow-hidden',
                      className
                    )}
                  >
                    {content}
                  </motion.div>
                )}
              </AnimatePresence>,
              document.getElementById('portal-root') || document.body
            )
          : null}
      </div>
    )
  }
)
Tooltip.displayName = 'Tooltip'

export interface TooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  content: React.ReactNode
  children: React.ReactNode
  containerClassName?: string
}
