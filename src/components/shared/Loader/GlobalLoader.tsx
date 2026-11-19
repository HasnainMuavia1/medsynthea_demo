import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useUIStore } from '@/store/uiStore'
import { LoadingOverlay } from './LoadingOverlay'
import { Loader } from './Loader'

const MAIN_CONTENT_ID = 'main-content'

export const GlobalLoader: React.FC = () => {
  const { isLoading, label, description, scope } = useUIStore((state) => state.loading)

  if (!isLoading) return null

  const mainHost = typeof document !== 'undefined' ? document.getElementById(MAIN_CONTENT_ID) : null

  if (scope === 'fullscreen') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-9999 flex items-center justify-center bg-background/50 backdrop-blur-md"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader
            variant="fullscreen"
            size="lg"
            label={label || 'Loading...'}
            description={description || 'Please wait a moment'}
          />
        </motion.div>
      </AnimatePresence>
    )
  }

  if (!mainHost) return null

  return createPortal(
    <LoadingOverlay
      label={label || 'Working on it'}
      description={description || 'This may take a moment…'}
      size="md"
      className="rounded-none"
      blockInteraction
    />,
    mainHost
  )
}
