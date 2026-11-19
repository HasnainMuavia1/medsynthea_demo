import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ThemeRoot } from '@/components/shared/ThemeProvider/ThemeRoot'
import { themeInitScript } from '@/lib/theme-init-script'

const plusJakartaSans = localFont({
  src: '../assets/fonts/plus-jakarta-sans/plus-jakarta-sans-latin-wght-normal.woff2',
  weight: '200 800',
  variable: '--font-plus-jakarta',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
})

export const metadata: Metadata = {
  description: 'End-to-end AI revenue cycle workspace.',
  robots: { index: false, follow: false },
}

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" data-scroll-behavior="smooth" className={plusJakartaSans.variable} suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
    </head>
    <body className="antialiased" suppressHydrationWarning>
      <div id="portal-root" />
      <ThemeRoot>{children}</ThemeRoot>
    </body>
  </html>
)

export default RootLayout
