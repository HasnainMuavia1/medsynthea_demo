import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'
import { THEME_TOKENS } from '@/styles/theme-tokens'

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [...THEME_TOKENS.text],
      spacing: [...THEME_TOKENS.spacing],
      blur: [...THEME_TOKENS.blur],
      breakpoint: [...THEME_TOKENS.breakpoint],
      container: [...THEME_TOKENS.container],
      radius: [...THEME_TOKENS.radius],
      tracking: [...THEME_TOKENS.tracking],
      leading: [...THEME_TOKENS.leading],
    },
  },
})

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
