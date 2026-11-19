import { create } from 'zustand'

interface UIState {
  loading: {
    isLoading: boolean
    label?: string
    description?: string
    scope: AppLoadingScope
  }
  sidebarCollapsed: boolean
  setLoading: (
    isLoading: boolean,
    label?: string,
    description?: string,
    scope?: AppLoadingScope
  ) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebarCollapsed: () => void
}

export const useUIStore = create<UIState>((set) => ({
  loading: {
    isLoading: false,
    scope: 'content',
  },
  sidebarCollapsed: false,
  setLoading: (isLoading, label, description, scope = 'content') =>
    set({
      loading: {
        isLoading,
        label,
        description,
        scope,
      },
    }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))

export type AppLoadingScope = 'content' | 'fullscreen'
