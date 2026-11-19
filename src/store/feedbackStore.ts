import { create } from 'zustand'

type FeedbackType = 'success' | 'error' | 'seo' | null

interface FeedbackState {
  type: FeedbackType
  message: string | null
  title: string | null
  isVisible: boolean

  showFeedback: (message: string, type: 'success' | 'error' | 'seo', title?: string) => void
  hideFeedback: () => void
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
  type: null,
  message: null,
  title: null,
  isVisible: false,

  showFeedback: (message, type, title) =>
    set({ message, type, title: title || null, isVisible: true }),

  hideFeedback: () => set({ isVisible: false, type: null, message: null, title: null }),
}))
