'use client'

import type { ReactNode } from 'react'
import { ThemeProvider } from './ThemeProvider'

export const ThemeRoot = ({ children }: { children: ReactNode }) => {
  return <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
}
