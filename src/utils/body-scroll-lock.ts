const MAIN_CONTENT_ID = 'main-content'

let lockCount = 0
let lockedScrollY = 0
let previousMainOverflow = ''

const getMainContent = () => {
  if (typeof document === 'undefined') return null
  return document.getElementById(MAIN_CONTENT_ID)
}

export const lockBodyScroll = () => {
  if (typeof document === 'undefined') return

  if (lockCount === 0) {
    lockedScrollY = window.scrollY
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    const main = getMainContent()
    if (main) {
      previousMainOverflow = main.style.overflow
      main.style.overflow = 'hidden'
    }
  }

  lockCount += 1
}

export const unlockBodyScroll = () => {
  if (typeof document === 'undefined') return

  lockCount = Math.max(0, lockCount - 1)
  if (lockCount > 0) return

  document.body.style.overflow = ''
  document.body.style.paddingRight = ''

  const main = getMainContent()
  if (main) {
    main.style.overflow = previousMainOverflow
    previousMainOverflow = ''
  }

  window.scrollTo(0, lockedScrollY)
}
