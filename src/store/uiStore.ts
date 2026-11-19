import { create } from 'zustand'

interface UIState {
  loading: {
    isLoading: boolean
    label?: string
    description?: string
    scope: AppLoadingScope
  }
  sidebarCollapsed: boolean
  mobileNavOpen: boolean
  setLoading: (
    isLoading: boolean,
    label?: string,
    description?: string,
    scope?: AppLoadingScope
  ) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebarCollapsed: () => void
  setMobileNavOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  loading: {
    isLoading: false,
    scope: 'content',
  },
  sidebarCollapsed: false,
  mobileNavOpen: false,
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
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
}))

export type AppLoadingScope = 'content' | 'fullscreen'
