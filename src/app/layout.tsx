import { Nunito } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';
import type { ReactNode } from 'react';

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' });

export const metadata = {
  title: 'Akselera.Tech - Chat Internal',
  description: 'Aplikasi chat internal Akselera.Tech',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='id' suppressHydrationWarning>
      <body className={`${nunito.variable} font-sans`}>
        <SessionProviderWrapper>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
