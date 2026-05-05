'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { LanguageProvider } from './contexts/LanguageContext'
import { SessionProvider } from 'next-auth/react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </NextThemesProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}
