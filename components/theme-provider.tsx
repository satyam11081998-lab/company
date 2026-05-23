'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Thin wrapper around next-themes ThemeProvider.
 * Defaults to light mode. Supports system preference.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
