'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { LanguageProvider } from './contexts/LanguageContext'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </NextThemesProvider>
    </LanguageProvider>
  )
}
